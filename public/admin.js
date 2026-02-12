const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const productForm = document.getElementById("productForm");
const adminProducts = document.getElementById("adminProducts");
const adminEmpty = document.getElementById("adminEmpty");
const productsContainer = document.getElementById("productsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const totalProductsEl = document.getElementById("totalProducts");
const totalCategoriesEl = document.getElementById("totalCategories");
const avgPriceEl = document.getElementById("avgPrice");

// Loading state to prevent multiple simultaneous requests
let isLoadingProducts = false;

// Dashboard elements
const todayVisitorsEl = document.getElementById("todayVisitors");
const todayPageViewsEl = document.getElementById("todayPageViews");
const activeUsersEl = document.getElementById("activeUsers");
const conversionRateEl = document.getElementById("conversionRate");
const activityLogsEl = document.getElementById("activityLogs");
const topProductsListEl = document.getElementById("topProductsList");
const trafficChart = document.getElementById("trafficChart");

// Tab elements
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const toggleAdmin = (isAdmin) => {
  if (isAdmin) {
    loginPanel.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadDashboardData();
  } else {
    adminPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
  }
};

const formatPrice = (price) => {
  return `₹${Number(price).toFixed(2)}`;
};

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  if (hasHalfStar) {
    stars += '☆';
  }
  for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
    stars += '☆';
  }
  return stars;
};

// Tab switching functionality
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetTab = btn.dataset.tab;

    // Remove active class from all tabs
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    // Add active class to clicked tab
    btn.classList.add("active");
    document.getElementById(targetTab + "Tab").classList.add("active");

    // Load data for the active tab (only if not already loaded)
    if (targetTab === "dashboard") {
      loadDashboardData();
    } else if (targetTab === "products") {
      // Only load products if not already loaded or if container is empty
      if (adminProducts.children.length === 0) {
        loadProducts();
      }
    }
  });
});

// Dashboard data loading functions
const loadDashboardData = () => {
  loadTrafficStats();
  loadActivityLogs();
  loadTopProducts();
  drawTrafficChart();
};

const loadTrafficStats = () => {
  fetch("/api/admin/analytics/traffic")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) return;

      const stats = data.traffic;
      todayVisitorsEl.textContent = stats.todayVisitors;
      todayPageViewsEl.textContent = stats.todayPageViews;
      activeUsersEl.textContent = stats.activeUsers;
      conversionRateEl.textContent = stats.conversionRate + "%";
    })
    .catch(() => {
      // Fallback to mock data if API fails
      todayVisitorsEl.textContent = Math.floor(Math.random() * 500) + 200;
      todayPageViewsEl.textContent = Math.floor(Math.random() * 1500) + 800;
      activeUsersEl.textContent = Math.floor(Math.random() * 50) + 20;
      conversionRateEl.textContent = (Math.random() * 5 + 1).toFixed(1) + "%";
    });
};

const loadActivityLogs = () => {
  fetch("/api/admin/analytics/activity")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) return;

      activityLogsEl.innerHTML = "";
      data.activities.forEach(log => {
        const logItem = document.createElement("div");
        logItem.className = `log-item ${log.type}`;
        logItem.innerHTML = `
          <span class="log-time">${log.time}</span>
          <span class="log-icon">${log.icon}</span>
          <span class="log-message">${log.message}</span>
        `;
        activityLogsEl.appendChild(logItem);
      });
    })
    .catch(() => {
      // Fallback to mock data if API fails
      const mockLogs = [
        { time: "14:32", type: "success", icon: "👤", message: "User 'john_doe' logged in successfully" },
        { time: "14:28", type: "info", icon: "🛒", message: "Product 'Wireless Headphones' added to cart" },
        { time: "14:25", type: "warning", icon: "⚠️", message: "Failed login attempt for user 'admin'" },
        { time: "14:20", type: "success", icon: "✅", message: "New product 'Smart Watch' added to catalog" },
        { time: "14:15", type: "info", icon: "👁️", message: "Product page viewed: 'Laptop Stand'" },
        { time: "14:10", type: "success", icon: "💳", message: "Order #1234 completed successfully" },
        { time: "14:05", type: "error", icon: "❌", message: "Payment failed for order #1233" },
        { time: "14:00", type: "info", icon: "🔍", message: "Search performed: 'wireless mouse'" }
      ];

      activityLogsEl.innerHTML = "";
      mockLogs.forEach(log => {
        const logItem = document.createElement("div");
        logItem.className = `log-item ${log.type}`;
        logItem.innerHTML = `
          <span class="log-time">${log.time}</span>
          <span class="log-icon">${log.icon}</span>
          <span class="log-message">${log.message}</span>
        `;
        activityLogsEl.appendChild(logItem);
      });
    });
};

