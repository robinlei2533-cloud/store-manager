const fs = require('fs');
const path = require('path');
const filePath = "C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx";

let content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Normalize ALL line endings to LF
content = content.replace(/\r\r\r\n/g, '\n').replace(/\r\n/g, '\n');
const lines = content.split('\n');
console.log('Normalized to', lines.length, 'lines');

// Step 2: Remove ShaderOverlay component (lines ~866-980)
// Find the ShaderOverlay section boundaries
const shaderMarker = '// ============ Shader/Raster Overlay ============';
let shaderIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(shaderMarker)) {
    shaderIdx = i;
    break;
  }
}
if (shaderIdx >= 0) {
  // Find the end - it's the next 'export default FanEntryPage;' or next '// =========' section
  let endIdx = -1;
  for (let i = shaderIdx + 1; i < lines.length; i++) {
    if (lines[i].includes('const FanEntryPage') || lines[i].includes('// ============') && i > shaderIdx + 1) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) endIdx = shaderIdx + 30; // fallback
  
  console.log('Removing ShaderOverlay lines', shaderIdx, 'to', endIdx - 1);
  lines.splice(shaderIdx, endIdx - shaderIdx);
}

// Step 3: Remove <ShaderOverlay /> from JSX
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<ShaderOverlay') && lines[i].includes('/>')) {
    console.log('Removed ShaderOverlay reference at line', i);
    lines.splice(i, 1);
    break;
  }
}

// Step 4: Fix GSAP targets - change the animation selectors to match existing classes
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("gsap.from('.fe-hero-title'")) {
    lines[i] = "    gsap.from('.fe-hero-left h1', { opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: 0.3 });";
    console.log('Fixed GSAP line', i);
  }
  if (lines[i].includes("gsap.from('.fe-hero-sub'")) {
    lines[i] = "    gsap.from('.fe-hero-left p', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.6 });";
    console.log('Fixed GSAP line', i);
  }
  if (lines[i].includes("gsap.from('.fe-login-form'")) {
    lines[i] = "    gsap.from('.fe-hero-right', { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out', delay: 0.9 });";
    console.log('Fixed GSAP line', i);
  }
}

// Step 5: Replace outer wrapper div's inline styles with className="fe-page"
// Find the return statement and the div right after it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'return (' && lines[i+1] && lines[i+1].includes('<div style={{')) {
    // Remove the entire inline style block and replace with just <div className="fe-page">
    let endStyle = i + 1;
    while (endStyle < lines.length && !lines[endStyle].trim().startsWith('}>')) {
      endStyle++;
    }
    if (endStyle < lines.length) {
      console.log('Replaced outer wrapper div styles with fe-page, lines', i+1, 'to', endStyle);
      lines[i+1] = '  <div className="fe-page">';
      lines.splice(i+2, endStyle - i - 1);
    }
    break;
  }
}

// Step 6: Replace main content div with fe-content-area
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('position:\'relative\'') && lines[i].includes('zIndex:20')) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ position:'relative', zIndex:20, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'120px 40px 260px' \}\}>/,
      '<div className="fe-content-area" style={{ padding:\'120px 40px 260px\' }}>'
    );
    console.log('Replaced main content div with fe-content-area');
    break;
  }
}

// Step 7: Replace hero row with fe-hero-row
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('display:\'flex\'') && lines[i].includes('gap:80') && lines[i].includes('maxWidth:1100')) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ display:'flex', alignItems:'center', justifyContent:'center', gap:80, width:'100%', maxWidth:1100, minHeight:'80vh', padding:'60px 0 40px' \}\}>/,
      '<div className="fe-hero-row">'
    );
    console.log('Replaced hero row with fe-hero-row');
    break;
  }
}

// Step 8: Replace the badge with fe-badge
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("display:'inline-flex'") && lines[i].includes("'rgba(255,215,0,0.12)'")) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, background:'rgba\(255,215,0,0\.12\)', border:'1px solid rgba\(255,215,0,0\.25\)', fontSize:11, fontWeight:700, letterSpacing:2, color:'#FFD700', textTransform:'uppercase', marginBottom:20 \}\}>/,
      '<div className="fe-badge">'
    );
    console.log('Replaced badge with fe-badge');
    break;
  }
}

// Step 9: Replace form card inner div with fe-form-card + fe-login-form
let foundFormCard = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("background:'rgba(255,255,255,0.04)'") && 
      lines[i].includes("WebkitBackdropFilter:'blur(20px)'") &&
      lines[i].includes("backdropFilter:'blur(20px)'") &&
      !foundFormCard) {
    lines[i] = '            <div className="fe-login-form fe-form-card">';
    foundFormCard = true;
    console.log('Replaced form card with fe-form-card');
  }
}

