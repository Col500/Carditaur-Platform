import re
with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()
text = re.sub(r'c\.setDimensions\(\{ width: (.*?) \}\);\s*c\.setDimensions\(\{ height: (.*?) \}\);', r'c.setDimensions({ width: \1, height: \2 });', text)
with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
