const { readJsonBody } = require('../_readJsonBody');
const { setRole } = require('../_roleCookie');

const STIMULATOR_USER = process.env.STIMULATOR_USER || 'stimulator';
const STIMULATOR_PASS = process.env.STIMULATOR_PASS || 'stimulate2024';
const STIMULATOR_USER_2 = process.env.STIMULATOR_USER_2 || 'simulator';
const STIMULATOR_PASS_2 = process.env.STIMULATOR_PASS_2 || '1234hari';

const STIMULATOR_CREDENTIALS = [
  { username: STIMULATOR_USER, password: STIMULATOR_PASS },
  { username: STIMULATOR_USER_2, password: STIMULATOR_PASS_2 }
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

  if (!matchesCredentials(STIMULATOR_CREDENTIALS, username, password)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, message: 'Invalid credentials' }));
  }

  setRole(res, { username, isStimulator: true });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ ok: true, isStimulator: true }));
};
