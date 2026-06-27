const fs = require('fs');
const html = '<!DOCTYPE html>' +
'<html><head><meta charset="UTF-8"><title>Module Test</title>' +
'<style>body{background:#0a0a0f;color:#e0e0e0;font-family:monospace;padding:20px}' +
'h1{color:#FFD700}' +
'.pass{color:#4caf50}.fail{color:#f44336}.info{color:#888}' +
'.sect{background:#1a1a2e;border-radius:8px;padding:12px;margin:8px 0}</style></head><body>' +
'<h1>Module Load Test</h1>' +
'<div class="sect" id="s1">1. Page loaded: <span class="pass">OK</span></div>' +
'<div class="sect">2. Main module script: <span id="module-status">loading...</span></div>' +
'<div class="sect">3. Module error: <pre id="module-error" style="color:#f44336;display:none"></pre></div>' +
'<div class="sect">4. React root: <span id="root-status">waiting...</span></div>' +
'<div id="root" style="border:1px solid #333;padding:16px;margin-top:16px;min-height:40px">root div</div>' +
'<script>' +
'// Capture module load errors' +
'window.addEventListener("error", function(e) {' +
'  var errDiv = document.getElementById("module-error");' +
'  errDiv.style.display = "block";' +
'  errDiv.textContent = "Error: " + (e.message || e.error || "unknown");' +
'  console.error("Captured:", e);' +
'  document.getElementById("module-status").innerHTML = "<span class=fail>FAILED</span>";' +
'});' +
'window.addEventListener("unhandledrejection", function(e) {' +
'  var errDiv = document.getElementById("module-error");' +
'  errDiv.style.display = "block";' +
'  errDiv.textContent = "Promise: " + (e.reason || "unknown");' +
'  document.getElementById("module-status").innerHTML = "<span class=fail>PROMISE FAIL</span>";' +
'});' +
'document.getElementById("module-status").innerHTML = "<span class=info>about to load module...</span>";' +
'<\/script>' +
// Load the SAME main module as index.html
'<script type="module">' +
'try {' +
'  document.getElementById("module-status").innerHTML = "<span class=info>importing...</span>";' +
'  const mod = await import("./assets/index-DwQgT2qG.js");' +
'  document.getElementById("module-status").innerHTML = "<span class=pass>LOADED</span>";' +
'  document.getElementById("root-status").innerHTML = "<span class=pass>Module loaded, React should render</span>";' +
'} catch(e) {' +
'  document.getElementById("module-status").innerHTML = "<span class=fail>FAILED</span>";' +
'  var errDiv = document.getElementById("module-error");' +
'  errDiv.style.display = "block";' +
'  errDiv.textContent = e.message + "\\n" + (e.stack || "");' +
'}' +
'<\/script>' +
'</body></html>';
fs.writeFileSync('dist/module-test.html', html, 'utf-8');
console.log('module-test.html created, ' + html.length + ' bytes');