// Step 10: Replace form accent
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("width:50") && lines[i].includes("height:3") && lines[i].includes("linear-gradient(90deg,#FFD700,#457bff)")) {
    lines[i] = '              <div className="fe-form-accent" />';
    console.log('Replaced form accent');
    break;
  }
}

// Step 11: Replace form title wrapper
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("textAlign:'center', marginBottom:24") && i > 100) {
    // Only replace if we haven't already and it's after the accent line
    lines[i] = '              <div className="fe-form-title">';
    console.log('Replaced form title wrapper');
    break;
  }
}

// Step 12: Replace input fields with fe-input-dark
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('placeholder={t(\'fan_entry_placeholder_email\')}')) {
    // This is a multi-line input element - find the line with style
    for (let j = i; j < Math.min(i+5, lines.length); j++) {
      if (lines[j].includes("width:'100%'") && lines[j].includes("padding:'12px 16px'") && lines[j].includes("rgba(255,255,255,0.05)")) {
        lines[j] = lines[j].replace(
          /style=\{\{ width:'100%', padding:'12px 16px', background:'rgba\(255,255,255,0\.05\)', border:'1px solid rgba\(255,255,255,0\.1\)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' \}\}/,
          'className="fe-input-dark"'
        );
        console.log('Replaced email input with fe-input-dark');
        break;
      }
    }
  }
  if (lines[i].includes('placeholder={t(\'fan_entry_placeholder_password\')}')) {
    for (let j = i; j < Math.min(i+5, lines.length); j++) {
      if (lines[j].includes("width:'100%'") && lines[j].includes("padding:'12px 16px'") && lines[j].includes("rgba(255,255,255,0.05)")) {
        lines[j] = lines[j].replace(
          /style=\{\{ width:'100%', padding:'12px 16px', background:'rgba\(255,255,255,0\.05\)', border:'1px solid rgba\(255,255,255,0\.1\)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' \}\}/,
          'className="fe-input-dark"'
        );
        console.log('Replaced password input with fe-input-dark');
        break;
      }
    }
  }
}

// Step 13: Replace login button with fe-btn-primary
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("background:'linear-gradient(135deg,#FFD700,#F5A623)'") && 
      lines[i].includes("color:'#14141e'") && lines[i].includes("fontSize:14")) {
    // Check if this is login or register button
    const nearby = lines.slice(Math.max(0,i-5), Math.min(lines.length, i+5)).join(' ');
    if (nearby.includes('handleLogin')) {
      lines[i] = lines[i].replace(
        /style=\{[\s\S]*?\}/,
        'className="fe-btn-primary"'
      );
      console.log('Replaced login button with fe-btn-primary');
    }
    break;
  }
}

// Step 14: Replace product strip section wrapper
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("width:'100%'") && lines[i].includes("padding:'0 40px'") && lines[i].includes("marginTop:40") && i > 200) {
    // This is the product strip section
    const context = lines.slice(Math.max(0,i-3), Math.min(lines.length, i+3)).join(' ');
    if (context.includes('Product Showcase') || context.includes('Circular Gallery')) {
      lines[i] = lines[i].replace(
        /<div style=\{\{ width:'100%', padding:'0 40px', marginTop:40 \}\}>/,
        '<div className="fe-strip-section">'
      );
      console.log('Replaced product strip section');
    }
    break;
  }
}

// Step 15: Replace product strip badge
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'rgba(255,215,0,0.08)'") && lines[i].includes("fontSize:10") && lines[i].includes("fontWeight:700")) {
    const context = lines.slice(Math.max(0,i-3), Math.min(lines.length, i+3)).join(' ');
    if (context.includes('fan_product_family')) {
      lines[i] = lines[i].replace(
        /<div style=\{\{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:20, background:'rgba\(255,215,0,0\.08\)', border:'1px solid rgba\(255,215,0,0\.15\)', fontSize:10, fontWeight:700, letterSpacing:2, color:'#FFD700', textTransform:'uppercase', marginBottom:12 \}\}>/,
        '<div className="fe-strip-badge">'
      );
      console.log('Replaced strip badge');
      break;
    }
  }
}

// Step 16: Replace gradient title span
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("background:'linear-gradient(135deg,#fff,#FFD700 60%,#F5A623)'")) {
    lines[i] = lines[i].replace(
      /<span style=\{\{ background:'linear-gradient\(135deg,#fff,#FFDWall time: 60%,#F5A623\)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' \}\}>/,
      '<span className="fe-text-title-grad">'
    );
    console.log('Replaced gradient title span');
    break;
  }
}

// Step 17: Replace strip viewport
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("height:360") && lines[i].includes("position:'relative'")) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ width:'100%', height:360, position:'relative' \}\}>/,
      '<div className="fe-strip-viewport">'
    );
    console.log('Replaced strip viewport');
    break;
  }
}