const loadTopProducts = () => {
  fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) return;

      const products = data.products || [];
      // Sort by rating and review count for "top products"
      const topProducts = products
        .sort((a, b) => (b.rating * b.review_count) - (a.rating * a.review_count))
        .slice(0, 5);

      topProductsListEl.innerHTML = "";
      topProducts.forEach((product, index) => {
        const productItem = document.createElement("div");
        productItem.className = "top-product-item";
        productItem.innerHTML = `
          <div class="top-product-rank">${index + 1}</div>
          <img src="${product.image_url || '/placeholder.jpg'}" alt="${product.name}" class="top-product-image" onerror="this.src='/placeholder.jpg'" />
          <div class="top-product-info">
            <div class="top-product-name">${product.name}</div>
            <div class="top-product-stats">
              ${formatPrice(product.price)} • ${renderStars(product.rating)} (${product.review_count})
            </div>
          </div>
        `;
        topProductsListEl.appendChild(productItem);
      });
    });
};

const drawTrafficChart = () => {
  fetch("/api/admin/analytics/chart")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        // Fallback to mock data
        drawMockChart();
        return;
      }

      const { days, visitors, pageViews } = data.chart;
      drawChartWithData(days, visitors, pageViews);
    })
    .catch(() => {
      // Fallback to mock data if API fails
      drawMockChart();
    });
};

const drawMockChart = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const visitors = [120, 150, 180, 200, 250, 220, 190];
  const pageViews = [450, 520, 680, 750, 890, 780, 650];
  drawChartWithData(days, visitors, pageViews);
};

const drawChartWithData = (days, visitors, pageViews) => {
  const ctx = trafficChart.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, trafficChart.width, trafficChart.height);

  // Chart dimensions
  const chartWidth = trafficChart.width - 60;
  const chartHeight = trafficChart.height - 60;
  const barWidth = chartWidth / days.length / 2;

  // Find max values for scaling
  const maxVisitors = Math.max(...visitors);
  const maxPageViews = Math.max(...pageViews);
  const maxValue = Math.max(maxVisitors, maxPageViews);

  // Draw grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = 30 + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(trafficChart.width - 20, y);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#718096';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxValue * (5 - i) / 5), 35, y + 3);
  }

  // Draw bars
  visitors.forEach((value, index) => {
    const x = 50 + index * (chartWidth / days.length);
    const height = (value / maxValue) * chartHeight;

    // Visitors bar (blue)
    ctx.fillStyle = '#3182ce';
    ctx.fillRect(x, trafficChart.height - 30 - height, barWidth, height);

    // Page views bar (green)
    const pageViewHeight = (pageViews[index] / maxValue) * chartHeight;
    ctx.fillStyle = '#38a169';
    ctx.fillRect(x + barWidth, trafficChart.height - 30 - pageViewHeight, barWidth, pageViewHeight);
  });

  // Draw legend
  ctx.fillStyle = '#3182ce';
  ctx.fillRect(trafficChart.width - 120, 10, 12, 12);
  ctx.fillStyle = '#38a169';
  ctx.fillRect(trafficChart.width - 120, 25, 12, 12);

  ctx.fillStyle = '#2d3748';
  ctx.font = '12px Inter';
  ctx.textAlign = 'left';
  ctx.fillText('Visitors', trafficChart.width - 100, 18);
  ctx.fillText('Page Views', trafficChart.width - 100, 33);

  // Draw X-axis labels
  ctx.fillStyle = '#718096';
  ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  days.forEach((day, index) => {
    const x = 50 + index * (chartWidth / days.length) + barWidth;
    ctx.fillText(day, x, trafficChart.height - 10);
  });
};

