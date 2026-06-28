const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\dashboard\\DashboardPage.jsx';
let code = fs.readFileSync(path, 'utf8');

// Replace the StatCard function's return div with motion.div 
// First, fix the cardRef reference by replacing the div with motion.div
code = code.replace(
  '<div ref={cardRef} className="liquid-glass" style={{',
  '<motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: delay * 0.1, ease: [0.16, 1, 0.3, 1] }} className="liquid-glass" style={{'
);

// Replace closing div of StatCard  
code = code.replace(
  '</div>\n  );\n};',
  '</motion.div>\n  );\n};'
);

// Remove the leftover cardRef from destructuring if it exists as a standalone removal
// But keep it if used elsewhere

console.log('cardRef count:', (code.match(/cardRef/g) || []).length);
console.log('gsap count:', (code.match(/gsap/g) || []).length);
console.log('useGSAP count:', (code.match(/useGSAP/g) || []).length);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
