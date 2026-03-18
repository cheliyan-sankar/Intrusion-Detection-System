function clampInt(value, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function intensityToConfig(intensity) {
  const lvl = String(intensity || 'low').toLowerCase();
  if (lvl === 'very_high' || lvl === 'very high' || lvl === 'veryhigh') {
    // Represent "lakhs" of users via virtualUsers, while keeping actual
    // request fan-out bounded so a single dev container doesn't melt.
    return { name: 'very_high', rps: 2000, concurrency: 200, durationMs: 0, virtualUsers: 100000 };
  }
  if (lvl === 'high') {
    return { name: 'high', rps: 250, concurrency: 30, durationMs: 0, virtualUsers: 30000 };
  }
  if (lvl === 'medium') {
    return { name: 'medium', rps: 120, concurrency: 15, durationMs: 0, virtualUsers: 12000 };
  }
  return { name: 'low', rps: 45, concurrency: 8, durationMs: 0, virtualUsers: 3000 };
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onDone(err) {
      if (err) return reject(err);
      return resolve({ lastID: this && this.lastID, changes: this && this.changes });
    });
  });
}

function normalizeAttackType(value) {
  const normalized = String(value || '').toLowerCase().trim();
  const mapped = normalized === 'bot' ? 'bot_traffic'
    : normalized === 'bot_traffic' ? 'bot_traffic'
    : normalized === 'bruteforce' ? 'brute_force'
    : normalized === 'brute' ? 'brute_force'
    : normalized === 'brute_force' ? 'brute_force'
    : normalized === 'spike' ? 'spike_load'
    : normalized === 'spike_load' ? 'spike_load'
    : normalized === 'ddos' ? 'ddos'
    : '';

  const allowed = new Set(['ddos', 'bot_traffic', 'brute_force', 'spike_load']);
  return allowed.has(mapped) ? mapped : '';
}

