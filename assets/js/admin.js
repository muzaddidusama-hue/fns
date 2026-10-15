/**
 * FNS - Faizan Network Solution
 * Admin Dashboard — Supabase-powered engine
 */

const FNS_ADMIN = {
  currentTab: 'overview',
  orders:     [],
  messages:   [],
  products:   []
};

document.addEventListener('DOMContentLoaded', () => {
  initAdminTheme();
  initAdminAuth();
});

// ── 1. Theme ──────────────────────────────────────────────────────
function initAdminTheme() {
  const saved = localStorage.getItem('fns_theme') || 'dark';
  setAdminTheme(saved);
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setAdminTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
    });
  });
}

function setAdminTheme(theme) {
  localStorage.setItem('fns_theme', theme);
  const root  = document.documentElement;
  const logos = document.querySelectorAll('.fns-logo-img');
  if (theme === 'dark') {
    root.classList.add('dark');
    logos.forEach(img => img.src = 'assets/images/fns-logo-dark.svg');
  } else {
    root.classList.remove('dark');
    logos.forEach(img => img.src = 'assets/images/fns-logo-light.svg');
  }
  document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', theme !== 'dark'));
  document.querySelectorAll('.theme-icon-sun').forEach(el  => el.classList.toggle('hidden', theme === 'dark'));
}

// ── 2. Authentication (Supabase Auth) ─────────────────────────────
async function initAdminAuth() {
  const loginView     = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  // Check existing session
  const { data: { session } } = await window.fnsDb.auth.getSession();

  if (session) {
    showDashboard(loginView, dashboardView);
  } else {
    if (loginView)     loginView.classList.remove('hidden');
    if (dashboardView) dashboardView.classList.add('hidden');
  }

  // Listen for auth state changes (tab switches etc.)
  window.fnsDb.auth.onAuthStateChange((_event, session) => {
    if (session) {
      showDashboard(loginView, dashboardView);
    } else {
      if (loginView)     loginView.classList.remove('hidden');
      if (dashboardView) dashboardView.classList.add('hidden');
    }
  });

  // Login form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value.trim();
      const errorMsg = document.getElementById('login-error-msg');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (submitBtn) { submitBtn.textContent = 'Signing in…'; submitBtn.disabled = true; }

      const { error } = await window.fnsDb.auth.signInWithPassword({ email, password });

      if (submitBtn) { submitBtn.textContent = 'Sign In to Admin Portal'; submitBtn.disabled = false; }

      if (error) {
        if (errorMsg) {
          errorMsg.textContent = 'Invalid email or password. Please try again.';
          errorMsg.classList.remove('hidden');
        }
      }
    });
  }

  // Logout buttons
  document.querySelectorAll('.admin-logout-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await window.fnsDb.auth.signOut();
      showAdminToast('Logged out successfully.');
    });
  });
}

async function showDashboard(loginView, dashboardView) {
  if (loginView)     loginView.classList.add('hidden');
  if (dashboardView) dashboardView.classList.remove('hidden');
  await loadAdminData();
  setupAdminEvents();
  renderAllAdminSections();
}

// ── 3. Load data from Supabase ────────────────────────────────────
async function loadAdminData() {
  // Orders (most recent first)
  const { data: orders, error: oErr } = await window.fnsDb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (oErr) console.error('Orders fetch error:', oErr.message);
  FNS_ADMIN.orders = orders || [];

  // Messages (most recent first)
  const { data: messages, error: mErr } = await window.fnsDb
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (mErr) console.error('Messages fetch error:', mErr.message);
  FNS_ADMIN.messages = messages || [];

  // Products (static JSON — unchanged)
  try {
    const res = await fetch('assets/data/products.json');
    FNS_ADMIN.products = await res.json();
  } catch (e) { console.error(e); }
}

// ── 4. Tab Navigation ─────────────────────────────────────────────
function setupAdminEvents() {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(tab.getAttribute('data-tab'));
    });
  });

  // Mobile sidebar
  const sidebarToggle = document.getElementById('admin-sidebar-toggle');
  const sidebar       = document.getElementById('admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
  }

  // Order filters
  const orderSearch = document.getElementById('order-search-input');
  const orderStatus = document.getElementById('order-status-filter');
  if (orderSearch) orderSearch.addEventListener('input',  renderOrdersTab);
  if (orderStatus) orderStatus.addEventListener('change', renderOrdersTab);

  // Message filters
  const msgSearch = document.getElementById('msg-search-input');
  const msgFilter = document.getElementById('msg-status-filter');
  if (msgSearch) msgSearch.addEventListener('input',  renderMessagesTab);
  if (msgFilter) msgFilter.addEventListener('change', renderMessagesTab);
}

