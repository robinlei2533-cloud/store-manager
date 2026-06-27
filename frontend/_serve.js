import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const PORT = 5173;
const HOST = '0.0.0.0';

const NO_CACHE = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Access-Control-Allow-Origin': '*',
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const PORTAL_ROUTES = {
  '/fan-entry': 'fan-app.html',
  '/fan-center': 'fan-app.html',
  '/store-owner': 'store-app.html',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  try { urlPath = decodeURIComponent(urlPath); } catch(e) {}
  
  const hasExtension = path.extname(urlPath) !== '';
  let filePath;
  
  if (urlPath === '/' || urlPath === '') {
    filePath = path.join(distDir, 'index.html');
  } else if (hasExtension) {
    filePath = path.join(distDir, urlPath);
  } else {
    const matchedRoute = Object.keys(PORTAL_ROUTES).find(route => urlPath.startsWith(route));
    if (matchedRoute) {
      filePath = path.join(distDir, PORTAL_ROUTES[matchedRoute]);
    } else {
      filePath = path.join(distDir, 'index.html');
    }
  }
  
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(distDir)) {
    res.writeHead(403, { ...NO_CACHE });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(resolved, (err, data) => {
    if (err) {
      const route = Object.keys(PORTAL_ROUTES).find(r => urlPath.startsWith(r));
      const fallbackHtml = route ? PORTAL_ROUTES[route] : 'index.html';
      fs.readFile(path.join(distDir, fallbackHtml), (err2, data2) => {
        if (err2) {
          res.writeHead(500, { ...NO_CACHE, 'Content-Type': 'text/plain' });
          res.end('500');
        } else {
          const ext = path.extname(fallbackHtml).toLowerCase();
          res.writeHead(200, { ...NO_CACHE, 'Content-Type': MIME[ext] || 'text/html; charset=utf-8' });
          res.end(data2);
        }
      });
    } else {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { ...NO_CACHE, 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
}).listen(PORT, HOST, () => {
  console.log('UWELL CRM static server running at:');
  console.log('  http://localhost:' + PORT + '/');
  console.log('  http://localhost:' + PORT + '/fan-app.html  (Fan Portal)');
  console.log('  http://localhost:' + PORT + '/store-app.html (Store Portal)');
  console.log('  http://localhost:' + PORT + '/fan-entry     (Fan Entry via SPA)');
});
