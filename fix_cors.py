import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    "const img = await fabric.FabricImage.fromURL(flyer.imageUrl, { crossOrigin: 'anonymous' });",
    "const img = await fabric.FabricImage.fromURL(flyer.imageUrl + '?t=' + Date.now(), { crossOrigin: 'anonymous' });"
)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Fixed CORS caching")
