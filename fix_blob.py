import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

blob_old = """               const img = await fabric.FabricImage.fromURL(flyer.imageUrl + '?t=' + Date.now(), { crossOrigin: 'anonymous' });"""

blob_new = """               const res = await fetch(flyer.imageUrl);
               const blob = await res.blob();
               const objectURL = URL.createObjectURL(blob);
               const img = await fabric.FabricImage.fromURL(objectURL);"""

text = text.replace(blob_old, blob_new)

# Also fix the grid image
grid_old = """                <img src={flyer.imageUrl} className="w-full h-full object-cover" alt="" crossOrigin="anonymous" />"""
grid_new = """                <img src={flyer.imageUrl} className="w-full h-full object-cover" alt="" />"""

text = text.replace(grid_old, grid_new)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated to use blob for fabric")
