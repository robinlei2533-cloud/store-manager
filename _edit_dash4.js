const fs = require('fs');
const path = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\dashboard\\DashboardPage.jsx';
let code = fs.readFileSync(path, 'utf8');
// Fix the closing tag
code = code.replace(
  '    </div>\n  );\n};',
  '    </motion.div>\n  );\n};'
);
// Clean up the comment
code = code.replace('  // Replaced GSAP with Framer Motion below\n\n', '\n');
fs.writeFileSync(path, code, 'utf8');
console.log('Closing tag fixed. Done.');
