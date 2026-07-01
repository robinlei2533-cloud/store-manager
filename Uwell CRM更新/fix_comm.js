const fs = require('fs');
const p = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\community\\CommunityPage.jsx';
let c = fs.readFileSync(p, 'utf-8');
// Add liquid-glass to the 3 sidebar cards
c = c.replace(
  '<Card size="small" title="📊 Community Stats">',
  '<Card className="liquid-glass" size="small" title="📊 Community Stats">'
);
c = c.replace(
  '<Card size="small" title="🔥 Hot Topics">',
  '<Card className="liquid-glass" size="small" title="🔥 Hot Topics">'
);
c = c.replace(
  '<Card size="small" title="👥 Active Users">',
  '<Card className="liquid-glass" size="small" title="👥 Active Users">'
);
fs.writeFileSync(p, c, 'utf-8');
console.log('CommunityPage done');
