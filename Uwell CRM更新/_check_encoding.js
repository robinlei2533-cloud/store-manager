const fs = require('fs');
const filePath = "C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx";
const raw = fs.readFileSync(filePath);
console.log('Raw size:', raw.length);
console.log('Has CRCRCRLF:', raw.includes('\r\r\r\n'));
console.log('Has CRLF:', raw.includes('\r\n'));
let crcrlf = 0, crlf = 0, lf = 0;
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === 0x0d && raw[i+1] === 0x0d && raw[i+2] === 0x0d && raw[i+3] === 0x0a) { crcrlf++; i += 3; }
  else if (raw[i] === 0x0d && raw[i+1] === 0x0a) { crlf++; i++; }
  else if (raw[i] === 0x0a) { lf++; }
}
console.log('CRCRCRLF count:', crcrlf);
console.log('CRLF count:', crlf);
console.log('LF count:', lf);