const updateStats = (products) => {
  const totalProducts = products.length;
  const categories = new Set(products.map(p => p.category).filter(c => c));
  const totalCategories = categories.size;
  const avgPrice = totalProducts > 0
    ? products.reduce((sum, p) => sum + Number(p.price), 0) / totalProducts
    : 0;

  totalProductsEl.textContent = totalProducts;
  totalCategoriesEl.textContent = totalCategories;
  avgPriceEl.textContent = formatPrice(avgPrice);
};

const createEditForm = (product) => {
  const editForm = document.createElement("tr");
  editForm.className = "edit-form";
  editForm.innerHTML = `
    <td colspan="6">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 16px; background: #fefcbf; border: 1px solid #f6e05e; border-radius: 8px; margin-top: 8px;">
        <div>
          <label style="display: block; font-weight: 500; margin-bottom: 4px;">Name</label>
          <input type="text" value="${product.name}" class="edit-name form-input" style="width: 100%;" />
        </div>
        <div>
          <label style="display: block; font-weight: 500; margin-bottom: 4px;">Price (₹)</label>
          <input type="number" value="${product.price}" class="edit-price form-input" min="0" step="0.01" style="width: 100%;" />
        </div>
        <div>
          <label style="display: block; font-weight: 500; margin-bottom: 4px;">Category</label>
          <select class="edit-category form-input" style="width: 100%;">
            <option value="">Select Category</option>
            <option value="Electronics" ${product.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
            <option value="Fashion" ${product.category === 'Fashion' ? 'selected' : ''}>Fashion</option>
            <option value="Home & Kitchen" ${product.category === 'Home & Kitchen' ? 'selected' : ''}>Home & Kitchen</option>
            <option value="Books" ${product.category === 'Books' ? 'selected' : ''}>Books</option>
            <option value="Sports & Fitness" ${product.category === 'Sports & Fitness' ? 'selected' : ''}>Sports & Fitness</option>
            <option value="Beauty & Personal Care" ${product.category === 'Beauty & Personal Care' ? 'selected' : ''}>Beauty & Personal Care</option>
            <option value="Mobile Accessories" ${product.category === 'Mobile Accessories' ? 'selected' : ''}>Mobile Accessories</option>
            <option value="Computers" ${product.category === 'Computers' ? 'selected' : ''}>Computers</option>
            <option value="Wearable Technology" ${product.category === 'Wearable Technology' ? 'selected' : ''}>Wearable Technology</option>
            <option value="Toys & Games" ${product.category === 'Toys & Games' ? 'selected' : ''}>Toys & Games</option>
            <option value="Musical Instruments" ${product.category === 'Musical Instruments' ? 'selected' : ''}>Musical Instruments</option>
            <option value="Bags & Luggage" ${product.category === 'Bags & Luggage' ? 'selected' : ''}>Bags & Luggage</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-weight: 500; margin-bottom: 4px;">Brand</label>
          <input type="text" value="${product.brand || ''}" class="edit-brand form-input" style="width: 100%;" />
        </div>
        <div>
          <label style="display: block; font-weight: 500; margin-bottom: 4px;">Rating</label>
          <input type="number" value="${product.rating || 0}" class="edit-rating form-input" min="0" max="5" step="0.1" style="width: 100%;" />
        </div>
        <div style="display: flex; align-items: end; gap: 8px;">
          <button class="btn btn-primary save-edit" style="flex: 1;">Save</button>
          <button class="btn btn-outline cancel-edit" style="flex: 1;">Cancel</button>
        </div>
      </div>
    </td>
  `;

  // Add event listeners
  const saveBtn = editForm.querySelector(".save-edit");
  const cancelBtn = editForm.querySelector(".cancel-edit");

  saveBtn.addEventListener("click", () => {
    const updatedProduct = {
      name: editForm.querySelector(".edit-name").value,
      price: editForm.querySelector(".edit-price").value,
      category: editForm.querySelector(".edit-category").value,
      brand: editForm.querySelector(".edit-brand").value,
      rating: editForm.querySelector(".edit-rating").value,
      description: product.description,
      imageUrl: product.image_url,
      reviewCount: product.review_count
    };

    fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct)
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        loadProducts();
      } else {
        alert("Failed to update product: " + data.message);
      }
    });
  });

  cancelBtn.addEventListener("click", () => {
    loadProducts();
  });

  return editForm;
};