function createAttackSimulator({ db, baseUrl, metrics }) {
  let current = null; // { id, attackType, intensity, startedAt, controller, stopRequested }
  let selected = null; // { attackType, selectedAt }

  const debug = String(process.env.SIMULATOR_DEBUG || '').toLowerCase() === '1' ||
    String(process.env.SIMULATOR_DEBUG || '').toLowerCase() === 'true';

  const internalHeaders = { 'x-demokart-simulator': '1' };

  async function logAttack(attackType, details, severity) {
    try {
      await dbRun(
        db,
        "INSERT INTO attack_logs (attack_type, details, severity, ip_address, session_id, timestamp) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [attackType, details, severity || 'medium', 'simulator', 'simulator']
      );
    } catch {
      // ignore
    }
  }

  function status() {
    const base = !current
      ? { running: false }
      : {
          running: true,
          id: current.id,
          attackType: current.attackType,
          intensity: current.intensity,
          concurrency: current.concurrency,
          virtualUsers: current.virtualUsers,
          virtualUsersTarget: current.virtualUsersTarget,
          startedAt: current.startedAt
        };

    return {
      ...base,
      selectedAttackType: selected ? selected.attackType : null,
      selectedAt: selected ? selected.selectedAt : null
    };
  }

  function select(attackType) {
    const t = normalizeAttackType(attackType);
    if (!t) {
      selected = null;
      return { ok: true, selectedAttackType: null, selectedAt: null };
    }

    selected = { attackType: t, selectedAt: new Date().toISOString() };
    return { ok: true, selectedAttackType: selected.attackType, selectedAt: selected.selectedAt };
  }

  async function stop() {
    if (!current) return { ok: true, stopped: false };
    current.stopRequested = true;
    try {
      current.controller.abort();
    } catch {
      // ignore
    }
    const stoppedId = current.id;
    current = null;
    try {
      metrics?.setVirtualClientCount?.('ecommerce', 0);
    } catch {
      // ignore
    }
    await logAttack('simulator_stop', `Stopped attack job ${stoppedId}`, 'low');
    return { ok: true, stopped: true, id: stoppedId };
  }

  async function start({ attackType, intensity }) {
    const type = normalizeAttackType(attackType);
    if (!type) {
      return { ok: false, message: 'Invalid attackType' };
    }

    if (current) {
      await stop();
    }

    const cfg = intensityToConfig(intensity);

    // Spike load is short burst by design.
    if (type === 'spike_load') {
      cfg.durationMs = cfg.name === 'high' ? 12000 : cfg.name === 'medium' ? 9000 : 6000;
      cfg.rps = cfg.name === 'high' ? 600 : cfg.name === 'medium' ? 350 : 160;
      if (cfg.name === 'very_high') {
        cfg.durationMs = 15000;
        cfg.rps = 3500;
        cfg.concurrency = 260;
      } else {
        cfg.concurrency = cfg.name === 'high' ? 60 : cfg.name === 'medium' ? 35 : 20;
      }
    }

    const controller = new AbortController();
    const id = `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    // Keep selection in sync with explicit starts.
    selected = { attackType: type, selectedAt: new Date().toISOString() };

    current = {
      id,
      attackType: type,
      intensity: cfg.name,
      concurrency: cfg.concurrency,
      virtualUsers: 0,
      virtualUsersTarget: cfg.virtualUsers,
      startedAt: new Date().toISOString(),
      controller,
      stopRequested: false
    };

    // Start from 0 and ramp up over time to reflect a growing spike.
    try {
      metrics?.setVirtualClientCount?.('ecommerce', 0);
    } catch {
      // ignore
    }

    await logAttack(type, `Started ${type} (${cfg.name})`, cfg.name === 'high' ? 'high' : cfg.name);

    // Fire-and-forget runners
    runJob({ type, cfg, controller }).catch(() => {
      // best-effort; status is cleared below
    });

    rampVirtualUsers({ cfg, controller }).catch(() => {
      // ignore
    });

    return { ok: true, id, attackType: type, intensity: cfg.name };
  }

  async function runJob({ type, cfg, controller }) {
    const tickMs = 200;
    const perTick = Math.max(1, Math.floor((cfg.rps * tickMs) / 1000));

    const started = Date.now();

    // Keep actual network fan-out bounded, but tag each request as a distinct virtual user.
    const ipPoolSize = Math.max(50, Math.min(5000, Math.floor(cfg.concurrency * 120)));

    function virtualUser(ipIdx) {
      const idx = Math.max(0, Math.floor(ipIdx) % ipPoolSize);
      // Map idx deterministically into a private /16.
      const o3 = Math.floor(idx / 256) % 256;
      const o4 = idx % 256;
      const ip = `10.42.${o3}.${o4}`;
      const ua = `DemoKartVirtualUser/${cfg.name}/${idx}`;
      return { ip, ua, id: idx };
    }

    async function oneRequest() {
      if (controller.signal.aborted) return;

      const u = virtualUser(Math.floor(Math.random() * ipPoolSize));

      const baseHeaders = {
        ...internalHeaders,
        'X-Forwarded-For': u.ip,
        'User-Agent': u.ua
      };

      if (type === 'ddos') {
        const endpoints = ['/', '/api/products', '/api/categories'];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        await fetch(baseUrl + ep, {
          method: 'GET',
          headers: {
            ...baseHeaders
          },
          signal: controller.signal
        }).catch(() => {});
        return;
      }

      if (type === 'bot_traffic') {
        const id = 1 + Math.floor(Math.random() * 25);
        const search = ['phone', 'watch', 'nike', 'sony', 'kettle', 'book'][Math.floor(Math.random() * 6)];
        const endpoints = [
          `/api/products?search=${encodeURIComponent(search)}`,
          '/api/products',
          '/api/categories',
          `/api/products/${id}`
        ];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        await fetch(baseUrl + ep, { method: 'GET', headers: baseHeaders, signal: controller.signal }).catch(() => {});
        return;
      }

      if (type === 'brute_force') {
        const usernames = ['admin', 'root', 'user', 'test', 'administrator', 'guest'];
        const body = {
          // Avoid accidentally matching real credentials; we want repeated failures.
          username: `sim_${usernames[Math.floor(Math.random() * usernames.length)]}_${Math.floor(Math.random() * 100000)}`,
          password: `wrong_${Math.random().toString(16).slice(2)}`
        };
        await fetch(baseUrl + '/api/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...baseHeaders },
          body: JSON.stringify(body),
          signal: controller.signal
        }).catch(() => {});
        return;
      }

      if (type === 'spike_load') {
        // Burst across key endpoints
        const endpoints = ['/', '/api/products', '/api/categories', '/api/products/1'];
        const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
        await fetch(baseUrl + ep, { method: 'GET', headers: baseHeaders, signal: controller.signal }).catch(() => {});
      }
    }

    async function tick() {
      const tasks = [];
      const batch = perTick;
      const concurrency = cfg.concurrency;

      for (let i = 0; i < batch; i++) {
        tasks.push(oneRequest());
        if (tasks.length >= concurrency) {
          await Promise.allSettled(tasks);
          tasks.length = 0;
        }
      }

      if (tasks.length) await Promise.allSettled(tasks);
    }

    while (!controller.signal.aborted) {
      if (!current || current.controller !== controller) break;

      if (cfg.durationMs > 0 && Date.now() - started > cfg.durationMs) {
        break;
      }

      await tick();
      await sleep(tickMs);
    }

    // auto-stop if still current
    if (current && current.controller === controller) {
      current = null;
      try {
        metrics?.setVirtualClientCount?.('ecommerce', 0);
      } catch {
        // ignore
      }
      await logAttack(type, `Finished ${type} (${cfg.name})`, 'low');
    }
  }

  async function rampVirtualUsers({ cfg, controller }) {
    // Increment virtual users by +5..+20 users per second (as requested).
    // This ramps independently of request execution.
    const minPerSec = 5;
    const maxPerSec = 20;
    const tickMs = 1000;

    while (!controller.signal.aborted) {
      if (!current || current.controller !== controller) break;

      const target = Number(current.virtualUsersTarget || cfg.virtualUsers || 0);
      const step = minPerSec + Math.floor(Math.random() * (maxPerSec - minPerSec + 1));
      const next = target > 0
        ? Math.min(target, (Number(current.virtualUsers || 0) + step))
        : (Number(current.virtualUsers || 0) + step);

      current.virtualUsers = next;
      try {
        metrics?.setVirtualClientCount?.('ecommerce', next);
      } catch {
        // ignore
      }

      if (debug) {
        const tgt = Number(current.virtualUsersTarget || 0);
        console.log(
          `[simulator] virtualUsers=${next}${tgt > 0 ? `/${tgt}` : ''} intensity=${cfg.name} type=${current.attackType} job=${current.id}`
        );
      }

      await sleep(tickMs);
    }
  }

  return {
    start,
    stop,
    status,
    select
  };
}

module.exports = {
  createAttackSimulator
};
