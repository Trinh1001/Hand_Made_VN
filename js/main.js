/* main.js - common logic for index/products/product/cart/admin
   - load products.json for listing/detail
   - cart using localStorage (hm_cart)
   - header shrink on scroll
   - fade-in for .fade elements using IntersectionObserver
*/

document.addEventListener('DOMContentLoaded', () => {
  // Header shrink
  const nav = document.querySelector('.navbar');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('shrink');
      else nav.classList.remove('shrink');
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // Fade-in on scroll for .fade
  const fades = document.querySelectorAll('.fade');
  if (fades.length) {
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
      }, { threshold: 0.18 });
      fades.forEach(el => obs.observe(el));
    } else {
      fades.forEach(el => el.classList.add('show'));
    }
  }

  // Load products.json if present
  const productsURL = 'data/products.json';
  fetch(productsURL).then(r => r.json()).then(products => {
    // Featured on index
    const featuredWrap = document.getElementById('featured-products');
    if (featuredWrap) {
      featuredWrap.innerHTML = products.slice(0,6).map(p => `
        <article class="product-card" itemscope itemtype="https://schema.org/Product">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="card-body">
            <h3 itemprop="name">${p.name}</h3>
            <p>${p.region} • ${new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ</p>
            <a href="product.html?id=${p.id}" class="btn-primary" aria-label="Xem ${p.name}">Xem chi tiết</a>
          </div>
        </article>`).join('');
    }

    // Products list page
    const listWrap = document.getElementById('product-list');
    if (listWrap) {
      listWrap.innerHTML = products.map(p => `
        <article class="product-card" itemscope itemtype="https://schema.org/Product">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="card-body">
            <h3 itemprop="name">${p.name}</h3>
            <p>${p.region}</p>
            <p>${new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ</p>
            <a href="product.html?id=${p.id}" class="btn-primary">Xem chi tiết</a>
          </div>
        </article>`).join('');
      // also inject ItemList JSON-LD for SEO
      const items = products.map((p,i) => ({ "@type":"ListItem","position":i+1,"url":`https://handmadevn.example.com/product.html?id=${p.id}` }));
      const ld = { "@context":"https://schema.org", "@type":"ItemList", "itemListElement": items };
      const s = document.createElement('script'); s.type='application/ld+json'; s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }

    // Product detail page
    const detailWrap = document.getElementById('product-detail');
    if (detailWrap) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const product = products.find(x => String(x.id) === String(id));
      if (!product) {
        detailWrap.innerHTML = '<p>❌ Không tìm thấy sản phẩm.</p>';
      } else {
        document.title = `${product.name} — HandMadeVN`;
        const bc = document.getElementById('breadcrumb-product');
        if (bc) bc.textContent = product.name;
        detailWrap.innerHTML = `
          <div class="product-card product-detail-card" itemscope itemtype="https://schema.org/Product">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="card-body">
              <h1 itemprop="name">${product.name}</h1>
              <p><strong>Khu vực:</strong> ${product.region}</p>
              <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN').format(product.price)} VNĐ</p>
              <p itemprop="description">${product.description}</p>
              <button class="btn-primary" data-add="${product.id}">🛒 Thêm vào giỏ hàng</button>
            </div>
          </div>`;
        // inject product JSON-LD
        const prodLD = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": [product.image],
          "description": product.description,
          "brand": product.region,
          "offers": { "@type":"Offer", "priceCurrency":"VND", "price":product.price, "availability":"https://schema.org/InStock", "url": window.location.href }
        };
        const s = document.createElement('script'); s.type='application/ld+json'; s.textContent = JSON.stringify(prodLD);
        document.head.appendChild(s);

        // related
        const relatedList = document.getElementById('related-list');
        if (relatedList) {
          relatedList.innerHTML = products.filter(p => p.id != product.id).slice(0,3).map(p => `
            <a class="product-card" href="product.html?id=${p.id}">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
              <div class="card-body"><h3>${p.name}</h3><p>${new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ</p></div>
            </a>`).join('');
        }
      }
    }

    // admin list
    const adminList = document.getElementById('admin-list');
    if (adminList) {
      adminList.innerHTML = products.map(p => `
        <div class="product-card">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="card-body"><h3>${p.name}</h3><p>${p.region}</p><p>${new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ</p></div>
        </div>`).join('');
    }
  }).catch(err => console.error('products.json load error', err));

  // CART (localStorage)
  const CART_KEY = 'hm_cart';
  const readCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const writeCart = c => localStorage.setItem(CART_KEY, JSON.stringify(c));

  // Add to cart via delegation
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (btn) {
      const id = String(btn.dataset.add);
      const cart = readCart();
      const found = cart.find(i => i.id === id);
      if (found) found.q++;
      else cart.push({ id, q: 1 });
      writeCart(cart);
      alert('✅ Đã thêm vào giỏ hàng');
      renderCart(); // update cart page if open
    }
  });

  // cart actions (plus/minus/remove)
  document.body.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const id = actionEl.dataset.id;
    let cart = readCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    if (action === 'plus') cart[idx].q++;
    else if (action === 'minus') cart[idx].q = Math.max(1, cart[idx].q - 1);
    else if (action === 'remove') cart.splice(idx, 1);
    writeCart(cart);
    renderCart();
  });

  // Render cart if on cart page
  function renderCart() {
    const cartList = document.getElementById('cart-list');
    const cartSummary = document.getElementById('cart-summary');
    const cartEmpty = document.getElementById('cart-empty');
    if (!cartList) return;
    const cart = readCart();
    if (cart.length === 0) {
      cartEmpty.style.display = 'block';
      cartList.innerHTML = '';
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }
    cartEmpty.style.display = 'none';
    fetch('data/products.json').then(r => r.json()).then(products => {
      let total = 0;
      cartList.innerHTML = cart.map(item => {
        const p = products.find(pp => String(pp.id) === String(item.id));
        const price = p ? Number(p.price) : 0;
        const subtotal = price * item.q;
        total += subtotal;
        return `<div class="cart-item" data-id="${item.id}">
          <div><strong>${p ? p.name : 'Sản phẩm'}</strong><div>${new Intl.NumberFormat('vi-VN').format(price)} VNĐ</div></div>
          <div class="cart-actions">
            <button data-action="minus" data-id="${item.id}">-</button>
            <span>${item.q}</span>
            <button data-action="plus" data-id="${item.id}">+</button>
            <button data-action="remove" data-id="${item.id}">Xóa</button>
          </div>
          <div>${new Intl.NumberFormat('vi-VN').format(subtotal)} VNĐ</div>
        </div>`;
      }).join('');
      if (cartSummary) {
        cartSummary.style.display = 'block';
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = new Intl.NumberFormat('vi-VN').format(total) + ' VNĐ';
      }
    });
  }
  if (document.getElementById('cart-list')) renderCart();

  // Admin form demo
  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Demo: chức năng thêm sản phẩm là local-only trong bản này. Cần backend để lưu thực tế.');
      adminForm.reset();
    });
  }
});
