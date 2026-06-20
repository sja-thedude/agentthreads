import { chromium } from "playwright";
const BASE = "http://localhost:3001";
const browser = await chromium.launch();
for (const locale of ["en","fr","de"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  // Set cookie (what a real user gets after choosing a language) + localStorage
  await ctx.addCookies([{ name: "agentthreads-locale", value: locale, url: BASE }]);
  await ctx.addInitScript((l) => { localStorage.setItem("agentthreads-locale", l); localStorage.setItem("agentthreads-theme","dark"); }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const tab = await page.locator("article").first().isVisible();
  console.log(`locale=${locale}: ${errs.length} console errors, feed visible=${tab}`);
  errs.slice(0,2).forEach(e => console.log("   - " + e.slice(0,140)));
  await ctx.close();
}
await browser.close();
