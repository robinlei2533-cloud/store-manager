const fs = require("fs");
const path = "C:\\Users\\????\\Documents\\Uwell CRM??\\uwell-crm\\frontend\\public\\fan-entry.html";
const content = fs.readFileSync(path, "utf8");
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match, allJS = "", totalScripts = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  allJS += match[1] + "\n"; totalScripts++;
}
console.log("Total script blocks:", totalScripts);
console.log("Total JS length:", allJS.length);
try {
  new Function(allJS);
  console.log("JS PARSE: OK - No syntax errors");
} catch (e) {
  console.log("JS PARSE: ERROR at line", e.lineNumber || "?", ":", e.message);
  const lines = allJS.split("\n");
  const ln = e.lineNumber || 0;
  for (let i = Math.max(0, ln - 3); i < Math.min(lines.length, ln + 2); i++) {
    console.log((i + 1) + ": " + lines[i].substring(0, 200));
  }
}
