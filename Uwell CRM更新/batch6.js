const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages';
const bg = 'bg-radial-top';
const sty = 'style={{minHeight:"100vh",padding:24}}';
const lg = 'liquid-glass';

function patch(filePath, replacements) {
    const name = path.basename(filePath);
    let c = fs.readFileSync(filePath, 'utf-8');
    let allOk = true;
    replacements.forEach(([from, to]) => {
        if (c.includes(from)) c = c.replace(from, to);
        else { console.log("  MISS: " + name + " - " + from.substring(0,30)); allOk = false; }
    });
    fs.writeFileSync(filePath, c, 'utf-8');
    if (allOk) console.log("  OK: " + name);
}

// ============ FanGrowthPage (complex) ============
const fg = base + '\\fans\\FanGrowthPage.jsx';
let c = fs.readFileSync(fg, 'utf-8');

// CheckInTab wrapper
c = c.replace(
  'const CheckInTab = ({ fan }) => {',
  'const CheckInTab = ({ fan }) => {\n  return <div className="' + bg + '" ' + sty + '>'
);
c = c.replace(
  'export default FanGrowthPage;',
  '</div>\n' + 'export default FanGrowthPage;'
);
// Actually the CheckInTab already has its own div wrapper with Row gutter. Let me do it differently.
// Actually looking at the code, CheckInTab doesn't have PageTransition, so let me not wrap it.
// Let's undo what I just did
c = c.replace(
  'const CheckInTab = ({ fan }) => {\n  return <div className="' + bg + '" ' + sty + '>',
  'const CheckInTab = ({ fan }) => {'
);
c = c.replace(
  '</div>\nexport default FanGrowthPage;',
  'export default FanGrowthPage;'
);

// Instead, add bg-radial-top to the main page
c = c.replace(
  'return (\n    <div>\n      <Title level={4} className="fg-mb16">',
  'return (\n    <div className="' + bg + '" ' + sty + '>\n      <Title level={4} className="fg-mb16">'
);

// Add liquid-glass to Cards in the page
// Fan selector Card
c = c.replace(
  '<Card size="small" className="fg-mb16">',
  '<Card size="small" className="fg-mb16 ' + lg + '">'
);
// Main Content empty state Card  
c = c.replace(
  'return (\n      <Card>',
  'return (\n      <Card className="' + lg + '">'
);

fs.writeFileSync(fg, c, 'utf-8');
console.log("  OK: FanGrowthPage.jsx (main wrapper)");

// Also add liquid-glass to inner Cards within the tabs
// CheckInTab stat cards
c = fs.readFileSync(fg, 'utf-8');
c = c.replace(
  '<Card size="small">\n            <Statistic title="Current Points"',
  '<Card className="' + lg + '" size="small">\n            <Statistic title="Current Points"'
);
c = c.replace(
  '<Card size="small">\n            <Statistic title="Level"',
  '<Card className="' + lg + '" size="small">\n            <Statistic title="Level"'
);
c = c.replace(
  '<Card size="small">\n            <Statistic title="Streak"',
  '<Card className="' + lg + '" size="small">\n            <Statistic title="Streak"'
);
c = c.replace(
  '<Card size="small">\n            <Statistic title="Next Level"',
  '<Card className="' + lg + '" size="small">\n            <Statistic title="Next Level"'
);
// LuckyDraw tab cards
c = c.replace(
  '<Card title="Basic Prizes" size="small"',
  '<Card className="' + lg + '" title="Basic Prizes" size="small"'
);
c = c.replace(
  '<Card title="Premium Prizes" size="small"',
  '<Card className="' + lg + '" title="Premium Prizes" size="small"'
);
// FanMapTab cards
c = c.replace(
  '<Card title="Fan Distribution Map" size="small">',
  '<Card className="' + lg + '" title="Fan Distribution Map" size="small">'
);
c = c.replace(
  '<Card title="Fans by Store" size="small">',
  '<Card className="' + lg + '" title="Fans by Store" size="small">'
);

fs.writeFileSync(fg, c, 'utf-8');
console.log("  OK: FanGrowthPage inner cards");

// ============ SETTINGS ============
const st = base + '\\settings';

patch(st + '\\SettingsPage.jsx', [
    ['<PageTransition>\n    <Card>',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '">'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

patch(st + '\\UserManagementPage.jsx', [
    ['<PageTransition>\n    <Card title="User Management">',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '" title="User Management">'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

patch(st + '\\ProductManagementPage.jsx', [
    ['<PageTransition>\n    <Card title="Product Management"',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '" title="Product Management"'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

patch(st + '\\DataManagement.jsx', [
    ['<PageTransition>\n    <Card title={<><DatabaseOutlined /> Data Management</>}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '" title={<><DatabaseOutlined /> Data Management</>}'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

patch(st + '\\AuditLogPage.jsx', [
    ['<PageTransition>\n        <Card title={<><DatabaseOutlined /> Audit Log</>}>',
     '<PageTransition>\n        <div className="' + bg + '" ' + sty + '>\n        <Card className="' + lg + '" title={<><DatabaseOutlined /> Audit Log</>}>'],
    ['</Card>\n      </PageTransition>',
     '</Card>\n      </div>\n      </PageTransition>'],
]);

console.log('=== SETTINGS done ===');

// ============ COMMUNITY ============
const co = base + '\\community\\CommunityPage.jsx';
// Community doesn't have PageTransition wrapper, so just add bg-radial and liquid-glass
let cc = fs.readFileSync(co, 'utf-8');

// Add bg-radial to outer wrapper
cc = cc.replace(
  'const CommunityPage = () => {',
  'const CommunityPage = () => {\n  return <div className="' + bg + '" ' + sty + '>'
);
// Add closing div before the last row's closing
// Actually easier: wrap the return statement
cc = cc.replace(
  '\nexport default CommunityPage;',
  '\n</div>\nexport default CommunityPage;'
);

// Add liquid-glass to Cards
cc = cc.replace(
  '<Card size="small" title="馃搳 Community Stats">',
  '<Card className="' + lg + '" size="small" title="馃搳 Community Stats">'
);
cc = cc.replace(
  '<Card size="small" title="馃敟 Hot Topics">',
  '<Card className="' + lg + '" size="small" title="馃敟 Hot Topics">'
);
cc = cc.replace(
  '<Card size="small" title="馃懃 Active Users">',
  '<Card className="' + lg + '" size="small" title="馃懃 Active Users">'
);

fs.writeFileSync(co, cc, 'utf-8');
console.log("  OK: CommunityPage.jsx");
