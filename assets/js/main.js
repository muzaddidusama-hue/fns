/**
 * FNS - Faizan Network Solution
 * Core Application Engine & Interactivity
 */

// Global State
const FNS = {
  theme: 'dark',
  products: [],
  cart: [],
  compare: [],
  activeSlide: 0,
  slideInterval: null,
  contact: {
    name: 'FNS - Faizan Network Solution',
    address: 'House :27, Road:4/A, Sector:5, Uttara Dhaka-1230',
    phone: '01613410777',
    phoneFormatted: '+880 1613-410777',
    phoneIntl: '+8801613410777',
    whatsapp: '8801613410777',
    email: 'faizannetworksolution@gmail.com'
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStorage();
  loadProducts();
  initHeroCarousel();
  initEventListeners();
  initQuickModals();
  updateBadgeCounts();
  if (document.getElementById('builder-form')) {
    initBuilder();
  }
});

// 1. Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('fns_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');
  setTheme(savedTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  });
}

function setTheme(theme) {
  FNS.theme = theme;
  localStorage.setItem('fns_theme', theme);
  const root = document.documentElement;
  const logos = document.querySelectorAll('.fns-logo-img');
  
  if (theme === 'dark') {
    root.classList.add('dark');
    logos.forEach(img => {
      img.src = 'assets/images/fns-logo-dark.svg';
    });
  } else {
    root.classList.remove('dark');
    logos.forEach(img => {
      img.src = 'assets/images/fns-logo-light.svg';
    });
  }

  // Update theme icons
  document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', theme !== 'dark'));
  document.querySelectorAll('.theme-icon-sun').forEach(el => el.classList.toggle('hidden', theme === 'dark'));
}

// 2. Storage & State
function initStorage() {
  try {
    FNS.cart = JSON.parse(localStorage.getItem('fns_cart')) || [];
    FNS.compare = JSON.parse(localStorage.getItem('fns_compare')) || [];
  } catch (e) {
    FNS.cart = [];
    FNS.compare = [];
  }
}

function saveCart() {
  localStorage.setItem('fns_cart', JSON.stringify(FNS.cart));
  updateBadgeCounts();
  renderCartDrawer();
}

function saveCompare() {
  localStorage.setItem('fns_compare', JSON.stringify(FNS.compare));
  updateBadgeCounts();
  renderCompareModal();
}

function updateBadgeCounts() {
  const cartBadges = document.querySelectorAll('.cart-count-badge');
  const cartTotal = FNS.cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadges.forEach(b => {
    b.textContent = cartTotal;
    b.classList.toggle('hidden', cartTotal === 0);
  });

  const compareBadges = document.querySelectorAll('.compare-count-badge');
  compareBadges.forEach(b => {
    b.textContent = FNS.compare.length;
    b.classList.toggle('hidden', FNS.compare.length === 0);
  });
}

// 3. Products Loading
async function loadProducts() {
  try {
    const res = await fetch('assets/data/products.json');
    if (res.ok) {
      FNS.products = await res.json();
      console.log('Loaded products:', FNS.products.length);
      onProductsReady();
    }
  } catch (e) {
    console.error('Failed to load products:', e);
  }
}

function onProductsReady() {
  // If on shop page, render catalog
  if (document.getElementById('shop-product-grid')) {
    renderShopGrid();
  }
  // If on home page, render category tabs or featured
  if (document.getElementById('home-mikrotik-grid')) {
    renderHomeGrids();
  }
  renderCartDrawer();
  renderCompareModal();
}

