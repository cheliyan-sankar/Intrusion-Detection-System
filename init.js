const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "demokart.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS products");
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS cart");
  db.run("DROP TABLE IF EXISTS wishlist");
  db.run(
    "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, description TEXT, image_url TEXT, category TEXT, brand TEXT, rating REAL DEFAULT 0, review_count INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, email TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, product_id INTEGER, quantity INTEGER DEFAULT 1, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(product_id) REFERENCES products(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, product_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(product_id) REFERENCES products(id))"
  );

  const sampleProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      price: 2999.99,
      description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      category: "Electronics",
      brand: "Sony",
      rating: 4.2,
      review_count: 1250
    },
    {
      name: "Smartphone Case",
      price: 499.99,
      description: "Durable protective case for smartphones with anti-slip grip and shock absorption.",
      image_url: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80",
      category: "Mobile Accessories",
      brand: "Generic",
      rating: 4.0,
      review_count: 890
    },
    {
      name: "Coffee Maker",
      price: 2499.99,
      description: "Automatic drip coffee maker with programmable timer and thermal carafe.",
      image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Philips",
      rating: 4.3,
      review_count: 567
    },
    {
      name: "Yoga Mat",
      price: 1299.99,
      description: "Non-slip yoga mat made from eco-friendly materials, perfect for home workouts.",
      image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      category: "Sports & Fitness",
      brand: "Nike",
      rating: 4.5,
      review_count: 2340
    },
    {
      name: "LED Desk Lamp",
      price: 899.99,
      description: "Adjustable LED desk lamp with multiple brightness levels and USB charging port.",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Philips",
      rating: 4.1,
      review_count: 678
    },
    {
      name: "Wireless Mouse",
      price: 799.99,
      description: "Ergonomic wireless mouse with precision tracking and long battery life.",
      image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
      category: "Computers",
      brand: "Logitech",
      rating: 4.4,
      review_count: 1456
    },
    {
      name: "Laptop Stand",
      price: 1499.99,
      description: "Adjustable aluminum laptop stand for better ergonomics and cooling.",
      image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
      category: "Computers",
      brand: "Rain Design",
      rating: 4.2,
      review_count: 789
    },
    {
      name: "Bluetooth Speaker",
      price: 1999.99,
      description: "Portable Bluetooth speaker with waterproof design and 360-degree sound.",
      image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
      category: "Electronics",
      brand: "JBL",
      rating: 4.3,
      review_count: 2100
    },
    {
      name: "Smartwatch",
      price: 4999.99,
      description: "Fitness tracking smartwatch with heart rate monitor and GPS.",
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      category: "Wearable Technology",
      brand: "Fitbit",
      rating: 4.1,
      review_count: 3456
    },
    {
      name: "Tablet",
      price: 15999.99,
      description: "10-inch tablet with high-resolution display and long battery life.",
      image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
      category: "Computers",
      brand: "Samsung",
      rating: 4.0,
      review_count: 1234
    },
    {
      name: "Gaming Keyboard",
      price: 3499.99,
      description: "Mechanical gaming keyboard with RGB lighting and programmable keys.",
      image_url: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=800&q=80",
      category: "Computers",
      brand: "Razer",
      rating: 4.5,
      review_count: 2890
    },
    {
      name: "External Hard Drive",
      price: 2999.99,
      description: "1TB portable external hard drive for data backup and storage.",
      image_url: "https://images.unsplash.com/photo-1606235203602-a8a1a2d0bbf6?auto=format&fit=crop&w=800&q=80",
      category: "Computers",
      brand: "Western Digital",
      rating: 4.2,
      review_count: 1678
    },
    {
      name: "Webcam",
      price: 1299.99,
      description: "HD webcam with auto-focus and built-in microphone for video calls.",
      image_url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80",
      category: "Computers",
      brand: "Logitech",
      rating: 4.0,
      review_count: 987
    },
    {
      name: "Router",
      price: 2499.99,
      description: "Dual-band Wi-Fi router with fast speeds and wide coverage.",
      image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      category: "Electronics",
      brand: "TP-Link",
      rating: 4.1,
      review_count: 1456
    },
    {
      name: "Power Bank",
      price: 999.99,
      description: "10000mAh power bank with fast charging and multiple ports.",
      image_url: "https://images.unsplash.com/photo-1609594040184-27d43e27b276?auto=format&fit=crop&w=800&q=80",
      category: "Mobile Accessories",
      brand: "Anker",
      rating: 4.3,
      review_count: 2345
    },
    {
      name: "Blender",
      price: 1999.99,
      description: "High-speed blender for smoothies, soups, and more.",
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Oster",
      rating: 4.2,
      review_count: 1234
    },
    {
      name: "Air Fryer",
      price: 3999.99,
      description: "Oil-free air fryer for healthy cooking with digital controls.",
      image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Philips",
      rating: 4.4,
      review_count: 3456
    },
    {
      name: "Vacuum Cleaner",
      price: 4999.99,
      description: "Cordless vacuum cleaner with powerful suction and HEPA filter.",
      image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Dyson",
      rating: 4.5,
      review_count: 4567
    },
    {
      name: "Microwave Oven",
      price: 5999.99,
      description: "Countertop microwave with multiple power levels and defrost function.",
      image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "LG",
      rating: 4.0,
      review_count: 2345
    },
    {
      name: "Toaster",
      price: 1499.99,
      description: "4-slice toaster with adjustable browning and crumb tray.",
      image_url: "https://images.unsplash.com/photo-1556909114-4c36e03d6b5f?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Hamilton Beach",
      rating: 4.1,
      review_count: 1234
    },
    {
      name: "Electric Kettle",
      price: 999.99,
      description: "Fast-boiling electric kettle with auto shut-off and cordless design.",
      image_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Breville",
      rating: 4.2,
      review_count: 1876
    },
    {
      name: "Dishwasher",
      price: 24999.99,
      description: "Energy-efficient dishwasher with quiet operation and multiple cycles.",
      image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Bosch",
      rating: 4.3,
      review_count: 987
    },
    {
      name: "Washing Machine",
      price: 19999.99,
      description: "Front-load washing machine with smart features and large capacity.",
      image_url: "https://images.unsplash.com/photo-1626806787426-5910811b6325?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Samsung",
      rating: 4.4,
      review_count: 3456
    },
    {
      name: "Refrigerator",
      price: 29999.99,
      description: "Double-door refrigerator with frost-free technology and energy star rating.",
      image_url: "https://images.unsplash.com/photo-1584568694244-14e3f4c0b4b5?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "LG",
      rating: 4.2,
      review_count: 2345
    },
    {
      name: "Fiction Book: The Great Gatsby",
      price: 499.99,
      description: "Classic American novel by F. Scott Fitzgerald.",
      image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      category: "Books",
      brand: "Penguin",
      rating: 4.5,
      review_count: 5678
    },
    {
      name: "Non-Fiction Book: Sapiens",
      price: 799.99,
      description: "A brief history of humankind by Yuval Noah Harari.",
      image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
      category: "Books",
      brand: "Harper",
      rating: 4.6,
      review_count: 7890
    },
    {
      name: "Cookbook: Italian Cuisine",
      price: 699.99,
      description: "Delicious recipes from Italy with step-by-step instructions.",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      category: "Books",
      brand: "Williams Sonoma",
      rating: 4.3,
      review_count: 3456
    },
    {
      name: "Biography: Steve Jobs",
      price: 599.99,
      description: "The life and legacy of Apple's co-founder.",
      image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      category: "Books",
      brand: "Simon & Schuster",
      rating: 4.4,
      review_count: 4567
    },
    {
      name: "Self-Help Book: Atomic Habits",
      price: 649.99,
      description: "An easy and proven way to build good habits and break bad ones.",
      image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      category: "Books",
      brand: "Avery",
      rating: 4.7,
      review_count: 8901
    },
    {
      name: "T-Shirt",
      price: 799.99,
      description: "Cotton t-shirt with comfortable fit and classic design.",
      image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "H&M",
      rating: 4.0,
      review_count: 2345
    },
    {
      name: "Jeans",
      price: 1999.99,
      description: "Slim-fit jeans made from durable denim.",
      image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "Levi's",
      rating: 4.2,
      review_count: 3456
    },
    {
      name: "Sneakers",
      price: 2999.99,
      description: "Comfortable running sneakers with cushioning and support.",
      image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "Nike",
      rating: 4.3,
      review_count: 5678
    },
    {
      name: "Jacket",
      price: 3999.99,
      description: "Water-resistant jacket perfect for outdoor activities.",
      image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "The North Face",
      rating: 4.4,
      review_count: 2345
    },
    {
      name: "Hat",
      price: 499.99,
      description: "Stylish baseball cap with adjustable strap.",
      image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "Adidas",
      rating: 4.1,
      review_count: 1234
    },
    {
      name: "Dumbbells Set",
      price: 2499.99,
      description: "Adjustable dumbbells for home workouts, 5-50 lbs.",
      image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
      category: "Sports & Fitness",
      brand: "Bowflex",
      rating: 4.5,
      review_count: 3456
    },
    {
      name: "Yoga Block",
      price: 299.99,
      description: "Foam yoga block for support and alignment in poses.",
      image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      category: "Sports & Fitness",
      brand: "Gaiam",
      rating: 4.2,
      review_count: 1876
    },
    {
      name: "Tennis Racket",
      price: 3499.99,
      description: "Lightweight tennis racket with graphite frame.",
      image_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80",
      category: "Sports & Fitness",
      brand: "Wilson",
      rating: 4.3,
      review_count: 2345
    },
    {
      name: "Basketball",
      price: 1499.99,
      description: "Official size basketball with durable rubber cover.",
      image_url: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=800&q=80",
      category: "Sports & Fitness",
      brand: "Spalding",
      rating: 4.4,
      review_count: 3456
    },
    {
      name: "Cycling Helmet",
      price: 1999.99,
      description: "Safety helmet for cycling with adjustable fit and ventilation.",
      image_url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
      category: "Sports & Fitness",
      brand: "Giro",
      rating: 4.5,
      review_count: 1234
    },
    {
      name: "Backpack",
      price: 1299.99,
      description: "Durable backpack with multiple compartments for daily use.",
      image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      category: "Bags & Luggage",
      brand: "JanSport",
      rating: 4.2,
      review_count: 4567
    },
    {
      name: "Sunglasses",
      price: 999.99,
      description: "UV-protective sunglasses with polarized lenses.",
      image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "Ray-Ban",
      rating: 4.3,
      review_count: 5678
    },
    {
      name: "Watch",
      price: 4999.99,
      description: "Classic analog watch with leather strap and water resistance.",
      image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "Fossil",
      rating: 4.1,
      review_count: 2345
    },
    {
      name: "Wallet",
      price: 799.99,
      description: "Leather wallet with multiple card slots and RFID protection.",
      image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      category: "Fashion",
      brand: "Coach",
      rating: 4.0,
      review_count: 1234
    },
    {
      name: "Perfume",
      price: 1499.99,
      description: "Elegant fragrance with floral notes for everyday wear.",
      image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
      category: "Beauty & Personal Care",
      brand: "Chanel",
      rating: 4.4,
      review_count: 3456
    },
    {
      name: "Shampoo",
      price: 399.99,
      description: "Nourishing shampoo for all hair types with natural ingredients.",
      image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      category: "Beauty & Personal Care",
      brand: "Herbal Essences",
      rating: 4.2,
      review_count: 4567
    },
    {
      name: "Toothbrush",
      price: 199.99,
      description: "Electric toothbrush with timer and multiple brush heads.",
      image_url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80",
      category: "Beauty & Personal Care",
      brand: "Oral-B",
      rating: 4.3,
      review_count: 5678
    },
    {
      name: "Soap",
      price: 149.99,
      description: "Organic soap bar with moisturizing properties.",
      image_url: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=800&q=80",
      category: "Beauty & Personal Care",
      brand: "Dove",
      rating: 4.1,
      review_count: 2345
    },
    {
      name: "Candles Set",
      price: 599.99,
      description: "Scented candles set with relaxing aromas.",
      image_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Yankee Candle",
      rating: 4.4,
      review_count: 3456
    },
    {
      name: "Picture Frame",
      price: 499.99,
      description: "Wooden picture frame for 4x6 photos.",
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Generic",
      rating: 4.0,
      review_count: 1234
    },
    {
      name: "Throw Pillow",
      price: 699.99,
      description: "Soft throw pillow with decorative cover.",
      image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Casper",
      rating: 4.2,
      review_count: 2345
    },
    {
      name: "Plant Pot",
      price: 399.99,
      description: "Ceramic plant pot for indoor plants.",
      image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Generic",
      rating: 4.1,
      review_count: 1876
    },
    {
      name: "Wall Art",
      price: 1299.99,
      description: "Abstract wall art print for home decoration.",
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
      category: "Home & Kitchen",
      brand: "Art.com",
      rating: 4.3,
      review_count: 3456
    },
    {
      name: "Board Game",
      price: 899.99,
      description: "Fun board game for family entertainment.",
      image_url: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=800&q=80",
      category: "Toys & Games",
      brand: "Hasbro",
      rating: 4.4,
      review_count: 4567
    },
    {
      name: "Puzzle",
      price: 499.99,
      description: "1000-piece jigsaw puzzle with scenic landscape.",
      image_url: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=800&q=80",
      category: "Toys & Games",
      brand: "Ravensburger",
      rating: 4.5,
      review_count: 5678
    },
    {
      name: "Guitar",
      price: 7999.99,
      description: "Acoustic guitar with rich sound and comfortable playability.",
      image_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
      category: "Musical Instruments",
      brand: "Yamaha",
      rating: 4.6,
      review_count: 2345
    },
    {
      name: "Piano Keyboard",
      price: 14999.99,
      description: "88-key digital piano with weighted keys and built-in speakers.",
      image_url: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80",
      category: "Musical Instruments",
      brand: "Casio",
      rating: 4.4,
      review_count: 1234
    }
  ];

  const stmt = db.prepare("INSERT INTO products (name, price, description, image_url, category, brand, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  sampleProducts.forEach(product => {
    stmt.run(product.name, product.price, product.description, product.image_url, product.category, product.brand, product.rating, product.review_count);
  });
  stmt.finalize();

  console.log("Sample products added to DemoKart database.");
});

db.close();