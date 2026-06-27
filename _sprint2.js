const fs = require("fs");
const path = require("path");
const root = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/";

// Find all .jsx files that don't have t() hook
function findJsxFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findJsxFiles(full));
    } else if (item.name.endsWith(".jsx")) {
      results.push(full);
    }
  }
  return results;
}

const files = findJsxFiles(root);
let added = 0, skipped = 0;

files.forEach(file => {
  let c = fs.readFileSync(file, "utf8");
  
  // Skip if already has t()
  if (c.includes("const { t }") || c.includes("const {t}")) {
    skipped++;
    return;
  }
  
  // Calculate relative path to stores/languageStore.js
  const rel = path.relative(path.dirname(file), root + "stores/languageStore.js").replace(/\\/g, "/");
  const importPath = rel.startsWith(".") ? rel.replace(".js", "") : "./" + rel.replace(".js", "");
  
  // Add import
  c = "import useLanguageStore from '" + importPath + "';\n" + c;
  
  // Add t() hook - find the component function and add after hooks
  // Look for useNavigate, useState, useEffect patterns
  c = c.replace(
    /const (\w+) = useNavigate\(\);/,
    "const $1 = useNavigate();\n  const { t } = useLanguageStore();"
  );
  // If no useNavigate, look for other react hooks
  c = c.replace(
    /const \[(\w+), set\1\] = useState\(/,
    "const { t } = useLanguageStore();\n  const [$1, set$1] = useState("
  );
  
  fs.writeFileSync(file, c, "utf8");
  added++;
});

console.log("Added t() to: " + added + " files");
console.log("Already had t(): " + skipped + " files");
