const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173/#/fan-entry', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  const title = await page.title();
  console.log('TITLE:', title);
  const text = await page.evaluate(() => {
    const body = document.querySelector('#root');
    return body ? body.innerText.substring(0, 3000) : 'NO ROOT';
  });
  console.log('=== PAGE TEXT ===');
  console.log(text);
  await page.screenshot({ path: 'C:/Users/陈木木的/Documents/Uwell CRM更新/fan_entry_screenshot.png', fullPage: true });
  console.log('=== SCREENSHOT SAVED ===');
  await browser.close();
})();
