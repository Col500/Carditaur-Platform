import re
with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Fix undo
undo_code = """  const undo = async () => {
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

# Fix redo
redo_code = """  const redo = async () => {
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

text = re.sub(r'const undo = \(\) => \{[\s\S]*?\}\);\s*\};', undo_code, text)
text = re.sub(r'const redo = \(\) => \{[\s\S]*?\}\);\s*\};', redo_code, text)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