// Step 18: Replace product cards
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('key={p.n}') && lines[i].includes('width:140') && lines[i].includes('cursor:"pointer"')) {
    lines[i] = lines[i].replace(
      /<div\s+key=\{p\.n\}\s+style=\{[\s\S]*?\}\s+/,
      '<div key={p.n} className="fe-prod-card" '
    );
    console.log('Replaced product card at line', i);
    break;
  }
}

// Step 19: Replace product image wraps
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('width:"100%"') && lines[i].includes('height:100') && lines[i].includes('"flex"')) {
    const context = lines.slice(Math.max(0,i-2), Math.min(lines.length, i+3)).join(' ');
    if (context.includes('objectFit') || context.includes('img src')) {
      lines[i] = lines[i].replace(
        /<div style=\{\{ width:"100%", height:100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba\(0,0,0,0\.3\)", borderRadius:"8px 8px 0 0" \}\}>/,
        '<div className="fe-prod-img-wrap">'
      );
      console.log('Replaced product img wrap');
      break;
    }
  }
}

// Step 20: Replace product info
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('padding:"6px 10px"')) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ padding:"6px 10px" \}\}>/,
      '<div className="fe-prod-info">'
    );
    console.log('Replaced product info');
    break;
  }
}

// Step 21: Replace product name
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fontSize:10') && lines[i].includes('fontWeight:700') && lines[i].includes('color:"#e5e5e5"')) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ fontSize:10, fontWeight:700, color:"#e5e5e5", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" \}\}>/,
      '<div className="fe-prod-name">'
    );
    console.log('Replaced product name');
    break;
  }
}

// Step 22: Replace product series
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fontSize:8') && lines[i].includes('"rgba(255,255,255,0.3)"')) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ fontSize:8, color:"rgba\(255,255,255,0\.3\)", marginTop:1 \}\}>/,
      '<div className="fe-prod-series">'
    );
    console.log('Replaced product series');
    break;
  }
}

// Step 23: Replace modal elements
for (let i = 0; i < lines.length; i++) {
  // Modal overlay
  if (lines[i].includes("position:'fixed'") && lines[i].includes("top:0, left:0") && lines[i].includes("zIndex:200") && lines[i].includes("rgba(0,0,0,0.7)")) {
    // This spans multiple lines, find the closing tag
    let j = i;
    while (j < lines.length && !lines[j].includes('}>')) j++;
    lines[i] = '<div onClick={() => setModalOpen(false)} className="fe-modal-overlay">';
    lines.splice(i+1, j-i-1);
    console.log('Replaced modal overlay');
    break;
  }
}

for (let i = 0; i < lines.length; i++) {
  // Modal card
  if (lines[i].includes("'rgba(20,20,30,0.95)'") && lines[i].includes("borderRadius:24")) {
    lines[i] = lines[i].replace(
      /<div onClick=\{e => e\.stopPropagation\(\)\} style=\{[\s\S]*?\}>/,
      '<div onClick={e => e.stopPropagation()} className="fe-modal-card">'
    );
    console.log('Replaced modal card');
    break;
  }
}

for (let i = 0; i < lines.length; i++) {
  // Modal close button
  if (lines[i].includes("position:'absolute'") && lines[i].includes("top:14, right:14")) {
    lines[i] = lines[i].replace(
      /<button onClick=\{\(\) => setModalOpen\(false\)\} style=\{[\s\S]*?\}>/,
      '<button onClick={() => setModalOpen(false)} className="fe-modal-close">'
    );
    console.log('Replaced modal close');
    break;
  }
}

for (let i = 0; i < lines.length; i++) {
  // Modal img area
  if (lines[i].includes("height:200") && lines[i].includes("display:'flex'") && lines[i].includes("marginBottom:20")) {
    lines[i] = lines[i].replace(
      /<div style=\{\{ width:'100%', height:200, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 \}\}>/,
      '<div className="fe-modal-img-area">'
    );
    console.log('Replaced modal img area');
    break;
  }
}

for (let i = 0; i < lines.length; i++) {
  // Modal img
  if (lines[i].includes('maxWidth:\'90%\'') && lines[i].includes('maxHeight:\'100%\'') && lines[i].includes('drop-shadow')) {
    lines[i] = '              <img src={modalProduct.product.i} alt="" className="fe-modal-img" />';
    console.log('Replaced modal img');
    break;
  }
}

// Step 24: Replace footer text
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("color:'rgba(255,255,255,0.12)'") && lines[i].includes("fontSize:11")) {
    lines[i] = lines[i].replace(/<p style=\{\{[\s\S]*?\}\}>/, '<p className="fe-footer-text">');
    console.log('Replaced footer text');
    break;
  }
}

// Write back
content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('\\nFile written successfully!');
console.log('New line count:', lines.length);
