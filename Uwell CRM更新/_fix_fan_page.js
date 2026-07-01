const fs = require('fs');
const filePath = "C:\\Users\\陈木木的\\Documents\\Uwell CRM网站\\uwell-crm\\frontend\\src\\pages\\fan-entry\\FanEntryPage.jsx";

let content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Normalize all line endings to LF
content = content.replace(/\r\r\r\n/g, '\n').replace(/\r\n/g, '\n');

// Step 2: Remove the ShaderOverlay component definition
// Find the ShaderOverlay section and remove it
const shaderOverlayStart = '// ============ Shader/Raster Overlay ============\nconst ShaderOverlay = () => {';
const shaderOverlayEnd = '};';

let startIdx = content.indexOf(shaderOverlayStart);
if (startIdx === -1) {
  // Try without comment
  const altSearch = 'const ShaderOverlay = () => {';
  startIdx = content.indexOf(altSearch);
}

if (startIdx >= 0) {
  // Find the matching closing brace for this component
  // The ShaderOverlay is a simple useEffect with a canvas return
  // It ends with the first '};' after the return
  const afterStart = content.substring(startIdx);
  // Find 'return <canvas' pattern then find the next '};' after it
  const returnIdx = afterStart.indexOf('return ');
  if (returnIdx >= 0) {
    const afterReturn = afterStart.substring(returnIdx);
    // Find the }; that closes the component (after the return statement)
    // Look for '};' after the return
    let braceDepth = 0;
    let foundEnd = -1;
    let inJSX = false;
    for (let i = returnIdx; i < afterStart.length; i++) {
      if (afterStart[i] === '{') braceDepth++;
      else if (afterStart[i] === '}') {
        braceDepth--;
        if (braceDepth === 0 && i > returnIdx + 20) {
          // Need to find the next }; after the component
          const rest = afterStart.substring(i);
          const semiClose = rest.indexOf('};');
          if (semiClose >= 0) {
            foundEnd = i + semiClose + 2;
            break;
          }
        }
      }
    }
    if (foundEnd > 0) {
      const newContent = content.substring(0, startIdx) + '\n' + content.substring(startIdx + foundEnd);
      console.log('Removed ShaderOverlay component');
      content = newContent;
    } else {
      console.log('Could not find end of ShaderOverlay');
    }
  } else {
    console.log('Could not find return in ShaderOverlay');
  }
} else {
  console.log('ShaderOverlay not found');
}

// Step 3: Remove <ShaderOverlay /> from JSX
content = content.replace(/\n\s*<ShaderOverlay\s*\/>\s*\n/g, '\n');
console.log('Removed <ShaderOverlay /> references');

// Step 4: Fix GSAP targets - add the missing class names to elements
// Change gsap targets to use existing classes or add classes to elements
// Target: gsap.from('.fe-hero-title'... -> we'll add the fe-hero-title class to the h1
// Actually let's just change the GSAP targets to match existing classes

// Option: Replace GSAP useEffect with framer-motion approach
// Simpler: Just fix the target classes in the JSX
// Add class "fe-hero-title" to the motion.h1
content = content.replace(
  /<motion\.h1 initial=\{\{[^}]*\}\} animate=\{\{[^}]*\}\} transition=\{\{[^}]*\}\} style=\{[\s\S]*?fontStyle:"italic"\}\}>/,
  (match) => {
    return match.replace('style={{', 'className="fe-hero-title" style={{');
  }
);

// Add class "fe-hero-sub" to the subtitle paragraph
content = content.replace(
  /<p style=\{\{ color:'rgba\(255,255,255,0\.35\)', fontSize:15, lineHeight:1.7, marginBottom:28 \}\}>/,
  '<p className="fe-hero-sub" style={{ color:\'rgba(255,255,255,0.35)\', fontSize:15, lineHeight:1.7, marginBottom:28 }}>'
);

// Add class "fe-login-form" to the form card div (the fe-hero-right div)
// Actually the login form is inside the fe-hero-right div
// Let's add the class to the form card div
// The form card is: <div style={{ background:'rgba(255,255,255,0.04)', ...
content = content.replace(
  /<div style=\{\{ background:'rgba\(255,255,255,0\.04\)', WebkitBackdropFilter:'blur\(20px\)', backdropFilter:'blur\(20px\)', border:'1px solid rgba\(255,255,255,0\.08\)', borderRadius:24, padding:'40px 36px', boxShadow:'0 24px 80px rgba\(0,0,0,0\.5\)' \}\}>/,
  '<div className="fe-login-form fe-form-card" style={{ padding:\'40px 36px\' }}>'
);

