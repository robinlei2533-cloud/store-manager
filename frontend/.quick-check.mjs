import { chromium } from 'playwright';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  
  await p.goto('http://127.0.0.1:3456/fan-app.html#/fan-entry', { timeout: 15000, waitUntil: 'networkidle' });
  await sleep(3000);
  
  // Get full body text
  const bodyText = await p.evaluate(() => document.body.innerText);
  console.log('=== BODY TEXT (first 800 chars) ===');
  console.log(bodyText.substring(0, 800));
  
  console.log('\n=== CHECKING HEADER ===');
  // Check for store entry text
  const hasStoreEntry = bodyText.includes('Store Entry') || bodyText.includes('门店进入') || bodyText.includes('🏪');
  console.log('Store Entry text:', hasStoreEntry ? 'FOUND' : 'NOT FOUND');
  
  // Check for admin panel text
  const hasAdminEntry = bodyText.includes('Admin Panel') || bodyText.includes('管理后台') || bodyText.includes('🔐');
  console.log('Admin Panel text:', hasAdminEntry ? 'FOUND' : 'NOT FOUND');
  
  // Check for language flags
  const hasLang = bodyText.includes('🇨🇳') || bodyText.includes('🇺🇸') || bodyText.includes('🇸🇦');
  console.log('Language flags:', hasLang ? 'FOUND' : 'NOT FOUND');
  
  // Check for website link
  const hasWebsite = bodyText.includes('UWELL Website') || bodyText.includes('UWELL 官网') || bodyText.includes('🌐');
  console.log('Website link:', hasWebsite ? 'FOUND' : 'NOT FOUND');
  
  console.log('\n=== CHECKING LOGIN FORM ===');
  const emailInputs = await p.locator('input[type=\"email\"]').count();
  const pwdInputs = await p.locator('input[type=\"password\"]').count();
  console.log('Email inputs:', emailInputs);
  console.log('Password inputs:', pwdInputs);
  
  // Check canvas
  const canvases = await p.locator('canvas').count();
  console.log('Canvas elements:', canvases);
  
  await browser.close();
})();