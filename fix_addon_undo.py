import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# find setCanUndo(undoStack.current.length > 1); in undo
old_sync = """        setCanUndo(undoStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
    } catch (e) {"""

new_sync = """        setCanUndo(undoStack.current.length > 1);
        setCanRedo(redoStack.current.length > 0);
        
        const existing = canvas.getObjects().find((o: any) => o.isAddon);
        if (existing) {
            setAddonType((existing as any).addonType);
            setAddonColor((existing as any).fill);
            setAddonThickness((existing as any).addonThickness);
        } else {
            setAddonType('none');
        }
    } catch (e) {"""
    
text = text.replace(old_sync, new_sync)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated undo/redo sync")
