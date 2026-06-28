const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx';
let code = fs.readFileSync(path, 'utf8');
// Use regex to remove the gsap import line
code = code.replace(/import gsap from 'gsap';\r?\n/g, '');
// Remove the GSAP entrance useEffect - match from comment to before the staggered useEffect
code = code.replace(
  /\/\/ GSAP entrance animation[\s\S]*?delay: 0\.9 \}\)[;\s]*\}\);?\s*/g,
  ''
);
// Clean up any double blank lines
code = code.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(path, code, 'utf8');
console.log('Done. Length:', code.length);
