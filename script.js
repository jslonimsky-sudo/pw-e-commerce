const products = [
  { id: 1, name: "Shadow Black", price: 4500, image: "img/negra.jpg",   tag: "BESTSELLER", size: "Único" },
  { id: 2, name: "Emerald Core", price: 4900, image: "img/verde.jpg",   tag: "NUEVO",      size: "Único" },
  { id: 3, name: "Cocoa Classic",price: 5200, image: "img/marron.jpg",                     size: "7 1/8" },
  { id: 4, name: "Sky Blue",     price: 4700, image: "img/celeste.jpg",                    size: "Único" },
  { id: 5, name: "Rose Edition", price: 5000, image: "img/rosa.jpg",                       size: "Único" },
  { id: 6, name: "Core Black",   price: 4800, image: "img/basica.jpg",                     size: "7 1/4" },
];

let cart = [];

// Referencias al DOM
const cartCount   = document.getElementById('cartCount');
const cartBtn     = document.getElementById('cartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart   = document.getElementById('closeCart');
const cartBody    = document.getElementById('cartBody');
const cartFooter  = document.getElementById('cartFooter');
const cartTotal   = document.getElementById('cartTotal');
const featuredGrid   = document.getElementById('featuredGrid');
const coleccionGrid  = document.getElementById('coleccionGrid');
const coleccionCount = document.getElementById('coleccionCount');

// ── NAVEGACIÓN ENTRE PÁGINAS ──
function showPage(page) {
  document.getElementById('page-home').style.display      = page === 'home'      ? 'block' : 'none';
  document.getElementById('page-coleccion').style.display = page === 'coleccion' ? 'block' : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── RENDERIZAR PRODUCTOS ──
function renderCard(product) {
  return `
    <li>
      <article class="card" data-id="${product.id}">
        <div class="card-img-wrap">
          <img src="${product.image}" alt="Gorra ${product.name}" loading="lazy" />
          ${product.tag ? `<span class="card-tag">${product.tag}</span>` : ''}
        </div>
        <div class="card-body">
          <div>
            <p class="card-name">${product.name}</p>
            <p class="card-price">${formatPrice(product.price)}</p>
          </div>
          <button class="add-btn" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito">
            + AGREGAR
          </button>
        </div>
      </article>
    </li>
  `;
}

// Destacados: primeros 4 productos
featuredGrid.innerHTML = products.slice(0, 4).map(renderCard).join('');

// Colección: todos los productos
coleccionGrid.innerHTML = products.map(renderCard).join('');
coleccionCount.textContent = products.length + ' MODELOS';

// ── DETECCIÓN DE CLICK EN TARJETA ──
// Usamos event delegation: un solo listener por grilla detecta el click
// y busca el data-id del article más cercano
[featuredGrid, coleccionGrid].forEach(grid => {
  grid.addEventListener('click', e => {
    // Si el click fue en el botón "+ AGREGAR", agregar al carrito sin abrir la vista
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      addToCart(Number(addBtn.dataset.add));
      return;
    }
    // Buscar la tarjeta clickeada por su data-id
    const card = e.target.closest('[data-id]');
    if (card) {
      openProductView(Number(card.dataset.id));
    }
  });
});

// ── AGREGAR AL CARRITO ──
// qty permite agregar más de una unidad desde la vista de producto
function addToCart(productId, qty = 1) {
  const product  = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  updateCartUI();
}

// ── CAMBIAR CANTIDAD ──
function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartUI();
}

