export async function bootStatus(){
  const res = await fetch('/status/status.json'); const data = await res.json(); (window.__bootStatus && window.__bootStatus.hook) && window.__bootStatus.hook(data);
  // Overall banner
  const hero = document.querySelector('.status-hero');
  const label = {
    operational: 'All Systems Operational',
    degraded_performance: 'Degraded Performance',
    partial_outage: 'Partial Outage',
    major_outage: 'Major Outage',
    maintenance: 'Scheduled Maintenance'
  }[data.overall] || 'Status';
  hero.querySelector('.meta').textContent = 'Updated ' + new Date(data.updated_at).toLocaleString();
  hero.querySelector('.title')?.remove();
  hero.insertAdjacentHTML('beforeend', `<div class="title">${label}</div>`);

  // Components
  const table = document.querySelector('.status-table');
  table.innerHTML = `<div class="row head"><div>Component</div><div>Status</div><div>Uptime</div></div>` +
    data.components.map(c=>`
      <div class="row">
        <div>${c.name}</div>
        <div>${statusPill(c.status)}</div>
        <div>${c.uptime||'—'}</div>
      </div>`).join('');

  // Incidents
  
  const incWrap = document.getElementById('incidents');
  if(incWrap){
    incWrap.innerHTML = (data.incidents||[]).map(i=>`
      <article class="incident card">
        <div class="p">
          <details ${i.status!=='resolved'?'open':''}>
            <summary><span class="pill ${i.status}">${i.status.replace('_',' ')}</span> ${i.name}</summary>
            <div class="meta">Started ${new Date(i.started_at).toLocaleString()}</div>
            <ul class="timeline">
              ${(i.updates||[]).map(u=>`<li><time>${new Date(u.at).toLocaleString()}</time><p>${u.text}</p></li>`).join('')}
            </ul>
          </details>
        </div>
      </article>
    `).join('') || '<div class="empty">No incidents reported.</div>';
  }

  function statusPill(s){
(s){
    const text = ({
      operational:'Operational',
      degraded_performance:'Degraded Performance',
      partial_outage:'Partial Outage',
      major_outage:'Major Outage',
      maintenance:'Maintenance'
    })[s]||s;
    return `<span class="pill ${s}">${text}</span>`;
  }
}

export function renderHistory(history){
  const el = document.getElementById('history');
  if(!el) return;
  el.innerHTML = `<div class="row head"><div>Date</div><div>Overall</div><div>Uptime</div></div>` +
    history.map(h=>`<div class="row"><div>${h.date}</div><div>${statusPill(h.overall)}</div><div>${h.uptime}</div></div>`).join('');
}
export function renderMaint(maint){
  const el = document.getElementById('scheduled');
  if(!el) return;
  el.innerHTML = maint.map(m=>`
    <article class="incident card">
      <div class="p">
        <div class="inc-hd"><span class="pill maintenance">${m.status}</span><h3>${m.name}</h3></div>
        <div class="meta">Window ${new Date(m.window_start).toLocaleString()} → ${new Date(m.window_end).toLocaleString()}</div>
        <ul class="timeline">
          ${m.updates.map(u=>`<li><time>${new Date(u.at).toLocaleString()}</time><p>${u.text}</p></li>`).join('')}
        </ul>
      </div>
    </article>
  `).join('') || '<div class="empty">No upcoming maintenance.</div>';
}

(function augment(){
  // When bootStatus runs, attach into its scope:
  const orig = (window.__bootStatus = window.__bootStatus || {});
  orig.hook = (data)=>{
    try{ renderMaint(data.scheduled_maintenances||[]); }catch(e){}
    try{ renderHistory(data.history||[]); }catch(e){}
  };
})();
