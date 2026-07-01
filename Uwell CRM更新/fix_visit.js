const fs = require('fs');
const p = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\visits\\VisitCreatePage.jsx';
let c = fs.readFileSync(p, 'utf-8');
// Find the Active Campaign Deliveries card and add liquid-glass
c = c.replace(
  '<Card size="small" title="',
  '<Card className="liquid-glass" size="small" title="'
);
// Only do the first replacement (the campaign card), not other small cards
fs.writeFileSync(p, c, 'utf-8');
console.log('VisitCreatePage campaign card fixed');
