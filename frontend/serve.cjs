const http = require("http");
const fs = require("fs");
const path = require("path");

// P3-2: 环境变量校验 — 检查 .env 是否存在
const dotenvPath = path.join(__dirname, ".env");
if (!fs.existsSync(dotenvPath)) {
  console.warn("\n[WARN] .env file not found — running in LOCAL mode.");
  console.warn("[WARN] To enable Supabase, copy .env.example to .env and fill in your credentials.\n");
} else {
  console.log("[INFO] .env found — Supabase mode available.\n");
}

const envExample = path.join(__dirname, ".env.example");
if (fs.existsSync(envExample)) {
  const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
  const exampleContent = fs.readFileSync(envExample, "utf8");
  for (const v of requiredVars) {
    if (!exampleContent.includes(v + "=")) {
      console.warn("[WARN] .env.example is missing required variable: " + v);
    }
  }
}
const dist = path.join(__dirname, "dist");
const mime = { ".html":"text/html",".js":"application/javascript",".css":"text/css",".png":"image/png",".svg":"image/svg+xml",".ico":"image/x-icon" };
http.createServer((req, res) => {
  let fp = req.url === "/" ? path.join(dist, "index.html") : path.join(dist, req.url.replace(/^\//, ""));
  if (!fs.existsSync(fp)) fp = path.join(dist, "index.html");
  if (fs.existsSync(fp)) {
    const ext = path.extname(fp);
    const isHtml = ext === ".html";
  const cacheControl = isHtml ? "no-cache, no-store, must-revalidate" : "public, max-age=0, must-revalidate";
  res.writeHead(200, { "Content-Type": mime[ext] || "text/plain", "Access-Control-Allow-Origin": "*", "Cache-Control": cacheControl, "Pragma": "no-cache", "Expires": "0" });
    fs.createReadStream(fp).pipe(res);
  } else { res.writeHead(404); res.end("NF"); }
}).listen(3456, () => console.log("Server running on http://127.0.0.1:3456"));

