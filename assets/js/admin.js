/**
 * FNS - Faizan Network Solution
 * Admin Dashboard & Order/Message Management Engine
 */

const FNS_ADMIN = {
  authKey: 'fns_admin_logged_in',
  defaultUser: 'admin',
  defaultPass: 'fns2026',
  currentTab: 'overview',
  orders: [],
  messages: [],
  products: []
};

document.addEventListener('DOMContentLoaded', () => {
  initAdminTheme();
  initAdminAuth();
  loadAdminData();
  setupAdminEvents();
});

// 1. Theme Management for Admin
function initAdminTheme() {
  const savedTheme = localStorage.getItem('fns_theme') || 'dark';
  setAdminTheme(savedTheme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      setAdminTheme(nextTheme);
    });
  });
}

function setAdminTheme(theme) {
  const root = document.documentElement;
  const logos = document.querySelectorAll('.fns-logo-img');
  localStorage.setItem('fns_theme', theme);

  if (theme === 'dark') {
    root.classList.add('dark');
    logos.forEach(img => img.src = 'assets/images/fns-logo-dark.svg');
  } else {
    root.classList.remove('dark');
    logos.forEach(img => img.src = 'assets/images/fns-logo-light.svg');
  }

  document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', theme !== 'dark'));
  document.querySelectorAll('.theme-icon-sun').forEach(el => el.classList.toggle('hidden', theme === 'dark'));
}

// 2. Authentication
function initAdminAuth() {
  const isLoggedIn = sessionStorage.getItem(FNS_ADMIN.authKey) === 'true';
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  if (isLoggedIn) {
    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) dashboardView.classList.remove('hidden');
    renderAllAdminSections();
  } else {
    if (loginView) loginView.classList.remove('hidden');
    if (dashboardView) dashboardView.classList.add('hidden');
  }

  // Handle Login Form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('admin-username').value.trim();
      const pass = document.getElementById('admin-password').value.trim();
      const errorMsg = document.getElementById('login-error-msg');

      if (user === FNS_ADMIN.defaultUser && pass === FNS_ADMIN.defaultPass) {
        sessionStorage.setItem(FNS_ADMIN.authKey, 'true');
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        renderAllAdminSections();
        showAdminToast('Welcome, Administrator! Logged in successfully.');
      } else {
        if (errorMsg) {
          errorMsg.textContent = 'Invalid username or password. Default is admin / fns2026';
          errorMsg.classList.remove('hidden');
        }
      }
    });
  }

  // Quick Demo Login Button
  const demoFillBtn = document.getElementById('btn-fill-demo');
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
      document.getElementById('admin-username').value = 'admin';
      document.getElementById('admin-password').value = 'fns2026';
    });
  }

  // Logout
  const logoutBtns = document.querySelectorAll('.admin-logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sessionStorage.removeItem(FNS_ADMIN.authKey);
      window.location.reload();
    });
  });
}

// 3. Load & Seed Data
function loadAdminData() {
  // Orders
  try {
    const savedOrders = localStorage.getItem('fns_orders');
    if (savedOrders) {
      FNS_ADMIN.orders = JSON.parse(savedOrders);
    } else {
      seedDemoOrders();
    }
  } catch (e) {
    seedDemoOrders();
  }

  // Messages
  try {
    const savedMessages = localStorage.getItem('fns_messages');
    if (savedMessages) {
      FNS_ADMIN.messages = JSON.parse(savedMessages);
    } else {
      seedDemoMessages();
    }
  } catch (e) {
    seedDemoMessages();
  }

  // Products
  fetch('assets/data/products.json')
    .then(r => r.json())
    .then(prods => {
      FNS_ADMIN.products = prods;
      if (FNS_ADMIN.currentTab === 'products') renderProductsTab();
    })
    .catch(e => console.error(e));
}

