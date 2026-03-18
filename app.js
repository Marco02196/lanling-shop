const STORAGE_KEY = "lanling-shop-cart";

const PRODUCTS = [
  {
    id: "aqua-pearl",
    name: "海蓝珍珠项链",
    price: 1680,
    desc: "淡水珍珠 + 925 银链，清爽百搭",
    tags: ["淡水珍珠", "925银", "40cm"],
    label: "项链",
  },
  {
    id: "skyline-ring",
    name: "天蓝光晕戒指",
    price: 1299,
    desc: "莫桑石切割，日常也闪",
    tags: ["莫桑石", "S925", "可调节"],
    label: "戒指",
  },
  {
    id: "breeze-earrings",
    name: "轻云耳坠",
    price: 899,
    desc: "水滴玻璃与银镀层，轻盈有层次",
    tags: ["轻奢", "防过敏", "通勤"],
    label: "耳饰",
  },
];

const formatPrice = (value) => `¥${value.toLocaleString("zh-CN")}`;

const getCart = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const setCart = (cart) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
};

const addToCart = (id, amount = 1) => {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + amount;
  if (cart[id] <= 0) {
    delete cart[id];
  }
  setCart(cart);
  return cart;
};

const removeFromCart = (id) => {
  const cart = getCart();
  delete cart[id];
  setCart(cart);
  return cart;
};

const buildProductCards = () => {
  const container = document.querySelector("[data-products]");
  if (!container) return;
  container.innerHTML = "";

  PRODUCTS.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-media">
        <span>${product.label}</span>
      </div>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="product-tags">
        ${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <div class="price">${formatPrice(product.price)}</div>
      <button class="btn btn-primary" data-add="${product.id}">
        加入购物车
      </button>
    `;
    card.style.animation = `fadeUp 0.4s ease ${index * 0.08}s both`;
    container.appendChild(card);
  });
};

const updateCartBadge = () => {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const cart = getCart();
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  badge.textContent = count;
};

const showToast = (message) => {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.dataset.timer);
  toast.dataset.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
};

const renderCart = () => {
  const list = document.querySelector("[data-cart-list]");
  const summary = document.querySelector("[data-summary]");
  const empty = document.querySelector("[data-cart-empty]");
  if (!list || !summary) return;

  const cart = getCart();
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return null;
      return { ...product, qty };
    })
    .filter(Boolean);

  list.innerHTML = "";

  if (items.length === 0) {
    if (empty) empty.style.display = "block";
    summary.style.display = "none";
    return;
  }

  if (empty) empty.style.display = "none";
  summary.style.display = "block";

  let subtotal = 0;
  items.forEach((item) => {
    subtotal += item.price * item.qty;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="product-media"><span>${item.label}</span></div>
      <div>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="price">${formatPrice(item.price)}</div>
      </div>
      <div>
        <div class="qty-control">
          <button class="btn btn-outline" data-dec="${item.id}">-</button>
          <strong>${item.qty}</strong>
          <button class="btn btn-outline" data-inc="${item.id}">+</button>
        </div>
        <div class="cart-actions">
          <button class="btn btn-outline" data-remove="${item.id}">移除</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });

  const shipping = subtotal >= 2000 ? 0 : 20;
  const discount = subtotal >= 3000 ? 150 : 0;
  const total = subtotal + shipping - discount;

  summary.innerHTML = `
    <div class="summary-row"><span>商品小计</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>运费</span><span>${shipping === 0 ? "免运费" : formatPrice(shipping)}</span></div>
    <div class="summary-row"><span>优惠</span><span>${discount === 0 ? "-" : `-${formatPrice(discount)}`}</span></div>
    <hr />
    <div class="summary-row summary-total"><span>应付</span><span>${formatPrice(total)}</span></div>
    <button class="btn btn-primary" style="width: 100%; margin-top: 12px;">去结算</button>
  `;
};

const bindEvents = () => {
  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const addId = target.getAttribute("data-add");
    if (addId) {
      addToCart(addId, 1);
      updateCartBadge();
      showToast("已加入购物车");
      return;
    }

    const incId = target.getAttribute("data-inc");
    if (incId) {
      addToCart(incId, 1);
      renderCart();
      updateCartBadge();
      return;
    }

    const decId = target.getAttribute("data-dec");
    if (decId) {
      addToCart(decId, -1);
      renderCart();
      updateCartBadge();
      return;
    }

    const removeId = target.getAttribute("data-remove");
    if (removeId) {
      removeFromCart(removeId);
      renderCart();
      updateCartBadge();
    }
  });
};

const initPage = () => {
  buildProductCards();
  updateCartBadge();
  renderCart();
  bindEvents();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}


