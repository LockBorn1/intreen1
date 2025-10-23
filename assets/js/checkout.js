
export function loadCartSummary(){
  const items = JSON.parse(localStorage.getItem("intreen_cart_v1")||"[]");
  const lines = document.getElementById('order-lines');
  const totalEl = document.getElementById('order-total');
  if(!lines){ return; }
  if(items.length===0){ lines.innerHTML = '<p class="meta">Your cart is empty.</p>'; totalEl.textContent = '$0.00'; return; }
  lines.innerHTML = items.map(i=>`<div class="summary-line"><span>${i.title} × ${i.qty}</span><strong>$${(i.price*i.qty).toFixed(2)}</strong></div>`).join('');
  const total = items.reduce((t,i)=>t+i.price*i.qty,0);
  totalEl.textContent = '$'+total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', ()=>{
  const pay = document.getElementById('pay');
  if(pay){
    pay.addEventListener('click', ()=>{
      alert('Payment demo — integrate Stripe/PayPal here.');
    });
  }
  loadCartSummary();
});
