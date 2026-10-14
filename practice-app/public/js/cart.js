// Cart page: change quantities, remove items, empty the cart (with a confirm dialog).
(async function () {
  const { api, bug, money, esc, setBadge } = QS;
  const { cart } = await QS.init();

  const rows = document.getElementById('cart-rows');
  const content = document.getElementById('cart-content');
  const emptyMsg = document.getElementById('cart-empty');
  const error = document.getElementById('cart-error');
  const subtotal = document.querySelector('[data-testid="cart-subtotal"]');

  function showError(msg) {
    error.textContent = msg;
    error.hidden = !msg;
  }

  function render(data, { updateBadge = true } = {}) {
    if (updateBadge) setBadge(data.count);
    emptyMsg.hidden = data.items.length > 0;
    content.hidden = data.items.length === 0;
    subtotal.textContent = money(data.subtotal);
    rows.innerHTML = data.items
      .map(
        (it) => `
        <tr data-testid="cart-row" data-id="${it.productId}">
          <th scope="row">${esc(it.name)}</th>
          <td>${money(it.price)}</td>
          <td>
            <label class="visually-hidden" for="qty-${it.productId}">Quantity for ${esc(it.name)}</label>
            <input id="qty-${it.productId}" type="number" min="1" max="10" step="1" value="${it.quantity}" data-prev="${it.quantity}" />
          </td>
          <td data-testid="line-total">${money(it.lineTotal)}</td>
          <td><button type="button" class="secondary" data-remove="${it.productId}">Remove ${esc(it.name)}</button></td>
        </tr>`,
      )
      .join('');
  }

  rows.addEventListener('change', async (e) => {
    const input = e.target.closest('input[type="number"]');
    if (!input) return;
    const id = input.id.replace('qty-', '');
    const r = await api(`/api/cart/items/${id}`, { method: 'PUT', body: { quantity: Number(input.value) } });
    if (!r.ok) {
      showError((r.data && r.data.error) || 'Could not update the quantity');
      input.value = input.dataset.prev;
      return;
    }
    showError('');
    render(r.data);
  });

  rows.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-remove]');
    if (!btn) return;
    const r = await api(`/api/cart/items/${btn.dataset.remove}`, { method: 'DELETE' });
    if (r.ok) {
      showError('');
      render(r.data, { updateBadge: !bug('cart-badge-remove') });
    }
  });

  document.getElementById('empty-cart').addEventListener('click', async () => {
    const yes = window.confirm('Remove all items from your cart?');
    if (!yes && !bug('cart-confirm-cancel')) return;
    const r = await api('/api/cart', { method: 'DELETE' });
    if (r.ok) render(r.data);
  });

  render(cart);
})();
