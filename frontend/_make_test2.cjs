const fs = require('fs');
const html = '<!DOCTYPE html>' +
'<html><head><meta charset="UTF-8"><title>Static Module Test</title>' +
'<style>body{background:#0a0a0f;color:#e0e0e0;font-family:monospace;padding:20px}' +
'h1{color:#FFD700}.pass{color:#4caf50}.fail{color:#f44336}</style></head><body>' +
'<h1>Static Module Test</h1>' +
'<div id="status">Page loaded, waiting for module...</div>' +
'<div id="root" style="border:1px solid #333;padding:16px;margin-top:16px">root div</div>' +
'<script>' +
'window.onerror = function(m,u,l,c,e) { document.getElementById("status").innerHTML = "<span class=fail>ERROR: " + m + "</span>"; }' +
'<\/script>' +
// Same approach as index.html - static module script
'<script type="module" src="./assets/index-DwQgT2qG.js"><\/script>' +
'</body></html>';
fs.writeFileSync('dist/static-module-test.html', html, 'utf-8');
console.log('static-module-test.html created');
