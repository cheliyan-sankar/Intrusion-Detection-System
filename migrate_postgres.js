const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL in your environment (e.g. postgres://user:pass@host:5432/dbname)');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false });

const sampleProducts = [
  // (trimmed for brevity in code comments) full list copied from init.js will be inserted here
  { name: 'Wireless Bluetooth Headphones', price: 2999.99, description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', category: 'Electronics', brand: 'Sony', rating: 4.2, review_count: 1250 },
  { name: 'Smartphone Case', price: 499.99, description: 'Durable protective case for smartphones with anti-slip grip and shock absorption.', image_url: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80', category: 'Mobile Accessories', brand: 'Generic', rating: 4.0, review_count: 890 },
  { name: 'Coffee Maker', price: 2499.99, description: 'Automatic drip coffee maker with programmable timer and thermal carafe.', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', category: 'Home & Kitchen', brand: 'Philips', rating: 4.3, review_count: 567 },
  { name: 'Yoga Mat', price: 1299.99, description: 'Non-slip yoga mat made from eco-friendly materials, perfect for home workouts.', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', category: 'Sports & Fitness', brand: 'Nike', rating: 4.5, review_count: 2340 },
  { name: 'LED Desk Lamp', price: 899.99, description: 'Adjustable LED desk lamp with multiple brightness levels and USB charging port.', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', category: 'Home & Kitchen', brand: 'Philips', rating: 4.1, review_count: 678 },
  { name: 'Wireless Mouse', price: 799.99, description: 'Ergonomic wireless mouse with precision tracking and long battery life.', image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80', category: 'Computers', brand: 'Logitech', rating: 4.4, review_count: 1456 }
  // Add remaining products from init.js as needed (copy/paste the array for full seeding)
];

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create tables (Postgres-compatible)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT,
        brand TEXT,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        session_id TEXT,
        user_id INTEGER REFERENCES users(id),
        page TEXT,
        user_agent TEXT,
        ip_address TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT UNIQUE,
        user_id INTEGER REFERENCES users(id),
        start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
        is_active BOOLEAN DEFAULT true
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_id TEXT,
        action TEXT,
        details TEXT,
        ip_address TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS attack_logs (
        id SERIAL PRIMARY KEY,
        attack_type TEXT,
        details TEXT,
        severity TEXT,
        ip_address TEXT,
        session_id TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    // Seed products if empty
    const res = await client.query('SELECT COUNT(*)::int as count FROM products');
    const count = res.rows[0].count;
    if (count === 0) {
      const insertText = 'INSERT INTO products (name, price, description, image_url, category, brand, rating, review_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)';
      for (const p of sampleProducts) {
        await client.query(insertText, [p.name, p.price, p.description, p.image_url, p.category, p.brand, p.rating, p.review_count]);
      }
      console.log(`Seeded ${sampleProducts.length} products into Postgres.`);
    } else {
      console.log(`Products table already has ${count} rows; skipping seed.`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
