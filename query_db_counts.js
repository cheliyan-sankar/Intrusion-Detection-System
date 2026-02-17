const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'data', 'demokart.db');

const tables = ['products','users','page_views','cart','wishlist','activity_logs'];

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('OPEN ERR', err.message);
    process.exit(1);
  }

  let i = 0;
  const next = () => {
    if (i >= tables.length) {
      db.close();
      return;
    }
    const t = tables[i++];
    db.get(`SELECT COUNT(*) AS c FROM ${t}`, [], (e, r) => {
      if (e) console.log(`${t}: ERR: ${e.message}`);
      else console.log(`${t}: ${r.c}`);
      next();
    });
  };

  next();
});