function seedDemoOrders() {
  const seed = [
    {
      id: "FNS-842910",
      customerName: "Abrarul Hoque",
      company: "Uttara Broadband ISP",
      customerPhone: "01711223344",
      customerEmail: "abrar@uttaranet.bd",
      location: "Sector 3, Uttara, Dhaka",
      items: [
        { name: "FNS X44 Enterprise PC MikroTik Router Server", qty: 1, category: "PC MikroTik Router" },
        { name: "Intel Ethernet X710-DA2 Dual-Port 10GbE SFP+ Network Adapter", qty: 2, category: "Network Adapter" }
      ],
      totalItems: 3,
      note: "Urgent core router upgrade needed for 8,000 PPPoE subscribers.",
      date: new Date(Date.now() - 3600000 * 3).toISOString(),
      status: "In Progress"
    },
    {
      id: "FNS-619284",
      customerName: "Engr. Tanvir Ahmed",
      company: "Chittagong Metro Net",
      customerPhone: "01819876543",
      customerEmail: "tanvir@ctgmetronet.com",
      location: "Agrabad Commercial Area, Chittagong",
      items: [
        { name: "Cisco Nexus N9K-C93180YC-EX Network Switch", qty: 1, category: "Switches & Routers" },
        { name: "Mellanox ConnectX-3 Pro Dual-Port 40GbE QSFP Network Adapter", qty: 4, category: "Network Adapter" }
      ],
      totalItems: 5,
      note: "Looking for optical transceivers and DAC cables included in the quote.",
      date: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: "Quoted"
    },
    {
      id: "FNS-523190",
      customerName: "Nazmus Sakib",
      company: "CloudHost Bangladesh",
      customerPhone: "01912345678",
      customerEmail: "sakib@cloudhostbd.com",
      location: "Mohakhali DOHS, Dhaka",
      items: [
        { name: "Dell PowerEdge R740 2U Rack Server", qty: 2, category: "Servers & Systems" },
        { name: "Intel SSD DC S4500 Series 240GB Enterprise SSD", qty: 4, category: "Storage & SSDs" }
      ],
      totalItems: 6,
      note: "Proxmox cluster setup with dual 750W redundant PSUs.",
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: "Delivered"
    },
    {
      id: "FNS-410982",
      customerName: "Kamrul Hasan",
      company: "Sylhet Optical Network",
      customerPhone: "01612987654",
      customerEmail: "kamrul@sylhetoptical.net",
      location: "Zindabazar, Sylhet",
      items: [
        { name: "FNS X32 Professional PC MikroTik Router Server", qty: 1, category: "PC MikroTik Router" }
      ],
      totalItems: 1,
      note: "Configured from the PC MikroTik Builder for 4 Gbps and 3,500 users.",
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "Pending"
    },
    {
      id: "FNS-309182",
      customerName: "Mahmudur Rahman",
      company: "Apex Technologies Ltd",
      customerPhone: "01715678901",
      customerEmail: "mahmud@apexbd.com",
      location: "Motijheel C/A, Dhaka",
      items: [
        { name: "XikeStor SKS8300-12X 12-Port 10G SFP+ Switch", qty: 1, category: "Switches & Routers" },
        { name: "Supermicro AOC-STGN-i2S Rev. 2.11 Dual-Port 10GbE", qty: 2, category: "Network Adapter" }
      ],
      totalItems: 3,
      note: "Require VAT invoice and delivery to head office.",
      date: new Date(Date.now() - 3600000 * 30).toISOString(),
      status: "Contacted"
    }
  ];
  FNS_ADMIN.orders = seed;
  saveAdminOrders();
}

