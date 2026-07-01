const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages';

function modifyFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [from, to] of replacements) {
        const idx = content.indexOf(from);
        if (idx === -1) {
            console.log('  WARNING: pattern not found in ' + path.basename(filePath) + ' for "' + from.substring(0, 40) + '..."');
            continue;
        }
        content = content.replace(from, to);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('OK: ' + path.basename(filePath));
}

const bgRadial = 'bg-radial-top';
const containerStyle = 'style={{minHeight:"100vh",padding:24}}';

// ============ STORES ============
const stores = path.join(base, 'stores');
modifyFile(path.join(stores, 'StoreListPage.jsx'), [
    ['<PageTransition>\n    <Card className="crud-card" title="Store Management"',
     '<PageTransition>\n    <div className="' + bgRadial + '" ' + containerStyle + '>\n    <Card className="crud-card liquid-glass" title="Store Management"'],
    ['<Card className="crud-card" title="Import Stores from CSV" size="small" style={{ marginTop: 16, background: \'#fafafa\' }}>',
     '<Card className="crud-card liquid-glass" title="Import Stores from CSV" size="small" style={{ marginTop: 16 }}>'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

modifyFile(path.join(stores, 'StoreCreatePage.jsx'), [
    ['<PageTransition>\n    <Card title={id ? \'Edit Store\' : \'Add Store\'}>',
     '<PageTransition>\n    <div className="' + bgRadial + '" ' + containerStyle + '>\n    <Card className="liquid-glass" title={id ? \'Edit Store\' : \'Add Store\'}>'],
    ['</Card>\n    </PageTransition>)',
     '</Card>\n    </div>\n    </PageTransition>)'],
]);

modifyFile(path.join(stores, 'StoreDetailPage.jsx'), [
    ['<PageTransition>\n    <div>\n      <Button type="link" onClick={() => navigate(\'/app/stores/list\')}',
     '<PageTransition>\n    <div className="' + bgRadial + '" ' + containerStyle + '>\n      <Button type="link" onClick={() => navigate(\'/app/stores/list\')}'],
    ['<Card title={store?.name || \'Store Detail\'}>',
     '<Card className="liquid-glass" title={store?.name || \'Store Detail\'}>'],
]);

console.log('\n=== STORES done ===');
