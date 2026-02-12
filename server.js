const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const STIMULATOR_USER = process.env.STIMULATOR_USER || "stimulator";
const STIMULATOR_PASS = process.env.STIMULATOR_PASS || "stimulate2024";
const SESSION_SECRET = process.env.SESSION_SECRET || "demokart-dev-secret";

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "demokart.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
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
  // Analytics tables
  db.run(
    "CREATE TABLE IF NOT EXISTS page_views (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, user_id INTEGER, page TEXT, user_agent TEXT, ip_address TEXT, timestamp TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS user_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT UNIQUE, user_id INTEGER, start_time TEXT DEFAULT CURRENT_TIMESTAMP, last_activity TEXT DEFAULT CURRENT_TIMESTAMP, is_active INTEGER DEFAULT 1, FOREIGN KEY(user_id) REFERENCES users(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS activity_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, session_id TEXT, action TEXT, details TEXT, ip_address TEXT, timestamp TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id))"
  );
  // Attack logs table for IDS testing
  db.run(
    "CREATE TABLE IF NOT EXISTS attack_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, attack_type TEXT, details TEXT, severity TEXT, ip_address TEXT, session_id TEXT, timestamp TEXT DEFAULT CURRENT_TIMESTAMP)"
  );
});

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);

// Analytics middleware (must come before static files)
app.use((req, res, next) => {
  const sessionId = req.session.id || req.sessionID;
  const userId = req.session.userId || null;
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';

  // Track page views for main pages and HTML files (but not API calls or static assets)
  if ((req.path.endsWith('.html') || req.path === '/' || req.path === '/admin.html') &&
      !req.path.startsWith('/api/') &&
      !req.path.includes('.')) {
    const page = req.path === '/' ? '/index.html' : req.path;

    db.run(
      "INSERT INTO page_views (session_id, user_id, page, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)",
      [sessionId, userId, page, userAgent, ipAddress]
    );
  }

  // Update or create user session for all requests
  db.run(
    "INSERT OR REPLACE INTO user_sessions (session_id, user_id, last_activity, is_active) VALUES (?, ?, datetime('now'), 1)",
    [sessionId, userId]
  );

  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Route for stimulator page
app.get("/stimulator.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "stimulator.html"));
});

// Helper function to log activities
const logActivity = (userId, sessionId, action, details, ipAddress) => {
  db.run(
    "INSERT INTO activity_logs (user_id, session_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)",
    [userId, sessionId, action, details || '', ipAddress]
  );
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  return res.status(401).json({ ok: false, message: "Unauthorized" });
};

const requireStimulator = (req, res, next) => {
  if (req.session && req.session.isStimulator) {
    return next();
  }

  return res.status(401).json({ ok: false, message: "Unauthorized" });
};

app.get("/api/products", (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  let query = "SELECT id, name, price, description, image_url AS imageUrl, category, brand, rating, review_count FROM products WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (search) {
    query += " AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (minPrice) {
    query += " AND price >= ?";
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    query += " AND price <= ?";
    params.push(Number(maxPrice));
  }

  if (sort === "price_asc") {
    query += " ORDER BY price ASC";
  } else if (sort === "price_desc") {
    query += " ORDER BY price DESC";
  } else if (sort === "rating") {
    query += " ORDER BY rating DESC";
  } else {
    query += " ORDER BY datetime(created_at) DESC";
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    return res.json({ ok: true, products: rows });
  });
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.get(
    "SELECT id, name, price, description, image_url AS imageUrl, category, brand, rating, review_count FROM products WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ ok: false, message: "Database error" });
      }

      if (!row) {
        return res.status(404).json({ ok: false, message: "Product not found" });
      }

      return res.json({ ok: true, product: row });
    }
  );
});

app.get("/api/categories", (req, res) => {
  db.all("SELECT DISTINCT category FROM products ORDER BY category", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    const categories = rows.map(row => row.category);
    return res.json({ ok: true, categories });
  });
});

