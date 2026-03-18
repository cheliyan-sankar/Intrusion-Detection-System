const os = require('os');
const { monitorEventLoopDelay } = require('perf_hooks');

function clampInt(value, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function normalizePath(pathname) {
  if (!pathname) return '/';
  // collapse IDs in common API routes
  return String(pathname)
    .replace(/\?.*$/, '')
    .replace(/\/(\d+)(?=\/|$)/g, '/:id')
    .replace(/\/([0-9a-fA-F]{8,})(?=\/|$)/g, '/:id');
}

function percentile(values, p) {
  if (!values || values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function createMetrics(options = {}) {
  const windowSeconds = clampInt(options.windowSeconds ?? 60, 10, 600);
  const sampleLimitPerSecond = clampInt(options.sampleLimitPerSecond ?? 200, 20, 5000);
  const snapshotSeconds = clampInt(options.snapshotSeconds ?? 10, 1, windowSeconds);

  const buckets = new Map(); // epochSecond -> bucket

  const clientCounts = {
    ecommerce: 0,
    admin: 0,
    simulator: 0,
    other: 0
  };

  // Virtual clients are not real WebSocket connections.
  // They are used to represent simulated traffic spikes (e.g., "lakhs" of users)
  // without overwhelming a dev environment.
  const virtualClientCounts = {
    ecommerce: 0,
    admin: 0,
    simulator: 0,
    other: 0
  };

  const h = monitorEventLoopDelay({ resolution: 10 });
  h.enable();

  function getBucket(epochSecond) {
    let bucket = buckets.get(epochSecond);
    if (!bucket) {
      bucket = {
        count: 0,
        simulated: 0,
        errors: 0,
        latencySumMs: 0,
        latenciesMs: [],
        byRoute: new Map(), // key -> {count, errors, latencySumMs, latenciesMs, statusCounts: Map}
        byIp: new Map() // ip -> count
      };
      buckets.set(epochSecond, bucket);
    }
    return bucket;
  }

  function cleanup(nowSec) {
    const minSec = nowSec - windowSeconds - 2;
    for (const sec of buckets.keys()) {
      if (sec < minSec) buckets.delete(sec);
    }
  }

  function recordClientHello(moduleName) {
    const m = moduleName === 'ecommerce' || moduleName === 'admin' || moduleName === 'simulator' ? moduleName : 'other';
    clientCounts[m] += 1;
    return m;
  }

  function recordClientBye(moduleName) {
    const m = moduleName === 'ecommerce' || moduleName === 'admin' || moduleName === 'simulator' ? moduleName : 'other';
    clientCounts[m] = Math.max(0, clientCounts[m] - 1);
  }

  function setVirtualClientCount(moduleName, count) {
    const m = moduleName === 'ecommerce' || moduleName === 'admin' || moduleName === 'simulator' ? moduleName : 'other';
    const n = Number(count);
    virtualClientCounts[m] = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  function middleware(req, res, next) {
    const start = process.hrtime.bigint();
    const method = req.method || 'GET';
    const path = normalizePath(req.path || req.url || '/');
    const routeKey = `${method.toUpperCase()} ${path}`;
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    const isSimulated = String(req.headers['x-demokart-simulator'] || '').toLowerCase() === '1';

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const ms = Number(end - start) / 1e6;
      const status = res.statusCode || 0;
      const isError = status >= 500;

      const nowSec = Math.floor(Date.now() / 1000);
      const bucket = getBucket(nowSec);
      bucket.count += 1;
      if (isSimulated) bucket.simulated += 1;
      bucket.latencySumMs += ms;
      if (isError) bucket.errors += 1;

      if (bucket.latenciesMs.length < sampleLimitPerSecond) bucket.latenciesMs.push(ms);

      bucket.byIp.set(ip, (bucket.byIp.get(ip) || 0) + 1);

      const route = bucket.byRoute.get(routeKey) || {
        count: 0,
        errors: 0,
        latencySumMs: 0,
        latenciesMs: [],
        statusCounts: new Map()
      };

      route.count += 1;
      route.latencySumMs += ms;
      if (isError) route.errors += 1;
      route.statusCounts.set(String(status), (route.statusCounts.get(String(status)) || 0) + 1);
      if (route.latenciesMs.length < sampleLimitPerSecond) route.latenciesMs.push(ms);

      bucket.byRoute.set(routeKey, route);

      cleanup(nowSec);
    });

    next();
  }

  function aggregate(lastSeconds) {
    const nowSec = Math.floor(Date.now() / 1000);
    const fromSec = nowSec - lastSeconds + 1;

    let count = 0;
    let simulated = 0;
    let errors = 0;
    let latencySumMs = 0;
    const latenciesMs = [];

    const byRoute = new Map();
    const byIp = new Map();

    for (let sec = fromSec; sec <= nowSec; sec++) {
      const b = buckets.get(sec);
      if (!b) continue;
      count += b.count;
      simulated += b.simulated || 0;
      errors += b.errors;
      latencySumMs += b.latencySumMs;
      for (const v of b.latenciesMs) latenciesMs.push(v);

      for (const [routeKey, r] of b.byRoute.entries()) {
        const existing = byRoute.get(routeKey) || {
          count: 0,
          errors: 0,
          latencySumMs: 0,
          latenciesMs: [],
          statusCounts: new Map()
        };
        existing.count += r.count;
        existing.errors += r.errors;
        existing.latencySumMs += r.latencySumMs;
        for (const v of r.latenciesMs) existing.latenciesMs.push(v);
        for (const [status, sc] of r.statusCounts.entries()) {
          existing.statusCounts.set(status, (existing.statusCounts.get(status) || 0) + sc);
        }
        byRoute.set(routeKey, existing);
      }

      for (const [ip, c] of b.byIp.entries()) {
        byIp.set(ip, (byIp.get(ip) || 0) + c);
      }
    }

    return { nowSec, fromSec, count, simulated, errors, latencySumMs, latenciesMs, byRoute, byIp };
  }

  function snapshot() {
    const shortAgg = aggregate(snapshotSeconds);
    const longAgg = aggregate(windowSeconds);

    const rps = shortAgg.count / snapshotSeconds;
    const simulatedRps = shortAgg.simulated / snapshotSeconds;
    const avgResponseTimeMs = shortAgg.count > 0 ? shortAgg.latencySumMs / shortAgg.count : 0;
    const p95ResponseTimeMs = percentile(shortAgg.latenciesMs, 95);
    const errorRate = shortAgg.count > 0 ? (shortAgg.errors / shortAgg.count) * 100 : 0;

    const uniqueIps = shortAgg.byIp.size;

    const routes = Array.from(shortAgg.byRoute.entries())
      .map(([routeKey, r]) => {
        const statusCounts = {};
        for (const [k, v] of r.statusCounts.entries()) statusCounts[k] = v;
        return {
          routeKey,
          count: r.count,
          errors: r.errors,
          avgResponseTimeMs: r.count > 0 ? r.latencySumMs / r.count : 0,
          p95ResponseTimeMs: percentile(r.latenciesMs, 95),
          statusCounts
        };
      })
      .sort((a, b) => b.count - a.count);

    const topRoutes = routes.slice(0, 8);

    const mem = process.memoryUsage();

    const clientsTotal = {
      ecommerce: (clientCounts.ecommerce || 0) + (virtualClientCounts.ecommerce || 0),
      admin: (clientCounts.admin || 0) + (virtualClientCounts.admin || 0),
      simulator: (clientCounts.simulator || 0) + (virtualClientCounts.simulator || 0),
      other: (clientCounts.other || 0) + (virtualClientCounts.other || 0)
    };

    return {
      ts: new Date().toISOString(),
      windowSeconds,
      snapshotSeconds,
      userCount: clientsTotal.ecommerce,
      requestRate: rps,
      simulatedRequestRate: simulatedRps,
      serverLoad: {
        load1: os.loadavg()[0] || 0,
        load5: os.loadavg()[1] || 0,
        memRssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        eventLoopLagMsP95: Math.round((Number(h.percentile(95)) / 1e6) * 10) / 10
      },
      responseTimeMs: {
        avg: Math.round(avgResponseTimeMs * 10) / 10,
        p95: Math.round(p95ResponseTimeMs * 10) / 10
      },
      errorRate,
      uniqueIps,
      topRoutes,
      longWindow: {
        requestRate: longAgg.count / windowSeconds,
        avgResponseTimeMs: longAgg.count > 0 ? longAgg.latencySumMs / longAgg.count : 0
      },
      clients: { ...clientsTotal },
      clientsReal: { ...clientCounts },
      clientsVirtual: { ...virtualClientCounts }
    };
  }

  return {
    middleware,
    snapshot,
    recordClientHello,
    recordClientBye,
    setVirtualClientCount
  };
}

module.exports = {
  createMetrics
};
