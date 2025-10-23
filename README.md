
# Intreen (Ground-Up Static Build)

A clean static build with:
- Full-screen single splash (Learn/Work/Grow vertical word slide)
- Caribbean-style **Events** grid (static sample thumbnails)
- **Shop** with floating cart button, in-panel cart, toasts
- Simplified **Sign In** page (admin is CLI-only on AWS, not exposed)
- Navbar links: Home, E‑Learning, Job Post, Events, Affiliates, Business Listing, Status, Games, Register As Vendor, About, Shop, Sign In
- Color scheme set via CSS variables in `assets/css/styles.css`

## Local preview

```bash
cd intreen-groundup-v1
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub (LockBorn1/intreen1)

```bash
# unzip and enter
unzip ~/Downloads/intreen-groundup-v1.zip -d ~/Sites/
cd ~/Sites/intreen-groundup-v1

# git init and push
rm -rf .git
git init
git branch -M main
git remote add origin https://github.com/LockBorn1/intreen1.git
git add .
git commit -m "Ground-up static site"
git push -u origin main --force
```

## Notes
- Event thumbnails hotlink to CaribbeanEvents images as placeholders.
- Cart is client-side only (localStorage).
- To change colors, edit the `:root` variables in `assets/css/styles.css`.


## Events ingestion options

### A) Vercel API (free, simple)
1. Ensure `cheerio` is installed (already in `package.json`).
2. Deploy to Vercel. The function is at `api/events.js`.
3. Your site will call `/api/events` on the Events page and render results. No extra setup.

### B) GitHub Action (static JSON refresh)
1. Enable GitHub Actions. The workflow is at `.github/workflows/scrape-events.yml`.
2. The job runs daily and writes `/events/events.json` (committed to the repo).
3. The Events page first tries `/api/events`, then falls back to `/events/events.json`.

## Status subscriptions
- Set `window.STATUS_SUBSCRIBE_ENDPOINT = "https://formspree.io/f/XXXXXXX"` in a small script tag on the Status page (or sitewide) to enable the subscribe form.
- Alternatively, switch to your own endpoint and accept `POST` with `email` field.


## E‑Learning (Frappe LMS) Integration

This site embeds the open-source Frappe LMS via an iframe for seamless UX on Vercel static hosting.

- Configure the LMS backend URL in `assets/config.json` (key: `LMS_BASE_URL`), or inject a global at build time:
  ```html
  <script>window.__LMS_BASE_URL__ = "https://learn.intreen.com";</script>
  ```
- Host the LMS backend separately (Docker or bench). See `/lms-develop/docker-installation.md` inside the provided LMS zip for a quick start.
- Visit `/elearning/` on the site to load the LMS. "Open in new tab" is provided for full-window use.

## Status Page

The status page (`/status/`) was redesigned with a dark, responsive UI. It reads data from `/status/status.json` and renders components, incidents, and maintenance.
Edit `status/status.json` to update the live state.
