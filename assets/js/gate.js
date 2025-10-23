
(function(){
  const VALID=[{u:"gagemilner",p:"Gmilner1174!"},{u:"migoyf",p:"Admin15!"}],TIMEOUT=9e5;
  const bump=()=>sessionStorage.setItem('intreen_last',Date.now().toString());
  ['click','keydown','mousemove','scroll','touchstart'].forEach(e=>window.addEventListener(e,bump,{passive:true}));
  function ok(){const a=sessionStorage.getItem('intreen_auth')==='ok';const l=+sessionStorage.getItem('intreen_last')||0;return a&&l&&(Date.now()-l)<=TIMEOUT}
  function gate(){
    const old=document.getElementById('splash-overlay'); if(old) old.remove();
    const el=document.createElement('div'); el.id='splash-overlay';
    el.innerHTML=`<div class="splash-card">
      <img class="splash-logo" src="/assets/img/main-logo.webp" alt="Intreen Logo"/>
      <div class="soon">Coming soon to customers…</div>
      <form class="splash-form" id="splash-form" autocomplete="off">
        <input id="s_user" placeholder="Username" required />
        <input id="s_pass" placeholder="Password" type="password" required />
        <button type="submit">Enter</button>
        <div class="splash-error" id="s_err"></div>
      </form>
    </div>`;
    document.documentElement.appendChild(el);
    el.querySelector('#splash-form').addEventListener('submit',ev=>{
      ev.preventDefault();
      const u=el.querySelector('#s_user').value.trim(), p=el.querySelector('#s_pass').value;
      if(VALID.some(v=>v.u===u&&v.p===p)){sessionStorage.setItem('intreen_auth','ok');bump();el.classList.add('splash-hide');setTimeout(()=>el.remove(),350);}
      else el.querySelector('#s_err').textContent='Invalid credentials';
    });
  }
  try{ if(!ok()) gate(); }catch(e){ console.warn(e); }
  setInterval(()=>{ if(!ok()) gate(); }, 10000);
})();