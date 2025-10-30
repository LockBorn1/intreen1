
// Intreen feature helpers: generic carousel arrows (safe)
(function(){
  function isHorizontalScrollable(el){
    const s = getComputedStyle(el);
    const can = /(auto|scroll|overlay)/.test(s.overflowX) || /(auto|scroll|overlay)/.test(s.overflow);
    return can && el.scrollWidth > el.clientWidth + 2;
  }
  function findScroller(start){
    let n = start;
    for(let i=0;i<8 && n && n !== document.body;i++){
      n = n.parentElement;
      if(!n) break;
      if(isHorizontalScrollable(n)) return n;
      // also treat elements with role="region" and lots of children as scrollers
      if(n.getAttribute && /region|group|listbox/i.test(n.getAttribute('role')||'') && isHorizontalScrollable(n)) return n;
    }
    return null;
  }
  function wireArrows(){
    const sel = [
      'button[aria-label*=\"Next\" i]',
      'button[aria-label*=\"Previous\" i]',
      'a[role=\"button\"][aria-label*=\"Next\" i]',
      'a[role=\"button\"][aria-label*=\"Previous\" i]',
      '[data-testid*=\"arrow\" i]',
      '[data-spec*=\"arrow\" i]'
    ].join(',');
    const btns = Array.from(document.querySelectorAll(sel));
    btns.forEach(btn=>{
      const label = (btn.getAttribute('aria-label')||btn.textContent||'').toLowerCase();
      const isNext = /next/.test(label);
      const isPrev = /prev|previous/.test(label);
      if(!isNext && !isPrev) return;
      btn.addEventListener('click', function(ev){
        const scroller = findScroller(btn);
        if(!scroller) return; // let native behavior proceed
        ev.preventDefault();
        const step = Math.max(280, Math.round(scroller.clientWidth * 0.8));
        scroller.scrollBy({left: isNext ? step : -step, behavior: 'smooth'});
      }, {passive:false});
    });
  }
  document.addEventListener('DOMContentLoaded', wireArrows);
  // also wire on route/content changes if the app mutates DOM
  const obs = new MutationObserver((m)=> wireArrows());
  obs.observe(document.documentElement, {subtree:true, childList:true});
})();
