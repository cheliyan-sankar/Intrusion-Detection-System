function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function nowIso() {
  return new Date().toISOString();
}

function pickSeverity(score) {
  if (score >= 0.85) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

function toJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onDone(err) {
      if (err) return reject(err);
      return resolve({ lastID: this && this.lastID, changes: this && this.changes });
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      return resolve(rows || []);
    });
  });
}

function createDetector({ db, usePostgres = false }) {
  const cooldownMsByType = {
    ddos: 15000,
    brute_force: 20000,
    bot_traffic: 15000,
    spike_load: 15000
  };

  const lastAlertAt = new Map();
  let currentThreat = null; // {type, severity, since}

  function shouldEmit(type) {
    const last = lastAlertAt.get(type) || 0;
    return Date.now() - last > (cooldownMsByType[type] || 15000);
  }

  function markEmit(type) {
    lastAlertAt.set(type, Date.now());
  }

  function classify(metrics) {
    const rps = metrics.requestRate || 0;
    const avg = metrics.responseTimeMs?.avg || 0;
    const p95 = metrics.responseTimeMs?.p95 || 0;
    const errorRate = metrics.errorRate || 0;

    const longRps = metrics.longWindow?.requestRate || 0;

    const topRoutes = metrics.topRoutes || [];
    const routeMap = new Map(topRoutes.map(r => [r.routeKey, r]));
    const login = routeMap.get('POST /api/user/login');
    const login401 = login?.statusCounts?.['401'] || 0;
    const login403 = login?.statusCounts?.['403'] || 0;

    function extractPath(routeKey) {
      const key = String(routeKey || '').trim();
      const m = key.match(/^[A-Z]+\s+([^\s]+)/);
      return m ? m[1] : '';
    }

    // Exclude internal control-plane endpoints from classification signals.
    const visibleRoutes = topRoutes.filter(r => {
      const path = extractPath(r.routeKey);
      if (path.startsWith('/api/admin') || path.startsWith('/api/simulator')) return false;
      if (path === '/api/user/login' || path === '/api/user/register') return false;
      return true;
    });

    const spikeRatio = longRps > 0.1 ? rps / longRps : (rps > 0 ? 10 : 0);

    // DDoS: concentrated traffic + elevated RPS, often with rising latency/errors.
    const uniqueVisiblePaths = new Set(visibleRoutes.map(r => extractPath(r.routeKey)).filter(Boolean)).size;
    const concentrated = uniqueVisiblePaths > 0 && uniqueVisiblePaths <= 3;
    if (
      rps >= 120 ||
      (rps >= 80 && (p95 >= 800 || errorRate >= 3)) ||
      (rps >= 80 && concentrated) ||
      (rps >= 45 && concentrated && (p95 >= 350 || avg >= 250 || errorRate >= 2))
    ) {
      const score =
        clamp((rps - 35) / 160, 0, 1) * 0.7 +
        clamp(p95 / 2000, 0, 1) * 0.2 +
        clamp(errorRate / 10, 0, 1) * 0.1;
      return {
        type: 'ddos',
        attackType: 'DDoS',
        severity: pickSeverity(score),
        score,
        affectedEndpoints: (visibleRoutes.length ? visibleRoutes : topRoutes)
          .slice(0, 4)
          .map(r => r.routeKey)
      };
    }

    // Brute force: many failed logins
    if (login && (login401 + login403) >= 25) {
      const score = clamp((login401 + login403) / 120, 0, 1);
      return {
        type: 'brute_force',
        attackType: 'Brute Force',
        severity: pickSeverity(score),
        score,
        affectedEndpoints: ['POST /api/user/login']
      };
    }

    // Bot traffic: moderate-high RPS, many routes hit, low errors, API-heavy
    const uniqueRoutes = new Set(visibleRoutes.map(r => extractPath(r.routeKey)).filter(Boolean)).size;
    const apiHeavy = visibleRoutes.some(r => String(r.routeKey || '').includes('/api/products'));
    if (rps >= 40 && uniqueRoutes >= 5 && apiHeavy && errorRate < 5) {
      const score = clamp((rps - 30) / 90, 0, 1);
      return {
        type: 'bot_traffic',
        attackType: 'Bot Traffic',
        severity: pickSeverity(score),
        score,
        affectedEndpoints: (visibleRoutes.length ? visibleRoutes : topRoutes).slice(0, 5).map(r => r.routeKey)
      };
    }

    // Spike load: sudden jump relative to baseline
    if (rps >= 30 && spikeRatio >= 3.0) {
      const score = clamp((spikeRatio - 3) / 6, 0, 1) * 0.6 + clamp((rps - 30) / 150, 0, 1) * 0.4;
      return {
        type: 'spike_load',
        attackType: 'Spike Load',
        severity: pickSeverity(score),
        score,
        affectedEndpoints: (visibleRoutes.length ? visibleRoutes : topRoutes).slice(0, 5).map(r => r.routeKey)
      };
    }

    // Nothing suspicious
    return null;
  }

  async function createIncident({ type, attackType, severity, affectedEndpoints, metrics }) {
    const createdAt = nowIso();
    const simulated = Boolean(metrics && metrics.simulator && metrics.simulator.running);
    const incident = {
      id: null,
      type,
      attackType,
      severity,
      timestamp: createdAt,
      affectedEndpoints: affectedEndpoints || [],
      status: 'open',
      metrics: {
        simulated,
        simulator: metrics && metrics.simulator ? {
          running: Boolean(metrics.simulator.running),
          attackType: metrics.simulator.attackType || null,
          intensity: metrics.simulator.intensity || null,
          virtualUsers: metrics.simulator.virtualUsers || 0
        } : null,
        requestRate: metrics.requestRate,
        responseTimeMs: metrics.responseTimeMs,
        errorRate: metrics.errorRate,
        serverLoad: metrics.serverLoad
      }
    };

    // Persist
    const insertSql = usePostgres
      ? "INSERT INTO ids_incidents (attack_type, severity, affected_endpoints, metrics_json, status, created_at) VALUES (?, ?, ?, ?, 'open', CURRENT_TIMESTAMP) RETURNING id"
      : "INSERT INTO ids_incidents (attack_type, severity, affected_endpoints, metrics_json, status, created_at) VALUES (?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)";

    const result = await dbRun(db, insertSql, [attackType, severity, toJson(incident.affectedEndpoints), toJson(incident.metrics)]);

    incident.id = result.lastID;

    // Also log to legacy table (best-effort)
    try {
      await dbRun(
        db,
        "INSERT INTO attack_logs (attack_type, details, severity, ip_address, session_id, timestamp) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [attackType, `${simulated ? 'Simulated scenario' : 'Auto-detected'} by IDS (${type})`, severity, simulated ? 'simulator' : 'system', simulated ? 'simulator' : 'system']
      );
    } catch {
      // ignore
    }

    return incident;
  }

  async function tick(metrics) {
    const suspicious = classify(metrics);

    if (!suspicious) {
      currentThreat = null;
      return { incident: null, status: { underAttack: false, threat: null } };
    }

    currentThreat = {
      type: suspicious.type,
      attackType: suspicious.attackType,
      severity: suspicious.severity,
      since: currentThreat?.type === suspicious.type ? currentThreat.since : nowIso()
    };

    if (!shouldEmit(suspicious.type)) {
      return { incident: null, status: { underAttack: true, threat: currentThreat } };
    }

    markEmit(suspicious.type);

    const incident = await createIncident({
      type: suspicious.type,
      attackType: suspicious.attackType,
      severity: suspicious.severity,
      affectedEndpoints: suspicious.affectedEndpoints,
      metrics
    });

    return { incident, status: { underAttack: true, threat: currentThreat } };
  }

  async function listIncidents(limit = 50) {
    const rows = await dbAll(
      db,
      'SELECT id, attack_type, severity, affected_endpoints, metrics_json, status, created_at, acked_at FROM ids_incidents ORDER BY id DESC LIMIT ?',
      [limit]
    );

    return rows.map(r => {
      let affectedEndpoints = [];
      let metrics = {};
      try { affectedEndpoints = JSON.parse(r.affected_endpoints || '[]'); } catch {}
      try { metrics = JSON.parse(r.metrics_json || '{}'); } catch {}
      return {
        id: r.id,
        attackType: r.attack_type,
        severity: r.severity,
        timestamp: new Date(r.created_at).toISOString(),
        affectedEndpoints,
        status: r.status,
        ackedAt: r.acked_at ? new Date(r.acked_at).toISOString() : null,
        metrics
      };
    });
  }

  async function ackIncident(id) {
    await dbRun(db, "UPDATE ids_incidents SET status = 'acked', acked_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
  }

  return {
    tick,
    listIncidents,
    ackIncident
  };
}

module.exports = {
  createDetector
};
