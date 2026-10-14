// Product list: search, category filter, sorting and "Add to cart".
(async function () {
  const { api, bug, money, esc, sleep, setBadge, toast } = QS;
  await QS.init();

  const search = document.getElementById('search');
  const category = document.getElementById('category');
  const sort = document.getElementById('sort');
  const list = document.getElementById('product-list');
  const count = document.querySelector('[data-testid="result-count"]');
  const empty = document.getElementById('empty');
  const loading = document.getElementById('loading');

  // the catalogue arrives after a short (fixed) delay, like a real network call
  await sleep(600);
  const res = await api('/api/products');
  const products = res.data || [];
  loading.remove();

  const byName = (a, b) => {
    if (bug('sort-name-case')) return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  };
  const priceOf = (p) => (bug('sort-price-cents') ? Math.floor(p.price) : p.price);
  const byPrice = (a, b) => priceOf(a) - priceOf(b) || byName(a, b);

  function sorted(items, mode) {
    const copy = [...items];
    switch (mode) {
      case 'name-desc':
        return copy.sort((a, b) => byName(b, a));
      case 'price-asc':
        return copy.sort(byPrice);
      case 'price-desc':
        if (bug('sort-tie-desc')) return copy.sort(byPrice).reverse();
        return copy.sort((a, b) => priceOf(b) - priceOf(a) || byName(a, b));
      default:
        return copy.sort(byName);
    }
  }

  function render() {
    const q = bug('search-trim') ? search.value : search.value.trim();
    const cat = category.value;
    let items = products.filter((p) => (bug('search-case') ? p.name.includes(q) : p.name.toLowerCase().includes(q.toLowerCase())));
    const ignoreCategory = bug('filter-combined') && q !== '';
    if (cat !== 'all' && !ignoreCategory) items = items.filter((p) => p.category === cat);
    const filtering = q !== '' || cat !== 'all';
    items = sorted(items, bug('sort-reset-on-filter') && filtering ? 'name-asc' : sort.value);

    count.textContent = `Showing ${items.length} ${items.length === 1 ? 'product' : 'products'}`;
    empty.hidden = items.length > 0 || bug('search-empty-state');
    list.innerHTML = items
      .map(
        (p) => `
        <li>
          <article aria-label="${esc(p.name)}" data-testid="product-card">
            <h2 data-testid="product-name">${esc(p.name)}</h2>
            <p class="muted">${esc(p.category)}</p>
            <p class="price" data-testid="product-price">${money(p.price)}</p>
            <button type="button" data-id="${p.id}">Add to cart</button>
          </article>
        </li>`,
      )
      .join('');
  }

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const product = products.find((p) => p.id === Number(btn.dataset.id));
    const r = await api('/api/cart/items', { method: 'POST', body: { productId: product.id, quantity: 1 } });
    if (!r.ok) {
      toast((r.data && r.data.error) || 'Could not add to cart');
      return;
    }
    setBadge(r.data.count);
    toast(`Added ${product.name} to cart`);
  });

  search.addEventListener('input', render);
  category.addEventListener('change', render);
  sort.addEventListener('change', render);
  render();
})();
