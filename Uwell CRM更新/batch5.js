const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\fans';
const bg = 'bg-radial-top';
const sty = 'style={{minHeight:"100vh",padding:24}}';
const lg = 'liquid-glass';

function patch(filePath, replacements) {
    const name = path.basename(filePath);
    let c = fs.readFileSync(filePath, 'utf-8');
    let allOk = true;
    replacements.forEach(([from, to]) => {
        if (c.includes(from)) c = c.replace(from, to);
        else { console.log('  MISS in ' + name); allOk = false; }
    });
    fs.writeFileSync(filePath, c, 'utf-8');
    if (allOk) console.log('  OK: ' + name);
}

// FanListPage
patch(base + '\\FanListPage.jsx', [
    ['<PageTransition>\n    <Card title="Fan Operations"',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '" title="Fan Operations"'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

// FanDetailPage
patch(base + '\\FanDetailPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/fans/list\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/fans/list\')}'],
    ['<Card title="Fan Detail">',
     '<Card className="' + lg + '" title="Fan Detail">'],
    // Level info cards
    ['<Card key={r.id} size="small" style={{ marginBottom: 8, border: r.level === fan?.level ? \'2px solid #1677ff\' : \'1px solid #eee\' }}>',
     '<Card key={r.id} size="small" className="' + lg + '" style={{ marginBottom: 8, border: r.level === fan?.level ? \'2px solid #FFD700\' : \'1px solid rgba(255,215,0,0.2)\' }}>'],
]);

// FanRulesPage
patch(base + '\\FanRulesPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/fans/list\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/fans/list\')}'],
    ['<Card title="Points Rules"',
     '<Card className="' + lg + '" title="Points Rules"'],
    ['<Card title="Level Rules">',
     '<Card className="' + lg + '" title="Level Rules">'],
]);

// ScanCenterPage
patch(base + '\\ScanCenterPage.jsx', [
    ['<PageTransition>\n    <Card>',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '">'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

console.log('=== FANS done ===');
