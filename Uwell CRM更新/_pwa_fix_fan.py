import re, sys

# ===== fan-app.html =====
with open('fan-app.html', 'r', encoding='utf-8') as f:
    html = f.read()

style_match = re.search(r'<style>.*?</style>', html, re.DOTALL)
if style_match:
    html = html[:style_match.start()] + '    <link rel="stylesheet" href="/src/styles/design-system.css">\n' + html[style_match.end():]

html = html.replace(
    '<meta name="apple-mobile-web-app-capable" content="yes" />',
    '<meta name="apple-mobile-web-app-capable" content="yes" />\n    <link rel="manifest" href="/manifest.json">\n    <link rel="apple-touch-icon" href="/images/icon-192.png">'
)

html = html.replace('</body>', '  <script>\nif (\x27serviceWorker\x27 in navigator) {\n  window.addEventListener(\x27load\x27, () => {\n    navigator.serviceWorker.register(\x27/sw.js\x27).catch(() => {});\n  });\n}\n</script>\n</body>')

with open('fan-app.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('fan-app.html done')

with open('fan-app.html', 'r', encoding='utf-8') as f:
    h = f.read()
assert 'design-system.css' in h
assert 'manifest.json' in h
assert 'apple-touch-icon' in h
assert 'serviceWorker' in h
print('fan-app.html verified')
