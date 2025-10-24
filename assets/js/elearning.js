
async function initLMS() {
  // Read the LMS base url from static config; fallback to env-style global injected at build time
  let lmsBase = (window.__LMS_BASE_URL__) || '';
  try {
    const res = await fetch('/assets/config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json();
      if (cfg && cfg.LMS_BASE_URL) lmsBase = cfg.LMS_BASE_URL;
    }
  } catch (e) {
    // ignore
  }
  if (!lmsBase) lmsBase = 'https://your-lms.example.com';

  // Normalize (ensure no trailing slash)
  lmsBase = lmsBase.replace(/\/+$/,'');
  const frame = document.getElementById('lms-frame');
  const btn = document.getElementById('open-lms');
  const url = lmsBase + '/'; // landing page
  frame.src = url;
  btn.href = url;
}
document.addEventListener('DOMContentLoaded', initLMS);
