import { test, expect } from "@playwright/test";
const BASE = "http://127.0.0.1:3456";
test.describe("Core Workflow", () => {
  test("All pages load without React errors", async ({ page }) => {
    const urls = [
      "/#/admin", "/#/app/stores", "/#/app/visits",
      "/#/app/evaluation", "/#/app/dashboard",
      "/fan-app.html#/fan-entry", "/fan-app.html#/fan-center",
      "/store-app.html#/store-owner"
    ];
    for (const url of urls) {
      await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent("body");
      const hasReactError = body.includes("Unexpected Application Error") || body.includes("is not defined");
      expect(hasReactError).toBe(false);
    }
  });
  test("Login + Store flow works", async ({ page }) => {
    await page.goto(BASE + "/#/admin", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);
    const pw = page.locator("input[type=password]");
    if (await pw.count() > 0) {
      await page.locator("input").nth(0).fill("admin@test.com");
      await pw.fill("admin123");
      await page.locator("button[type=submit]").click();
      await page.waitForTimeout(2000);
    }
    await page.goto(BASE + "/#/app/stores", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);
    let body = await page.textContent("body");
    expect(body.includes("Unexpected Application Error")).toBe(false);
    await page.goto(BASE + "/#/app/visits", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);
    body = await page.textContent("body");
    expect(body.includes("Unexpected Application Error")).toBe(false);
    await page.goto(BASE + "/#/app/evaluation", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);
    body = await page.textContent("body");
    expect(body.includes("Unexpected Application Error")).toBe(false);
  });
});

test.describe("Mobile Viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("Key pages render on mobile", async ({ page }) => {
    const urls = [
      "/fan-app.html#/fan-entry",
      "/fan-app.html#/fan-center",
      "/store-app.html#/store-owner"
    ];
    for (const url of urls) {
      await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent("body");
      const hasReactError = body.includes("Unexpected Application Error") || body.includes("is not defined");
      expect(hasReactError, url + " mobile render").toBe(false);
      expect(body.length, url + " has content").toBeGreaterThan(50);
    }
  });
});


