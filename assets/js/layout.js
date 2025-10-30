import { initThemes, applyTheme } from "/assets/js/theme.js";


export function navbar(active=""){
  return `
  <header class="site">
    <div class="topbar">
      <div class="container topbar-inner">
        <a href="/index.html" class="brand logo">
          <img src="/assets/img/main-logo.webp" alt="Intreen" style="height:32px;vertical-align:middle;border-radius:6px"/>
        </a>
        <form action="/search/index.html" method="get" class="site-search">
          <input type="search" name="q" placeholder="Search Intreen..." aria-label="Search site"/>
          <button type="submit" class="btn sm">Search</button>
        </form>
        <div style="margin-left:auto"></div>
        <div class="auth" style="display:flex;gap:8px;align-items:center;">
          
        </div>
      </div>
    </div>
    <nav class="container">
      <div class="menu">
        <a href="/index.html" class="${active==='home'?'active':''}">Home</a>
        <a href="/events/index.html" class="${active==='events'?'active':''}">Events</a>
        <a href="/progress/index.html" class="${active==='shop'?'active':''}">Progress</a>
        <a href="/jobs/index.html" class="${active==='jobs'?'active':''}">Jobs</a>
        <a href="https://e-learning.intreen.com" class="${active==='e-learning'?'active':''}">E‑Learning</a>
        <a href="/status/index.html" class="${active==='status'?'active':''}">Status</a>
        <a href="/about/index.html" class="${active==='about'?'active':''}">About</a>
      </div>
    </nav>
  </header>`;
}

function footer(){
  return `
  <footer class="site">
    <div class="upper">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px">
          <div>
            <div class="brand-logo"><img src="/assets/img/main-logo.webp" alt="Intreen"/></div>
            <p style="color:#cbd5e1">If it's happening, it's here. Learn • Work • Grow.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="lower"><div class="container">© INTREEN 2025 — All rights reserved</div></div>
  </footer>`
}


export function bootLayout(active){
  const mountHeader = document.getElementById("site-navbar");
  if(mountHeader) mountHeader.outerHTML = navbar(active);
  const mountFooter = document.getElementById("site-footer");
  if(mountFooter) mountFooter.outerHTML = footer();
}

// DETAILS_MODAL_V3 — always-on delegate
(function(){
  function ensureModal(){
    if(document.getElementById('modal-backdrop')) return;
    const mb = document.createElement('div');
    mb.className='modal-backdrop'; mb.id='modal-backdrop';
    mb.innerHTML = `<div class="modal" id="modal-card">
        <div class="hd"><span id="modal-title"></span><button class="modal-close" id="modal-close">×</button></div>
        <div class="bd" id="modal-body"></div>
        <div class="ft"><button class="btn sm outline" id="modal-dismiss">Close</button></div>
      </div>`;
    document.body.appendChild(mb);
    const close = ()=>{ mb.style.display='none'; document.getElementById('modal-card').classList.remove('show'); };
    document.getElementById('modal-close').onclick = close;
    document.getElementById('modal-dismiss').onclick = close;
    mb.addEventListener('click', (e)=>{ if(e.target===mb) close(); });
  }
  function openModal(title, body, img){
    ensureModal();
    const mb = document.getElementById('modal-backdrop');
    document.getElementById('modal-title').textContent = title || 'Details';
    document.getElementById('modal-body').innerHTML = (img? `<img class='media' src='${img}' alt=''>`:'') + (body||'');
    mb.style.display='flex'; setTimeout(()=>document.getElementById('modal-card').classList.add('show'), 10);
  }
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('[data-details]'); if(!a) return;
    e.preventDefault();
    const card = a.closest('.card') || a.closest('article');
    const title = a.getAttribute('data-title') || (card?.querySelector('h3')?.textContent ?? 'Details');
    const body  = a.getAttribute('data-body') || (card?.querySelector('.meta')?.textContent ?? '');
    const img   = (card?.querySelector('img')||{}).getAttribute?.('src');
    openModal(title, body, img);
  });
  window.openDetails = openModal; // debug helper
})();

// ADD_TO_CART_COURSES (delegated)
document.addEventListener('click', (e)=>{
  const a = e.target.closest('[data-add="course"]'); if(!a) return;
  e.preventDefault();
  const item = { sku: a.getAttribute('data-sku'), title: a.getAttribute('data-title'), price: parseFloat(a.getAttribute('data-price')||'0'), qty: 1, type:'course' };
  try{ window.cartAdd(item); }catch(_){ alert('Added: '+item.title+' ($'+item.price.toFixed(2)+')'); }
});

// VIEWPORT_DETECT_V32
try{ const s=document.createElement('script'); s.src='/assets/js/viewport-detect.js'; document.body.appendChild(s);}catch(_){}


document.addEventListener('DOMContentLoaded', ()=>{
  try{ initThemes(); }catch(_){}
  const sel = document.getElementById('nav-theme');
  if(sel){
    const saved = localStorage.getItem('intreen_theme_v1') || 'light';
    sel.value = saved;
    sel.addEventListener('change', ()=> applyTheme(sel.value));
  }
});
