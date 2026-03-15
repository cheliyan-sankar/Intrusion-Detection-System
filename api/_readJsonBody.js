async function readJsonBody(req) {
  // Vercel usually populates req.body for JSON requests, but keep a fallback.
  if (req && req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on('data', (c) => chunks.push(c));
    req.on('end', resolve);
    req.on('error', reject);
  });

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = { readJsonBody };
