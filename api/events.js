// Minimal Vercel serverless function to return events JSON by scraping on request.
// Free, simple, runs on Vercel. Add cheerio as a dependency in package.json if using a monorepo build.
import * as cheerio from 'cheerio';

function monthToNum(m){
  const map = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  return map[m.slice(0,3).toLowerCase()]||0;
}
function parseWhen(whenStr){
  if(!whenStr) return null;
  // Examples: "OCT 10-2025", "October 10, 2025", "2025-10-10"
  const s = whenStr.replace(/\s+/g,' ').trim();
  let m = s.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})\s*[-,]?\s*(\d{4})/i);
  if(m){ const y=+m[3], mo=monthToNum(m[1]), d=+m[2]; return new Date(Date.UTC(y,mo-1,d)); }
  m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if(m){ return new Date(Date.UTC(+m[1], +m[2]-1, +m[3])); }
  m = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if(m){ const mo=+m[1]>12?+m[2]:+m[1]; const d=+m[1]>12?+m[1]:+m[2]; const y=+m[3]; return new Date(Date.UTC(y,mo-1,d)); }
  return null;
}
function normalizeAndFilter(items){
  const today = new Date(); const out = [];
  for(const e of items){
    let dt = parseWhen(e.when||e.start||'');
    if(!dt && e.when && e.when.includes('–')){ // handle ranges like Oct 1–5 2025 -> pick first day
      const p = e.when.split('–')[0]; dt = parseWhen(p);
    }
    // Keep upcoming or unknown dates
    if(!dt || dt >= new Date(today.getFullYear(),today.getMonth(),today.getDate())){
      if(dt) e.when = dt.toISOString().slice(0,10);
      out.push(e);
    }
  }
  return out;
}


export const config = { runtime: 'nodejs' };

async function fetchHTML(url){
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 IntreenBot/1.0' } });
  if(!res.ok) throw new Response('Upstream error', { status: 502 });
  return await res.text();
}




function parseHome(html){
  const $ = cheerio.load(html);
  const items = [];
  $('.ova_thumbnail').each((_, el)=>{
    const root = $(el).closest('article, .ovaev_item, .elementor-post, .ova-event-item, .post');
    const img = $(el).find('img').attr('src') || '';
    const learn = root.find('a.ova-btn').filter((i,a)=>/learn\s*more/i.test($(a).text()||'')).first();
    const titleA = root.find('h2 a, h3 a').first();
    const title = (titleA.text()||'').trim();
    const url = (learn.attr('href') || titleA.attr('href') || '').trim();
    let when = '';
    const dateWrap = root.find('.wrap_date_venue, .time, .date').first();
    if(dateWrap.length) when = (dateWrap.text()||'').trim();
    if(title && url){ items.push({ title, url, image: img, when }); }
  });
  return items;
}

function parseList(html){

  const $ = cheerio.load(html);
  const items = [];

  // A) JSON-LD Events (robust)
  $('script[type="application/ld+json"]').each((_, s)=>{
    let txt = $(s).contents().text();
    try{
      const data = JSON.parse(txt);
      const arr = Array.isArray(data) ? data : (data.itemListElement || data.@graph || [data]);
    }catch(_){}
  });

  try{
    $('script[type="application/ld+json"]').each((_, s)=>{
      let txt = $(s).contents().text();
      try{
        const data = JSON.parse(txt);
        const list = Array.isArray(data) ? data : (data['@graph'] || data['itemListElement'] || [data]);
        const flat = Array.isArray(list) ? list : [list];
        for(const node of flat){
          const type = (node['@type'] || node.type || '').toString().toLowerCase();
          if(type.includes('event') && (node.name || node.headline)){
            const title = node.name || node.headline;
            const url = node.url || (node['@id']||'');
            const when = node.startDate || node.date || '';
            const island = (node.location && (node.location.name || node.location.address || '')) || '';
            const image = (Array.isArray(node.image)?node.image[0]:node.image) || '';
            if(title && url){
              items.push({ title, url, when, island, type: (node.eventAttendanceMode||'').split('/').pop()||node.eventType||'', image });
            }
          }
          // Handle ItemList of Events
          if(node.item && node.item['@type'] && node.item['@type'].toLowerCase().includes('event')){
            const ev = node.item;
            const title = ev.name || ev.headline; const url = ev.url || ''; const when = ev.startDate || '';
            const island = (ev.location && (ev.location.name||'')) || ''; const image = (Array.isArray(ev.image)?ev.image[0]:ev.image) || '';
            if(title && url){ items.push({ title, url, when, island, type: ev.eventType||'', image }); }
          }
        }
      }catch(e){}
    });
  }catch(e){}

  // B) The Events Calendar list rows
  $('.tribe-events-calendar-list__event, article.type-tribe_events, .tec-event, .events-list .event').each((_, el)=>{
    const root = $(el);
    const a = root.find('.tribe-events-calendar-list__event-title a, h2 a, h3 a, a[rel="bookmark"]').first();
    const title = (a.text() || root.find('h2, h3').first().text()).trim();
    const href = (a.attr('href') || root.find('a').first().attr('href') || '').trim();
    const dateEl = root.find('time').first();
    const when = (dateEl.attr('datetime') || dateEl.text() || '').trim();
    const meta = root.find('.tribe-events-calendar-list__event-datetime, .tribe-events-calendar-list__event-venue, .entry-meta, .meta').text().trim();
    const islandMatch = meta.match(/(Barbados|Saint\s?Eustatius|Trinidad|Tobago|Jamaica|Dominica|Antigua|Bahamas|Cuba|Curaçao|St\.\s?Maarten|Saint\s?Martin|Grenada|St\.\s?Kitts|Nevis|Bonaire|Aruba|Cayman|Martinique|Guadeloupe|Barbuda)/i);
    const typeMatch = meta.match(/(Festival|Carnival|Concert|Parade|Market|Conference|Summit|Expo)/i);
    if(title && href){ items.push({ title, url: href, when, island: islandMatch?.[1]||'', type: typeMatch?.[1]||'' }); }
  });

  // C) Fall back: any <article> with an <a> and <time>
  $('article').each((_, el)=>{
    const root = $(el);
    const a = root.find('a').first();
    const t = root.find('time').first();
    const title = a.text().trim(); const href = a.attr('href')||''; const when = t.attr('datetime')||t.text().trim();
    if(title && href && when){ items.push({ title, url: href, when }); }
  });

  return items;
}
  });
  return items;
}
);
    }
  });
  return items;
}


export default async function handler(req, res){
  try{
    const pages = ['https://caribbeanevents.com/events-archive/','https://caribbeanevents.com/events-archive/page/2/','https://caribbeanevents.com/calendar/'];
    const results = [];
    for(const u of pages){
      const html = await fetchHTML(u);
      
      let items = [];
      if(url === 'https://caribbeanevents.com/' || /\/events\/?$/.test(url)){ items = parseHome(html); }
      else { items = parseList(html); }

      for(const it of items){ results.push(it); }
    }
    // Dedup
    const seen = new Set(); const items = [];
    for(const e of results){
      const key = (e.title||'') + '|' + (e.url||''); if(!e.title || !e.url || seen.has(key)) continue;
      seen.add(key); items.push(e);
    }
    res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ updated_at: new Date().toISOString(), source: 'caribbeanevents.com', items });
  }catch(e){
    return res.status(200).json({ updated_at: new Date().toISOString(), source: 'fallback', items: [] });
  }
}

