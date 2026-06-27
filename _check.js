const fs = require("fs");
const file = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fan-entry/FanEntryPage.jsx";
const c = fs.readFileSync(file, "utf8");
console.log("Has setLangDropdownOpen:", c.includes("setLangDropdownOpen"));
console.log("Has setCurrentLang:", c.includes("setCurrentLang"));
console.log("Has currentLang:", c.includes("currentLang"));
console.log("Has LanguageSwitcher:", c.includes("LanguageSwitcher"));
