import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

text = text.replace("addonRect.sendToBack();", "(addonRect as any).sendToBack();")

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Fixed TS")
