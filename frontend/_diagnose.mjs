import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsPath = path.join(__dirname, 'dist', 'assets');

// Read the rolldown runtime
const rt = fs.readFileSync(path.join(jsPath, 'rolldown-runtime-QTnfLwEv.js'), 'utf-8');
console.log('rolldown runtime:', rt);

// Read the beginning of main index to see how it starts
const main = fs.readFileSync(path.join(jsPath, 'index-B0A0InSL.js'), 'utf-8');
console.log('\\nMain index first 300 chars:');
console.log(main.substring(0, 300));
