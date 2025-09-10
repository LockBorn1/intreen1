
const CART_KEY = "intreen_cart_v1";
function load(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }catch(e){ return [] } }
function save(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); }
function redraw(){
  const items = load();
  const count = items.reduce((n,i)=>n+i.qty,0);
  const fab = document.querySelector(".cart-fab .count");
  if(fab) fab.textContent = count;
  const panel = document.querySelector(".cart-panel");
  if(panel){
    if(items.length===0){ panel.innerHTML = "<div class='center' style='padding:16px;color:#64748b'>Your cart is empty.</div>"; return; }
    panel.innerHTML = items.map(i=>`
      <div class="cart-line"><span>${i.title} × ${i.qty}</span><strong>$${(i.price*i.qty).toFixed(2)}</strong></div>
    `).join("") + `<div class="cart-total"><span>Total</span><strong>$${items.reduce((t,i)=>t+i.price*i.qty,0).toFixed(2)}</strong></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
      <button class="btn outline sm" data-cart="clear">Clear</button>
      <a class="btn sm" style="background:var(--brand-primary);color:#fff" href="/checkout/index.html">Checkout</a>
    </div>`;
  }
}
export function addToCart(item){
  const items = load();
  const idx = items.findIndex(i=>i.id===item.id);
  if(idx>-1){ items[idx].qty += (item.qty||1); } else { items.push({...item, qty:item.qty||1}); }
  save(items); redraw();
  const t = document.createElement("div");
  t.textContent = `Added ${item.title} — $${item.price.toFixed(2)}`;
  Object.assign(t.style, {position:"fixed", right:"18px", bottom:"18px", background:"#111", color:"#fff",
    padding:"10px 14px", borderRadius:"10px", zIndex:"70", boxShadow:"0 8px 24px rgba(0,0,0,.35)"});
  document.body.appendChild(t); setTimeout(()=>t.remove(),1500);
}
export function mountCartUI(){
  let fab = document.querySelector(".cart-fab");
  if(!fab){
    fab = document.createElement("button"); fab.className="cart-fab"; fab.innerHTML = "🛒<span class='count'>0</span>";
    document.body.appendChild(fab);
  }
  let panel = document.querySelector(".cart-panel");
  if(!panel){ panel = document.createElement("div"); panel.className="cart-panel"; document.body.appendChild(panel); }
  fab.onclick = ()=>{ panel.style.display = (panel.style.display==="block"?"none":"block"); };
  redraw();
}

document.addEventListener('click',(e)=>{
  const ctrl = e.target.closest('[data-cart]'); if(!ctrl) return;
  if(ctrl.dataset.cart==='clear'){ localStorage.setItem("intreen_cart_v1","[]"); redraw(); }
});
