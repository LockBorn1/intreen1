
(function(){
  const VALID=[{u:"gagemilner",p:"Gmilner1174!"},{u:"migoyf",p:"Admin15!"}],TIMEOUT=9e5;
  const bump=()=>sessionStorage.setItem('intreen_last',Date.now().toString());
  ['click','keydown','mousemove','scroll','touchstart'].forEach(e=>window.addEventListener(e,bump,{passive:true}));
  function ok(){const a=sessionStorage.getItem('intreen_auth')==='ok';const l=+sessionStorage.getItem('intreen_last')||0;return a&&l&&(Date.now()-l)<=TIMEOUT}
  function gate(){
    const old=document.getElementById('splash-overlay'); if (old && old.querySelector('#splash-form')) { return; }
    if (old) old.remove();
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

// ==== Eye icon toggle (safe, dynamic wrapper) ====
(function(){
  const pass = el.querySelector('#s_pass');
  if (!pass || pass.dataset.eyeBound === "1") return;
  pass.dataset.eyeBound = "1";

  // Build wrapper
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.style.display = 'flex';
  wrap.style.alignItems = 'center';

  // Insert wrapper before the input, then move input inside
  const parent = pass.parentNode;
  parent.insertBefore(wrap, pass);
  wrap.appendChild(pass);

  // Ensure padding for the icon
  try { 
    const pr = parseInt((pass.style.paddingRight || '0').replace('px','')) || 0;
    pass.style.paddingRight = (pr < 40 ? 40 : pr) + 'px';
  } catch(e){}

  // Create icon node
  const tog = document.createElement('span');
  tog.id = 'toggle_pass';
  tog.setAttribute('role','button');
  tog.setAttribute('tabindex','0');
  tog.setAttribute('aria-label','Show password');
  tog.title = 'Show password';
  tog.style.position = 'absolute';
  tog.style.right = '10px';
  tog.style.width = '26px';
  tog.style.height = '26px';
  tog.style.display = 'flex';
  tog.style.alignItems = 'center';
  tog.style.justifyContent = 'center';
  tog.style.cursor = 'pointer';
  tog.style.userSelect = 'none';

  // Inline SVG (eye)
  tog.innerHTML = '<svg id="eye_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  wrap.appendChild(tog);

  const eye = tog.querySelector('#eye_icon');
  let showing = false;
  function setMode(show){
    pass.type = show ? 'text' : 'password';
    tog.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    tog.title = show ? 'Hide password' : 'Show password';
    // simple icon swap (eye-off = eye with strike line)
    if (eye) {
      if (show) {
        eye.innerHTML = '<path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z"></path><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2"></line>';
      } else {
        eye.innerHTML = '<path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    }
  }
  function toggle(){ showing = !showing; setMode(showing); }
  tog.addEventListener('click', toggle);
  tog.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }});
})();
// ==== /Eye icon toggle ====


    el.querySelector('#splash-form').addEventListener('submit',ev=>{
      ev.preventDefault();
      const u=el.querySelector('#s_user').value.trim(), p=el.querySelector('#s_pass').value;
      if(VALID.some(v=>v.u===u&&v.p===p)){sessionStorage.setItem('intreen_auth','ok');bump();el.classList.add('splash-hide');setTimeout(()=>el.remove(),350);}
      else el.querySelector('#s_err').textContent='Invalid credentials';
    });
  }
  try{ if(!ok()) gate(); }catch(e){ console.warn(e); }
  setInterval(() => { if (!ok()) { const ov = document.getElementById('splash-overlay'); const hasForm = ov && ov.querySelector('#splash-form'); if (!hasForm) gate(); } }, 10000);
})();