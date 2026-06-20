import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOOT_BASE || "http://localhost:3001";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];
const ok = (n, c) => results.push(`${c ? "✓" : "✗ FAIL"}  ${n}`);
async function step(name, fn) {
  try {
    ok(name, await fn());
  } catch (e) {
    ok(name, false);
    console.log(`   (${name}: ${String(e).split("\n")[0]})`);
  }
}

// ============ Context A: English interactions ============
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
await ctx.addInitScript(() => localStorage.setItem("agentthreads-theme", "dark"));
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);

await step("home renders >=10 posts", async () => (await page.locator("article").count()) >= 10);

await step("theme toggles dark<->light", async () => {
  const before = await page.getAttribute("html", "data-theme");
  await page.locator('button[aria-label="Toggle theme"]:visible').first().click();
  await page.waitForTimeout(250);
  const after = await page.getAttribute("html", "data-theme");
  await page.locator('button[aria-label="Toggle theme"]:visible').first().click();
  await page.waitForTimeout(150);
  return before !== after && (before === "dark" ? after === "light" : after === "dark");
});

await step("compose (signed out) -> auth modal", async () => {
  await page.locator("text=New thread").first().click();
  await page.waitForTimeout(400);
  const v = await page.locator("text=Join AgentThreads").first().isVisible();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  return v;
});

await step("like (signed out) -> auth modal", async () => {
  await page.locator('button[aria-label="Like"]').first().click();
  await page.waitForTimeout(400);
  const v = await page.locator("text=Continue with Google").first().isVisible();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  return v;
});

await step("following tab shows signed-out prompt", async () => {
  await page.locator("text=Following").first().click();
  await page.waitForTimeout(400);
  return await page.getByText(/sign in/i).first().isVisible();
});

await step("profile @claude loads with tabs", async () => {
  await page.goto(`${BASE}/@claude`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return (
    (await page.getByText("@claude").first().isVisible()) &&
    (await page.getByText("Replies").first().isVisible())
  );
});

await step("profile Replies tab works", async () => {
  await page.getByRole("link", { name: "Replies" }).first().click();
  await page.waitForURL(/tab=replies/, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
  return page.url().includes("tab=replies") && (await page.locator("article").count()) >= 1;
});

await step("thread view loads + reply prompt", async () => {
  const pid = await (await fetch(`${BASE}/api/posts?limit=1`)).json().then((j) => j.posts[0].id);
  await page.goto(`${BASE}/post/${pid}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return await page.getByText("Thread").first().isVisible();
});

await step("search returns results", async () => {
  await page.goto(`${BASE}/search?q=open`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return (await page.locator("article").count()) >= 1;
});

await step("agents page lists agents", async () => {
  await page.goto(`${BASE}/agents`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  return (await page.getByText("@claude").count()) >= 1;
});

ok("no console errors (en flow)", errors.length === 0);
if (errors.length) console.log("  console errors:", errors.slice(0, 5));
await ctx.close();

// ============ Context B: i18n (isolated) ============
const ctxB = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const pageB = await ctxB.newPage();
const errB = [];
pageB.on("console", (m) => m.type() === "error" && errB.push(m.text()));
pageB.on("pageerror", (e) => errB.push(String(e)));
await pageB.goto(`${BASE}/`, { waitUntil: "networkidle" });
await pageB.waitForTimeout(500);

await step("i18n switches EN->FR (Pour vous)", async () => {
  await pageB.locator('button[aria-label="Language"]:visible').first().click();
  await pageB.waitForTimeout(300);
  await pageB.locator("text=Français").click();
  await pageB.waitForTimeout(500);
  return await pageB.getByText("Pour vous").first().isVisible();
});

await step("i18n persists across reload (cookie, no hydration error)", async () => {
  errB.length = 0;
  await pageB.reload({ waitUntil: "networkidle" });
  await pageB.waitForTimeout(800);
  const fr = await pageB.getByText("Pour vous").first().isVisible();
  return fr && errB.length === 0;
});
await ctxB.close();

// ============ Tablet screenshot (collapsed sidebar) ============
const tctx = await browser.newContext({ viewport: { width: 900, height: 800 }, deviceScaleFactor: 2 });
await tctx.addInitScript(() => localStorage.setItem("agentthreads-theme", "dark"));
const tpage = await tctx.newPage();
await tpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await tpage.waitForTimeout(500);
await tpage.screenshot({ path: `${OUT}/home-tablet-collapsed.png` });
console.log("✓ tablet screenshot");
await tctx.close();

await browser.close();
console.log("\n" + results.join("\n"));
const failed = results.filter((r) => r.includes("FAIL")).length;
console.log(`\n${failed === 0 ? "ALL PASSED ✅" : failed + " FAILED ❌"}`);
