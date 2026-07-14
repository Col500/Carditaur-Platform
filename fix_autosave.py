import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

save_history_old = """  const saveHistory = (c: fabric.Canvas) => {
    if (isHistoryUpdate.current || !c) return;
    const json = JSON.stringify((c as any).toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'borderColor', 'isAddon', 'addonType']));
    undoStack.current.push({
        json,
        width: c.width,
        height: c.height,
        bgLeft: (c.backgroundImage as any)?.left || 0,
        bgTop: (c.backgroundImage as any)?.top || 0
    });
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(false);
  };"""

save_history_new = """  const saveHistory = (c: fabric.Canvas) => {
    if (isHistoryUpdate.current || !c) return;
    const json = JSON.stringify((c as any).toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'borderColor', 'isAddon', 'addonType']));
    undoStack.current.push({
        json,
        width: c.width,
        height: c.height,
        bgLeft: (c.backgroundImage as any)?.left || 0,
        bgTop: (c.backgroundImage as any)?.top || 0
    });
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(false);
    
    // Autosave to localStorage
    try {
        localStorage.setItem('coloh_flyer_backup_' + flyer.id, json);
    } catch (e) { console.error("Could not autosave to localstorage", e); }
  };"""

text = text.replace(save_history_old, save_history_new)

init_old = """       if (flyer.imageUrl) {
           try {
               const img = await fabric.FabricImage.fromURL(flyer.imageUrl + '?t=' + Date.now(), { crossOrigin: 'anonymous' });
               if (!isMounted) return;
               
               const scaleX = c.width! / img.width!;
               const scaleY = c.height! / img.height!;
               const scale = Math.min(scaleX, scaleY);
               
               c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
               
               img.scale(scale);
               
               img.set({
                   left: 0,
                   top: 0,
                   originX: 'left',
                   originY: 'top',
                   selectable: false,
                   evented: false
               });
               
               c.backgroundImage = img;
               
               c.renderAll();
               saveHistory(c);
           } catch (e) {
               console.error("Failed to load image", e);
           }
       }"""

init_new = """       if (flyer.imageUrl) {
           try {
               const img = await fabric.FabricImage.fromURL(flyer.imageUrl + '?t=' + Date.now(), { crossOrigin: 'anonymous' });
               if (!isMounted) return;
               
               const scaleX = c.width! / img.width!;
               const scaleY = c.height! / img.height!;
               const scale = Math.min(scaleX, scaleY);
               
               c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
               
               img.scale(scale);
               
               img.set({
                   left: 0,
                   top: 0,
                   originX: 'left',
                   originY: 'top',
                   selectable: false,
                   evented: false
               });
               
               c.backgroundImage = img;
               
               // Check if we have an autosaved state
               const cachedJson = localStorage.getItem('coloh_flyer_backup_' + flyer.id);
               if (cachedJson) {
                   await c.loadFromJSON(cachedJson);
               }
               
               c.renderAll();
               if (!cachedJson) saveHistory(c);
           } catch (e) {
               console.error("Failed to load image", e);
           }
       }"""

text = text.replace(init_old, init_new)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated autosave logic")
