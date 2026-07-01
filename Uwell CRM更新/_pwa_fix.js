const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend';

// ---- fan-app.html ----
let html = fs.readFileSync(path.join(dir, 'fan-app.html'), 'utf-8');
html = html.replace(/<style>[\s\S]*?<\/style>/, '    <link rel="stylesheet" href="/src/styles/design-system.css">\n');
html = html.replace(
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />\n    <link rel="manifest" href="/manifest.json">\n    <link rel="apple-touch-icon" href="/images/icon-192.png">'
);
html = html.replace('</body>',   <script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
</script>
</body>);
fs.writeFileSync(path.join(dir, 'fan-app.html'), html, 'utf-8');
console.log('fan-app.html done');

// ---- store-app.html ----
html = fs.readFileSync(path.join(dir, 'store-app.html'), 'utf-8');
html = html.replace(/<style>[\s\S]*?<\/style>/, '    <link rel="stylesheet" href="/src/styles/design-system.css">\n');
html = html.replace(
  '<meta name="theme-color" content="#0a0a0f" />',
  '<meta name="theme-color" content="#0a0a0f" />\n    <link rel="manifest" href="/manifest.json">\n    <meta name="apple-mobile-web-app-capable" content="yes">\n    <link rel="apple-touch-icon" href="/images/icon-192.png">'
);
html = html.replace('</body>',   <script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
</script>
</body>);
fs.writeFileSync(path.join(dir, 'store-app.html'), html, 'utf-8');
console.log('store-app.html done');

// Verify
const files = ['fan-app.html', 'store-app.html', 'index.html'];
for (const f of files) {
  const c = fs.readFileSync(path.join(dir, f), 'utf-8');
  const checks = [
    ['design-system.css', 'design-system.css link'],
    ['manifest.json', 'manifest link'],
    ['apple-touch-icon', 'apple-touch-icon'],
    ['serviceWorker', 'SW registration'],
  ];
  const results = checks.map(([kw, label]) => c.includes(kw) ? 'OK' : 'MISSING: ' + label);
  console.log(f + ': ' + results.join(', '));
}