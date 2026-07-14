import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

func = """  const applyAddon = (type: string, color: string, thicknessStr: number) => {
    if (!canvas) return;
    const bgImg = canvas.backgroundImage as fabric.Image;
    if (!bgImg) return;
    const scale = bgImg.scaleX || 1;
    const thickness = thicknessStr || 100;
    const thickScaled = thickness * scale;
    
    setAddonType(type as any);
    setAddonColor(color);
    setAddonThickness(thickness);
    
    const existing = canvas.getObjects().find((o: any) => o.isAddon);
    if (existing && (existing as any).addonType === type && (existing as any).addonThickness === thickness) {
        existing.set('fill', color);
        canvas.renderAll();
        saveHistory(canvas);
        return;
    }
    
    if (existing) {
        const extType = (existing as any).addonType;
        const extThick = (existing as any).addonThickness * scale;
        
        canvas.remove(existing);
        
        const shiftX = extType === 'left' ? -extThick : 0;
        const shiftY = extType === 'header' ? -extThick : 0;
        
        if (shiftX !== 0 || shiftY !== 0) {
            bgImg.set({ left: (bgImg.left || 0) + shiftX, top: (bgImg.top || 0) + shiftY });
            canvas.getObjects().forEach(obj => {
                obj.set({ left: (obj.left || 0) + shiftX, top: (obj.top || 0) + shiftY });
                obj.setCoords();
            });
        }
        
        if (extType === 'header' || extType === 'footer') {
            canvas.setDimensions({ width: canvas.width! - 0, height: canvas.height! - extThick });
        } else if (extType === 'left' || extType === 'right') {
            canvas.setDimensions({ width: canvas.width! - extThick, height: canvas.height! - 0 });
        }
    }
    
    if (type !== 'none') {
        const shiftX = type === 'left' ? thickScaled : 0;
        const shiftY = type === 'header' ? thickScaled : 0;
        
        if (type === 'header' || type === 'footer') {
            canvas.setDimensions({ width: canvas.width!, height: canvas.height! + thickScaled });
        } else if (type === 'left' || type === 'right') {
            canvas.setDimensions({ width: canvas.width! + thickScaled, height: canvas.height! });
        }
        
        if (shiftX !== 0 || shiftY !== 0) {
            bgImg.set({ left: (bgImg.left || 0) + shiftX, top: (bgImg.top || 0) + shiftY });
            canvas.getObjects().forEach(obj => {
                obj.set({ left: (obj.left || 0) + shiftX, top: (obj.top || 0) + shiftY });
                obj.setCoords();
            });
        }
        
        let rectLeft = 0; let rectTop = 0; let rectWidth = 0; let rectHeight = 0;
        if (type === 'header') {
            rectLeft = 0; rectTop = 0; rectWidth = canvas.width!; rectHeight = thickScaled;
        } else if (type === 'footer') {
            rectLeft = 0; rectTop = canvas.height! - thickScaled; rectWidth = canvas.width!; rectHeight = thickScaled;
        } else if (type === 'left') {
            rectLeft = 0; rectTop = 0; rectWidth = thickScaled; rectHeight = canvas.height!;
        } else if (type === 'right') {
            rectLeft = canvas.width! - thickScaled; rectTop = 0; rectWidth = thickScaled; rectHeight = canvas.height!;
        }
        
        const addonRect = new fabric.Rect({
            left: rectLeft, top: rectTop, width: rectWidth, height: rectHeight,
            fill: color, selectable: false, evented: false,
            id: '360-addon'
        } as any);
        (addonRect as any).isAddon = true;
        (addonRect as any).addonType = type;
        (addonRect as any).addonThickness = thickness;
        canvas.add(addonRect);
        addonRect.sendToBack();
    }
    
    canvas.renderAll();
    saveHistory(canvas);
  };
"""

# Insert before changeColor
text = text.replace("  const changeColor = (color: string) => {", func + "\n  const changeColor = (color: string) => {")

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Added applyAddon")
