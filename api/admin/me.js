const { getRole, isAdmin } = require('../_roleCookie');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  if (!isAdmin(req)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, isAdmin: false }));
  }

  const role = getRole(req);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({ ok: true, isAdmin: true, username: role && role.username ? role.username : null }));
};
