const fs = require('fs');
const p = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\campaigns\\CampaignDetailPage.jsx';
let c = fs.readFileSync(p, 'utf-8');
c = c.replace(
  '<Card title={campaign.name} extra={<Tag',
  '<Card className="liquid-glass" title={campaign.name} extra={<Tag'
);
fs.writeFileSync(p, c, 'utf-8');
console.log('Fixed CampaignDetailPage');
