let currentFilters = {};
let currentUser = null;

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const categoriesList = document.getElementById("categoriesList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const sortSelect = document.getElementById("sortSelect");
const applyFilters = document.getElementById("applyFilters");
const loginBtn = document.getElementById("loginBtn");
const userInfo = document.getElementById("userInfo");
const username = document.getElementById("username");
const logoutBtn = document.getElementById("logoutBtn");
const cartLink = document.getElementById("cartLink");
const cartCount = document.getElementById("cartCount");
const wishlistLink = document.getElementById("wishlistLink");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const productModal = document.getElementById("productModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const productDetails = document.getElementById("productDetails");

const formatPrice = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "₹0";
  }
  return `₹${amount.toLocaleString()}`;
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

const renderProducts = (products) => {
  productGrid.innerHTML = "";

  if (!products.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.onclick = () => showProductModal(product);

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.imageUrl || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80";
    image.alt = product.name;

    const info = document.createElement("div");
    info.className = "product-info";

    const brand = document.createElement("div");
    brand.className = "product-brand";
    brand.textContent = product.brand || "Generic";

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = product.name;

    const rating = document.createElement("div");
    rating.className = "product-rating";
    rating.innerHTML = `
      <span class="stars">${renderStars(product.rating)}</span>
      <span>(${product.review_count})</span>
    `;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const addToCartBtn = document.createElement("button");
    addToCartBtn.className = "btn-primary";
    addToCartBtn.textContent = "Add to Cart";
    addToCartBtn.onclick = (e) => {
      e.stopPropagation();
      addToCart(product.id);
    };

    const wishlistBtn = document.createElement("button");
    wishlistBtn.className = "btn-secondary";
    wishlistBtn.textContent = "Wishlist";
    wishlistBtn.onclick = (e) => {
      e.stopPropagation();
      addToWishlist(product.id);
    };

    actions.append(addToCartBtn, wishlistBtn);
    info.append(brand, name, rating, price, actions);
    card.append(image, info);
    productGrid.appendChild(card);
  });
};

const loadProducts = () => {
  const params = new URLSearchParams(currentFilters);
  fetch(`/api/products?${params}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        renderProducts(data.products || []);
      }
    })
    .catch(() => {
      emptyState.classList.remove("hidden");
    });
};

const loadCategories = () => {
  fetch("/api/categories")
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        categoriesList.innerHTML = '<a href="#" data-category="">All</a>';
        data.categories.forEach(category => {
          const link = document.createElement("a");
          link.href = "#";
          link.textContent = category;
          link.dataset.category = category;
          link.onclick = (e) => {
            e.preventDefault();
            currentFilters.category = category;
            loadProducts();
          };
          categoriesList.appendChild(link);
        });
      }
    });
};

const checkUser = () => {
  fetch("/api/user/me")
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        currentUser = data.user;
        loginBtn.classList.add("hidden");
        userInfo.classList.remove("hidden");
        username.textContent = data.user.username;
      } else {
        currentUser = null;
        userInfo.classList.add("hidden");
        loginBtn.classList.remove("hidden");
      }
      loadCartCount();
    });
};

const addToCart = (productId) => {
  if (!currentUser) {
    loginModal.classList.remove("hidden");
    return;
  }

  fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        loadCartCount();
        alert("Added to cart!");
      }
    });
};

const addToWishlist = (productId) => {
  if (!currentUser) {
    loginModal.classList.remove("hidden");
    return;
  }

  fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        alert("Added to wishlist!");
      }
    });
};

const loadCartCount = () => {
  if (!currentUser) {
    cartCount.textContent = "0";
    return;
  }

  fetch("/api/cart")
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        cartCount.textContent = data.cart.length;
      }
    });
};

const showProductModal = (product) => {
  productDetails.innerHTML = `
    <div class="product-details">
      <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'}" alt="${product.name}">
      <div class="product-details-info">
        <h2>${product.name}</h2>
        <div class="rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span>(${product.review_count} reviews)</span>
        </div>
        <div class="price">${formatPrice(product.price)}</div>
        <div class="description">${product.description || "No description available."}</div>
        <div class="product-actions">
          <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
          <button class="btn-secondary" onclick="addToWishlist(${product.id})">Add to Wishlist</button>
        </div>
      </div>
    </div>
  `;
  productModal.classList.remove("hidden");
};

// Event listeners
searchBtn.addEventListener("click", () => {
  currentFilters.search = searchInput.value;
  loadProducts();
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    currentFilters.search = searchInput.value;
    loadProducts();
  }
});

applyFilters.addEventListener("click", () => {
  currentFilters.minPrice = minPrice.value;
  currentFilters.maxPrice = maxPrice.value;
  currentFilters.sort = sortSelect.value;
  loadProducts();
});

loginBtn.addEventListener("click", () => {
  loginModal.classList.remove("hidden");
});

logoutBtn.addEventListener("click", () => {
  fetch("/api/user/logout", { method: "POST" }).then(() => {
    checkUser();
  });
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  fetch("/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: formData.get("username"),
      password: formData.get("password")
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        loginModal.classList.add("hidden");
        if (data.isAdmin && data.redirect) {
          // Admin login - redirect to admin page
          window.location.href = data.redirect;
        } else {
          // Regular user login
          checkUser();
        }
      } else {
        alert("Login failed: " + data.message);
      }
    });
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  fetch("/api/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password")
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        registerModal.classList.add("hidden");
        checkUser();
      } else {
        alert("Registration failed: " + data.message);
      }
    });
});

showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.classList.add("hidden");
  registerModal.classList.remove("hidden");
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerModal.classList.add("hidden");
  loginModal.classList.remove("hidden");
});

// Close modals
document.querySelectorAll(".close").forEach(closeBtn => {
  closeBtn.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    registerModal.classList.add("hidden");
    productModal.classList.add("hidden");
  });
});

// Initialize
loadCategories();
loadProducts();
checkUser();