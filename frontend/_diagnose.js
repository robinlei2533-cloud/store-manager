const fs = require('fs');
const path = require('path');

// Check the built JS file
const jsPath = path.join(__dirname, 'dist', 'assets');
const files = fs.readdirSync(jsPath).filter(f => f.startsWith('index-') && f.endsWith('.js'));
console.log('Main JS file:', files[0]);

const code = fs.readFileSync(path.join(jsPath, files[0]), 'utf-8');
console.log('Size:', code.length, 'bytes');

// Check for key exports
const checks = [
  'createRoot', 'HashRouter', 'ErrorBoundary', 
  'QueryClientProvider', 'ConfigProvider',
  'FanEntryRedirect', 'FanEntryPage', 'FanCenterPage',
  'StoreOwnerPage', 'LoginPage', 'AdminLayout'
];

for (const c of checks) {
  console.log('  Contains', c + ':', code.includes(c));
}

// Check for import.meta.env references (might cause issues in production)
const envRefs = code.match(/import\.meta\.env/g);
console.log('import.meta.env references:', envRefs ? envRefs.length : 0);
const envRefs2 = code.match(/import\.meta\.env\.VITE_SUPABASE/g);
console.log('VITE_SUPABASE references:', envRefs2 ? envRefs2.length : 0);

// Check for dynamic imports
const dynImports = code.match(/import\(/g);
console.log('Dynamic imports (import() calls):', dynImports ? dynImports.length : 0);

console.log('\nDiagnostic complete');