function seedDemoMessages() {
  const seed = [
    {
      id: "MSG-90412",
      name: "Farhan Chowdhury",
      phone: "01722334455",
      email: "farhan@speednet.com.bd",
      subject: "Inquiry about FNS X56 56-core Router for 15k PPPoE Users",
      message: "Hello FNS team, we are expanding our ISP network in Mirpur, Dhaka. We need pricing for the FNS X56 server with RouterOS v7 pre-installed. Do you have ready stock in Uttara for pickup tomorrow?",
      date: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: "unread"
    },
    {
      id: "MSG-89102",
      name: "Sadman Sakif",
      phone: "01833445566",
      email: "sakif@itlinkbd.net",
      subject: "Dell PowerEdge R630 Availability with 64GB RAM",
      message: "Please let us know if you can customize a Dell R630 with 64GB ECC RAM and dual 10G SFP+ cards, and what would be the best price including warranty.",
      date: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: "read"
    },
    {
      id: "MSG-78231",
      name: "Muntasir Billah",
      phone: "01944556677",
      email: "billah@netvision.com",
      subject: "Quotation for 10x Intel X710-DA2 SFP+ Network Cards",
      message: "We need 10 units of Intel X710-DA2 dual-port 10G cards for our server farm. Please send an official quote to our email address.",
      date: new Date(Date.now() - 3600000 * 26).toISOString(),
      status: "read"
    },
    {
      id: "MSG-67120",
      name: "Rashedul Islam",
      phone: "01655667788",
      email: "rashed@dhakafiber.net",
      subject: "Need technical consultation on RouterOS v7 BGP routing",
      message: "We are migrating to BGP full table with two upstreams (BTCL and Summit). Can your team assist in testing and configuring the PC MikroTik router before dispatch?",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: "unread"
    }
  ];
  FNS_ADMIN.messages = seed;
  saveAdminMessages();
}

function saveAdminOrders() {
  localStorage.setItem('fns_orders', JSON.stringify(FNS_ADMIN.orders));
  updateAdminBadges();
}

function saveAdminMessages() {
  localStorage.setItem('fns_messages', JSON.stringify(FNS_ADMIN.messages));
  updateAdminBadges();
}

function updateAdminBadges() {
  const pendingOrders = FNS_ADMIN.orders.filter(o => o.status === 'Pending').length;
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

// 4. Tab Navigation
function setupAdminEvents() {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('data-tab');
      switchTab(target);
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('admin-sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Order filters
  const orderSearch = document.getElementById('order-search-input');
  const orderStatus = document.getElementById('order-status-filter');
  if (orderSearch) orderSearch.addEventListener('input', renderOrdersTab);
  if (orderStatus) orderStatus.addEventListener('change', renderOrdersTab);

  // Message filters
  const msgSearch = document.getElementById('msg-search-input');
  const msgFilter = document.getElementById('msg-status-filter');
  if (msgSearch) msgSearch.addEventListener('input', renderMessagesTab);
  if (msgFilter) msgFilter.addEventListener('change', renderMessagesTab);
}

function switchTab(tabName) {
  FNS_ADMIN.currentTab = tabName;
  document.querySelectorAll('.admin-nav-tab').forEach(t => {
    const isTarget = t.getAttribute('data-tab') === tabName;
    t.classList.toggle('bg-blue-600', isTarget);
    t.classList.toggle('text-white', isTarget);
    t.classList.toggle('text-slate-600', !isTarget);
    t.classList.toggle('dark:text-zinc-400', !isTarget);
  });

  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.toggle('hidden', pane.id !== `tab-${tabName}`);
  });

  // Render appropriate tab
  if (tabName === 'overview') renderOverviewTab();
  if (tabName === 'orders') renderOrdersTab();
  if (tabName === 'messages') renderMessagesTab();
  if (tabName === 'products') renderProductsTab();

  // Close mobile sidebar if open
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar && window.innerWidth < 1024) {
    sidebar.classList.add('-translate-x-full');
  }
}

function renderAllAdminSections() {
  updateAdminBadges();
  renderOverviewTab();
  renderOrdersTab();
  renderMessagesTab();
}

