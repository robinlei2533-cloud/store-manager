import re
with open('C:/Users/³ÂÄ¾Ä¾µÄ/Documents/Uwell CRMÍøÕ¾/uwell-crm/frontend/src/pages/fan-entry/FanEntryPage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    chinese = re.findall('[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+', line)
    if chinese and chr(116)+chr(40) not in line:
        print(f'Line {i}: {line.strip()[:120]}')
