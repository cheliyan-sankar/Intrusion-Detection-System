const cookie = require('cookie');
const signature = require('cookie-signature');

const ROLE_COOKIE_NAME = 'demokart_role';

function getSecret() {
  return process.env.SESSION_SECRET || 'demokart-dev-secret';
}

function encodePayload(payload) {
  const json = JSON.stringify(payload || {});
  return Buffer.from(json, 'utf8').toString('base64url');
}

function decodePayload(encoded) {
  const json = Buffer.from(String(encoded || ''), 'base64url').toString('utf8');
  return JSON.parse(json);
}

function signValue(value) {
  return 's:' + signature.sign(String(value || ''), getSecret());
}

function unsignValue(signedValue) {
  const raw = String(signedValue || '');
  if (!raw.startsWith('s:')) return null;
  const unsigned = signature.unsign(raw.slice(2), getSecret());
  return unsigned || null;
}

function getCookies(req) {
  const header = (req && req.headers && req.headers.cookie) ? req.headers.cookie : '';
  return cookie.parse(header || '');
}

function getRole(req) {
  const cookies = getCookies(req);
  const signed = cookies[ROLE_COOKIE_NAME];
  if (!signed) return null;

  const unsigned = unsignValue(signed);
  if (!unsigned) return null;

  try {
    const payload = decodePayload(unsigned);
    if (!payload || typeof payload !== 'object') return null;
    return payload;
  } catch {
    return null;
  }
}

function setRole(res, payload) {
  const value = signValue(encodePayload(payload));
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  res.setHeader('Set-Cookie', cookie.serialize(ROLE_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }));
}

function clearRole(res) {
  res.setHeader('Set-Cookie', cookie.serialize(ROLE_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
    path: '/',
    maxAge: 0
  }));
}

function isAdmin(req) {
  const role = getRole(req);
  return Boolean(role && role.isAdmin);
}

function isStimulator(req) {
  const role = getRole(req);
  return Boolean(role && role.isStimulator);
}

module.exports = {
  ROLE_COOKIE_NAME,
  getRole,
  setRole,
  clearRole,
  isAdmin,
  isStimulator
};
