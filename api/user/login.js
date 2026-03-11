const fs = require('fs');
const path = require('path');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const ADMIN_USER_2 = process.env.ADMIN_USER_2 || 'admin1';
const ADMIN_PASS_2 = process.env.ADMIN_PASS_2 || 'hari123';

const STIMULATOR_USER = process.env.STIMULATOR_USER || 'stimulator';
const STIMULATOR_PASS = process.env.STIMULATOR_PASS || 'stimulate2024';
const STIMULATOR_USER_2 = process.env.STIMULATOR_USER_2 || 'simulator';
const STIMULATOR_PASS_2 = process.env.STIMULATOR_PASS_2 || '1234hari';

const ADMIN_CREDENTIALS = [
  { username: ADMIN_USER, password: ADMIN_PASS },
  { username: ADMIN_USER_2, password: ADMIN_PASS_2 }
].filter(c => c.username && c.password);

const STIMULATOR_CREDENTIALS = [
  { username: STIMULATOR_USER, password: STIMULATOR_PASS },
  { username: STIMULATOR_USER_2, password: STIMULATOR_PASS_2 }
].filter(c => c.username && c.password);

const matchesCredentials = (list, username, password) => {
  return Array.isArray(list) && list.some(c => c.username === username && c.password === password);
};

const loadUsers = () => {
  try {
    const p = path.join(__dirname, '..', '..', 'data', 'users.json');
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

module.exports = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ ok: false, message: 'Missing credentials' });

    // admin
    if (matchesCredentials(ADMIN_CREDENTIALS, username, password)) {
      const payload = { username, isAdmin: true };
      res.setHeader('Set-Cookie', `demokart_user=${encodeURIComponent(JSON.stringify(payload))}; Path=/; HttpOnly; SameSite=Lax`);
      return res.json({ ok: true, isAdmin: true, redirect: '/admin.html' });
    }

    // stimulator
    if (matchesCredentials(STIMULATOR_CREDENTIALS, username, password)) {
      const payload = { username, isStimulator: true };
      res.setHeader('Set-Cookie', `demokart_user=${encodeURIComponent(JSON.stringify(payload))}; Path=/; HttpOnly; SameSite=Lax`);
      return res.json({ ok: true, isStimulator: true, redirect: '/stimulator.html' });
    }

    // demo users from data/users.json (plaintext passwords for demo)
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const payload = { id: user.id, username: user.username, email: user.email };
    res.setHeader('Set-Cookie', `demokart_user=${encodeURIComponent(JSON.stringify(payload))}; Path=/; HttpOnly; SameSite=Lax`);
    return res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};
