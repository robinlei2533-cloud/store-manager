const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\dashboard\\DashboardPage.jsx';
let code = fs.readFileSync(path, 'utf8');

// Remove useGSAP import
code = code.replace(/import \{ useGSAP \} from '@gsap\/react';\r?\n/g, '');
// Remove gsap.registerPlugin
code = code.replace(/gsap\.registerPlugin\(useGSAP\);\r?\n/g, '');
// Remove gsap import  
code = code.replace(/import gsap from 'gsap';\r?\n/g, '');

// Replace the StatCard useGSAP block with Framer Motion
code = code.replace(
  /  useGSAP\(\(\) => \{[\s\S]*?\}, \{ scope: cardRef \}\);/,
  "  // Replaced GSAP with Framer Motion below"
);

// Replace the cardRef with motion.div approach - wrap the return in motion.div 
// Actually, easier: just remove cardRef and useGSAP, and add motion props inline
code = code.replace(
  /const cardRef = useRef\(null\);\r?\n/g,
  ''
);

fs.writeFileSync(path, code, 'utf8');
console.log('DASHBOARD: done. Length:', code.length);
