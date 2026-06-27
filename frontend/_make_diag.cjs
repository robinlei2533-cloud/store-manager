const fs = require('fs');
const html = '<!DOCTYPE html>' +
'<html><head><meta charset="UTF-8"><title>UWELL Diag</title>' +
'<style>body{background:#0a0a0f;color:#e0e0e0;font-family:monospace;padding:20px}' +
'h1{color:#FFD700}.pass{color:#4caf50}.fail{color:#f44336}' +
'.sect{background:#1a1a2e;border-radius:8px;padding:12px;margin:8px 0}</style></head><body>' +
'<h1>UWELL CRM Diag</h1>' +
'<div class="sect">1. JS: <span id="r1">testing...</span></div>' +
'<div class="sect">2. DOM: <span id="r2">testing...</span></div>' +
'<div class="sect">3. Fetch JS: <span id="r3">testing...</span></div>' +
'<div class="sect">4. Module import: <span id="r4">testing...</span></div>' +
'<script>' +
'document.getElementById("r1").textContent = "PASS";' +
'document.getElementById("r2").textContent = "PASS";' +
'fetch("./assets/index-DwQgT2qG.js").then(r => { document.getElementById("r3").innerHTML = "<span class=pass>PASS " + r.status + "</span>"; }).catch(e => { document.getElementById("r3").innerHTML = "<span class=fail>FAIL: " + e.message + "</span>"; });' +
'setTimeout(function() {' +
'  import("./assets/rolldown-runtime-QTnfLwEv.js").then(function(m) { document.getElementById("r4").innerHTML = "<span class=pass>PASS</span>"; }).catch(function(e) { document.getElementById("r4").innerHTML = "<span class=fail>FAIL: " + e.message + "</span>"; });' +
'}, 500);' +
'<\/script></body></html>';
fs.writeFileSync('dist/diag.html', html, 'utf-8');
console.log('diag.html created, ' + html.length + ' bytes');
