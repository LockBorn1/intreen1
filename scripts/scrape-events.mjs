#!/usr/bin/env node
/**
 * Simple scraper that pulls CaribbeanEvents listings and outputs /events/events.json
 * to be hosted statically. Uses cheerio. Customize selectors if the site changes.
 *
 * Usage: node scripts/scrape-events.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const ROOT = new URL('https://caribbeanevents.com/');
const SOURCES = [
  'https://caribbeanevents.com/events-archive/',
  'https://caribbeanevents.com/calendar/'
];

async function fetchHTML(url){
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 IntreenBot/1.0' } });
  if(!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

function parseList(html, url){
  const $ = cheerio.load(html);
  const items = [];
  // Heuristic selectors for event tiles and calendar listings.
  $('[class*="event"], .tribe-events-calendar-list__event, .tribe-common-g-row').each((_, el)=>{
    const root = $(el);
    const title = root.find('a:contains("Event"), a[rel="bookmark"], .tribe-events-calendar-list__event-title a, h3 a, h2 a').first().text().trim()
           || root.find('h3, h2').first().text().trim();
    const href = root.find('a').first().attr('href');
    const dateText = root.find('time').first().attr('datetime') || root.find('time').first().text().trim();
    const meta = root.find('.tribe-events-calendar-list__event-datetime, .date, .tribe-events-calendar-list__event-venue').text().trim();
    const island = (meta.match(/(Barbados|Saint\s?Eustatius|Trinidad|Tobago|Jamaica|Dominica|Antigua|Bahamas|Cuba|Curaçao|St\.\s?Maarten|Saint\s?Martin|Grenada|St\.\s?Kitts|Nevis|Bonaire|Aruba|Cayman|Martinique|Guadeloupe|Barbuda)/i) || [,''])[1];
    if(!title || !href) return;
    items.push({
      title, url: href, island: island || '', when: dateText || '',
      type: (meta.match(/(Festival|Carnival|Concert|Parade|Market|Conference|Summit|Expo)/i) || [,''])[1] || ''
    });
  });
  return items;
}

async function main(){
  const all = [];
  for(const u of SOURCES){
    try{
      const html = await fetchHTML(u);
      const items = parseList(html, u);
      all.push(...items);
    }catch(e){
      console.error('Scrape error:', e.message);
    }
  }
  // Dedup by title+url
  const dedup = [];
  const seen = new Set();
  for(const e of all){
    const key = e.title + '|' + e.url;
    if(!seen.has(key)){
      seen.add(key);
      dedup.push(e);
    }
  }
  const out = {
    updated_at: new Date().toISOString(),
    source: 'caribbeanevents.com',
    items: dedup
  };
  const outDir = path.join(process.cwd(), 'events');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'events.json'), JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.items.length} events to /events/events.json`);
}

main().catch(err=>{ console.error(err); process.exit(1); });
