import { chromium } from 'playwright';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];

(async () => {
  console.log('=== COMPLETION AUDIT ===\n');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  
  // REQUIREMENT 1: Fan entry - store owner button visible
  console.log('--- Requirement 1: Store button visible on fan entry ---');
  const p1 = await ctx.newPage();
  await p1.goto('http://127.0.0.1:3456/fan-app.html#/fan-entry', { timeout: 15000, waitUntil: 'networkidle' });
  await sleep(3000);
  
  const storeBtn = await p1.locator('text=门店进入').count() + await p1.locator('text=Store').count() + await p1.locator('🏪').count();
  results.push({ r: 'Store entry button visible on fan entry', pass: storeBtn > 0 });
  console.log('  Store entry:', storeBtn > 0 ? 'FOUND' : 'NOT FOUND');
  
  // REQUIREMENT 2: Language switch visible
  const langBtn = await p1.locator('button:has-text(\"🇨🇳\"), button:has-text(\"🇺🇸\"), button:has-text(\"🇸🇦\")').count();
  results.push({ r: 'Language switch visible on fan entry', pass: langBtn > 0 });
  console.log('  Language switch:', langBtn > 0 ? 'FOUND' : 'NOT FOUND');
  
  // Click language and check dropdown
  const langSwitcherBtn = p1.locator('button').filter({ has: p1.locator('text=🇺🇸') }).or(p1.locator('button').filter({ has: p1.locator('text=🇨🇳') })).first();
  if (await langSwitcherBtn.isVisible()) {
    await langSwitcherBtn.click();
    await sleep(500);
    const langOptions = await p1.locator('text=中文, text=English, text=العربية').count();
    results.push({ r: 'Language dropdown has options', pass: langOptions >= 2 });
    console.log('  Language options:', langOptions);
    await langSwitcherBtn.click();
  }
  
  // REQUIREMENT 3: Login form works
  const emailInput = p1.locator('input[type=\"email\"]').first();
  const pwdInput = p1.locator('input[type=\"password\"]').first();
  results.push({ r: 'Fan login form present', pass: await emailInput.isVisible() && await pwdInput.isVisible() });
  await emailInput.fill('fan@uwell.com');
  await pwdInput.fill('test123');
  const signInBtn = p1.locator('button').filter({ hasText: /SIGN/ }).first();
  await signInBtn.click();
  await sleep(6000);
  results.push({ r: 'Fan login navigates to fan-center', pass: p1.url().includes('fan-center') });
  console.log('  Login redirect:', p1.url().includes('fan-center') ? 'OK' : 'FAILED');
  await p1.close();
  
  // REQUIREMENT 4: Fan center tabs functional
  console.log('\n--- Requirement 2: Fan center fully functional ---');
  const p2 = await ctx.newPage();
  await p2.goto('http://127.0.0.1:3456/fan-app.html', { timeout: 10000 });
  await p2.evaluate(() => localStorage.setItem('store_manager_current_user', 'f-001'));
  await p2.reload({ timeout: 10000, waitUntil: 'networkidle' });
  await p2.evaluate(() => { window.location.hash = '#/fan-center'; });
  await sleep(8000);
  
  const tabs = await p2.locator('[role=\"tab\"]').count();
  results.push({ r: 'Fan center tabs loaded', pass: tabs >= 3 });
  console.log('  Tabs:', tabs);
  
  if (tabs > 0) {
    const tabEls = await p2.locator('[role=\"tab\"]').all();
    let clickSuccess = 0;
    for (let i = 0; i < Math.min(tabEls.length, 6); i++) {
      try { await tabEls[i].click(); await sleep(800); clickSuccess++; } catch(e) {}
    }
    results.push({ r: 'Fan center tabs clickable', pass: clickSuccess >= 2 });
    console.log('  Clicked:', clickSuccess, 'tabs');
  }
  await p2.close();
  
  // REQUIREMENT 5: Store owner functional
  console.log('\n--- Requirement 3: Store owner functional ---');
  const p3 = await ctx.newPage();
  await p3.goto('http://127.0.0.1:3456/store-app.html', { timeout: 10000 });
  await p3.evaluate(() => { localStorage.setItem('store_manager_current_user', 'store-002'); localStorage.setItem('store_manager_version', '0'); });
  await p3.reload({ timeout: 15000, waitUntil: 'networkidle' });
  await sleep(5000);
  const body3 = await p3.evaluate(() => document.body.innerText.length);
  results.push({ r: 'Store owner loads with content', pass: body3 > 50 });
  console.log('  Content:', body3, 'chars');
  await p3.close();
  
  // REQUIREMENT 6: Admin has no fan/store buttons
  console.log('\n--- Requirement 4: Admin separate, no fan/store buttons ---');
  const p4 = await ctx.newPage();
  await p4.goto('http://127.0.0.1:3456/index.html#/admin', { timeout: 15000, waitUntil: 'networkidle' });
  await sleep(2000);
  
  const fanLinks = await p4.locator('a[href*=\"fan\"]').count();
  const storeLinks = await p4.locator('a[href*=\"store\"]').count();
  const btnText = await p4.evaluate(() => document.body.innerText);
  const hasFanText = btnText.includes('粉丝进入') || btnText.includes('门店进入');
  
  results.push({ r: 'Admin has NO fan/store navigation', pass: fanLinks + storeLinks === 0 && !hasFanText });
  console.log('  Fan/store links:', fanLinks + storeLinks, '(should be 0)');
  
  // Login and check dashboard
  const inputs = await p4.locator('input').all();
  await inputs[0].fill('admin@local.com');
  await inputs[1].fill('admin123');
  const loginBtn = p4.locator('button').filter({ hasText: /Sign|Login|登录/ }).first();
  await loginBtn.click();
  await sleep(3000);
  await p4.goto('http://127.0.0.1:3456/index.html#/app/dashboard', { timeout: 15000, waitUntil: 'networkidle' });
  await sleep(5000);
  
  const dashText = await p4.evaluate(() => document.body.innerText);
  const hasAppErr = dashText.includes('Application Error');
  results.push({ r: 'Dashboard loads without errors', pass: !hasAppErr && dashText.length > 200 });
  console.log('  Dashboard:', dashText.length, 'chars, errors:', hasAppErr);
  
  // Verify dashboard has no fan/store entry links
  const dashFanLinks = await p4.locator('a[href*=\"fan\"]').count();
  const dashStoreLinks = await p4.locator('a[href*=\"store\"]').count();
  results.push({ r: 'Dashboard sidebar has NO fan/store links', pass: dashFanLinks + dashStoreLinks === 0 });
  
  // Check admin pages load
  const adminPages = ['/app/stores/list', '/app/visits/list', '/app/evaluation', '/app/campaigns', '/app/materials/list', '/app/fans/list'];
  let loaded = 0;
  for (const page of adminPages) {
    try {
      await p4.goto('http://127.0.0.1:3456/index.html' + page, { timeout: 15000, waitUntil: 'networkidle' });
      await sleep(3000);
      const txt = await p4.evaluate(() => document.body.innerText.length);
      if (txt > 20) loaded++;
    } catch(e) {}
  }
  results.push({ r: 'Admin CRUD pages loadable', pass: loaded >= 3 });
  console.log('  Admin pages loaded:', loaded, '/ 6');
  await p4.close();
  
  // RESULTS
  await browser.close();
  console.log('\n=== COMPLETION AUDIT ===');
  let pass = 0, fail = 0;
  results.forEach(r => { r.pass ? pass++ : fail++; console.log('  ' + (r.pass ? 'PASS' : 'FAIL') + ' > ' + r.r); });
  console.log('\nTotal: ' + (pass+fail) + ', PASS: ' + pass + ', FAIL: ' + fail + ', Rate: ' + Math.round(pass/(pass+fail)*100) + '%');
})();