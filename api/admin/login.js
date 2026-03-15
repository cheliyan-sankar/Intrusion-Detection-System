const { readJsonBody } = require('../_readJsonBody');
const { setRole } = require('../_roleCookie');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const ADMIN_USER_2 = process.env.ADMIN_USER_2 || 'admin1';
const ADMIN_PASS_2 = process.env.ADMIN_PASS_2 || 'hari123';

const ADMIN_CREDENTIALS = [
  { username: ADMIN_USER, password: ADMIN_PASS },
  { username: ADMIN_USER_2, password: ADMIN_PASS_2 }
].filter(c => c.username && c.password);

function matchesCredentials(list, username, password) {
  return Array.isArray(list) && list.some(c => c.username === username && c.password === password);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  const body = await readJsonBody(req);
  const username = body && body.username;
  const password = body && body.password;

  if (!username || !password) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, message: 'Missing credentials' }));
  }

  if (!matchesCredentials(ADMIN_CREDENTIALS, username, password)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, message: 'Invalid credentials' }));
  }

  setRole(res, { username, isAdmin: true });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ ok: true, isAdmin: true }));
};
