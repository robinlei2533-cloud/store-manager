const fs = require('fs');
const filePath = 'C:\\Users\\\u9648\u6728\u6728\u7684\\Documents\\Uwell CRM\u7f51\u7ad9\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx';
const content = fs.readFileSync(filePath, 'utf-8');

const opens = (content.match(/<div/g) || []).length;
const closes = (content.match(/<\/div>/g) || []).length;
console.log('div balance:', opens - closes);

const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;
console.log('braces balance:', openBraces - closeBraces);

const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;
console.log('parens balance:', openParens - closeParens);

console.log('export default:', content.includes('export default FanEntryPage'));
console.log('fe-page:', content.includes('className=\"fe-page\"'));
console.log('fe-content-area:', content.includes('fe-content-area'));
console.log('fe-hero-row:', content.includes('fe-hero-row'));
console.log('fe-form-card:', content.includes('fe-form-card'));
console.log('fe-input-dark:', content.includes('fe-input-dark'));
console.log('ShaderOverlay removed:', !content.includes('ShaderOverlay'));
console.log('GSAP .fe-hero-left h1:', content.includes(\"gsap.from('.fe-hero-left h1'\"));
console.log('GSAP .fe-hero-left p:', content.includes(\"gsap.from('.fe-hero-left p'\"));
console.log('GSAP .fe-hero-right:', content.includes(\"gsap.from('.fe-hero-right'\"));
console.log('Line endings normalized:', !content.includes('\\r\\r\\r\\n'));
