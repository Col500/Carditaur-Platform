import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

state_adds = """  const [business, setBusiness] = useState<any>(null);
  const [logoMode, setLogoMode] = useState<'transparent' | 'block' | 'translucent'>('transparent');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');
  const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes'>('main');
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringTrash, setIsHoveringTrash] = useState(false);
  const undoStack = useRef<string[]>([]);"""

text = re.sub(r'  const \[business, setBusiness\] = useState<any>\(null\);\s*const \[logoMode, setLogoMode\] = useState<\'transparent\' \| \'block\' \| \'translucent\'>\(\'transparent\'\);\s*const \[logoBgColor, setLogoBgColor\] = useState<string>\(\'#ffffff\'\);\s*const \[activeToolMenu, setActiveToolMenu\] = useState<\'main\' \| \'text\' \| \'shapes\'>\(\'main\'\);\s*const undoStack = useRef<string\[\]>\(\[\]\);', state_adds, text)

# Add event listeners for dragging
canvas_events = """          canvas.on('object:modified', () => {
             saveHistory(canvas);
          });
          
          canvas.on('object:moving', (e) => {
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

text = re.sub(r"          canvas\.on\('object:modified', \(\) => \{\s*saveHistory\(canvas\);\s*\}\);", canvas_events, text)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated drag to delete logic")
