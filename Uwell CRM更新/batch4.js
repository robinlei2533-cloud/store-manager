const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\materials';

const bg = 'bg-radial-top';
const sty = 'style={{minHeight:"100vh",padding:24}}';
const lg = 'liquid-glass';

function patch(filePath, replacements) {
    const name = path.basename(filePath);
    let c = fs.readFileSync(filePath, 'utf-8');
    replacements.forEach(([from, to]) => {
        if (c.includes(from)) c = c.replace(from, to);
        else console.log('  MISS in ' + name);
    });
    fs.writeFileSync(filePath, c, 'utf-8');
    console.log('  OK: ' + name);
}

// MaterialListPage - complex with tabs
patch(base + '\\MaterialListPage.jsx', [
    // Wrap outer div
    ['<Card title="Inbound History">\n        {isLoading ? <div style={{ textAlign: \'center\', padding: 48 }}><Spin /></div> :',
     '<Card className="' + lg + '" title="Inbound History">\n        {isLoading ? <div style={{ textAlign: \'center\', padding: 48 }}><Spin /></div> :'],
    // Main page tabs wrapper
    ['const MaterialListPage = () => {\n  const [activeTab, setActiveTab] = useState(\'catalog\');\n\n  return (\n    <div>',
     'const MaterialListPage = () => {\n  const [activeTab, setActiveTab] = useState(\'catalog\');\n\n  return (\n    <div className="' + bg + '" ' + sty + '>'],
]);

// MaterialInboundPage
patch(base + '\\MaterialInboundPage.jsx', [
    ['<PageTransition>\n    <div>\n      <Card title="Inbound Management" style={{ marginBottom: 16 }}>',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n      <Card className="' + lg + '" title="Inbound Management" style={{ marginBottom: 16 }}>'],
    ['<Card title="Inbound History">',
     '<Card className="' + lg + '" title="Inbound History">'],
]);

// MaterialOutboundPage
patch(base + '\\MaterialOutboundPage.jsx', [
    ['<PageTransition>\n    <Card title="Outbound / Requisition">',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '" title="Outbound / Requisition">'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

// MaterialStocksPage
patch(base + '\\MaterialStocksPage.jsx', [
    ['<PageTransition>\n    <Card title="Inventory Dashboard">',
     '<PageTransition>\n    <div className="' + bg + '" ' + sty + '>\n    <Card className="' + lg + '" title="Inventory Dashboard">'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

console.log('=== MATERIALS done ===');