// ── ACTUALIZAR INTERFAZ DEL CARRITO ──
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartBody.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    cartFooter.style.display = 'none';
  } else {
    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${formatPrice(item.price)} c/u</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)" aria-label="Quitar uno">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="Agregar uno">+</button>
        </div>
      </div>
    `).join('');
    cartTotal.textContent = formatPrice(totalPrice);
    cartFooter.style.display = 'block';
  }
}

// ── ABRIR / CERRAR CARRITO ──
cartBtn.addEventListener('click', () => {
  cartOverlay.classList.add('active');
  cartOverlay.setAttribute('aria-hidden', 'false');
});
closeCart.addEventListener('click', cerrarCarrito);
cartOverlay.addEventListener('click', e => {
  if (e.target === cartOverlay) cerrarCarrito();
});
function cerrarCarrito() {
  cartOverlay.classList.remove('active');
  cartOverlay.setAttribute('aria-hidden', 'true');
}

// ── FORMATEAR PRECIO ──
function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(price);
}

// ── VISTA INDIVIDUAL DE PRODUCTO ──
const productViewOverlay  = document.getElementById('productViewOverlay');
const closeProductViewBtn = document.getElementById('closeProductView');
const productViewImg      = document.getElementById('productViewImg');
const productViewTag      = document.getElementById('productViewTag');
const productViewName     = document.getElementById('productViewName');
const productViewPrice    = document.getElementById('productViewPrice');
const productViewSize       = document.getElementById('productViewSize');
const productViewQtyDisplay = document.getElementById('productViewQtyDisplay');
const productViewMinus    = document.getElementById('productViewMinus');
const productViewPlus     = document.getElementById('productViewPlus');
const productViewAddBtn   = document.getElementById('productViewAddBtn');

let productViewCurrentId  = null;  // id del producto abierto
let productViewCurrentQty = 1;     // cantidad seleccionada

function openProductView(productId) {
  // 1. Buscar el producto en el array usando su id
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // 2. Guardar referencia y resetear cantidad
  productViewCurrentId  = productId;
  productViewCurrentQty = 1;

  // 3. Insertar dinámicamente los datos del producto en el HTML
  productViewImg.src              = product.image;
  productViewImg.alt              = `Gorra ${product.name}`;
  productViewName.textContent     = product.name;
  productViewPrice.textContent    = formatPrice(product.price);
  productViewSize.textContent     = `Talle: ${product.size}`;
  productViewQtyDisplay.textContent = '1';

  if (product.tag) {
    productViewTag.textContent    = product.tag;
    productViewTag.style.display  = '';
  } else {
    productViewTag.style.display  = 'none';
  }

  // 4. Abrir el overlay
  productViewOverlay.classList.add('active');
  productViewOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function cerrarProductView() {
  productViewOverlay.classList.remove('active');
  productViewOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Botón cerrar
closeProductViewBtn.addEventListener('click', cerrarProductView);

// Click fuera del modal
productViewOverlay.addEventListener('click', e => {
  if (e.target === productViewOverlay) cerrarProductView();
});

// Tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && productViewOverlay.classList.contains('active')) {
    cerrarProductView();
  }
});

// Selector de cantidad
productViewMinus.addEventListener('click', () => {
  if (productViewCurrentQty > 1) {
    productViewCurrentQty--;
    productViewQtyDisplay.textContent = productViewCurrentQty;
  }
});

productViewPlus.addEventListener('click', () => {
  productViewCurrentQty++;
  productViewQtyDisplay.textContent = productViewCurrentQty;
});

// Agregar al carrito desde la vista — reutiliza la función existente
productViewAddBtn.addEventListener('click', () => {
  addToCart(productViewCurrentId, productViewCurrentQty);
  cerrarProductView();
});

// ── CHECKOUT ──
const checkoutOverlay  = document.getElementById('checkoutOverlay');
const checkoutBody     = document.getElementById('checkoutBody');
const checkoutItems    = document.getElementById('checkoutItems');
const checkoutTotal    = document.getElementById('checkoutTotal');
const checkoutSuccess  = document.getElementById('checkoutSuccess');
const closeCheckoutBtn = document.getElementById('closeCheckout');
const closeSuccessBtn  = document.getElementById('closeSuccess');
const checkoutForm     = document.getElementById('checkoutForm');
const inputName        = document.getElementById('checkout-name');
const inputEmail       = document.getElementById('checkout-email');
const inputAddress     = document.getElementById('checkout-address');

document.querySelector('.checkout-btn').addEventListener('click', openCheckout);
closeCheckoutBtn.addEventListener('click', cerrarCheckout);
checkoutOverlay.addEventListener('click', e => {
  if (e.target === checkoutOverlay) cerrarCheckout();
});
closeSuccessBtn.addEventListener('click', () => {
  cerrarCheckout();
  cerrarCarrito();
});

function openCheckout() {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  checkoutItems.innerHTML = cart.map(item => `
    <li class="checkout-item">
      <span class="checkout-item-name">${item.name}</span>
      <span class="checkout-item-qty">x${item.quantity}</span>
      <span class="checkout-item-price">${formatPrice(item.price * item.quantity)}</span>
    </li>
  `).join('');
  checkoutTotal.textContent = formatPrice(totalPrice);

  checkoutOverlay.classList.add('active');
  checkoutOverlay.setAttribute('aria-hidden', 'false');
}

function cerrarCheckout() {
  checkoutOverlay.classList.remove('active');
  checkoutOverlay.setAttribute('aria-hidden', 'true');
  clearCheckoutForm();
  checkoutBody.style.display = '';
  checkoutSuccess.classList.remove('visible');
}

function clearCheckoutForm() {
  inputName.value = '';
  inputEmail.value = '';
  inputAddress.value = '';
  [inputName, inputEmail, inputAddress].forEach(i => i.classList.remove('input-error'));
  ['error-name', 'error-email', 'error-address'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function setFieldError(inputEl, errorId, message) {
  inputEl.classList.add('input-error');
  document.getElementById(errorId).textContent = message;
}

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  [inputName, inputEmail, inputAddress].forEach(i => i.classList.remove('input-error'));
  ['error-name', 'error-email', 'error-address'].forEach(id => {
    document.getElementById(id).textContent = '';
  });

  let valid = true;
  if (!inputName.value.trim()) {
    setFieldError(inputName, 'error-name', 'El nombre es requerido');
    valid = false;
  }
  if (!inputEmail.value.trim()) {
    setFieldError(inputEmail, 'error-email', 'El email es requerido');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail.value)) {
    setFieldError(inputEmail, 'error-email', 'Email inválido');
    valid = false;
  }
  if (!inputAddress.value.trim()) {
    setFieldError(inputAddress, 'error-address', 'La dirección es requerida');
    valid = false;
  }
  if (!valid) return;

  cart = [];
  updateCartUI();
  checkoutBody.style.display = 'none';
  checkoutSuccess.classList.add('visible');
});