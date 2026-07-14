import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Replace undoStack and redoStack
text = text.replace("const undoStack = useRef<string[]>([]);", "const undoStack = useRef<any[]>([]);")
text = text.replace("const redoStack = useRef<string[]>([]);", "const redoStack = useRef<any[]>([]);")

# Fix saveHistory
old_saveHistory = """  const saveHistory = (c: fabric.Canvas) => {
    if (isHistoryUpdate.current || !c) return;
    const json = JSON.stringify((c as any).toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'borderColor']));
    undoStack.current.push(json);
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(false);
  };"""

new_saveHistory = """  const saveHistory = (c: fabric.Canvas) => {
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
text = text.replace(old_saveHistory, new_saveHistory)

# Fix undo
old_undo = """    const undo = async () => {
    if (!canvas || undoStack.current.length <= 1) return;
    isHistoryUpdate.current = true;
    const currentJson = undoStack.current.pop()!;
    redoStack.current.push(currentJson);
    const previousJson = undoStack.current[undoStack.current.length - 1];
    
    const bg = canvas.backgroundImage;
    try {
        await canvas.loadFromJSON(previousJson);
        canvas.backgroundImage = bg;
        canvas.renderAll();
        setCanUndo(undoStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    } catch (e) {
        console.error(e);
    } finally {
        isHistoryUpdate.current = false;
    }
  };"""

new_undo = """    const undo = async () => {
    if (!canvas || undoStack.current.length <= 1) return;
    isHistoryUpdate.current = true;
    const current = undoStack.current.pop()!;
    redoStack.current.push(current);
    const prev = undoStack.current[undoStack.current.length - 1];
    
    const bg = canvas.backgroundImage as fabric.Image;
    try {
        await canvas.loadFromJSON(prev.json);
        if (bg) {
            bg.set({ left: prev.bgLeft, top: prev.bgTop });
            canvas.backgroundImage = bg;
        }
        canvas.setDimensions({ width: prev.width, height: prev.height });
        canvas.renderAll();
        setCanUndo(undoStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    } catch (e) {
        console.error(e);
    } finally {
        isHistoryUpdate.current = false;
    }
  };"""
text = text.replace(old_undo, new_undo)

# Fix redo
old_redo = """    const redo = async () => {
    if (!canvas || redoStack.current.length === 0) return;
    isHistoryUpdate.current = true;
    const nextJson = redoStack.current.pop()!;
    undoStack.current.push(nextJson);
    
    const bg = canvas.backgroundImage;
    try {
        await canvas.loadFromJSON(nextJson);
        canvas.backgroundImage = bg;
        canvas.renderAll();
        setCanUndo(undoStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    } catch (e) {
        console.error(e);
    } finally {
        isHistoryUpdate.current = false;
    }
  };"""

new_redo = """    const redo = async () => {
    if (!canvas || redoStack.current.length === 0) return;
    isHistoryUpdate.current = true;
    const next = redoStack.current.pop()!;
    undoStack.current.push(next);
    
    const bg = canvas.backgroundImage as fabric.Image;
    try {
        await canvas.loadFromJSON(next.json);
        if (bg) {
            bg.set({ left: next.bgLeft, top: next.bgTop });
            canvas.backgroundImage = bg;
        }
        canvas.setDimensions({ width: next.width, height: next.height });
        canvas.renderAll();
        setCanUndo(undoStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    } catch (e) {
        console.error(e);
    } finally {
        isHistoryUpdate.current = false;
    }
  };"""
text = text.replace(old_redo, new_redo)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated history functions")