app.get("/api/cart", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const query = `
    SELECT c.id AS cartId, p.id, p.name, p.price, p.image_url AS imageUrl, c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.all(query, [req.session.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    return res.json({ ok: true, cart: rows });
  });
});

app.post("/api/cart", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const { productId, quantity } = req.body || {};
  const qty = Number(quantity) || 1;

  if (!productId || qty < 1) {
    return res.status(400).json({ ok: false, message: "Invalid data" });
  }

  db.run(
    "INSERT OR REPLACE INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
    [req.session.userId, productId, qty],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ ok: false, message: "Database error" });
      }

      logActivity(req.session.userId, req.session.id, 'cart_add', `Added product ${productId} to cart (quantity: ${qty})`, req.ip);
      return res.json({ ok: true, cartId: this.lastID });
    }
  );
});

app.delete("/api/cart/:cartId", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const { cartId } = req.params;
  db.run("DELETE FROM cart WHERE id = ? AND user_id = ?", [cartId, req.session.userId], (err) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    return res.json({ ok: true });
  });
});

app.get("/api/wishlist", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const query = `
    SELECT w.id AS wishlistId, p.id, p.name, p.price, p.image_url AS imageUrl, p.rating
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
  `;

  db.all(query, [req.session.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    return res.json({ ok: true, wishlist: rows });
  });
});

app.post("/api/wishlist", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const { productId } = req.body || {};

  if (!productId) {
    return res.status(400).json({ ok: false, message: "Invalid data" });
  }

  db.run(
    "INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
    [req.session.userId, productId],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ ok: false, message: "Database error" });
      }

      if (this.changes > 0) {
        logActivity(req.session.userId, req.session.id, 'wishlist_add', `Added product ${productId} to wishlist`, req.ip);
      }
      return res.json({ ok: true, wishlistId: this.lastID });
    }
  );
});

app.delete("/api/wishlist/:wishlistId", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const { wishlistId } = req.params;
  db.run("DELETE FROM wishlist WHERE id = ? AND user_id = ?", [wishlistId, req.session.userId], (err) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    return res.json({ ok: true });
  });
});

app.get("/api/admin/me", (req, res) => {
  return res.json({ ok: true, isAdmin: Boolean(req.session && req.session.isAdmin) });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Missing credentials" });
  }

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    logActivity(null, req.session.id, 'admin_login_failed', `Failed login attempt for username: ${username}`, req.ip);
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  }

  req.session.isAdmin = true;
  logActivity(null, req.session.id, 'admin_login_success', `Admin login successful for username: ${username}`, req.ip);
  return res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.post("/api/user/register", async (req, res) => {
  const { username, password, email } = req.body || {};

  if (!username || !password || !email) {
    return res.status(400).json({ ok: false, message: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email],
      function onInsert(err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            logActivity(null, req.session.id, 'user_register_failed', `Registration failed - username already exists: ${username}`, req.ip);
            return res.status(409).json({ ok: false, message: "Username already exists" });
          }
          return res.status(500).json({ ok: false, message: "Database error" });
        }

        req.session.userId = this.lastID;
        req.session.username = username;
        logActivity(this.lastID, req.session.id, 'user_register_success', `New user registered: ${username}`, req.ip);
        return res.json({ ok: true, user: { id: this.lastID, username, email } });
      }
    );
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

app.post("/api/user/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Missing credentials" });
  }

  // Check if admin credentials
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.username = username;
    logActivity(null, req.session.id, 'admin_login_success', `Admin login successful for username: ${username}`, req.ip);
    return res.json({ ok: true, isAdmin: true, redirect: "/admin.html" });
  }

  // Check if stimulator credentials
  if (username === STIMULATOR_USER && password === STIMULATOR_PASS) {
    req.session.isStimulator = true;
    req.session.username = username;
    logActivity(null, req.session.id, 'stimulator_login_success', `Stimulator login successful for username: ${username}`, req.ip);
    return res.json({ ok: true, isStimulator: true, redirect: "/stimulator.html" });
  }

  // Regular user login
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logActivity(null, req.session.id, 'user_login_failed', `Failed login attempt for username: ${username}`, req.ip);
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    logActivity(user.id, req.session.id, 'user_login_success', `User login successful: ${username}`, req.ip);
    return res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email } });
  });
});

app.post("/api/user/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/user/me", (req, res) => {
  if (req.session.userId) {
    return res.json({ ok: true, user: { id: req.session.userId, username: req.session.username } });
  }
  return res.json({ ok: false });
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  const { name, price, description, imageUrl, category, brand, rating, reviewCount } = req.body || {};
  const parsedPrice = Number.parseFloat(price);
  const parsedRating = Number.parseFloat(rating) || 0;
  const parsedReviewCount = Number.parseInt(reviewCount) || 0;

  if (!name || Number.isNaN(parsedPrice)) {
    return res.status(400).json({ ok: false, message: "Invalid product data" });
  }

  db.run(
    "INSERT INTO products (name, price, description, image_url, category, brand, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, parsedPrice, description || "", imageUrl || "", category || "", brand || "", parsedRating, parsedReviewCount],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ ok: false, message: "Database error" });
      }

      return res.json({ ok: true, id: this.lastID });
    }
  );
});

app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, price, description, imageUrl, category, brand, rating, reviewCount } = req.body || {};

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ ok: false, message: "Name and price are required" });
  }

  const parsedPrice = parseFloat(price);
  const parsedRating = rating ? parseFloat(rating) : 0;
  const parsedReviewCount = reviewCount ? parseInt(reviewCount) : 0;

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ ok: false, message: "Invalid price" });
  }

  db.run(
    "UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, category = ?, brand = ?, rating = ?, review_count = ? WHERE id = ?",
    [name, parsedPrice, description || "", imageUrl || "", category || "", brand || "", parsedRating, parsedReviewCount, id],
    function onUpdate(err) {
      if (err) {
        return res.status(500).json({ ok: false, message: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ ok: false, message: "Product not found" });
      }

      return res.json({ ok: true });
    }
  );
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ ok: false, message: "Database error" });
    }

    return res.json({ ok: true });
  });
});

// Analytics endpoints for dashboard
app.get("/api/admin/analytics/traffic", requireAdmin, (req, res) => {
  // Get today's traffic stats
  const today = new Date().toISOString().split('T')[0];

  // Today's visitors (unique sessions)
  db.get(
    "SELECT COUNT(DISTINCT session_id) as visitors FROM page_views WHERE date(timestamp) = ?",
    [today],
    (err, visitorsRow) => {
      if (err) return res.status(500).json({ ok: false, message: "Database error" });

      // Today's page views
      db.get(
        "SELECT COUNT(*) as pageViews FROM page_views WHERE date(timestamp) = ?",
        [today],
        (err, pageViewsRow) => {
          if (err) return res.status(500).json({ ok: false, message: "Database error" });

          // Active users (sessions active in last 30 minutes)
          db.get(
            "SELECT COUNT(*) as activeUsers FROM user_sessions WHERE is_active = 1 AND datetime(last_activity) > datetime('now', '-30 minutes')",
            [],
            (err, activeUsersRow) => {
              if (err) return res.status(500).json({ ok: false, message: "Database error" });

              // Calculate conversion rate (simplified - cart additions vs page views)
              db.get(
                "SELECT COUNT(DISTINCT a.user_id) as conversions FROM activity_logs a WHERE a.action = 'cart_add' AND date(a.timestamp) = ?",
                [today],
                (err, conversionsRow) => {
                  if (err) return res.status(500).json({ ok: false, message: "Database error" });

                  const visitors = visitorsRow.visitors || 0;
                  const pageViews = pageViewsRow.pageViews || 0;
                  const activeUsers = activeUsersRow.activeUsers || 0;
                  const conversions = conversionsRow.conversions || 0;
                  const conversionRate = visitors > 0 ? ((conversions / visitors) * 100).toFixed(1) : 0;

                  res.json({
                    ok: true,
                    traffic: {
                      todayVisitors: visitors,
                      todayPageViews: pageViews,
                      activeUsers: activeUsers,
                      conversionRate: parseFloat(conversionRate)
                    }
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

app.get("/api/admin/analytics/activity", requireAdmin, (req, res) => {
  // Get recent activity logs (last 20)
  db.all(
    `SELECT a.*, u.username
     FROM activity_logs a
     LEFT JOIN users u ON a.user_id = u.id
     ORDER BY a.timestamp DESC LIMIT 20`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, message: "Database error" });

      const activities = rows.map(row => ({
        time: new Date(row.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        type: getActivityType(row.action),
        icon: getActivityIcon(row.action),
        message: formatActivityMessage(row, row.username)
      }));

      res.json({ ok: true, activities });
    }
  );
});

app.get("/api/admin/analytics/chart", requireAdmin, (req, res) => {
  // Get weekly traffic data for chart
  const days = [];
  const visitors = [];
  const pageViews = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

    // Get visitors for this day
    db.get(
      "SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE date(timestamp) = ?",
      [dateStr],
      (err, row) => {
        if (err) return;
        visitors.push(row.count || 0);

        // Get page views for this day
        db.get(
          "SELECT COUNT(*) as count FROM page_views WHERE date(timestamp) = ?",
          [dateStr],
          (err, row) => {
            if (err) return;
            pageViews.push(row.count || 0);

            // Send response when all data is collected
            if (visitors.length === 7 && pageViews.length === 7) {
              res.json({
                ok: true,
                chart: {
                  days,
                  visitors,
                  pageViews
                }
              });
            }
          }
        );
      }
    );
  }
});

// Traffic stimulator routes
app.post("/api/stimulator/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Missing credentials" });
  }

  if (username === STIMULATOR_USER && password === STIMULATOR_PASS) {
    req.session.isStimulator = true;
    req.session.username = username;
    logActivity(null, req.session.id, 'stimulator_login_success', `Stimulator login successful for username: ${username}`, req.ip);
    return res.json({ ok: true, isStimulator: true });
  }

  logActivity(null, req.session.id, 'stimulator_login_failed', `Failed stimulator login attempt for username: ${username}`, req.ip);
  return res.status(401).json({ ok: false, message: "Invalid credentials" });
});

app.post("/api/stimulator/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/stimulator/me", (req, res) => {
  if (req.session.isStimulator) {
    return res.json({ ok: true, isStimulator: true, username: req.session.username });
  }
  return res.json({ ok: false });
});

// Attack simulation logging endpoint
app.post("/api/stimulator/log-attack", requireStimulator, (req, res) => {
  const { attackType, details, severity } = req.body || {};

  if (!attackType) {
    return res.status(400).json({ ok: false, message: "Attack type required" });
  }

  // Log attack attempt for IDS testing
  logActivity(null, req.session.id, `attack_${attackType}`, `Simulated ${attackType} attack: ${details || 'No details'}`, req.ip);

  // Also log to a separate attack log table if it exists
  db.run(
    "INSERT INTO attack_logs (attack_type, details, severity, ip_address, session_id, timestamp) VALUES (?, ?, ?, ?, ?, datetime('now'))",
    [attackType, details || '', severity || 'medium', req.ip, req.session.id],
    (err) => {
      if (err) {
        // Table might not exist, just log to activity_logs
        console.log(`Attack logged: ${attackType} from ${req.ip}`);
      }
    }
  );

  return res.json({ ok: true, logged: true });
});

// Helper functions for activity formatting
const getActivityType = (action) => {
  const typeMap = {
    'user_login_success': 'success',
    'admin_login_success': 'success',
    'stimulator_login_success': 'success',
    'user_register_success': 'success',
    'cart_add': 'info',
    'wishlist_add': 'info',
    'user_login_failed': 'warning',
    'admin_login_failed': 'warning',
    'stimulator_login_failed': 'warning',
    'user_register_failed': 'error'
  };
  return typeMap[action] || 'info';
};

const getActivityIcon = (action) => {
  const iconMap = {
    'user_login_success': '👤',
    'admin_login_success': '👑',
    'stimulator_login_success': '🚀',
    'user_register_success': '✨',
    'cart_add': '🛒',
    'wishlist_add': '❤️',
    'user_login_failed': '⚠️',
    'admin_login_failed': '🚫',
    'stimulator_login_failed': '🚫',
    'user_register_failed': '❌'
  };
  return iconMap[action] || '📝';
};

const formatActivityMessage = (row, username) => {
  const user = username || 'Anonymous';
  switch (row.action) {
    case 'user_login_success':
      return `User '${user}' logged in successfully`;
    case 'admin_login_success':
      return `Admin login successful`;
    case 'stimulator_login_success':
      return `Traffic stimulator login successful`;
    case 'user_register_success':
      return `New user '${user}' registered`;
    case 'cart_add':
      return `Product added to cart by ${user}`;
    case 'wishlist_add':
      return `Product added to wishlist by ${user}`;
    case 'user_login_failed':
      return `Failed login attempt for user '${user}'`;
    case 'admin_login_failed':
      return `Failed admin login attempt`;
    case 'stimulator_login_failed':
      return `Failed stimulator login attempt`;
    case 'user_register_failed':
      return `Registration failed for user '${user}'`;
    default:
      return row.details || `${row.action} by ${user}`;
  }
};

app.listen(PORT, () => {
  console.log(`DemoKart running on http://localhost:${PORT}`);
});
