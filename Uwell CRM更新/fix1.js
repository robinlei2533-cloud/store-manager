const fs = require('fs');

const base = 'C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages';

function patch(f, replacements) {
    let c = fs.readFileSync(f, 'utf-8');
    replacements.forEach(([from, to]) => {
        if (c.includes(from)) {
            c = c.replace(from, to);
            console.log('  patched in ' + require('path').basename(f));
        } else {
            console.log('  SKIP: ' + require('path').basename(f) + ' - pattern not found');
        }
    });
    fs.writeFileSync(f, c, 'utf-8');
}

const bg = 'bg-radial-top';
const sty = 'style={{minHeight:"100vh",padding:24}}';
const lg = 'liquid-glass';

// Fix StoreListPage
const slp = base + '\\stores\\StoreListPage.jsx';
patch(slp, [
    ['<div class="bg-radial-top" style="min-height:100vh;padding:24px">', '<div className="' + bg + '" ' + sty + '>'],
    ['</Card>\\n    </PageTransition>);', '</Card>\\n    </div>\\n    </PageTransition>);']
]);

console.log('DONE');
