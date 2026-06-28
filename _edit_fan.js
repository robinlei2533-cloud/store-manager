const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace("import gsap from 'gsap';\n", '');
code = code.replace(
  /\/\/ GSAP entrance animation for header[\s\S]*?\/\/ Staggered/,
  '// Staggered'
);
fs.writeFileSync(path, code, 'utf8');
console.log('FANENTRY: gsap removed. Length:', code.length);
