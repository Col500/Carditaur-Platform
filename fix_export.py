import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_save = """  const saveFlyer = async () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const originalZoom = canvas.getZoom();
    canvas.setZoom(1);
    
    const bgImg = canvas.backgroundImage as fabric.Image;
    if (bgImg) {
      canvas.setDimensions({ width: bgImg.width!, height: bgImg.height! });
    }
    
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
    
    if (bgImg) {
      canvas.setDimensions({ width: bgImg.width! * originalZoom, height: bgImg.height! * originalZoom });
    }
    canvas.setZoom(originalZoom);
    canvas.renderAll();"""

new_save = """  const saveFlyer = async () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    
    // Hide trash icon guide if present
    const trash = canvas.getObjects().find((o: any) => o.id === 'trash-icon');
    if (trash) trash.visible = false;
    
    canvas.renderAll();
    const originalZoom = canvas.getZoom();
    canvas.setZoom(1);
    
    const bgImg = canvas.backgroundImage as fabric.Image;
    const baseScale = bgImg ? (bgImg.scaleX || 1) : 1;
    
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 / baseScale });
    
    if (trash) trash.visible = true;
    canvas.setZoom(originalZoom);
    canvas.renderAll();"""

text = text.replace(old_save, new_save)

old_download = """  const downloadFlyerImage = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const originalZoom = canvas.getZoom();
    canvas.setZoom(1);
    const bgImg = canvas.backgroundImage as fabric.Image;
    if (bgImg) {
      canvas.setDimensions({ width: bgImg.width!, height: bgImg.height! });
    }
    
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
    
    if (bgImg) {
      canvas.setDimensions({ width: bgImg.width! * originalZoom, height: bgImg.height! * originalZoom });
    }
    canvas.setZoom(originalZoom);
    canvas.renderAll();"""
    
new_download = """  const downloadFlyerImage = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    
    const trash = canvas.getObjects().find((o: any) => o.id === 'trash-icon');
    if (trash) trash.visible = false;
    
    canvas.renderAll();
    
    const originalZoom = canvas.getZoom();
    canvas.setZoom(1);
    
    const bgImg = canvas.backgroundImage as fabric.Image;
    const baseScale = bgImg ? (bgImg.scaleX || 1) : 1;
    
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 / baseScale });
    
    if (trash) trash.visible = true;
    canvas.setZoom(originalZoom);
    canvas.renderAll();"""

text = text.replace(old_download, new_download)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated export functions")
