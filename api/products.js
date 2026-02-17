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
  const q = req.query || {};

  let out = products.slice();

  if (q.search) {
    const s = q.search.toLowerCase();
    out = out.filter(p => (p.name || '').toLowerCase().includes(s) || (p.brand || '').toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
  }

  if (q.category) {
    out = out.filter(p => (p.category || '') === q.category);
  }

  const min = q.minPrice ? Number(q.minPrice) : null;
  const max = q.maxPrice ? Number(q.maxPrice) : null;
  if (!Number.isNaN(min) && min !== null) out = out.filter(p => Number(p.price) >= min);
  if (!Number.isNaN(max) && max !== null) out = out.filter(p => Number(p.price) <= max);

  if (q.sort) {
    if (q.sort === 'price_asc') out.sort((a,b) => a.price - b.price);
    else if (q.sort === 'price_desc') out.sort((a,b) => b.price - a.price);
    else if (q.sort === 'rating') out.sort((a,b) => (b.rating||0) - (a.rating||0));
  }

  // normalize to fields frontend expects
  out = out.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    imageUrl: p.imageUrl || p.image_url || '',
    category: p.category,
    brand: p.brand,
    rating: p.rating || 0,
    review_count: p.review_count || p.reviewCount || 0
  }));

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ ok: true, products: out }));
};
