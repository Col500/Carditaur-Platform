import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

text = text.replace('hide-scrollbar no-scrollbar scroll-smooth', 'overflow-x-auto scroll-smooth')
text = text.replace('overflow-x-auto h-full px-4 gap-4 sm:gap-6 max-w-4xl w-full hide-scrollbar', 'overflow-x-auto h-full px-4 gap-4 sm:gap-6 max-w-4xl w-full')
text = text.replace('overflow-x-auto h-full px-4 gap-4 sm:gap-8 max-w-4xl w-full hide-scrollbar', 'overflow-x-auto h-full px-4 gap-4 sm:gap-8 max-w-4xl w-full')


with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Replaced scrollbar")
