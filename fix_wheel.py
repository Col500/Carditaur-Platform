import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_wheel = """       c.on('mouse:wheel', function(opt) {
          var delta = opt.e.deltaY;
          var zoom = c.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 5) zoom = 5;
          if (zoom < 0.1) zoom = 0.1;
          c.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
       });"""

new_wheel = """       c.on('mouse:wheel', function(opt) {
          var evt = opt.e;
          if (evt.ctrlKey) {
              var delta = evt.deltaY;
              var zoom = c.getZoom();
              zoom *= 0.999 ** delta;
              if (zoom > 5) zoom = 5;
              if (zoom < 0.1) zoom = 0.1;
              c.zoomToPoint(new fabric.Point(evt.offsetX, evt.offsetY), zoom);
              evt.preventDefault();
              evt.stopPropagation();
          } else {
              var vpt = c.viewportTransform;
              if (vpt) {
                  vpt[4] -= evt.deltaX;
                  vpt[5] -= evt.deltaY;
                  c.requestRenderAll();
              }
              evt.preventDefault();
              evt.stopPropagation();
          }
       });"""

text = text.replace(old_wheel, new_wheel)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Replaced wheel")
