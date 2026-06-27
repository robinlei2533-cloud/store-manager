const fs = require('fs');
const file = 'C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fan-entry/FanEntryPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove legacy language state variables
content = content.replace(/, setLangDropdownOpen/g, '');
content = content.replace(/,\s*setCurrentLang\s*=\s*useState\('[^']*'\)/g, '');
content = content.replace(/const \[currentLang, setCurrentLang\] = useState\('[^']*'\);\s*\n/g, '');

// 2. Replace old language button section with LanguageSwitcher
const oldLangDiv =           {/* Language */}
          <div style={{ position:'relative' }}>
            <button
              onClick={() => { setLangDropdownOpen(!langDropdownOpen); if(settingsOpen) setSettingsOpen(false); }}
              style={{
                width:38, height:38, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)',
                fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                letterSpacing: '0.5px', transition:'all .3s',
              }}
            >{currentLang}</button>
            {langDropdownOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:160,
                background:'rgba(20,20,30,0.95)', WebkitBackdropFilter:'blur(20px)', backdropFilter:'blur(20px)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:6, zIndex:100,
                boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
              }}>
                {[
                  { lang: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
                  { lang: 'zh', label: '\u4E2D\u6587', flag: '\u{1F1E8}\u{1F1F3}' },
                  { lang: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', flag: '\u{1F1F8}\u{1F1E6}' },
                ].map(item => (
                  <div key={item.lang} onClick={() => { setCurrentLang(item.flag + ' ' + item.label.split(' ').pop()); setLangDropdownOpen(false); }}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer' }}
                    onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.target.style.background='transparent'}>
                    <span>{item.flag}</span> {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>;

const found = content.includes(oldLangDiv);
if (found) {
  content = content.replace(oldLangDiv, '          <LanguageSwitcher position="relative" top="0" right="0" />');
  console.log('Language section replaced successfully');
} else {
  console.log('Could not find exact language section - trying exact match fallback');
  // Try to find it by looking for the {/* Language */} comment
  const idx = content.indexOf('{/* Language */}');
  if (idx >= 0) {
    console.log('Found language comment at position', idx);
    // Find the closing of the outer div
    const after = content.substring(idx);
    // Find pattern: after the language items array and closing divs
    // </div>
    //             )}
    //           </div>
    let pos = idx;
    // Find the end of this language section
    const endMarker = '            )}';
    let lastEndPos = after.lastIndexOf(endMarker);
    if (lastEndPos > 0) {
      // Go past this to include the outer div closing
      let closeDivPos = after.indexOf('</div>', lastEndPos);
      if (closeDivPos > 0) {
        const toRemove = after.substring(0, closeDivPos + 6);
        content = content.replace(toRemove, '          <LanguageSwitcher position="relative" top="0" right="0" />');
        console.log('Fallback replacement done');
      }
    }
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done');
