require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false });
  pool.query('SELECT 1').then(() => {
    console.log('POSTGRES: connected');
    return pool.end();
  }).catch(err => {
    console.error('POSTGRES: connection error:', err.message || err);
    process.exit(1);
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, 'data', 'demokart.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('SQLITE: open error:', err.message || err);
      process.exit(1);
    }
    db.get('SELECT 1 as ok', [], (err) => {
      if (err) {
        console.error('SQLITE: query error:', err.message || err);
        process.exit(1);
      }
      console.log('SQLITE: connected');
      db.close();
    });
  });
}
