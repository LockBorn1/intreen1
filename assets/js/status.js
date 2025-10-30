
async function loadStatus() {
  const res = await fetch('/status/status.json', { cache: 'no-store' });
  const data = await res.json();

  const elUpdated = document.getElementById('updated');
  const elComponents = document.getElementById('components');
  const elIncidents = document.getElementById('incidents');
  const elMaint = document.getElementById('maintenances');
  const elOverall = document.getElementById('overall-chip');

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso }
  };

  // Overall
  const overall = data.overall || 'unknown';
  const overallText = {
    operational: 'All Systems Operational',
    degraded_performance: 'Degraded Performance',
    partial_outage: 'Partial Outage',
    major_outage: 'Major Outage',
    maintenance: 'Under Maintenance'
  }[overall] || overall;

  elOverall.textContent = overallText;

  // Components grid
  elComponents.innerHTML = '';
  (data.components || []).forEach(c => {
    const dotClass = c.status === 'operational' ? 'ok' : (c.status.includes('degraded') ? 'degraded' : 'down');
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <div class="comp"><span class="dot ${dotClass}"></span>${c.name}</div>
      <div class="uptime" title="30d uptime">${(c.uptime || c.uptime_value || '').toString()}</div>
    `;
    elComponents.appendChild(row);
  });

  // Incidents
  const incidents = (data.incidents || []).filter(Boolean);
  elIncidents.innerHTML = incidents.length ? '' : '<div class="row"><span class="badge">None</span></div>';
  incidents.forEach(inc => {
    const sev = (inc.impact || '').includes('major') ? 'severe' : '';
    const wrap = document.createElement('div');
    wrap.className = `incident ${sev}`;
    const updates = (inc.updates || []).map(u => `<div class="update"><span class="meta">${fmt(u.at)}</span> – ${u.text}</div>`).join('');
    wrap.innerHTML = `
      <div class="row">
        <div class="name">${inc.name}</div>
        <div class="badge">${inc.status}</div>
      </div>
      <div class="meta">Started: ${fmt(inc.started_at)} • Last update: ${fmt(inc.updated_at)}</div>
      <div class="timeline">{updates}</div>
    `.replace('{updates}', updates);
    elIncidents.appendChild(wrap);
    elIncidents.appendChild(document.createElement('hr'));
  });
  if (incidents.length) elIncidents.removeChild(elIncidents.lastChild);

  // Maintenances
  const maints = (data.scheduled_maintenances || []);
  elMaint.innerHTML = maints.length ? '' : '<div class="row"><span class="badge">None scheduled</span></div>';
  maints.forEach(m => {
    const wrap = document.createElement('div');
    wrap.className = 'incident';
    wrap.innerHTML = `
      <div class="row">
        <div class="name">${m.name}</div>
        <div class="badge">scheduled</div>
      </div>
      <div class="meta">${fmt(m.start)} → ${fmt(m.end)}</div>
      <div>${m.description || ''}</div>
    `;
    elMaint.appendChild(wrap);
    elMaint.appendChild(document.createElement('hr'));
  });
  if (maints.length) elMaint.removeChild(elMaint.lastChild);

  elUpdated.textContent = fmt(data.updated_at || new Date().toISOString());
}
document.addEventListener('DOMContentLoaded', loadStatus);



// --- Simulation Mode: randomize uptimes & sometimes incidents ---
(function(){
  const ENABLE_SIM = true; // set false to disable
  if(!ENABLE_SIM) return;
  let jitterTimer = 0;
  function jitter(){
    try{
      const compRows = document.querySelectorAll('#components .row');
      compRows.forEach(row=>{
        const uptime = row.querySelector('.uptime');
        if(!uptime) return;
        const num = Math.max(0, Math.min(0.9999, (0.9990 + Math.random()*0.001))).toFixed(4);
        uptime.textContent = (parseFloat(num)*100).toFixed(2)+'%';
      });
      // Occasionally add a transient incident
      if(Math.random()<0.20){
        const elIncidents = document.getElementById('incidents');
        const now = new Date();
        const name = ['API latency','Auth errors','Payments delay','Search indexing','CDN purge backlog'][Math.floor(Math.random()*5)];
        const wrap = document.createElement('div');
        wrap.className = 'incident';
        wrap.innerHTML = `
          <div class="row">
            <div class="name">${name}</div>
            <div class="badge">investigating</div>
          </div>
          <div class="meta">Started: ${now.toLocaleString()} • Last update: ${now.toLocaleString()}</div>
          <div class="timeline"><div class="update">${name} spotted by monitors. Team investigating.</div></div>
        `;
        if(elIncidents.innerHTML.includes('None')) elIncidents.innerHTML='';
        elIncidents.prepend(document.createElement('hr'));
        elIncidents.prepend(wrap);
        // Auto-resolve after 20–45s
        setTimeout(()=>{
          wrap.querySelector('.badge').textContent = 'resolved';
          const t = document.createElement('div');
          t.className = 'update';
          t.textContent = 'Mitigated. Monitoring shows metrics back to normal.';
          wrap.querySelector('.timeline').appendChild(t);
        }, 20000 + Math.random()*25000);
      }
    }catch(_){}
    jitterTimer = setTimeout(jitter, 7000 + Math.random()*8000);
  }
  document.addEventListener('DOMContentLoaded', ()=> setTimeout(jitter, 4000));
})();
