const fs = require('fs');
const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages';

// EvalListPage - add liquid-glass to stat cards
let e = fs.readFileSync(base + '\\evaluation\\EvalListPage.jsx', 'utf-8');
e = e.replace(
  '<Col xs={12} sm={12} md={6}><Card size="small"><Statistic title="Avg Score"',
  '<Col xs={12} sm={12} md={6}><Card className="liquid-glass" size="small"><Statistic title="Avg Score"'
);
e = e.replace(
  '<Col xs={12} sm={12} md={6}><Card size="small"><Statistic title="Level A"',
  '<Col xs={12} sm={12} md={6}><Card className="liquid-glass" size="small"><Statistic title="Level A"'
);
e = e.replace(
  '<Col xs={12} sm={12} md={6}><Card size="small"><Statistic title="Level B"',
  '<Col xs={12} sm={12} md={6}><Card className="liquid-glass" size="small"><Statistic title="Level B"'
);
e = e.replace(
  '<Col xs={12} sm={12} md={6}><Card size="small"><Statistic title="Level C"',
  '<Col xs={12} sm={12} md={6}><Card className="liquid-glass" size="small"><Statistic title="Level C"'
);
fs.writeFileSync(base + '\\evaluation\\EvalListPage.jsx', e, 'utf-8');
console.log('EvalListPage stats done');

// ScanCenterPage stat cards
let s = fs.readFileSync(base + '\\fans\\ScanCenterPage.jsx', 'utf-8');
s = s.replace(
  '<Col span={6}><Card size="small"><Statistic title="Total QR Codes"',
  '<Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Total QR Codes"'
);
s = s.replace(
  '<Col span={6}><Card size="small"><Statistic title="Active Codes"',
  '<Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Active Codes"'
);
s = s.replace(
  '<Col span={6}><Card size="small"><Statistic title="Total Scans"',
  '<Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Total Scans"'
);
s = s.replace(
  '<Col span={6}><Card size="small"><Statistic title="Total Points Awarded"',
  '<Col span={6}><Card className="liquid-glass" size="small"><Statistic title="Total Points Awarded"'
);
fs.writeFileSync(base + '\\fans\\ScanCenterPage.jsx', s, 'utf-8');
console.log('ScanCenterPage stats done');

// CommunityPage - also wrap the main post cards
let co = fs.readFileSync(base + '\\community\\CommunityPage.jsx', 'utf-8');
// The main feed cards (post cards)
co = co.replace(
  '<Card style={{ marginBottom: 16 }}>',
  '<Card className="liquid-glass" style={{ marginBottom: 16 }}>'
);
fs.writeFileSync(base + '\\community\\CommunityPage.jsx', co, 'utf-8');
console.log('CommunityPage post card done');
