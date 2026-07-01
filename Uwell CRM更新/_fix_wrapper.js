const fs = require('fs');
const filePath = 'C:\\Users\\\u9648\u6728\u6728\u7684\\Documents\\Uwell CRM\u7f51\u7ad9\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix the outer wrapper - find 'return (' then the '<div style={{' pattern
const idx = content.indexOf('return (');
if (idx >= 0) {
  const after = content.substring(idx);
  const styleStart = after.indexOf('<div style={{');
  if (styleStart >= 0) {
    const sub = after.substring(styleStart);
    const styleEnd = sub.indexOf('}>');
    if (styleEnd >= 0) {
      const before = content.substring(0, idx + styleStart);
      const afterFull = content.substring(idx + styleStart + styleEnd + 2);
      content = before + '<div className="fe-page">' + afterFull;
      console.log('Replaced outer wrapper with fe-page');
    }
  }
}

// Normalize remaining line endings
content = content.replace(/\r\r\r\n/g, '\n').replace(/\r\n/g, '\n');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done - new size:', content.length);