// 4. Hero Carousel
function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  if (!slides.length) return;

  function showSlide(idx) {
    FNS.activeSlide = (idx + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.style.transform = `translateX(${-FNS.activeSlide * 100}%)`;
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === FNS.activeSlide);
      d.classList.toggle('bg-blue-600', i === FNS.activeSlide);
      d.classList.toggle('bg-white/40', i !== FNS.activeSlide);
    });
  }

  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');

  if (prevBtn) prevBtn.addEventListener('click', () => { showSlide(FNS.activeSlide - 1); resetInterval(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { showSlide(FNS.activeSlide + 1); resetInterval(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { showSlide(i); resetInterval(); });
  });

  function startInterval() {
    FNS.slideInterval = setInterval(() => {
      showSlide(FNS.activeSlide + 1);
    }, 5500);
  }

  function resetInterval() {
    clearInterval(FNS.slideInterval);
    startInterval();
  }

  startInterval();
}

// 5. Global Event Listeners (Cart Drawer, Modals, Search, Mobile Menu)
function initEventListeners() {
  // Mobile menu
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  const mobileClose = document.getElementById('mobile-menu-close');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => mobileDrawer.classList.add('active'));
  }
  if (mobileClose && mobileDrawer) {
    mobileClose.addEventListener('click', () => mobileDrawer.classList.remove('active'));
  }

  // Cart Drawer
  const cartToggles = document.querySelectorAll('.cart-open-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartClose = document.getElementById('cart-drawer-close');

  cartToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      renderCartDrawer();
      if (cartDrawer) cartDrawer.classList.add('active');
    });
  });
  if (cartClose && cartDrawer) {
    cartClose.addEventListener('click', () => cartDrawer.classList.remove('active'));
  }

  // Compare Modal
  const compareToggles = document.querySelectorAll('.compare-open-btn');
  const compareModal = document.getElementById('compare-modal');
  const compareClose = document.getElementById('compare-modal-close');

  compareToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      renderCompareModal();
      if (compareModal) compareModal.classList.add('active');
    });
  });
  if (compareClose && compareModal) {
    compareClose.addEventListener('click', () => compareModal.classList.remove('active'));
  }

  // Search Modal
  const searchToggles = document.querySelectorAll('.search-open-btn');
  const searchModal = document.getElementById('search-modal');
  const searchClose = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('search-input');

  searchToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      if (searchModal) {
        searchModal.classList.add('active');
        setTimeout(() => searchInput && searchInput.focus(), 100);
      }
    });
  });
  if (searchClose && searchModal) {
    searchClose.addEventListener('click', () => searchModal.classList.remove('active'));
  }

  // Keyboard shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchModal) {
        searchModal.classList.add('active');
        setTimeout(() => searchInput && searchInput.focus(), 100);
      }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer-backdrop.active, .modal-overlay.active').forEach(el => el.classList.remove('active'));
    }
  });

  // Search Input Filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value.trim());
    });
  }

  // Close backdrops on click
  document.querySelectorAll('.drawer-backdrop, .modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

// 6. Search Functionality
function handleSearch(query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (!query) {
    resultsContainer.innerHTML = '<div class="py-8 text-center text-sm text-slate-500 dark:text-zinc-400">Type product name, model (e.g. X44, R730, Cisco), or category...</div>';
    return;
  }

  const q = query.toLowerCase();
  const matched = FNS.products.filter(p => {
    return p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.specs.some(s => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q));
  });

  if (!matched.length) {
    resultsContainer.innerHTML = `<div class="py-8 text-center text-sm text-slate-500 dark:text-zinc-400">No products found matching "${query}". Contact us directly on WhatsApp for customized hardware.</div>`;
    return;
  }

  resultsContainer.innerHTML = matched.map(p => `
    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
      <div class="flex items-center gap-3">
        <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-contain rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800">
        <div>
          <div class="text-xs font-semibold text-blue-600 dark:text-blue-400">${p.categoryName}</div>
          <div class="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-500" onclick="openProductQuickView('${p.id}')">${p.name}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white" onclick="openProductQuickView('${p.id}')">View</button>
        <button class="p-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700" title="Add to Quote Cart" onclick="addToCart('${p.id}')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

// 7. Cart & Quote Drawer Functionality
window.addToCart = function(productId) {
  const p = FNS.products.find(item => item.id === productId);
  if (!p) return;

  const existing = FNS.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    FNS.cart.push({
      id: p.id,
      name: p.name,
      image: p.image,
      category: p.categoryName,
      qty: 1
    });
  }
  saveCart();
  showToast(`Added "${p.name}" to Quote Cart!`);
};

window.removeFromCart = function(productId) {
  FNS.cart = FNS.cart.filter(item => item.id !== productId);
  saveCart();
};

window.updateCartQty = function(productId, delta) {
  const item = FNS.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
  }
};

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-drawer-footer');
  if (!container) return;

  if (FNS.cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <p class="text-base font-semibold text-slate-700 dark:text-zinc-300">Your Quote Cart is empty</p>
        <p class="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs mx-auto">Browse our PC MikroTik routers, servers, switches, and network adapters to build your quote.</p>
        <a href="shop.html" class="inline-block mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider">Browse Catalog</a>
      </div>
    `;
    if (footer) footer.classList.add('hidden');
    return;
  }

  if (footer) footer.classList.remove('hidden');

  container.innerHTML = FNS.cart.map(item => `
    <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
      <div class="flex items-center gap-3">
        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-contain rounded-lg bg-white dark:bg-zinc-800 p-1 border border-slate-200 dark:border-zinc-700">
        <div>
          <div class="text-[11px] font-semibold text-blue-600 dark:text-blue-400">${item.category}</div>
          <div class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">${item.name}</div>
          <div class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Price: <span class="font-medium text-emerald-600 dark:text-emerald-400">On Request</span></div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center border border-slate-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
          <button class="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-zinc-700" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span class="px-2 text-xs font-bold">${item.qty}</span>
          <button class="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-zinc-700" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
        <button class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg" onclick="removeFromCart('${item.id}')" title="Remove">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

window.sendWhatsAppQuote = function() {
  if (FNS.cart.length === 0) {
    showToast('Your quote cart is empty!');
    return;
  }
  
  // Prompt or collect customer info
  const custName = prompt("Please enter your Name or Company:", "Valued Client") || "Direct Customer";
  const custPhone = prompt("Please enter your Phone number for order tracking:", "01XXXXXXXXX") || FNS.contact.phone;

  // Log order into fns_orders
  try {
    const orders = JSON.parse(localStorage.getItem('fns_orders')) || [];
    const newOrder = {
      id: "FNS-" + Math.floor(100000 + Math.random() * 900000),
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: "",
      location: "Dhaka, Bangladesh",
      items: FNS.cart.map(i => ({ name: i.name, qty: i.qty, category: i.category })),
      totalItems: FNS.cart.reduce((s, i) => s + i.qty, 0),
      note: "Quotation request submitted from Cart Drawer",
      date: new Date().toISOString(),
      status: "Pending"
    };
    orders.unshift(newOrder);
    localStorage.setItem('fns_orders', JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }

  let msg = `Hello FNS - Faizan Network Solution,%0A%0AI would like to request an official quotation for the following items:%0A`;
  FNS.cart.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name} (Qty: ${item.qty})%0A`;
  });
  msg += `%0AClient: ${encodeURIComponent(custName)} (${encodeURIComponent(custPhone)})%0APlease provide delivery time, pricing, and warranty details.%0AThank you!`;
  window.open(`https://wa.me/${FNS.contact.whatsapp}?text=${msg}`, '_blank');
  showToast('Quotation logged! Opening WhatsApp...');
};

