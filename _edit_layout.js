const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\components\\layout\\AppLayout.jsx';
let code = fs.readFileSync(path, 'utf8');

// Remove GSAP imports
code = code.replace(/import \{ useGSAP \} from '@gsap\/react';\r?\n/g, '');
code = code.replace(/import gsap from 'gsap';\r?\n/g, '');

// Remove gsap.registerPlugin  
code = code.replace(/gsap\.registerPlugin\(useGSAP\);\r?\n/g, '');

// Replace the 3 useGSAP/gsap.from blocks with Framer Motion

// 1. First useGSAP block (profile check - line ~44)
code = code.replace(
  /  useGSAP\(\(\) => \{[\s\S]*?\}, \{ scope: contentRef \}\);\r?\n/g,
  ''
);

// 2. Brand block animation  
code = code.replace(
  /  useGSAP\(\(\) => \{[\s\S]*?\}, \[\]\);\r?\n/g,
  ''
);

// 3. Route change animation
code = code.replace(
  /\/\/ Animate content on route change[\s\S]*?useGSAP\(\(\) => \{[\s\S]*?\}, \{ dependencies: \[location\.pathname\], scope: contentRef \}\);\r?\n/g,
  ''
);

// Clean up
code = code.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(path, code, 'utf8');
console.log('APPLAYOUT: done. Length:', code.length);
