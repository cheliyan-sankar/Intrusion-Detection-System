module.exports = (req, res) => {
  try {
    const cookie = req.headers.cookie || '';
    const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('demokart_user='));
    if (!match) return res.json({ ok: false });
    const val = decodeURIComponent(match.split('=')[1] || '');
    try {
      const parsed = JSON.parse(val);
      if (parsed && parsed.username) return res.json({ ok: true, user: parsed });
    } catch (e) {
      return res.json({ ok: false });
    }
    return res.json({ ok: false });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
};
