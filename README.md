
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
