// ========== Freshies App ==========
// Data produk (6 contoh, minimal 5 untuk slider)
const PRODUCTS = [
  { id:'salad-bowl', name:'Salad Bowl', price:32000, svg:'salad.svg', tag:'Sayur Segar' },
  { id:'green-smoothie', name:'Green Smoothie', price:28000, svg:'smoothie.svg', tag:'Detox' },
  { id:'chicken-wrap', name:'Chicken Wrap', price:35000, svg:'wrap.svg', tag:'Protein' },
  { id:'overnight-oats', name:'Overnight Oats', price:26000, svg:'oats.svg', tag:'Sarapan' },
  { id:'poke-bowl', name:'Poke Bowl', price:42000, svg:'poke.svg', tag:'Lengkap' },
  { id:'granola-bars', name:'Granola Bars', price:18000, svg:'granola.svg', tag:'Snack' }
];

// Helpers
const rupiah = (n) => n.toLocaleString('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

// Local Storage
const CART_KEY = 'freshies_cart';
const TESTI_KEY = 'freshies_testimonials';

const loadLS = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const saveLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// State
let cart = loadLS(CART_KEY, []);
let testimonials = loadLS(TESTI_KEY, [
  { name:'Rani', message:'Segar banget dan porsi pas! 💚' },
  { name:'Dimas', message:'Wrap-nya juicy, recommended.' }
]);

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Year
  $('#year').textContent = new Date().getFullYear();

  // Render Best Sellers Slider (ambil 5 pertama)
  const sliderEl = $('#slides-wrapper');
  PRODUCTS.slice(0,5).forEach(p => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `
      <div class="thumb"><img src="assets/svg/${p.svg}" alt="${p.name}"></div>
      <div class="title">${p.name}</div>
      <div class="price">${rupiah(p.price)}</div>
      <div class="actions">
        <button class="btn btn-primary" data-add="${p.id}">Tambahkan Keranjang</button>
      </div>
    `;
    sliderEl.appendChild(slide);
  });

  // Slider controls
  const wrapper = sliderEl;
  $('#slider-prev').addEventListener('click', () => wrapper.scrollBy({left: -wrapper.clientWidth, behavior:'smooth'}));
  $('#slider-next').addEventListener('click', () => wrapper.scrollBy({left: wrapper.clientWidth, behavior:'smooth'}));

  // Render Product Grid
  const grid = $('#product-grid');
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <div class="thumb"><img src="assets/svg/${p.svg}" alt="${p.name}"></div>
      <div class="title">${p.name}</div>
      <div class="price">${rupiah(p.price)}</div>
      <div class="actions">
        <button class="btn btn-primary" data-add="${p.id}">Tambah</button>
        <button class="btn btn-coral" data-buy="${p.id}">Beli Sekarang</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Delegated add to cart / buy now
  document.body.addEventListener('click', (e) => {
    const addId = e.target.getAttribute('data-add');
    const buyId = e.target.getAttribute('data-buy');
    if (addId) { addToCart(addId); }
    if (buyId) { addToCart(buyId); openCart(); }
  });

  // Cart drawer
  $('#open-cart').addEventListener('click', openCart);
  $('#close-cart').addEventListener('click', closeCart);
  $('#checkout-btn').addEventListener('click', openCheckout);
  $('#close-modal').addEventListener('click', closeCheckout);

  // Forms
  $('#checkout-form').addEventListener('submit', onCheckout);
  $('#testimonial-form').addEventListener('submit', onTestimonialSubmit);
  $('#feedback-form').addEventListener('submit', onFeedbackSubmit);

  // Init render
  renderCart();
  renderTestimonials();
});

// Cart functions
function addToCart(id){
  const item = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id:item.id, name:item.name, price:item.price, svg:item.svg, qty:1 });
  saveLS(CART_KEY, cart);
  renderCart();
}

function updateQty(id, delta){
  const i = cart.findIndex(c => c.id === id);
  if (i >= 0){
    cart[i].qty += delta;
    if (cart[i].qty <= 0) cart.splice(i,1);
    saveLS(CART_KEY, cart);
    renderCart();
  }
}

function renderCart(){
  const list = $('#cart-items');
  list.innerHTML = '';
  let total = 0;
  cart.forEach(c => {
    total += c.qty * c.price;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="assets/svg/${c.svg}" alt="${c.name}">
      <div>
        <div><strong>${c.name}</strong></div>
        <div>${rupiah(c.price)} x ${c.qty}</div>
      </div>
      <div class="qty">
        <button aria-label="Kurangi" data-dec="${c.id}">-</button>
        <button aria-label="Tambah" data-inc="${c.id}">+</button>
      </div>
    `;
    list.appendChild(row);
  });
  $('#cart-total').textContent = rupiah(total);
  $('#cart-count').textContent = cart.reduce((a,c)=>a+c.qty,0);

  // Delegate qty buttons
  list.addEventListener('click', (e) => {
    const inc = e.target.getAttribute('data-inc');
    const dec = e.target.getAttribute('data-dec');
    if (inc) updateQty(inc, +1);
    if (dec) updateQty(dec, -1);
  }, { once:true });
}

function openCart(){
  const drawer = $('#cart-drawer');
  drawer.classList.add('show');
  drawer.setAttribute('aria-hidden','false');
}
function closeCart(){
  const drawer = $('#cart-drawer');
  drawer.classList.remove('show');
  drawer.setAttribute('aria-hidden','true');
}

// Checkout
function openCheckout(){
  $('#checkout-modal').classList.add('show');
  $('#checkout-modal').setAttribute('aria-hidden','false');
}
function closeCheckout(){
  $('#checkout-modal').classList.remove('show');
  $('#checkout-modal').setAttribute('aria-hidden','true');
}

function onCheckout(e){
  e.preventDefault();
  if (cart.length === 0){
    $('#checkout-status').textContent = 'Keranjang masih kosong.';
    return;
  }
  const data = Object.fromEntries(new FormData(e.target).entries());
  // Simulasi submit
  $('#checkout-status').textContent = `Pesanan dibuat atas nama ${data.name}. Kami akan menghubungi ${data.phone}. Terima kasih!`;
  cart = [];
  saveLS(CART_KEY, cart);
  renderCart();
  setTimeout(()=>{ closeCheckout(); $('#checkout-status').textContent = ''; }, 1800);
}

// Testimonials
function renderTestimonials(){
  const wrap = $('#testimonial-list');
  wrap.innerHTML = '';
  testimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${t.name}</strong><p style="margin:.25rem 0 0">${t.message}</p>`;
    wrap.appendChild(card);
  });
}

function onTestimonialSubmit(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  testimonials.unshift({ name:data.name, message:data.message });
  saveLS(TESTI_KEY, testimonials);
  e.target.reset();
  renderTestimonials();
}

// Feedback (Kritik & Saran)
function onFeedbackSubmit(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const who = data.name ? ` (${data.name})` : '';
  $('#feedback-status').textContent = 'Terima kasih! Masukan kamu sudah kami catat' + who + '.';
  e.target.reset();
}
