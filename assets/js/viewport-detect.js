
// viewport-detect.js — sets CSS variables and data flags for better per-device formatting
(function(){
  function apply(){
    const d = document.documentElement;
    const vv = window.visualViewport;
    const w = Math.round((vv && vv.width) || window.innerWidth);
    const h = Math.round((vv && vv.height) || window.innerHeight);
    const dpr = Math.round(window.devicePixelRatio*100)/100;
    d.style.setProperty('--vw', w + 'px');
    d.style.setProperty('--vh', h + 'px');
    d.style.setProperty('--dpr', dpr);
    d.dataset.bp = w < 640 ? 'xs' : w < 768 ? 'sm' : w < 1024 ? 'md' : w < 1280 ? 'lg' : 'xl';
    d.dataset.dpr = String(dpr);
  }
  apply();
  window.addEventListener('resize', apply, {passive:true});
  window.addEventListener('orientationchange', apply, {passive:true});
  if (window.visualViewport) window.visualViewport.addEventListener('resize', apply, {passive:true});
  window.addEventListener('load', ()=>{ apply(); setTimeout(apply,120); setTimeout(apply,500); });
})();
