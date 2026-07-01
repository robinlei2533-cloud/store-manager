const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages';

function patch(filePath, replacements) {
    const name = path.basename(filePath);
    let c = fs.readFileSync(filePath, 'utf-8');
    replacements.forEach(([from, to]) => {
        if (c.includes(from)) {
            c = c.replace(from, to);
        } else {
            console.log('  MISS: ' + name);
        }
    });
    fs.writeFileSync(filePath, c, 'utf-8');
    console.log('  OK: ' + name);
}

const bg = 'bg-radial-top';
const sty = 'style={{minHeight:"100vh",padding:24}}';
const lg = 'liquid-glass';

// HELPER FUNCTIONS
function mainCard(pattern) {
    return [pattern, pattern.replace('className="', 'className="' + lg + ' ')];
}

function wrapRadial(openPattern, closePattern) {
    return [
        [openPattern, '<div className="' + bg + '" ' + sty + '>\n    ' + openPattern],
        [closePattern, '</div>\n    ' + closePattern]
    ];
}

// ============ VISITS ============
const v = base + '\\visits';

patch(v + '\\VisitListPage.jsx', [
    ['<PageTransition>\n    <Card className="crud-card" title="Visit Management"',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="crud-card ' + lg + '" title="Visit Management"'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

patch(v + '\\VisitCreatePage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/visits/list\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/visits/list\')}'],
    ['<Card title={id ? \'Edit Visit\' : \'New Visit\'}>',
     '<Card className="' + lg + '" title={id ? \'Edit Visit\' : \'New Visit\'}>'],
    // Campaign delivery card
    ['<Card size="small" title="馃幆 Active Campaign Deliveries" style={{marginBottom:16,background:"#fffbe6",borderColor:"#FFD700",borderRadius:12}}>',
     '<Card size="small" className="' + lg + '" title="馃幆 Active Campaign Deliveries" style={{marginBottom:16,borderRadius:12}}>'],
]);

patch(v + '\\VisitDetailPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/visits/list\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/visits/list\')}'],
    ['<Card title="Visit Detail">',
     '<Card className="' + lg + '" title="Visit Detail">'],
]);

console.log('=== VISITS done ===');
