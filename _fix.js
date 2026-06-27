const fs = require("fs");
const file = "C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fan-entry/FanEntryPage.jsx";
let c = fs.readFileSync(file, "utf8");

// Remove setLangDropdownOpen from useState declarations
c = c.replace(/, setLangDropdownOpen/g, '');
c = c.replace(/, setCurrentLang = useState\('[^']*'\)/g, '');
// Remove standalone currentLang state
c = c.replace(/const \[currentLang, setCurrentLang\] = useState\('[^']*'\);\s*\n/g, '');
// Remove old language button JSX code 
// Find and remove the commented {/* Language */} section
c = c.replace(/\s*\{LanguageSwitcher\}\s*\n\s*<div style=\{\{ position:'relative' \}\}>[\s\S]*?<\/div>\s*\n\s*\)}/, '');

fs.writeFileSync(file, c, "utf8");
console.log("Cleaned FanEntryPage");
