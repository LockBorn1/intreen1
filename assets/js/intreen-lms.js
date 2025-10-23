
import { mountCartUI, addToCart } from '/assets/js/cart.js';
import { initThemes } from '/assets/js/theme.js';

const DATA_URL = '/assets/data/intreen-lms.json';
const ORG_KEY = 'intreen_lms_org_v1';

function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
async function loadData(){ const r=await fetch(DATA_URL,{cache:'no-store'}); return r.json(); }

function planCard(p){
  return `<article class="card"><div class="p">
    <h3>${p.name}</h3>
    <div class="meta">${p.employees} employees</div>
    <div style="display:flex;align-items:baseline;gap:6px;margin-top:6px"><strong style="font-size:1.4rem">$${p.price}</strong><span class="meta">/mo</span></div>
    <ul class="meta" style="margin-top:8px">${(p.features||[]).map(f=>`<li>${f}</li>`).join('')}</ul>
    <div style="margin-top:10px;display:flex;gap:8px">
      <button class="btn primary" data-plan="${p.id}">Choose ${p.name}</button>
      <button class="btn" data-register="${p.id}">Register Business</button>
    </div>
  </div></article>`;
}

function courseCard(c){
  const free = !c.price;
  return `<article class="card">
    <img src="${c.img||'https://picsum.photos/seed/intreen-lms/640/360'}" alt="${c.title}" style="width:100%;height:auto;border-top-left-radius:16px;border-top-right-radius:16px"/>
    <div class="p">
      <h3>${c.title}</h3>
      <div class="meta">${(c.category||'Agile').toUpperCase()} • ${c.level} • ${c.duration} • ${c.lessons} lessons</div>
      ${c.desc?`<p class="meta" style="margin-top:6px">${c.desc}</p>`:''}
      <div class="row" style="margin-top:10px;justify-content:space-between">
        <div>${free?'<span class="badge">Included</span>':`<strong>$${(c.price||0).toFixed?c.price.toFixed(2):c.price}</strong>`}</div>
        <div>${free?`<button class="btn sm primary" data-enroll="${c.id}">Enroll</button>`:`<button class="btn sm" data-buy data-id="${c.id}" data-title="${c.title}" data-price="${c.price}">Add to Cart</button>`}</div>
      </div>
    </div>
  </article>`;
}

function gateView(org){
  const info = org ? `<span class="badge">Org: ${org.name}</span> <span class="badge">Plan: ${org.plan.toUpperCase()}</span>` : '<span class="meta">Not signed in</span>';
  return el(`<section class="card" style="padding:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <strong>Business Access</strong>
    ${info}
    <div style="margin-left:auto;display:flex;gap:8px">
      ${org?'<button class="btn outline" id="org-signout">Sign out</button>':'<button class="btn primary" id="org-signin">Business Sign‑In</button><button class="btn" id="org-register">Register Business</button>'}
    </div>
  </section>`);
}

function signInModal(planId){
  return el(`<div class="modal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:10050">
    <div class="card" style="padding:16px;max-width:460px;width:92%">
      <h3>${planId?'Sign‑In to '+planId.toUpperCase():'Business Sign‑In'}</h3>
      <label class="field">Org name<input id="org-name"></label>
      <label class="field">Plan<select id="org-plan"><option value="basic">Starter (1–40)</option><option value="pro">Pro (41–200)</option></select></label>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
        <button class="btn outline" id="cancel">Cancel</button>
        <button class="btn primary" id="save">Sign in</button>
      </div>
    </div>
  </div>`);
}

function registerModal(planId){
  return el(`<div class="modal" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:10050">
    <div class="card" style="padding:16px;max-width:520px;width:92%">
      <h3>Register Business</h3>
      <label class="field">Business name<input id="biz-name" required></label>
      <label class="field">Contact email<input id="biz-email" type="email" required></label>
      <label class="field">Plan<select id="biz-plan"><option value="basic">Starter (1–40)</option><option value="pro">Pro (41–200)</option></select></label>
      <label class="field">Employees<input id="biz-emps" type="number" min="1" placeholder="Number of employees"></label>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
        <button class="btn outline" id="cancel">Cancel</button>
        <button class="btn primary" id="save">Create</button>
      </div>
    </div>
  </div>`);
}

function sidebar(org){
  return el(`<aside class="panel dark" style="min-width:260px">
    <h3>Org Dashboard</h3>
    ${org?`<p class="meta">${org.name} • ${org.plan.toUpperCase()}</p>`:'<p class="meta">Sign in to manage your org</p>'}
    <div class="summary-line"><span>Seats</span><strong>${org?.plan==='pro'?'200':'40'}</strong></div>
    <div class="summary-line"><span>Active learners</span><strong>${Math.floor(Math.random()*((org?.plan==='pro')?120:30))}</strong></div>
    <div class="summary-line"><span>Courses assigned</span><strong>${Math.floor(Math.random()*20)+5}</strong></div>
    <div class="summary-line"><span>Certificates</span><strong>${Math.floor(Math.random()*50)+10}</strong></div>
  </aside>`);
}

function featured(data){
  const subset = (data.courses||[]).slice(0,3);
  return el(`<section class="panel"><h2>Featured</h2><div class="grid cols-3">${subset.map(courseCard).join('')}</div></section>`);
}

