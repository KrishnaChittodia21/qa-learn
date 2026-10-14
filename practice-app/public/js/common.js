// Shared helpers for every QA Shop page: API calls, the header, the cart badge and the toast.
(function () {
  const bug = (id) => (window.QS_BUGS || []).includes(id);

  async function api(path, options = {}) {
    const res = await fetch(path, {
      method: options.method || 'GET',
      headers: options.body ? { 'Content-Type': 'application/json' } : {},
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'same-origin',
    });
    let data = null;
    if (res.status !== 204) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }
    return { ok: res.ok, status: res.status, data };
  }

  const money = (n) => `$${Number(n).toFixed(2)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function setBadge(count) {
    const badge = document.querySelector('[data-testid="cart-badge"]');
    if (!badge) return;
    badge.textContent = String(count);
    badge.setAttribute('aria-label', `${count} ${count === 1 ? 'item' : 'items'} in cart`);
    badge.hidden = count === 0;
  }

  function renderHeader(user, count) {
    const header = document.getElementById('site-header');
    if (!header) return;
    header.className = 'site-header';
    header.innerHTML = `
      <a class="brand" href="/inventory.html">QA Shop</a>
      <nav aria-label="Main">
        <a href="/inventory.html">Products</a>
        &nbsp;&nbsp;
        <a class="cart-link" href="/cart.html">Cart<span class="badge" data-testid="cart-badge" hidden>0</span></a>
      </nav>
      <span class="user">Signed in as ${esc(user)}</span>
      <button type="button" id="logout">Log out</button>`;
    setBadge(count);
    header.querySelector('#logout').addEventListener('click', async () => {
      await api('/api/session/logout', { method: 'POST' });
      location.href = '/';
    });
  }

  let toastTimer;
  function toast(message) {
    let el = document.querySelector('[data-testid="toast"]');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.dataset.testid = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2500);
  }

  /** Loads the session and cart, renders the header. Pages call this first. */
  async function init() {
    const nav = performance.getEntriesByType('navigation')[0];
    if (bug('cart-reload') && nav && nav.type === 'reload') {
      await api('/api/cart', { method: 'DELETE' });
    }
    const session = await api('/api/session');
    const user = session.data && session.data.username;
    if (!user) {
      location.href = '/';
      return new Promise(() => {});
    }
    const cart = await api('/api/cart');
    renderHeader(user, cart.data ? cart.data.count : 0);
    return { user, cart: cart.data };
  }

  window.QS = { api, bug, money, esc, sleep, setBadge, toast, init };
})();
