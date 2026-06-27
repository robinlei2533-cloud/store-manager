import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const results = [];

const pages = [
  { name: "Main Index", url: "http://localhost:5173/" },
  { name: "Fan App", url: "http://localhost:5173/fan-app.html" },
  { name: "Store App", url: "http://localhost:5173/store-app.html" },
  { name: "Admin Login Hash", url: "http://localhost:5173/#/admin" },
  { name: "Fan Entry", url: "http://localhost:5173/fan-app.html#/fan-entry" },
  { name: "Fan Center", url: "http://localhost:5173/fan-app.html#/fan-center" },
  { name: "Store Owner", url: "http://localhost:5173/store-app.html#/store-owner" },
];

for (const p of pages) {
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(p.url, { waitUntil: "networkidle", timeout: 15000 });
    const title = await page.title();
    const consoleErrors = [];
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    await new Promise(r => setTimeout(r, 2000));
    results.push({ name: p.name, url: p.url, status: "OK", title, errors: consoleErrors.slice(0,3) });
    await page.close();
  } catch (e) {
    results.push({ name: p.name, url: p.url, status: "ERROR", error: e.message });
  }
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