function switchTab(tabName) {
  FNS_ADMIN.currentTab = tabName;
  document.querySelectorAll('.admin-nav-tab').forEach(t => {
    const active = t.getAttribute('data-tab') === tabName;
    t.classList.toggle('bg-blue-600',        active);
    t.classList.toggle('text-white',         active);
    t.classList.toggle('text-slate-600',    !active);
    t.classList.toggle('dark:text-zinc-400',!active);
  });
  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.toggle('hidden', pane.id !== `tab-${tabName}`);
  });
  if (tabName === 'overview')  renderOverviewTab();
  if (tabName === 'orders')    renderOrdersTab();
  if (tabName === 'messages')  renderMessagesTab();
  if (tabName === 'products')  renderProductsTab();

  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar && window.innerWidth < 1024) sidebar.classList.add('-translate-x-full');
}

function renderAllAdminSections() {
  updateAdminBadges();
  renderOverviewTab();
  renderOrdersTab();
  renderMessagesTab();
}

// ── 5. Badge counts ───────────────────────────────────────────────
function updateAdminBadges() {
  const pendingOrders  = FNS_ADMIN.orders.filter(o => o.status === 'Pending').length;
  const unreadMessages = FNS_ADMIN.messages.filter(m => m.status === 'unread').length;

  document.querySelectorAll('.badge-pending-orders').forEach(el => {
    el.textContent = pendingOrders;
    el.classList.toggle('hidden', pendingOrders === 0);
  });
  document.querySelectorAll('.badge-unread-messages').forEach(el => {
    el.textContent = unreadMessages;
    el.classList.toggle('hidden', unreadMessages === 0);
  });
}

// ── 6. Overview Tab ───────────────────────────────────────────────
function renderOverviewTab() {
  const pendingCount = FNS_ADMIN.orders.filter(o => o.status === 'Pending').length;
  const unreadCount  = FNS_ADMIN.messages.filter(m => m.status === 'unread').length;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-total-orders',   FNS_ADMIN.orders.length);
  set('stat-pending-orders', pendingCount);
  set('stat-total-messages', FNS_ADMIN.messages.length);
  set('stat-unread-messages',unreadCount);

  // Recent orders
  const recentOrdersTbody = document.getElementById('overview-recent-orders');
  if (recentOrdersTbody) {
    recentOrdersTbody.innerHTML = FNS_ADMIN.orders.slice(0, 5).map(o => `
      <tr class="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
        <td class="p-3 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${o.id}</td>
        <td class="p-3 font-semibold text-xs text-slate-800 dark:text-zinc-200">
          <div>${o.customer_name}</div>
          <div class="text-[10px] text-slate-400">${o.company || o.location || 'Individual'}</div>
        </td>
        <td class="p-3 text-xs text-slate-600 dark:text-zinc-400 font-mono">${o.customer_phone}</td>
        <td class="p-3 text-xs text-slate-600 dark:text-zinc-300">
          ${o.items?.length ? o.items[0].name + (o.items.length > 1 ? ` (+${o.items.length - 1} more)` : '') : 'Custom Build'}
        </td>
        <td class="p-3 text-xs">${getStatusBadge(o.status)}</td>
        <td class="p-3 text-xs">
          <button class="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors" onclick="viewOrderDetails('${o.id}')">View</button>
        </td>
      </tr>
    `).join('');
  }

  // Recent messages
  const recentMsgsContainer = document.getElementById('overview-recent-messages');
  if (recentMsgsContainer) {
    recentMsgsContainer.innerHTML = FNS_ADMIN.messages.slice(0, 4).map(m => `
      <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs text-slate-900 dark:text-white">${m.name}</span>
            <span class="text-[10px] text-slate-400 font-mono">${m.phone}</span>
            ${m.status === 'unread' ? '<span class="w-2 h-2 rounded-full bg-blue-500"></span>' : ''}
          </div>
          <div class="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-1 line-clamp-1">${m.subject}</div>
          <div class="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">${m.message}</div>
        </div>
        <button class="text-xs text-blue-600 dark:text-blue-400 font-bold shrink-0 hover:underline" onclick="viewMessageDetails('${m.id}')">Read</button>
      </div>
    `).join('');
  }
}