console.log('Fixed GSAP targets - added class names');

// Step 5: Replace inline styles with CSS classes for outer structure

// Main wrapper: add fe-page class
content = content.replace(
  /<div style=\{\s*\n\s*fontFamily: "-apple-system[^}]*minHeight: '100vh', width: '100vw',[^}]*\},\s*\n\s*\}>/,
  '<div className="fe-page">'
);

// Background radial div: keep as is or use fe-bg-layer
// Let's keep the radial gradient inline since CSS var isn't set for it
// But we can make it simpler

// Main content div: replace with fe-content-area  
content = content.replace(
  /<div style=\{\{ position:'relative', zIndex:20, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'120px 40px 260px' \}\}>/,
  '<div className="fe-content-area" style={{ padding:\'120px 40px 260px\' }}>'
);

// Hero row: replace with fe-hero-row
content = content.replace(
  /<div style=\{\{ display:'flex', alignItems:'center', justifyContent:'center', gap:80, width:'100%', maxWidth:1100, minHeight:'80vh', padding:'60px 0 40px' \}\}>/,
  '<div className="fe-hero-row" style={{ minHeight:\'80vh\' }}>'
);

// Hero badge - already using className="fe-badge." No wait, it's using inline style. 
// Replace the inline badge with fe-badge class
content = content.replace(
  /<div style=\{\{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, background:'rgba\(255,215,0,0\.12\)', border:'1px solid rgba\(255,215,0,0\.25\)', fontSize:11, fontWeight:700, letterSpacing:2, color:'#FFD700', textTransform:'uppercase', marginBottom:20 \}\}>/,
  '<div className="fe-badge">'
);

// Form section: replace with fe-form-card
content = content.replace(
  '<div className="fe-login-form fe-form-card" style={{ padding:\'40px 36px\' }}>',
  '<div className="fe-login-form fe-form-card">'
);

// Form accent
content = content.replace(
  /<div style=\{\{ width:50, height:3, background:'linear-gradient\(90deg,#FFD700,#457bff\)', borderRadius:2, margin:'0 auto 18px' \}\} \/>/,
  '<div className="fe-form-accent" />'
);

// Form title wrapper
content = content.replace(
  /<div style=\{\{ textAlign:'center', marginBottom:24 \}\}>([\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>[\s\S]*?<p[^>]*>[\s\S]*?<\/p>[\s\S]*?)<\/div>/,
  (match) => {
    if (match.includes('fe-form-title')) return match;
    return match.replace('<div style={{ textAlign:\'center\', marginBottom:24 }}>', '<div className="fe-form-title">');
  }
);

// Input fields - replace with fe-input-dark
content = content.replace(
  /<input type="email" value=\{email\} onChange=\{e => setEmail\(e\.target\.value\)\} onKeyDown=\{handleKeyDown\}\s*placeholder=\{t\('fan_entry_placeholder_email'\)\} autoComplete="email"\s*style=\{\{ width:'100%', padding:'12px 16px', background:'rgba\(255,255,255,0\.05\)', border:'1px solid rgba\(255,255,255,0\.1\)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' \}\}\s*\/>/,
  '<input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}\n                  placeholder={t(\'fan_entry_placeholder_email\')} autoComplete="email"\n                  className="fe-input-dark" />'
);

content = content.replace(
  /<input type="password" value=\{password\} onChange=\{e => setPassword\(e\.target\.value\)\} onKeyDown=\{handleKeyDown\}\s*placeholder=\{t\('fan_entry_placeholder_password'\)\} autoComplete="current-password"\s*style=\{\{ width:'100%', padding:'12px 16px', background:'rgba\(255,255,255,0\.05\)', border:'1px solid rgba\(255,255,255,0\.1\)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' \}\}\s*\/>/,
  '<input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}\n                  placeholder={t(\'fan_entry_placeholder_password\')} autoComplete="current-password"\n                  className="fe-input-dark" />'
);

// Login button - replace with fe-btn-primary
content = content.replace(
  /<button onClick=\{handleLogin\} style=\{[\s\S]*?background:'linear-gradient\(135deg,#FFD700,#F5A623\)',[\s\S]*?color:'#14141e', fontSize:14, fontWeight:700, letterSpacing:2,[\s\S]*?cursor:'pointer', transition:'all \.3s', position:'relative', overflow:'hidden',[\s\S]*?\}><ClickSpark sparkColor="#FFD700" sparkSize=\{12\} sparkRadius=\{20\} sparkCount=\{12\}>/,
  '<button onClick={handleLogin} className="fe-btn-primary"><ClickSpark sparkColor="#FFD700" sparkSize={12} sparkRadius={20} sparkCount={12}>'
);

// Register button - same pattern but different content
content = content.replace(
  /<button onClick=\{handleRegister\} style=\{[\s\S]*?background:'linear-gradient\(135deg,#FFD700,#F5A623\)',[\s\S]*?color:'#14141e', fontSize:14, fontWeight:700, letterSpacing:2,[\s\S]*?cursor:'pointer', transition:'all \.3s', position:'relative', overflow:'hidden',[\s\S]*?\}>/,
  '<button onClick={handleRegister} className="fe-btn-primary">'
);

// Product strip section
content = content.replace(
  /<div style=\{\{ width:'100%', padding:'0 40px', marginTop:40 \}\}>/,
  '<div className="fe-strip-section">'
);

// Product strip badge
content = content.replace(
  /<div style=\{\{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:20, background:'rgba\(255,215,0,0\.08\)', border:'1px solid rgba\(255,215,0,0\.15\)', fontSize:10, fontWeight:700, letterSpacing:2, color:'#FFD700', textTransform:'uppercase', marginBottom:12 \}\}>/,
  '<div className="fe-strip-badge">'
);

// Product strip title with gradient
content = content.replace(
  /<span style=\{\{ background:'linear-gradient\(135deg,#fff,#FFD700 60%,#F5A623\)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' \}\}>/,
  '<span className="fe-text-title-grad">'
);

// Product strip viewport
content = content.replace(
  /<div style=\{\{ width:'100%', height:360, position:'relative' \}\}>/,
  '<div className="fe-strip-viewport">'
);

// Modal overlay  
content = content.replace(
  /<div onClick=\{\(\) => setModalOpen\(false\)\} style=\{[\s\S]*?position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:200,[\s\S]*?background:'rgba\(0,0,0,0\.7\)', WebkitBackdropFilter:'blur\(16px\)', backdropFilter:'blur\(16px\)',[\s\S]*?display:'flex', alignItems:'center', justifyContent:'center', padding:20,[\s\S]*?\}>/,
  '<div onClick={() => setModalOpen(false)} className="fe-modal-overlay">'
);

// Modal card
content = content.replace(
  /<div onClick=\{e => e\.stopPropagation\(\)\} style=\{[\s\S]*?background:'rgba\(20,20,30,0\.95\)', border:'1px solid rgba\(255,255,255,0\.08\)', borderRadius:24, padding:36,[\s\S]*?maxWidth:520, width:'100%', position:'relative',[\s\S]*?\}>/,
  '<div onClick={e => e.stopPropagation()} className="fe-modal-card">'
);

// Modal close button
content = content.replace(
  /<button onClick=\{\(\) => setModalOpen\(false\)\} style=\{[\s\S]*?position:'absolute', top:14, right:14, width:32, height:32, borderRadius:'50%', border:'none',[\s\S]*?background:'rgba\(255,255,255,0\.06\)', color:'rgba\(255,255,255,0\.4\)', fontSize:16, cursor:'pointer',[\s\S]*?\}>/,
  '<button onClick={() => setModalOpen(false)} className="fe-modal-close">'
);

// Product card in the scroll-strip
content = content.replace(
  /<div\s+key=\{p\.n\}\s+style=\{[\s\S]*?flex:"0 0 auto", width:140, cursor:"pointer",[\s\S]*?borderRadius:10, overflow:"hidden",[\s\S]*?background:"rgba\(255,255,255,0\.03\)",[\s\S]*?border:"1px solid rgba\(255,215,0,0\.1\)",[\s\S]*?transition:"all \.3s",[\s\S]*?\}\s+onMouseEnter=\{e => \{ e\.currentTarget\.style\.borderColor = p\.c; e\.currentTarget\.style\.transform = "translateY\(-4px\)"; \}\}\s+onMouseLeave=\{e => \{ e\.currentTarget\.style\.borderColor = "rgba\(255,215,0,0\.1\)"; e\.currentTarget\.style\.transform = "none"; \}\}\s*>/,
  '<div key={p.n} className="fe-prod-card"\n              onMouseEnter={e => { e.currentTarget.style.borderColor = p.c; e.currentTarget.style.transform = "translateY(-4px)"; }}\n              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,215,0,0.1)"; e.currentTarget.style.transform = "none"; }}>'
);

// Product image areas
content = content.replace(
  /<div style=\{\{ width:"100%", height:100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba\(0,0,0,0\.3\)", borderRadius:"8px 8px 0 0" \}\}>/,
  '<div className="fe-prod-img-wrap">'
);

// Product info area
content = content.replace(
  /<div style=\{\{ padding:"6px 10px" \}\}>/,
  '<div className="fe-prod-info">'
);

// Product name
content = content.replace(
  /<div style=\{\{ fontSize:10, fontWeight:700, color:"#e5e5e5", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" \}\}>/,
  '<div className="fe-prod-name">'
);

// Product series
content = content.replace(
  /<div style=\{\{ fontSize:8, color:"rgba\(255,255,255,0\.3\)", marginTop:1 \}\}>/,
  '<div className="fe-prod-series">'
);

// Footer
content = content.replace(
  /<p style=\{\{ color:'rgba\(255,255,255,0\.12\)', fontSize:11, letterSpacing:1 \}\}>/,
  '<p className="fe-footer-text">'
);

// Modal image area
content = content.replace(
  /<div style=\{\{ width:'100%', height:200, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 \}\}>/,
  '<div className="fe-modal-img-area">'
);

// Modal image
content = content.replace(
  /<img src=\{modalProduct\.product\.i\} alt="" style=\{\{ maxWidth:'90%', maxHeight:'100%', objectFit:'contain', filter:'drop-shadow\(0 12px 32px rgba\(0,0,0,0\.5\)\)' \}\} \/>/,
  '<img src={modalProduct.product.i} alt="" className="fe-modal-img" />'
);

// Modal name
content = content.replace(
  /<h2 style=\{[\s\S]*?fontSize:24, fontWeight:900, letterSpacing:1, marginBottom:4, color: modalProduct\.product\.c[\s\S]*?\}>/,
  (match) => '<h2 className="fe-modal-name" style={{ color: modalProduct.product.c }}>'
);

// Modal category
content = content.replace(
  /<div style=\{\{ fontSize:12, color:'rgba\(255,255,255,0\.25\)', letterSpacing:1, marginBottom:12 \}\}>/,
  '<div className="fe-modal-category">'
);

// Modal description
content = content.replace(
  /<div style=\{\{ color:'rgba\(255,255,255,0\.45\)', fontSize:13, lineHeight:1\.8, marginBottom:20 \}\}>/,
  '<div className="fe-modal-desc">'
);

// Modal specs grid
content = content.replace(
  /<div style=\{\{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 \}\}>/,
  '<div className="fe-modal-specs">'
);

// Modal spec item
content = content.replace(
  /<div key=\{i\} style=\{\{ background:'rgba\(255,255,255,0\.03\)', border:'1px solid rgba\(255,255,255,0\.04\)', borderRadius:10, padding:'10px 14px' \}\}>/,
  '<div key={i} className="fe-modal-spec-item">'
);

// Modal spec label
content = content.replace(
  /<div style=\{\{ fontSize:9, color:'rgba\(255,255,255,0\.25\)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 \}\}>/,
  '<div className="fe-modal-spec-label">'
);

// Modal spec value
content = content.replace(
  /<div style=\{\{ fontSize:13, fontWeight:600 \}\}>/,
  '<div className="fe-modal-spec-value">'
);

// Write back
fs.writeFileSync(filePath, content, 'utf-8');
console.log('File written successfully');
console.log('New size:', content.length);
