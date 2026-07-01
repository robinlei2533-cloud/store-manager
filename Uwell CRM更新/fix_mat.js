const fs = require('fs');
const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\materials';

let c = fs.readFileSync(base + '\\MaterialListPage.jsx', 'utf-8');

// Add liquid-glass to inner cards in sub-tabs
// Catalog tab - main Card
c = c.replace(
  '<Card title="Material Catalog & Stock" extra={',
  '<Card className="liquid-glass" title="Material Catalog & Stock" extra={'
);
// Stock dashboard card
c = c.replace(
  '<Card title="Stock Dashboard">',
  '<Card className="liquid-glass" title="Stock Dashboard">'
);
// New Requisition card in OutboundTab  
c = c.replace(
  '<Card title="New Requisition" style={{ marginBottom: 16 }}>',
  '<Card className="liquid-glass" title="New Requisition" style={{ marginBottom: 16 }}>'
);
// Outbound Records card
c = c.replace(
  '<Card title="Outbound Records">',
  '<Card className="liquid-glass" title="Outbound Records">'
);

fs.writeFileSync(base + '\\MaterialListPage.jsx', c, 'utf-8');
console.log('MaterialListPage inner cards done');

// Also check for Tabs wrapper - wrap in bg-radial-top div  
// The wrapper was added at the div level, verify
let lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className="bg-radial-top"')) {
        console.log('bg-radial-top found at line ' + (i+1));
    }
}
