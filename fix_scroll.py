import re
with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Make FlyerEditor fixed so it doesn't scroll the body
text = text.replace('<div className="sm:p-6 bg-white sm:rounded-2xl sm:shadow-xl h-full flex flex-col">', '<div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">')

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