function catalog(data){
  return el(`<section class="panel"><h2>All Courses</h2><div class="grid cols-3" id="catalog">${(data.courses||[]).map(courseCard).join('')}</div></section>`);
}

function layoutGrid(){
  return el(`<section class="container mt-4"><div class="grid" style="grid-template-columns: 1fr 3fr; gap:18px"><div id="lms-sidebar"></div><div id="lms-main"></div></div></section>`);
}

function hero(data){
  return el(`<section class='container'><div class='card' style='padding:18px;background:url(${data.hero?.bg||''}) center/cover no-repeat;border:none;color:#fff'><h1 style='margin:0;text-shadow:0 2px 10px rgba(0,0,0,.4)'>${data.hero?.title||'Intreen LMS'}</h1><p style='text-shadow:0 2px 10px rgba(0,0,0,.4)'>${data.hero?.subtitle||''}</p></div></section>`);
}


function progressBar(val){ 
  return `<div style="height:8px;background:rgba(0,0,0,.08);border-radius:6px;overflow:hidden">
            <div style="width:${val}%;height:8px;background:var(--brand-primary)"></div>
          </div>`; 
}
function tracks(){
  const rows = [
    {name:'Scrum Starter', courses:3, est:'1–2 weeks', progress:20},
    {name:'Scrum Master Path', courses:5, est:'3–5 weeks', progress:45},
    {name:'Product Owner Track', courses:4, est:'2–4 weeks', progress:10},
  ];
  return el(`<section class="panel"><h2>Tracks</h2>
    <div class="grid cols-3">
      ${rows.map(r=>`<article class="card"><div class="p"><h3>${r.name}</h3>
        <div class="meta">${r.courses} courses • ${r.est}</div>
        <div style="margin-top:8px">${progressBar(r.progress)}</div>
        <div style="margin-top:10px"><button class="btn sm primary" data-start-track="${r.name}">Start</button></div>
      </div></article>`).join('')}
    </div>
  </section>`);
}
function faq(){
  const items = [
    {q:'Can I upload my own SCORM files?', a:'This static demo focuses on curated courses; custom uploads would be wired via backend.'},
    {q:'Do plans include certificates?', a:'Yes—teams can issue completion certificates per track/course.'},
    {q:'Can I integrate SSO?', a:'Pro plan indicates SCIM SSO in the UI. A backend would complete the flow.'}
  ];
  return el(`<section class="panel"><h2>FAQ</h2>${items.map(i=>`<details class="card"><summary class="p"><strong>${i.q}</strong></summary><div class="p meta">${i.a}</div></details>`).join('')}</section>`);
}
function testimonials(){
  const items = [
    {name:'Apex Labs', quote:'We onboarded a 30‑person support team in two weeks with Intreen LMS.'},
    {name:'Northwind', quote:'The Scrum library made sprint ceremonies click for non‑technical teams.'},
  ];
  return el(`<section class="panel"><h2>What teams say</h2>
    <div class="grid cols-2">${items.map(t=>`<blockquote class="card"><div class="p">“${t.quote}”<div class="meta" style="margin-top:6px">— ${t.name}</div></div></blockquote>`).join('')}</div>
  </section>`);
}

function render(data, org){
  const main = document.querySelector('main');
  main.innerHTML='';
  main.appendChild(hero(data));
  main.appendChild(gateView(org));
  const grid = layoutGrid(); main.appendChild(grid);
  grid.querySelector('#lms-sidebar').appendChild(sidebar(org));
  const mainCol = grid.querySelector('#lms-main');
  mainCol.appendChild(tracks()); mainCol.appendChild(featured(data)); mainCol.appendChild(catalog(data)); mainCol.appendChild(testimonials()); mainCol.appendChild(faq());
}

function wireEvents(){
  document.addEventListener('click', (e)=>{
    const buy = e.target.closest('[data-buy]');
    if(buy){ addToCart({id:buy.dataset.id, title:buy.dataset.title, price:parseFloat(buy.dataset.price)}); }
    const en = e.target.closest('[data-enroll]');
    if(en){ alert('Enrolled! Included in your plan.'); }
    const plan = e.target.closest('[data-plan]');
    if(plan){ const m = signInModal(plan.dataset.plan); document.body.appendChild(m); modalWire(m); }
    if(e.target.id==='org-signin'){ const m = signInModal(); document.body.appendChild(m); modalWire(m); }
    if(e.target.id==='org-register'){ const m = registerModal(); document.body.appendChild(m); modalWire(m); }
    if(e.target.id==='org-signout'){ localStorage.removeItem(ORG_KEY); boot(); }
  }, { passive:true });
}

function modalWire(modal){
  modal.addEventListener('click', (ev)=>{
    if(ev.target.id==='cancel' || ev.target===modal){ modal.remove(); }
    if(ev.target.id==='save'){
      const n = modal.querySelector('#org-name')?.value || modal.querySelector('#biz-name')?.value || 'My Org';
      const p = modal.querySelector('#org-plan')?.value || modal.querySelector('#biz-plan')?.value || 'basic';
      localStorage.setItem(ORG_KEY, JSON.stringify({name:n, plan:p}));
      modal.remove(); boot();
    }
  });
}

async function boot(){
  initThemes();
  mountCartUI();
  const data = await loadData();
  const org = JSON.parse(localStorage.getItem(ORG_KEY)||'null');
  render(data, org);
  wireEvents();
}
export { boot as bootIntreenLMS };
