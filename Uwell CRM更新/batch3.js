const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages';

function patch(filePath, replacements) {
    const name = path.basename(filePath);
    let c = fs.readFileSync(filePath, 'utf-8');
    let allOk = true;
    replacements.forEach(([from, to]) => {
        if (c.includes(from)) {
            c = c.replace(from, to);
        } else {
            console.log('  MISS in ' + name + ': "' + from.substring(0,50) + '..."');
            allOk = false;
        }
    });
    fs.writeFileSync(filePath, c, 'utf-8');
    if (allOk) console.log('  OK: ' + name);
}

const bg = 'bg-radial-top';
const sty = 'style={{minHeight:"100vh",padding:24}}';
const lg = 'liquid-glass';

// ============ EVALUATIONS ============
const ev = base + '\\evaluation';

patch(ev + '\\EvalListPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Row gutter={16} style={{ marginBottom: 16 }}>',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Row gutter={16} style={{ marginBottom: 16 }}>'],
    ['<Card className="crud-card" title="Store Evaluation"',
     '<Card className="crud-card ' + lg + '" title="Store Evaluation"'],
]);

patch(ev + '\\EvalCreatePage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/evaluation\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/evaluation\')}'],
    ['<Card title={id ? \'Edit Evaluation\' : \'New Evaluation\'}>',
     '<Card className="' + lg + '" title={id ? \'Edit Evaluation\' : \'New Evaluation\'}>'],
    // Score summary card
    ['<Card size="small" style={{ background: \'#f0f5ff\', marginBottom: 16 }}>',
     '<Card size="small" className="' + lg + '" style={{ marginBottom: 16 }}>'],
]);

patch(ev + '\\EvalDetailPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/evaluation\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/evaluation\')}'],
    ['<Card title={`Evaluation: ${evalData.stores?.name || \'\'}`}>',
     '<Card className="' + lg + '" title={`Evaluation: ${evalData.stores?.name || \'\'}`}>'],
    // Radar chart card
    ['<Card title="Radar Chart" size="small">',
     '<Card className="' + lg + '" title="Radar Chart" size="small">'],
    // Dimension scores card
    ['<Card title="Dimension Scores" size="small">',
     '<Card className="' + lg + '" title="Dimension Scores" size="small">'],
]);

console.log('=== EVALUATIONS done ===');

// ============ CAMPAIGNS ============
const cm = base + '\\campaigns';

patch(cm + '\\CampaignListPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Card className="crud-card" title="Campaign Management"',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Card className="crud-card ' + lg + '" title="Campaign Management"'],
    // Campaign cards (hoverable)
    ['<Card hoverable onClick={() => navigate(`/campaigns/${c.id}`)} title={',
     '<Card className="' + lg + '" hoverable onClick={() => navigate(`/campaigns/${c.id}`)} title={'],
]);

patch(cm + '\\CampaignCreatePage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/campaigns\')}',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/campaigns\')}'],
    ['<Card title={id ? \'Edit Campaign\' : \'New Campaign\'}>',
     '<Card className="' + lg + '" title={id ? \'Edit Campaign\' : \'New Campaign\'}>'],
]);

patch(cm + '\\CampaignDetailPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/campaigns\')} style={{ marginBottom: 16, paddingLeft: 0 }}>',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Button type="link" onClick={() => navigate(\'/app/campaigns\')} style={{ marginBottom: 16, paddingLeft: 0 }}>'],
    // Main detail card
    ['<Card title={campaign?.name || \'Campaign Detail\'}>',
     '<Card className="' + lg + '" title={campaign?.name || \'Campaign Detail\'}>'],
    // Stat cards in report tab
    ['<Card size="small"><Statistic title="Total Sales"',
     '<Card className="' + lg + '" size="small"><Statistic title="Total Sales"'],
    ['<Card size="small"><Statistic title="Total Visits"',
     '<Card className="' + lg + '" size="small"><Statistic title="Total Visits"'],
    ['<Card size="small"><Statistic title="Total Scans"',
     '<Card className="' + lg + '" size="small"><Statistic title="Total Scans"'],
    ['<Card size="small"><Statistic title="Achievement"',
     '<Card className="' + lg + '" size="small"><Statistic title="Achievement"'],
    // Summary cards in report
    ['<Card title="Summary" size="small" style={{ marginBottom: 8 }}>',
     '<Card className="' + lg + '" title="Summary" size="small" style={{ marginBottom: 8 }}>'],
    ['<Card title="Improvements" size="small">',
     '<Card className="' + lg + '" title="Improvements" size="small">'],
]);

console.log('=== CAMPAIGNS done ===');
