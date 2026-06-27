import http from 'http';
import fs from 'fs';
import path from 'path';
const D = path.resolve('dist');
const M = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css' };
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*' }); res.end(); return; }
  // Normalize URL: remove leading slash, default to index.html
  let url = (req.url === '/' || !req.url) ? 'index.html' : req.url.split('?')[0].replace(/^\//, '');
  // Security: prevent path traversal
  if (url.includes('..')) { res.writeHead(403); res.end('Bad path'); return; }
  let fp = path.join(D, url);
  fs.readFile(fp, (err, data) => {
    if (err) {
      // SPA fallback: serve index.html for all unknown paths
      fs.readFile(path.join(D, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(500); res.end('Server error'); return; }
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': M[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(3456, '0.0.0.0', () => console.log('OK'));
