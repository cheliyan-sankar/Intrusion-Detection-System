const fs = require('fs');
const path = require('path');

const loadProducts = () => {
  try {
    const p = path.join(__dirname, '..', 'data', 'products.json');
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

module.exports = (req, res) => {
  const products = loadProducts();
  const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ ok: true, categories: cats }));
};
