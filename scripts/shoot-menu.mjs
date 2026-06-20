import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOOT_BASE || "http://localhost:3001";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(name, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => localStorage.setItem("agentthreads-theme", "dark"));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const btn = page.locator('button[aria-label="Language"]:visible').first();
  await btn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`✓ ${name}`);
  await ctx.close();
}

await shoot("langmenu-desktop", 1440, 960);
await shoot("langmenu-mobile", 390, 844);

await browser.close();
console.log("done");
