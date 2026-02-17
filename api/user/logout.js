module.exports = (req, res) => {
  // Clear cookie by setting expired
  res.setHeader('Set-Cookie', 'demokart_user=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax');
  res.json({ ok: true });
};
