const fs = require("fs");
const file = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/components/common/LanguageSwitcher.jsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
// Remove duplicate useLanguageStore import
lines.splice(0, 1);
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Fixed duplicate import");
