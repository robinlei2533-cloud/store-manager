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

html = html.replace('</body>', '''  <script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
</script>
</body>''')

with open('fan-app.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('fan-app.html done')

# Verify
with open('fan-app.html', 'r', encoding='utf-8') as f:
    h = f.read()
assert 'design-system.css' in h, 'design-system.css missing'
assert 'manifest.json' in h, 'manifest.json missing'
assert 'apple-touch-icon' in h, 'apple-touch-icon missing'
assert \"serviceWorker\" in h, 'SW missing'
print('fan-app.html verified')
