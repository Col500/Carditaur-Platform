import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_code = """       // Enable panning with alt+drag or middle mouse button
       c.on('mouse:down', function(opt) {
          var evt = opt.e;
          if (evt.altKey === true || evt.button === 1) {
             this.isDragging = true;
             this.selection = false;
             this.lastPosX = evt.clientX;
             this.lastPosY = evt.clientY;
          }
       });
       c.on('mouse:move', function(opt) {
          if (this.isDragging) {
             var e = opt.e;
             var vpt = this.viewportTransform;
             vpt[4] += e.clientX - this.lastPosX;
             vpt[5] += e.clientY - this.lastPosY;
             this.requestRenderAll();
             this.lastPosX = e.clientX;
             this.lastPosY = e.clientY;
          }
       });
       c.on('mouse:up', function(opt) {
          this.setViewportTransform(this.viewportTransform);
          this.isDragging = false;
          this.selection = true;
       });"""

new_code = """       // Enable panning with alt+drag or middle mouse button
       c.on('mouse:down', function(opt) {
          var evt = opt.e as any;
          if (evt.altKey === true || evt.button === 1) {
             (this as any).isDragging = true;
             (this as any).selection = false;
             (this as any).lastPosX = evt.clientX || (evt.touches ? evt.touches[0].clientX : 0);
             (this as any).lastPosY = evt.clientY || (evt.touches ? evt.touches[0].clientY : 0);
          }
       });
       c.on('mouse:move', function(opt) {
          if ((this as any).isDragging) {
             var e = opt.e as any;
             var vpt = this.viewportTransform;
             if (vpt) {
                 var cx = e.clientX || (e.touches ? e.touches[0].clientX : 0);
                 var cy = e.clientY || (e.touches ? e.touches[0].clientY : 0);
                 vpt[4] += cx - (this as any).lastPosX;
                 vpt[5] += cy - (this as any).lastPosY;
                 this.requestRenderAll();
                 (this as any).lastPosX = cx;
                 (this as any).lastPosY = cy;
             }
          }
       });
       c.on('mouse:up', function(opt) {
          if (this.viewportTransform) this.setViewportTransform(this.viewportTransform);
          (this as any).isDragging = false;
          (this as any).selection = true;
       });"""

text = text.replace(old_code, new_code)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Replaced types")