const loadProducts = () => {
  // Prevent multiple simultaneous loads
  if (isLoadingProducts) return;
  isLoadingProducts = true;

  fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        isLoadingProducts = false;
        return;
      }

      adminProducts.innerHTML = "";
      const products = data.products || [];

      updateStats(products);

      if (!products.length) {
        adminEmpty.classList.remove("hidden");
        productsContainer.classList.add("hidden");
        isLoadingProducts = false;
        return;
      }

      adminEmpty.classList.add("hidden");
      productsContainer.classList.remove("hidden");

      products.forEach((product) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>
            <img src="${product.image_url || '/placeholder.jpg'}" alt="${product.name}" class="product-image" onerror="this.src='/placeholder.jpg'" />
          </td>
          <td>
            <div class="product-name">${product.name}</div>
            <div style="color: var(--admin-text-light); font-size: 12px; margin-top: 4px;">
              ${product.brand ? `Brand: ${product.brand}` : ''}
            </div>
          </td>
          <td>
            <span class="product-category">${product.category || 'Uncategorized'}</span>
          </td>
          <td>
            <span class="product-price">${formatPrice(product.price)}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #d69e2e;">${renderStars(product.rating || 0)}</span>
              <span style="font-size: 12px; color: var(--admin-text-light);">(${product.review_count || 0})</span>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon btn-edit edit-btn" title="Edit Product">
                ✏️
              </button>
              <button class="btn-icon btn-delete delete-btn" title="Delete Product">
                🗑️
              </button>
            </div>
          </td>
        `;

        // Add event listeners for edit and delete
        const editBtn = row.querySelector(".edit-btn");
        const deleteBtn = row.querySelector(".delete-btn");

        editBtn.addEventListener("click", () => {
          // Close any existing edit forms first
          const existingEditForms = document.querySelectorAll(".edit-form");
          existingEditForms.forEach(form => form.remove());

          const existingEditForm = row.nextElementSibling;
          if (existingEditForm && existingEditForm.classList.contains("edit-form")) {
            existingEditForm.remove();
          } else {
            const editForm = createEditForm(product);
            row.parentNode.insertBefore(editForm, row.nextSibling);
          }
        });

        deleteBtn.addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            fetch(`/api/admin/products/${product.id}`, { method: "DELETE" })
              .then((res) => res.json())
              .then(() => loadProducts());
          }
        });

        adminProducts.appendChild(row);
      });

      isLoadingProducts = false;
    })
    .catch(() => {
      isLoadingProducts = false;
    });
};

// Check admin status on page load
fetch("/api/admin/me")
  .then((res) => res.json())
  .then((data) => {
    toggleAdmin(Boolean(data.isAdmin));
    if (data.isAdmin) {
      loadDashboardData();
      // Also load products if products tab is active
      const activeTab = document.querySelector(".tab-btn.active");
      if (activeTab && activeTab.dataset.tab === "products") {
        loadProducts();
      }
    }
  });

// Login form handler
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const formData = new FormData(loginForm);
  const payload = {
    username: formData.get("username"),
    password: formData.get("password")
  };

  fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        loginError.textContent = "Invalid username or password.";
        loginError.classList.remove("hidden");
        return;
      }

      loginForm.reset();
      toggleAdmin(true);
      loadDashboardData();
    })
    .catch(() => {
      loginError.textContent = "Login failed. Try again.";
      loginError.classList.remove("hidden");
    });
});

// Product form handler
productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(productForm);
  const payload = {
    name: formData.get("name"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
    category: formData.get("category"),
    brand: formData.get("brand"),
    rating: formData.get("rating"),
    reviewCount: formData.get("reviewCount")
  };

  fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        productForm.reset();
        loadProducts();
      }
    });
});

// Logout handler
logoutBtn.addEventListener("click", () => {
  fetch("/api/admin/logout", { method: "POST" }).then(() => {
    toggleAdmin(false);
  });
});

// Check admin status on page load
fetch("/api/admin/me")
  .then((res) => res.json())
  .then((data) => {
    toggleAdmin(Boolean(data.isAdmin));
    if (data.isAdmin) {
      loadDashboardData();
    }
  });