// ── 7. Orders Tab ─────────────────────────────────────────────────
function renderOrdersTab() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  const q      = (document.getElementById('order-search-input')?.value || '').toLowerCase();
  const status = document.getElementById('order-status-filter')?.value || 'all';

  let filtered = FNS_ADMIN.orders;
  if (status !== 'all') filtered = filtered.filter(o => o.status.toLowerCase() === status.toLowerCase());
  if (q) filtered = filtered.filter(o =>
    o.id.toLowerCase().includes(q) ||
    o.customer_name.toLowerCase().includes(q) ||
    o.customer_phone.includes(q) ||
    (o.company && o.company.toLowerCase().includes(q)) ||
    o.items?.some(i => i.name.toLowerCase().includes(q))
  );

  const countBadge = document.getElementById('orders-filtered-count');
  if (countBadge) countBadge.textContent = `Showing ${filtered.length} Orders`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs font-semibold">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr class="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${o.id}</td>
      <td class="p-3.5 text-xs text-slate-800 dark:text-zinc-200">
        <div class="font-bold">${o.customer_name}</div>
        <div class="text-[10px] text-slate-400">${o.company || o.location || 'Direct Customer'}</div>
      </td>
      <td class="p-3.5 text-xs">
        <div class="font-mono text-slate-800 dark:text-zinc-200">${o.customer_phone}</div>
        <div class="text-[10px] text-slate-400">${o.customer_email || 'No email'}</div>
      </td>
      <td class="p-3.5 text-xs text-slate-700 dark:text-zinc-300">
        <div class="font-medium">${o.items?.length ? o.items.map(i => `${i.qty}× ${i.name}`).join('<br>') : 'Custom Build'}</div>
      </td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">${formatDate(o.created_at)}</td>
      <td class="p-3.5 text-xs">
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="text-xs font-bold rounded-lg px-2 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-hidden">
          ${['Pending','Contacted','In Progress','Quoted','Delivered','Cancelled'].map(s =>
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td class="p-3.5 text-xs text-right space-x-1 whitespace-nowrap">
        <a href="https://wa.me/${cleanPhone(o.customer_phone)}" target="_blank" class="inline-block p-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="WhatsApp">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
        </a>
        <a href="tel:${o.customer_phone}" class="inline-block p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors" title="Call">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        </a>
        <button onclick="viewOrderDetails('${o.id}')" class="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300" title="View">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
        <button onclick="deleteOrder('${o.id}')" class="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

// ── 8. Messages Tab ───────────────────────────────────────────────
function renderMessagesTab() {
  const container = document.getElementById('messages-list-container');
  if (!container) return;

  const q      = (document.getElementById('msg-search-input')?.value || '').toLowerCase();
  const filter = document.getElementById('msg-status-filter')?.value || 'all';

  let filtered = FNS_ADMIN.messages;
  if (filter === 'unread') filtered = filtered.filter(m => m.status === 'unread');
  if (filter === 'read')   filtered = filtered.filter(m => m.status === 'read');
  if (q) filtered = filtered.filter(m =>
    m.name.toLowerCase().includes(q)    ||
    m.phone.includes(q)                 ||
    m.email.toLowerCase().includes(q)   ||
    m.subject.toLowerCase().includes(q) ||
    m.message.toLowerCase().includes(q)
  );

  const countEl = document.getElementById('messages-count-badge');
  if (countEl) countEl.textContent = `${filtered.length} Inquiries`;

  if (!filtered.length) {
    container.innerHTML = `<div class="py-16 text-center text-slate-400 dark:text-zinc-500 text-xs font-semibold">No inquiries found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(m => `
    <div class="p-4 sm:p-5 rounded-2xl border ${m.status === 'unread' ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900'} shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:shadow-md transition-all">
      <div class="space-y-1.5 flex-1">
        <div class="flex items-center gap-3">
          <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">${m.name}</h4>
          <span class="text-xs font-mono text-slate-500 dark:text-zinc-400">${m.phone}</span>
          <span class="text-xs text-slate-400">• ${m.email}</span>
          ${m.status === 'unread' ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">NEW</span>' : ''}
        </div>
        <div class="text-xs font-bold text-slate-800 dark:text-zinc-200">${m.subject}</div>
        <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 mt-2">${m.message}</p>
        <div class="text-[10px] text-slate-400 pt-1">Received: ${formatDate(m.created_at)}</div>
      </div>
      <div class="flex sm:flex-col gap-2 shrink-0">
        <a href="https://wa.me/${cleanPhone(m.phone)}?text=Hello%20${encodeURIComponent(m.name)}%2C%20thank%20you%20for%20contacting%20FNS%20regarding%3A%20${encodeURIComponent(m.subject)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5">WhatsApp</a>
        <a href="mailto:${m.email}?subject=RE%3A%20${encodeURIComponent(m.subject)}" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5">Email Reply</a>
        <button onclick="toggleMessageRead('${m.id}')" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">
          ${m.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
        </button>
        <button onclick="deleteMessage('${m.id}')" class="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold">Delete</button>
      </div>
    </div>
  `).join('');
}

// ── 9. Products Tab ───────────────────────────────────────────────
function renderProductsTab() {
  const container = document.getElementById('products-admin-grid');
  if (!container) return;
  container.innerHTML = FNS_ADMIN.products.map(p => `
    <div class="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
      <div>
        <div class="w-full aspect-[4/3] rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-2 flex items-center justify-center overflow-hidden mb-3">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain">
        </div>
        <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">${p.categoryName}</span>
        <h4 class="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-2 mt-1">${p.name}</h4>
        <div class="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Brand: ${p.brand}</div>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <span class="font-bold text-emerald-600 dark:text-emerald-400">Available</span>
        <a href="shop.html?category=${p.category}" target="_blank" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">View in Shop →</a>
      </div>
    </div>
  `).join('');
}

// ── 10. Actions ───────────────────────────────────────────────────
window.updateOrderStatus = async function(orderId, newStatus) {
  const { error } = await window.fnsDb
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) { showAdminToast('Error updating order: ' + error.message); return; }

  const order = FNS_ADMIN.orders.find(o => o.id === orderId);
  if (order) order.status = newStatus;
  updateAdminBadges();
  renderOverviewTab();
  showAdminToast(`Order ${orderId} → "${newStatus}"`);
};

window.deleteOrder = async function(orderId) {
  if (!confirm(`Delete order ${orderId}? This cannot be undone.`)) return;

  const { error } = await window.fnsDb.from('orders').delete().eq('id', orderId);
  if (error) { showAdminToast('Error deleting order: ' + error.message); return; }

  FNS_ADMIN.orders = FNS_ADMIN.orders.filter(o => o.id !== orderId);
  renderOrdersTab();
  renderOverviewTab();
  updateAdminBadges();
  showAdminToast(`Order ${orderId} deleted.`);
};

window.viewOrderDetails = function(orderId) {
  const order = FNS_ADMIN.orders.find(o => o.id === orderId);
  if (!order) return;

  const modal        = document.getElementById('admin-modal');
  const modalContent = document.getElementById('admin-modal-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Order #${order.id}</span>
          <h3 class="text-xl font-extrabold text-slate-900 dark:text-white">${order.customer_name}</h3>
        </div>
        <div>${getStatusBadge(order.status)}</div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
        <div class="space-y-1">
          <span class="text-slate-400 block font-semibold">Contact Info</span>
          <div class="font-bold text-slate-800 dark:text-zinc-200">Phone: ${order.customer_phone}</div>
          <div class="text-slate-600 dark:text-zinc-300">Email: ${order.customer_email || 'N/A'}</div>
          <div class="text-slate-600 dark:text-zinc-300">Company: ${order.company || 'N/A'}</div>
        </div>
        <div class="space-y-1">
          <span class="text-slate-400 block font-semibold">Order Meta</span>
          <div class="text-slate-800 dark:text-zinc-200">Date: ${formatDate(order.created_at)}</div>
          <div class="text-slate-800 dark:text-zinc-200">Location: ${order.location || 'Dhaka'}</div>
        </div>
      </div>
      <div class="pt-4 border-t border-slate-200 dark:border-zinc-800">
        <h4 class="text-xs font-black uppercase text-slate-900 dark:text-white mb-2">Requested Hardware</h4>
        <div class="space-y-2">
          ${(order.items || []).map(i => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
              <span class="font-bold text-slate-800 dark:text-zinc-200">${i.qty}× ${i.name}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">${i.category || 'Hardware'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ${order.note ? `<div class="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200"><strong>Note:</strong> ${order.note}</div>` : ''}
      <div class="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
        <a href="https://wa.me/${cleanPhone(order.customer_phone)}?text=Hello%20${encodeURIComponent(order.customer_name)}%2C%20following%20up%20on%20quotation%20%23${order.id}%20from%20FNS." target="_blank" class="px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs">WhatsApp Customer</a>
        <a href="tel:${order.customer_phone}" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs">Call Customer</a>
      </div>
    </div>
  `;
  modal.classList.add('active');
};

window.toggleMessageRead = async function(msgId) {
  const msg = FNS_ADMIN.messages.find(m => m.id === msgId);
  if (!msg) return;
  const newStatus = msg.status === 'unread' ? 'read' : 'unread';

  const { error } = await window.fnsDb.from('messages').update({ status: newStatus }).eq('id', msgId);
  if (error) { showAdminToast('Error: ' + error.message); return; }

  msg.status = newStatus;
  updateAdminBadges();
  renderMessagesTab();
  renderOverviewTab();
};

window.deleteMessage = async function(msgId) {
  if (!confirm('Delete this inquiry? This cannot be undone.')) return;

  const { error } = await window.fnsDb.from('messages').delete().eq('id', msgId);
  if (error) { showAdminToast('Error: ' + error.message); return; }

  FNS_ADMIN.messages = FNS_ADMIN.messages.filter(m => m.id !== msgId);
  updateAdminBadges();
  renderMessagesTab();
  renderOverviewTab();
  showAdminToast('Message deleted.');
};

window.viewMessageDetails = async function(msgId) {
  const msg = FNS_ADMIN.messages.find(m => m.id === msgId);
  if (!msg) return;

  // Mark read
  if (msg.status === 'unread') {
    await window.fnsDb.from('messages').update({ status: 'read' }).eq('id', msgId);
    msg.status = 'read';
    updateAdminBadges();
    renderOverviewTab();
  }

  const modal        = document.getElementById('admin-modal');
  const modalContent = document.getElementById('admin-modal-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Inquiry #${msg.id}</span>
          <h3 class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${msg.subject}</h3>
        </div>
      </div>
      <div class="py-3 text-xs space-y-1">
        <div><strong>From:</strong> ${msg.name}</div>
        <div><strong>Phone:</strong> <a href="tel:${msg.phone}" class="text-blue-500 font-bold">${msg.phone}</a></div>
        <div><strong>Email:</strong> <a href="mailto:${msg.email}" class="text-blue-500">${msg.email}</a></div>
        <div class="text-slate-400 text-[10px]">Date: ${formatDate(msg.created_at)}</div>
      </div>
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed mt-2 whitespace-pre-wrap">${msg.message}</div>
      <div class="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
        <a href="https://wa.me/${cleanPhone(msg.phone)}?text=Hello%20${encodeURIComponent(msg.name)}%2C%20regarding%20your%20FNS%20inquiry%3A" target="_blank" class="px-4 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs">Reply on WhatsApp</a>
        <a href="mailto:${msg.email}?subject=RE%3A%20${encodeURIComponent(msg.subject)}" class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Reply via Email</a>
      </div>
    </div>
  `;
  modal.classList.add('active');
};

window.closeAdminModal = function() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.remove('active');
};

// ── 11. Helpers ───────────────────────────────────────────────────
function getStatusBadge(status) {
  const s = status || 'Pending';
  const map = {
    'Pending':     'admin-badge-pending',
    'Contacted':   'admin-badge-progress',
    'In Progress': 'admin-badge-progress',
    'Quoted':      'admin-badge-completed',
    'Delivered':   'admin-badge-completed',
    'Cancelled':   'admin-badge-cancelled'
  };
  const cls = map[s] || 'bg-slate-100 text-slate-700';
  return `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}">${s}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recent';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function cleanPhone(phone) {
  if (!phone) return '8801613410777';
  let p = phone.replace(/[^0-9]/g, '');
  if (p.startsWith('01')) p = '88' + p;
  return p;
}

function showAdminToast(msg) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
