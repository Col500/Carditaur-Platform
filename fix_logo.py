import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_add = """       if (logoMode === 'block') {
          const padding = 40;
          const rect = new fabric.Rect({
             width: img.getScaledWidth() + padding,
             height: img.getScaledHeight() + padding,
             fill: logoBgColor,
             rx: 15,
             ry: 15,
             originX: 'center',
             originY: 'center'
          });
          objToAdd = new fabric.Group([rect, img], {
             originX: 'center',
             originY: 'center'
          });
       }"""

new_add = """       if (logoMode === 'block' || logoMode === 'translucent') {
          const padding = 40;
          const rect = new fabric.Rect({
             width: img.getScaledWidth() + padding,
             height: img.getScaledHeight() + padding,
             fill: logoBgColor,
             opacity: logoMode === 'translucent' ? 0.5 : 1,
             rx: 15,
             ry: 15,
             originX: 'center',
             originY: 'center'
          });
          objToAdd = new fabric.Group([rect, img], {
             originX: 'center',
             originY: 'center'
          });
       }
       objToAdd.set({ name: 'logo' });"""

text = text.replace(old_add, new_add)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated logo")
