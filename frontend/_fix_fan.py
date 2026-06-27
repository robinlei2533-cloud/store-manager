import re

with open('C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fans/FanCenterPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Remove DB init from render body
content = content.replace(
    '  // Ensure DB is initialized\n  if (localDb.needsInit()) { localDb.init(seedData); }',
    '  // DB init moved to useEffect below'
)

# Fix 2: Add useEffect after fallbacks, before handlePointsChange
content = content.replace(
    '  // Final fallback: use first seed fan',
    '  // Init DB in useEffect (not render body)\n  useEffect(() => {\n    if (localDb.needsInit()) { localDb.init(seedData); }\n  }, []);\n\n  // Final fallback: use first seed fan'
)

# Fix 3: resolvedFan -> currentFan (remnants from previous bad edit)
content = content.replace('if (!resolvedFan)', 'if (!currentFan)')
content = content.replace('{resolvedFan.points}', '{currentFan.points}')
content = content.replace('resolvedFan.level', 'currentFan.level')
content = content.replace('fan={resolvedFan}', 'fan={currentFan}')
# Restore original text for the empty state section
content = content.replace(
    'description={t("fan_no_profile")} />\n          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>{t(\'fan_back_home\')}</Button>',
    'description="No fan profile found. Please contact support." />\n          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>Back to Home</Button>'
)

with open('C:/Users/陈木木的/Documents/Uwell CRM网站/uwell-crm/frontend/src/pages/fans/FanCenterPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