// 8. Compare Modal Functionality
window.addToCompare = function(productId) {
  const p = FNS.products.find(i => i.id === productId);
  if (!p) return;
  if (FNS.compare.some(i => i.id === productId)) {
    showToast(`"${p.name}" is already in comparison!`);
    return;
  }
  if (FNS.compare.length >= 4) {
    showToast('You can compare up to 4 products at a time!');
    return;
  }
  FNS.compare.push(p);
  saveCompare();
  showToast(`Added "${p.name}" to Comparison!`);
};

window.removeFromCompare = function(productId) {
  FNS.compare = FNS.compare.filter(i => i.id !== productId);
  saveCompare();
};

function renderCompareModal() {
  const container = document.getElementById('compare-content');
  if (!container) return;

  if (FNS.compare.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center">
        <p class="text-base font-semibold text-slate-700 dark:text-zinc-300">No products selected for comparison</p>
        <p class="text-xs text-slate-500 dark:text-zinc-500 mt-1">Click the compare icon on any product card in the Shop or Homepage to compare specifications.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm border-collapse">
        <thead>
          <tr class="border-b border-slate-200 dark:border-zinc-800">
            <th class="p-3 font-bold text-slate-500 dark:text-zinc-400 w-1/4">Specification</th>
            ${FNS.compare.map(p => `
              <th class="p-3 w-1/4 align-top">
                <div class="relative group">
                  <button class="absolute top-0 right-0 p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-950" onclick="removeFromCompare('${p.id}')">✕</button>
                  <img src="${p.image}" alt="${p.name}" class="w-20 h-20 object-contain mx-auto mb-2 rounded-lg bg-slate-50 dark:bg-zinc-800 p-1">
                  <div class="font-bold text-xs line-clamp-2 text-slate-900 dark:text-white">${p.name}</div>
                  <div class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">${p.brand}</div>
                  <button class="mt-2 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold" onclick="addToCart('${p.id}')">+ Add to Quote</button>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
          <tr>
            <td class="p-3 font-semibold text-slate-600 dark:text-zinc-400">Category</td>
            ${FNS.compare.map(p => `<td class="p-3 font-medium text-slate-800 dark:text-zinc-200">${p.categoryName}</td>`).join('')}
          </tr>
          <tr>
            <td class="p-3 font-semibold text-slate-600 dark:text-zinc-400">Processor / Chipset</td>
            ${FNS.compare.map(p => {
              const spec = p.specs.find(s => s.label.toLowerCase().includes('processor') || s.label.toLowerCase().includes('chipset') || s.label.toLowerCase().includes('controller'));
              return `<td class="p-3 text-xs text-slate-700 dark:text-zinc-300">${spec ? spec.value : 'Enterprise Standard'}</td>`;
            }).join('')}
          </tr>
          <tr>
            <td class="p-3 font-semibold text-slate-600 dark:text-zinc-400">Networking & Ports</td>
            ${FNS.compare.map(p => {
              const spec = p.specs.find(s => s.label.toLowerCase().includes('network') || s.label.toLowerCase().includes('port') || s.label.toLowerCase().includes('interface'));
              return `<td class="p-3 text-xs text-slate-700 dark:text-zinc-300">${spec ? spec.value : 'Multi-Port'}</td>`;
            }).join('')}
          </tr>
          <tr>
            <td class="p-3 font-semibold text-slate-600 dark:text-zinc-400">Memory & Storage</td>
            ${FNS.compare.map(p => {
              const mem = p.specs.find(s => s.label.toLowerCase().includes('memory') || s.label.toLowerCase().includes('ram'));
              const st = p.specs.find(s => s.label.toLowerCase().includes('storage') || s.label.toLowerCase().includes('capacity'));
              return `<td class="p-3 text-xs text-slate-700 dark:text-zinc-300">${mem ? mem.value : ''} ${st ? '<br>' + st.value : ''}</td>`;
            }).join('')}
          </tr>
          <tr>
            <td class="p-3 font-semibold text-slate-600 dark:text-zinc-400">Throughput / Users</td>
            ${FNS.compare.map(p => {
              const bw = p.specs.find(s => s.label.toLowerCase().includes('bandwidth') || s.label.toLowerCase().includes('throughput') || s.label.toLowerCase().includes('capacity'));
              const usr = p.specs.find(s => s.label.toLowerCase().includes('user') || s.label.toLowerCase().includes('concurrent'));
              return `<td class="p-3 text-xs text-slate-700 dark:text-zinc-300">${bw ? bw.value : ''} ${usr ? '<br>' + usr.value : ''}</td>`;
            }).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// 9. Quick View Modal
window.openProductQuickView = function(productId) {
  const p = FNS.products.find(i => i.id === productId);
  if (!p) return;

  const modal = document.getElementById('quick-view-modal');
  const container = document.getElementById('quick-view-content');
  if (!modal || !container) return;

  const waLink = `https://wa.me/${FNS.contact.whatsapp}?text=Hello%20FNS%20-%20Faizan%20Network%20Solution%2C%20I%20would%20like%20to%20order%20%2F%20get%20a%20quote%20for%3A%20${encodeURIComponent(p.name)}`;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div class="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
        <img src="${p.image}" alt="${p.name}" class="w-full max-h-72 object-contain rounded-xl drop-shadow-md">
        <div class="mt-4 flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">${p.badge || p.brand}</span>
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">In Stock in Uttara</span>
        </div>
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">${p.categoryName}</div>
          <h2 class="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${p.name}</h2>
          <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-2">Price: On Request (Best BD Rate)</div>
          <p class="text-xs text-slate-600 dark:text-zinc-300 mt-3 leading-relaxed">${p.description}</p>
          
          <div class="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <h4 class="text-xs font-extrabold tracking-wide uppercase text-slate-900 dark:text-white mb-2">Key Specifications</h4>
            <div class="space-y-1.5">
              ${p.specs.map(s => `
                <div class="flex items-start justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800/60">
                  <span class="font-semibold text-slate-500 dark:text-zinc-400">${s.label}:</span>
                  <span class="font-bold text-slate-800 dark:text-zinc-200 text-right">${s.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
          <button class="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-transform active:scale-95" onclick="addToCart('${p.id}')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add to Quote
          </button>
          <a href="${waLink}" target="_blank" class="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 transition-transform active:scale-95">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
            WhatsApp Quote
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

function initQuickModals() {
  const qvModal = document.getElementById('quick-view-modal');
  const qvClose = document.getElementById('quick-view-close');
  if (qvClose && qvModal) {
    qvClose.addEventListener('click', () => qvModal.classList.remove('active'));
  }
}

// 10. Home Grids Rendering
function renderHomeGrids() {
  const container = document.getElementById('home-mikrotik-grid');
  if (!container) return;

  const mikrotikProducts = FNS.products.filter(p => p.category === 'pc-mikrotik');
  container.innerHTML = mikrotikProducts.map(p => createProductCardHtml(p)).join('');

  // Render servers grid if present
  const serverContainer = document.getElementById('home-servers-grid');
  if (serverContainer) {
    serverContainer.innerHTML = FNS.products.filter(p => p.category === 'servers').map(p => createProductCardHtml(p)).join('');
  }

  // Render switches grid if present
  const switchesContainer = document.getElementById('home-switches-grid');
  if (switchesContainer) {
    switchesContainer.innerHTML = FNS.products.filter(p => p.category === 'switches-routers').map(p => createProductCardHtml(p)).join('');
  }

  // Render adapters grid if present
  const adaptersContainer = document.getElementById('home-adapters-grid');
  if (adaptersContainer) {
    adaptersContainer.innerHTML = FNS.products.filter(p => p.category === 'network-adapters').map(p => createProductCardHtml(p)).join('');
  }

  // Render storage grid if present
  const storageContainer = document.getElementById('home-storage-grid');
  if (storageContainer) {
    storageContainer.innerHTML = FNS.products.filter(p => p.category === 'storage').map(p => createProductCardHtml(p)).join('');
  }
}

// 11. Shop Grid Rendering with Filters
function renderShopGrid() {
  const container = document.getElementById('shop-product-grid');
  if (!container) return;

  // Read URL params or active filters
  const urlParams = new URLSearchParams(window.location.search);
  const activeCat = urlParams.get('category') || 'all';
  const activeBrand = urlParams.get('brand') || 'all';
  const searchQuery = (urlParams.get('q') || '').toLowerCase();

  let filtered = FNS.products;
  if (activeCat !== 'all') {
    filtered = filtered.filter(p => p.category === activeCat);
  }
  if (activeBrand !== 'all') {
    filtered = filtered.filter(p => p.brand.toLowerCase().includes(activeBrand.toLowerCase()));
  }
  if (searchQuery) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery) || p.categoryName.toLowerCase().includes(searchQuery));
  }

  const countEl = document.getElementById('shop-total-count');
  if (countEl) countEl.textContent = `${filtered.length} Products Available`;

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <p class="text-base font-semibold text-slate-700 dark:text-zinc-300">No products found in this category</p>
        <p class="text-xs text-slate-500 dark:text-zinc-500 mt-1">Try selecting another category or chat with our team on WhatsApp.</p>
        <a href="shop.html" class="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">Clear Filters</a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => createProductCardHtml(p)).join('');
}

function createProductCardHtml(p) {
  const waUrl = `https://wa.me/${FNS.contact.whatsapp}?text=Hello%20FNS%20-%20Faizan%20Network%20Solution%2C%20I%20would%20like%20to%20order%20%2F%20get%20a%20quote%20for%3A%20${encodeURIComponent(p.name)}`;
  
  // top 2 specs
  const specSnippets = p.specs.slice(0, 3).map(s => `
    <div class="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
      <span class="truncate"><strong class="font-semibold text-slate-800 dark:text-zinc-300">${s.label}:</strong> ${s.value}</span>
    </div>
  `).join('');

  return `
    <div class="group card-interactive rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-4 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative">
      <div>
        <div class="relative w-full aspect-[4/3] rounded-xl bg-slate-50 dark:bg-zinc-900/80 flex items-center justify-center p-3 overflow-hidden border border-slate-100 dark:border-zinc-800/60">
          ${p.badge ? `<span class="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">${p.badge}</span>` : ''}
          <div class="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-2 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 hover:text-blue-600 shadow-md transition-all active:scale-95" title="Quick View" onclick="openProductQuickView('${p.id}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
            <button class="p-2 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 hover:text-blue-600 shadow-md transition-all active:scale-95" title="Compare" onclick="addToCompare('${p.id}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </button>
          </div>
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108 cursor-pointer" onclick="openProductQuickView('${p.id}')" loading="lazy">
        </div>
        
        <div class="mt-3.5 space-y-1.5">
          <div class="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">${p.categoryName}</div>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-blue-500 transition-colors" onclick="openProductQuickView('${p.id}')">${p.name}</h3>
          <div class="pt-2 pb-1 space-y-1 border-t border-slate-100 dark:border-zinc-800/80">
            ${specSnippets}
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <div>
          <span class="text-[11px] text-slate-400 dark:text-zinc-500 block">Price</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">On Request</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button class="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title="Add to Quote Cart" onclick="addToCart('${p.id}')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
          <a href="${waUrl}" target="_blank" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-xs">
            Quote
          </a>
        </div>
      </div>
    </div>
  `;
}

// 12. PC MikroTik Router Builder Engine
function initBuilder() {
  const usersSlider = document.getElementById('builder-users');
  const bandwidthSlider = document.getElementById('builder-bandwidth');
  const usersVal = document.getElementById('builder-users-val');
  const bandwidthVal = document.getElementById('builder-bandwidth-val');
  const resultCard = document.getElementById('builder-result-card');

  function calculateRecommendation() {
    const users = parseInt(usersSlider ? usersSlider.value : 2500);
    const bw = parseFloat(bandwidthSlider ? bandwidthSlider.value : 5);

    if (usersVal) usersVal.textContent = `${users.toLocaleString()} Users`;
    if (bandwidthVal) bandwidthVal.textContent = `${bw} Gbps`;

    // Smart Matching logic
    let rec = FNS.products.find(p => p.id === 'fns-x28');
    if (bw >= 25 || users >= 15000) {
      rec = FNS.products.find(p => p.id === 'fns-x88') || rec;
    } else if (bw >= 18 || users >= 10000) {
      rec = FNS.products.find(p => p.id === 'fns-x64') || rec;
    } else if (bw >= 12 || users >= 7000) {
      rec = FNS.products.find(p => p.id === 'fns-x44d') || rec;
    } else if (bw >= 8 || users >= 4000) {
      rec = FNS.products.find(p => p.id === 'fns-x40') || rec;
    } else if (bw >= 4 || users >= 2000) {
      rec = FNS.products.find(p => p.id === 'fns-x32') || rec;
    }

    if (resultCard && rec) {
      const waText = encodeURIComponent(`Hello FNS - Faizan Network Solution, I used your PC MikroTik Router Builder for ${bw} Gbps and ${users} users. Recommended build: ${rec.name}. Please give me a quotation.`);
      window.logBuilderOrder = function(recName, bwVal, usersVal) {
        try {
          const orders = JSON.parse(localStorage.getItem('fns_orders')) || [];
          orders.unshift({
            id: "FNS-" + Math.floor(100000 + Math.random() * 900000),
            customerName: "Builder Client",
            customerPhone: "01XXXXXXXXX",
            customerEmail: "",
            location: "Dhaka",
            items: [{ name: recName, qty: 1, category: "PC MikroTik Builder" }],
            totalItems: 1,
            note: `Built for ${bwVal} Gbps and ${usersVal.toLocaleString()} PPPoE users`,
            date: new Date().toISOString(),
            status: "Pending"
          });
          localStorage.setItem('fns_orders', JSON.stringify(orders));
        } catch(e) {}
      };
      resultCard.innerHTML = `
        <div class="p-6 md:p-8 rounded-2xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-950/20 via-zinc-950 to-slate-900 shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 px-4 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-bl-xl shadow-md">
            Best Match Configuration
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div class="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10">
              <img src="${rec.image}" alt="${rec.name}" class="w-full max-h-56 object-contain drop-shadow-xl">
              <span class="mt-3 text-xs font-bold text-blue-400">${rec.badge || 'Recommended for your load'}</span>
            </div>
            <div class="md:col-span-7 space-y-4">
              <div>
                <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Engineered for ${bw} Gbps & ${users.toLocaleString()} PPPoE Sessions</span>
                <h3 class="text-xl md:text-2xl font-black text-white mt-1">${rec.name}</h3>
                <p class="text-xs text-zinc-300 mt-2 leading-relaxed">${rec.description}</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                ${rec.specs.map(s => `
                  <div class="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span class="text-zinc-400 text-[11px] block">${s.label}</span>
                    <span class="font-bold text-white">${s.value}</span>
                  </div>
                `).join('')}
              </div>

              <div class="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                <a href="https://wa.me/${FNS.contact.whatsapp}?text=${waText}" target="_blank" class="px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#25D366]/30 transition-transform active:scale-95">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
                  Get Instant WhatsApp Quote
                </a>
                <button class="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-transform active:scale-95" onclick="addToCart('${rec.id}')">
                  + Add to Quote Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (usersSlider) usersSlider.addEventListener('input', calculateRecommendation);
  if (bandwidthSlider) bandwidthSlider.addEventListener('input', calculateRecommendation);

  calculateRecommendation();
}

// 13. Toast Notification Helper
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// Contact Form Submission Handler
window.handleContactSubmit = function(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.querySelector('input[type="text"]')?.value || "Client";
  const phone = form.querySelector('input[type="tel"]')?.value || "";
  const email = form.querySelector('input[type="email"]')?.value || "";
  const inputs = form.querySelectorAll('input[type="text"]');
  const subject = inputs.length > 1 ? inputs[1].value : "Hardware Inquiry";
  const message = form.querySelector('textarea')?.value || "";

  try {
    const messages = JSON.parse(localStorage.getItem('fns_messages')) || [];
    const newMsg = {
      id: "MSG-" + Math.floor(10000 + Math.random() * 90000),
      name: name,
      phone: phone,
      email: email,
      subject: subject,
      message: message,
      date: new Date().toISOString(),
      status: "unread"
    };
    messages.unshift(newMsg);
    localStorage.setItem('fns_messages', JSON.stringify(messages));
  } catch (e) {
    console.error(e);
  }

  showToast('Thank you ' + name + '! Message submitted to FNS Admin.');
  form.reset();
};
