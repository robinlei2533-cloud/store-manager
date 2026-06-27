const fs = require("fs");
const root = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src";
const files = fs.readdirSync(root, { recursive: true }).filter(f => f.endsWith(".jsx"));

let issues = [];
files.forEach(f => {
  const c = fs.readFileSync(root + "/" + f, "utf8");
  const matches = c.match(/import useLanguageStore/g);
  if (matches && matches.length > 1) {
    issues.push(f + " (" + matches.length + "x)");
  }
});
console.log("Files with duplicate useLanguageStore imports:");
issues.forEach(i => console.log("  " + i));
