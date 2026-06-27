import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3456;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// SPA routing map: which entry HTML for which path
function getEntryHtml(urlPath) {
  if (urlPath.startsWith('/fan-app.html') || urlPath.startsWith('/fan-')) {
    return '/fan-app.html';
  }
  if (urlPath.startsWith('/store-app.html') || urlPath.startsWith('/store-')) {
    return '/store-app.html';
  }
  return '/index.html';
}

const server = http.createServer((req, res) => {
  let urlPath = new URL(req.url, 'http://localhost').pathname;

  // Default to fan-app
  if (urlPath === '/') {
    urlPath = '/fan-app.html';
  }

  let filePath = path.join(DIST, urlPath);

  // If file doesn't exist, try SPA routing
  if (!fs.existsSync(filePath)) {
    const entryFile = getEntryHtml(urlPath);
    filePath = path.join(DIST, entryFile);
  }

  // If still not found, return 404
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  // Cache control: HTML no cache, assets cache 1 year
  const isHtml = ext === '.html';
  const maxAge = isHtml ? 0 : 31536000;

  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': isHtml ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000, immutable',
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`✦ UWELL CRM Production Server`);
  console.log(`  http://localhost:${PORT}/fan-app.html#/fan-entry`);
  console.log(`  http://localhost:${PORT}/fan-app.html#/fan-center`);
  console.log(`  http://localhost:${PORT}/store-app.html#/store-owner`);
  console.log(`  http://localhost:${PORT}/index.html#/admin`);
  console.log(`  http://localhost:${PORT}/index.html#/app/dashboard`);
});