// 5. Render Overview Tab
function renderOverviewTab() {
  const totalOrdersEl = document.getElementById('stat-total-orders');
  const pendingOrdersEl = document.getElementById('stat-pending-orders');
  const totalMessagesEl = document.getElementById('stat-total-messages');
  const unreadMessagesEl = document.getElementById('stat-unread-messages');

  const pendingCount = FNS_ADMIN.orders.filter(o => o.status === 'Pending').length;
  const unreadCount = FNS_ADMIN.messages.filter(m => m.status === 'unread').length;

  if (totalOrdersEl) totalOrdersEl.textContent = FNS_ADMIN.orders.length;
  if (pendingOrdersEl) pendingOrdersEl.textContent = pendingCount;
  if (totalMessagesEl) totalMessagesEl.textContent = FNS_ADMIN.messages.length;
  if (unreadMessagesEl) unreadMessagesEl.textContent = unreadCount;

  // Recent Orders table in overview
  const recentOrdersTbody = document.getElementById('overview-recent-orders');
  if (recentOrdersTbody) {
    const recent = FNS_ADMIN.orders.slice(0, 5);
    recentOrdersTbody.innerHTML = recent.map(o => `
      <tr class="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
        <td class="p-3 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${o.id}</td>
        <td class="p-3 font-semibold text-xs text-slate-800 dark:text-zinc-200">
          <div>${o.customerName}</div>
          <div class="text-[10px] text-slate-400">${o.company || o.location || 'Individual'}</div>
        </td>
        <td class="p-3 text-xs text-slate-600 dark:text-zinc-400 font-mono">${o.customerPhone}</td>
        <td class="p-3 text-xs text-slate-600 dark:text-zinc-300">
          ${o.items.length ? o.items[0].name + (o.items.length > 1 ? ` (+${o.items.length - 1} more)` : '') : 'Custom Build'}
        </td>
        <td class="p-3 text-xs">${getStatusBadge(o.status)}</td>
        <td class="p-3 text-xs">
          <button class="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors" onclick="viewOrderDetails('${o.id}')">View</button>
        </td>
      </tr>
    `).join('');
  }

  // Recent Messages in overview
  const recentMsgsContainer = document.getElementById('overview-recent-messages');
  if (recentMsgsContainer) {
    const recent = FNS_ADMIN.messages.slice(0, 4);
    recentMsgsContainer.innerHTML = recent.map(m => `
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

// 6. Render Orders Tab
function renderOrdersTab() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('order-search-input')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('order-status-filter')?.value || 'all';

  let filtered = FNS_ADMIN.orders;
  if (statusFilter !== 'all') {
    filtered = filtered.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (searchQuery) {
    filtered = filtered.filter(o => 
      o.id.toLowerCase().includes(searchQuery) ||
      o.customerName.toLowerCase().includes(searchQuery) ||
      o.customerPhone.includes(searchQuery) ||
      (o.company && o.company.toLowerCase().includes(searchQuery)) ||
      o.items.some(i => i.name.toLowerCase().includes(searchQuery))
    );
  }

  const countBadge = document.getElementById('orders-filtered-count');
  if (countBadge) countBadge.textContent = `Showing ${filtered.length} Orders`;

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs font-semibold">
          No orders found matching the filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr class="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
      <td class="p-3.5 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${o.id}</td>
      <td class="p-3.5 text-xs text-slate-800 dark:text-zinc-200">
        <div class="font-bold">${o.customerName}</div>
        <div class="text-[10px] text-slate-400">${o.company || o.location || 'Direct Customer'}</div>
      </td>
      <td class="p-3.5 text-xs">
        <div class="font-mono text-slate-800 dark:text-zinc-200">${o.customerPhone}</div>
        <div class="text-[10px] text-slate-400">${o.customerEmail || 'No email provided'}</div>
      </td>
      <td class="p-3.5 text-xs text-slate-700 dark:text-zinc-300">
        <div class="font-medium">${o.items.length ? o.items.map(i => `${i.qty}× ${i.name}`).join('<br>') : 'Custom Router Build'}</div>
      </td>
      <td class="p-3.5 text-xs text-slate-500 whitespace-nowrap">
        ${formatDate(o.date)}
      </td>
      <td class="p-3.5 text-xs">
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="text-xs font-bold rounded-lg px-2 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-hidden">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Contacted" ${o.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="In Progress" ${o.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Quoted" ${o.status === 'Quoted' ? 'selected' : ''}>Quoted</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td class="p-3.5 text-xs text-right space-x-1 whitespace-nowrap">
        <a href="https://wa.me/${cleanPhone(o.customerPhone)}" target="_blank" class="inline-block p-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="Chat on WhatsApp">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
        </a>
        <a href="tel:${o.customerPhone}" class="inline-block p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors" title="Call">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        </a>
        <button onclick="viewOrderDetails('${o.id}')" class="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300" title="View Details">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
        <button onclick="deleteOrder('${o.id}')" class="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

// 7. Render Messages Tab
function renderMessagesTab() {
  const container = document.getElementById('messages-list-container');
  if (!container) return;

  const searchQuery = (document.getElementById('msg-search-input')?.value || '').toLowerCase();
  const filter = document.getElementById('msg-status-filter')?.value || 'all';

  let filtered = FNS_ADMIN.messages;
  if (filter === 'unread') filtered = filtered.filter(m => m.status === 'unread');
  if (filter === 'read') filtered = filtered.filter(m => m.status === 'read');

  if (searchQuery) {
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(searchQuery) ||
      m.phone.includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery) ||
      m.subject.toLowerCase().includes(searchQuery) ||
      m.message.toLowerCase().includes(searchQuery)
    );
  }

  const countEl = document.getElementById('messages-count-badge');
  if (countEl) countEl.textContent = `${filtered.length} Inquiries`;

  if (!filtered.length) {
    container.innerHTML = `
      <div class="py-16 text-center text-slate-400 dark:text-zinc-500 text-xs font-semibold">
        No customer inquiries found.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(m => `
    <div class="p-4 sm:p-5 rounded-2xl border ${m.status === 'unread' ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/20' : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900'} shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 transition-all hover:shadow-md">
      <div class="space-y-1.5 flex-1">
        <div class="flex items-center gap-3">
          <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">${m.name}</h4>
          <span class="text-xs font-mono text-slate-500 dark:text-zinc-400">${m.phone}</span>
          <span class="text-xs text-slate-400">• ${m.email}</span>
          ${m.status === 'unread' ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">NEW</span>' : ''}
        </div>
        <div class="text-xs font-bold text-slate-800 dark:text-zinc-200">${m.subject}</div>
        <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 mt-2">${m.message}</p>
        <div class="text-[10px] text-slate-400 pt-1">Received: ${formatDate(m.date)}</div>
      </div>

      <div class="flex sm:flex-col gap-2 shrink-0">
        <a href="https://wa.me/${cleanPhone(m.phone)}?text=Hello%20${encodeURIComponent(m.name)}%2C%20thank%20you%20for%20contacting%20FNS%20-%20Faizan%20Network%20Solution%20regarding%3A%20${encodeURIComponent(m.subject)}" target="_blank" class="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
          WhatsApp
        </a>
        <a href="mailto:${m.email}?subject=RE%3A%20${encodeURIComponent(m.subject)}" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
          Email Reply
        </a>
        <button onclick="toggleMessageRead('${m.id}')" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">
          ${m.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
        </button>
        <button onclick="deleteMessage('${m.id}')" class="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

// 8. Render Products Tab
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

// 9. Actions
window.updateOrderStatus = function(orderId, newStatus) {
  const order = FNS_ADMIN.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveAdminOrders();
    showAdminToast(`Order ${orderId} marked as "${newStatus}"`);
    renderOrdersTab();
    renderOverviewTab();
  }
};

window.deleteOrder = function(orderId) {
  if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
    FNS_ADMIN.orders = FNS_ADMIN.orders.filter(o => o.id !== orderId);
    saveAdminOrders();
    showAdminToast(`Order ${orderId} removed.`);
    renderOrdersTab();
    renderOverviewTab();
  }
};

window.viewOrderDetails = function(orderId) {
  const order = FNS_ADMIN.orders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('admin-modal');
  const modalContent = document.getElementById('admin-modal-content');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Order #${order.id}</span>
          <h3 class="text-xl font-extrabold text-slate-900 dark:text-white">${order.customerName}</h3>
        </div>
        <div>${getStatusBadge(order.status)}</div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
        <div class="space-y-1">
          <span class="text-slate-400 block font-semibold">Contact Info</span>
          <div class="font-bold text-slate-800 dark:text-zinc-200">Phone: ${order.customerPhone}</div>
          <div class="text-slate-600 dark:text-zinc-300">Email: ${order.customerEmail || 'N/A'}</div>
          <div class="text-slate-600 dark:text-zinc-300">Company: ${order.company || 'N/A'}</div>
        </div>
        <div class="space-y-1">
          <span class="text-slate-400 block font-semibold">Order Meta</span>
          <div class="text-slate-800 dark:text-zinc-200">Date: ${formatDate(order.date)}</div>
          <div class="text-slate-800 dark:text-zinc-200">Location: ${order.location || 'Dhaka'}</div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-200 dark:border-zinc-800">
        <h4 class="text-xs font-black uppercase text-slate-900 dark:text-white mb-2">Requested Equipment / Hardware</h4>
        <div class="space-y-2">
          ${order.items.map(i => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
              <span class="font-bold text-slate-800 dark:text-zinc-200">${i.qty}× ${i.name}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">${i.category || 'Hardware'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${order.note ? `
        <div class="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
          <strong>Customer Note:</strong> ${order.note}
        </div>
      ` : ''}

      <div class="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
        <a href="https://wa.me/${cleanPhone(order.customerPhone)}?text=Hello%20${encodeURIComponent(order.customerName)}%2C%20following%20up%20on%20your%20quotation%20request%20#${order.id}%20from%20FNS%20-%20Faizan%20Network%20Solution." target="_blank" class="px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-2">
          WhatsApp Customer
        </a>
        <a href="tel:${order.customerPhone}" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2">
          Call Customer
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

window.toggleMessageRead = function(msgId) {
  const msg = FNS_ADMIN.messages.find(m => m.id === msgId);
  if (msg) {
    msg.status = msg.status === 'unread' ? 'read' : 'unread';
    saveAdminMessages();
    renderMessagesTab();
    renderOverviewTab();
  }
};

window.deleteMessage = function(msgId) {
  if (confirm('Delete this customer inquiry?')) {
    FNS_ADMIN.messages = FNS_ADMIN.messages.filter(m => m.id !== msgId);
    saveAdminMessages();
    renderMessagesTab();
    renderOverviewTab();
    showAdminToast('Message deleted.');
  }
};

window.viewMessageDetails = function(msgId) {
  const msg = FNS_ADMIN.messages.find(m => m.id === msgId);
  if (!msg) return;
  msg.status = 'read';
  saveAdminMessages();
  renderMessagesTab();
  renderOverviewTab();

  const modal = document.getElementById('admin-modal');
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
        <div class="text-slate-400 text-[10px]">Date: ${formatDate(msg.date)}</div>
      </div>
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed mt-2 whitespace-pre-wrap">
        ${msg.message}
      </div>
      <div class="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
        <a href="https://wa.me/${cleanPhone(msg.phone)}?text=Hello%20${encodeURIComponent(msg.name)}%2C%20regarding%20your%20inquiry%20to%20FNS%20-%20Faizan%20Network%20Solution%3A" target="_blank" class="px-4 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5">
          Reply on WhatsApp
        </a>
        <a href="mailto:${msg.email}?subject=RE%3A%20${encodeURIComponent(msg.subject)}" class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5">
          Reply via Email
        </a>
      </div>
    </div>
  `;
  modal.classList.add('active');
};

window.closeAdminModal = function() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.remove('active');
};

// 10. Helpers
function getStatusBadge(status) {
  const s = status || 'Pending';
  switch (s) {
    case 'Pending':
      return '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold admin-badge-pending">Pending</span>';
    case 'Contacted':
      return '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold admin-badge-progress">Contacted</span>';
    case 'In Progress':
      return '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold admin-badge-progress">In Progress</span>';
    case 'Quoted':
      return '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold admin-badge-completed">Quoted</span>';
    case 'Delivered':
      return '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold admin-badge-completed">Delivered</span>';
    case 'Cancelled':
      return '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold admin-badge-cancelled">Cancelled</span>';
    default:
      return `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">${s}</span>`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recent';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
