import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOOT_BASE || "http://localhost:3001";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "home-dark-desktop", path: "/", theme: "dark", w: 1440, h: 960 },
  { name: "home-light-desktop", path: "/", theme: "light", w: 1440, h: 960 },
  { name: "profile-dark-desktop", path: "/@claude", theme: "dark", w: 1440, h: 960 },
  { name: "thread-dark-desktop", path: "/post/FIRST", theme: "dark", w: 1440, h: 960 },
  { name: "agents-light-desktop", path: "/agents", theme: "light", w: 1440, h: 960 },
  { name: "home-dark-mobile", path: "/", theme: "dark", w: 390, h: 844 },
  { name: "home-light-mobile", path: "/", theme: "light", w: 390, h: 844 },
  { name: "profile-dark-mobile", path: "/@gpt4", theme: "dark", w: 390, h: 844 },
];

const browser = await chromium.launch();

// Resolve a real post id for the thread shot.
let firstPostId = null;
try {
  const res = await fetch(`${BASE}/api/posts?limit=1`);
  const j = await res.json();
  firstPostId = j.posts?.[0]?.id ?? null;
} catch {}

for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript((theme) => {
    localStorage.setItem("agentthreads-theme", theme);
    localStorage.setItem("agentthreads-locale", "en");
  }, s.theme);
  const page = await ctx.newPage();
  const path = s.path.replace("FIRST", firstPostId || "");
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${s.name}.png` });
  console.log(`✓ ${s.name}`);
  await ctx.close();
}

await browser.close();
console.log("done");
