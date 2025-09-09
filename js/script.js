let cart = [];
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const productsContainer = document.getElementById("products");
const categoriesContainer = document.querySelector("aside ul"); // category list
const modal = document.createElement("div");

const API_ENDPOINTS = {
  ALL: "https://openapi.programming-hero.com/api/plants",
  CATEGORIES: "https://openapi.programming-hero.com/api/categories",
  CATEGORY: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  DETAIL: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

async function loadCategories() {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORIES);
    const json = await res.json();
    const categories = json?.categories ?? [];

    categoriesContainer.innerHTML = "";

    categoriesContainer.innerHTML += `
      <li><button data-id="all" class="w-full text-left block px-3 py-2 bg-green-700 text-white rounded">
        All Trees
      </button></li>
    `;

    categories.forEach((cat) => {
      categoriesContainer.innerHTML += `
        <li>
          <button data-id="${cat.id}" class="w-full text-left block px-3 py-2 hover:bg-green-200 rounded">
            ${cat.category_name}
          </button>
        </li>
      `;
    });

    categoriesContainer.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (id === "all") {
          loadProducts(API_ENDPOINTS.ALL);
        } else {
          loadProducts(API_ENDPOINTS.CATEGORY(id));
        }
      });
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

async function loadProducts(url) {
  try {
    productsContainer.innerHTML = `
      <div class="col-span-3 flex justify-center py-8">
        <span class="animate-pulse text-gray-500">Loading plants...</span>
      </div>`;
    
    const res = await fetch(url);
    const json = await res.json();

    let products = json?.plants ?? [];

    products = products.slice(0, 6);

    renderProducts(products);
  } catch (err) {
    console.error("Error loading products:", err);
    productsContainer.innerHTML = `<p class="col-span-3 text-center text-red-500">Failed to load products.</p>`;
  }
}

function renderProducts(products) {
  productsContainer.innerHTML = "";
  if (products.length === 0) {
    productsContainer.innerHTML =
      `<p class="col-span-3 text-center text-gray-500">No plants found.</p>`;
    return;
  }

  products.forEach((product) => {
    productsContainer.innerHTML += `
      <div class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
        <div class="h-40 bg-gray-100 rounded flex items-center justify-center">
          <img src="${product.image}" alt="${product.name}" class="h-full object-contain"/>
        </div>
        <h3 class="mt-3 font-bold text-green-700 cursor-pointer hover:underline"
            onclick="showPlantDetail(${product.id})">
          ${product.name}
        </h3>
        <p class="text-sm text-gray-600">${product.description.slice(0, 60)}...</p>
        <span class="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded">
          ${product.category}
        </span>
        <div class="flex justify-between items-center mt-4">
          <span class="font-semibold">৳${product.price}</span>
          <button onclick="addToCart('${product.name}', ${product.price})" 
            class="bg-green-700 text-white text-sm px-1 rounded hover:bg-green-800">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

async function showPlantDetail(id) {
  try {
    const res = await fetch(API_ENDPOINTS.DETAIL(id));
    const json = await res.json();
    const plant = json?.plant ?? {};

    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
          <button onclick="closeModal()" class="absolute top-2 right-2 text-gray-600 hover:text-black text-xl">&times;</button>
          <img src="${plant.image}" alt="${plant.name}" class="h-48 mx-auto object-contain"/>
          <h2 class="mt-4 text-2xl font-bold text-green-700">${plant.name}</h2>
          <p class="mt-2 text-gray-600">${plant.description}</p>
          <p class="mt-2 font-semibold">Category: ${plant.category}</p>
          <p class="mt-2 font-semibold">Price: ৳${plant.price}</p>
          <button onclick="addToCart('${plant.name}', ${plant.price})"
            class="mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } catch (err) {
    console.error("Error loading plant detail:", err);
  }
}

function closeModal() {
  if (modal.parentNode) modal.parentNode.removeChild(modal);
}

function addToCart(name, price) {
  const item = cart.find((p) => p.name === name);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
}

function removeFromCart(name) {
  cart = cart.filter((p) => p.name !== name);
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
    cartItems.innerHTML += `
      <li class="flex justify-between items-center bg-gray-100 px-3 py-2 rounded">
        <span>${item.name} x${item.qty}</span>
        <div class="flex items-center space-x-2">
          <span>৳${item.price * item.qty}</span>
          <button onclick="removeFromCart('${item.name}')" class="text-red-500 font-bold">×</button>
        </div>
      </li>
    `;
  });
  cartTotal.textContent = `৳${total}`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts(API_ENDPOINTS.ALL);

  document.getElementById("nav-plant").addEventListener("click", () => loadProducts(API_ENDPOINTS.ALL));
  document.getElementById("nav-plant-btn").addEventListener("click", () => loadProducts(API_ENDPOINTS.ALL));
  document.getElementById("hero-get-involved").addEventListener("click", () => loadProducts(API_ENDPOINTS.ALL));
});
