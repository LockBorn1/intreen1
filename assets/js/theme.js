
const THEMES = {
  "latte": {
    "--bg": "#eff1f5",
    "--text": "#4c4f69",
    "--muted": "#6c6f85",
    "--card": "#ffffff",
    "--nav-bg": "rgba(239,241,245,.8)",
    "--brand-primary": "#1e66f5"
  },
  "frappe": {
    "--bg": "#303446",
    "--text": "#c6d0f5",
    "--muted": "#a5adce",
    "--card": "#292c3c",
    "--nav-bg": "rgba(48,52,70,.72)",
    "--brand-primary": "#8caaee"
  },
  "macchiato": {
    "--bg": "#24273a",
    "--text": "#cad3f5",
    "--muted": "#a5adcb",
    "--card": "#1e2030",
    "--nav-bg": "rgba(36,39,58,.72)",
    "--brand-primary": "#8aadf4"
  },
  "mocha": {
    "--bg": "#1e1e2e",
    "--text": "#cdd6f4",
    "--muted": "#a6adc8",
    "--card": "#181825",
    "--nav-bg": "rgba(30,30,46,.72)",
    "--brand-primary": "#89b4fa"
  },
  "intreen": {"--bg":"#ffffff","--text":"#0b1220","--muted":"#607d8b","--card":"#ffffff","--nav-bg":"#0d47a1","--brand-primary":"#0d47a1"}
};
const STORAGE_KEY = "intreen_theme_v1";
const DEFAULT_THEME = "intreen"; // Intreen default

export function applyTheme(name){
  const theme = THEMES[name] || THEMES[DEFAULT_THEME];
  const root = document.documentElement;
  for(const k in theme){ root.style.setProperty(k, theme[k]); }
  localStorage.setItem(STORAGE_KEY, name || DEFAULT_THEME);
}

export function initThemes(){ 
  const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  applyTheme(saved);
}
