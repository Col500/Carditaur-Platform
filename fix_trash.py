import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_events = """          canvas.on('object:moving', (e) => {
              setIsDragging(true);
              if (e.target) {
                  const ptr = canvas.getPointer(e.e);
                  // Bottom left corner
                  if (ptr.x < 100 && ptr.y > (canvas.height || 0) - 100) {
                      setIsHoveringTrash(true);
                  } else {
                      setIsHoveringTrash(false);
                  }
              }
          });
          
          canvas.on('mouse:up', (e) => {
              setIsDragging(false);
              setIsHoveringTrash(false);
              if (e.target) {
                  const ptr = canvas.getPointer(e.e);
                  if (ptr.x < 100 && ptr.y > (canvas.height || 0) - 100) {
                      canvas.remove(e.target);
                      canvas.discardActiveObject();
                      canvas.renderAll();
                      saveHistory(canvas);
                  }
              }
          });"""

new_events = """          canvas.on('object:moving', (e) => {
              setIsDragging(true);
              if (e.target && e.e) {
                  const ev = e.e as MouseEvent | TouchEvent;
                  const clientX = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
                  const clientY = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
                  // Bottom left corner of the screen
                  if (clientX < 150 && clientY > window.innerHeight - 200) {
                      setIsHoveringTrash(true);
                  } else {
                      setIsHoveringTrash(false);
                  }
              }
          });
          
          canvas.on('mouse:up', (e) => {
              setIsDragging(false);
              setIsHoveringTrash(false);
              if (e.target && e.e) {
                  const ev = e.e as MouseEvent | TouchEvent;
                  const clientX = 'changedTouches' in ev ? ev.changedTouches[0].clientX : (ev as MouseEvent).clientX;
                  const clientY = 'changedTouches' in ev ? ev.changedTouches[0].clientY : (ev as MouseEvent).clientY;
                  if (clientX < 150 && clientY > window.innerHeight - 200) {
                      canvas.remove(e.target);
                      canvas.discardActiveObject();
                      canvas.renderAll();
                      saveHistory(canvas);
                  }
              }
          });"""

text = text.replace(old_events, new_events)

# Ensure the trash icon has z-index so it's above the bottom toolbar
text = text.replace("absolute bottom-4 left-4 w-16 h-16 rounded-full flex items-center justify-center transition-all", "fixed bottom-8 left-8 w-16 h-16 rounded-full flex items-center justify-center transition-all z-[100] shadow-2xl border-2 border-red-200")

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated trash detection and UI")
