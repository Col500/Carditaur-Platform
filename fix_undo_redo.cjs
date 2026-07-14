const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

// 1. Add refs for undo/redo
const refsToAdd = `  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isHistoryUpdate = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const saveHistory = () => {
    if (isHistoryUpdate.current || !canvas) return;
    const json = JSON.stringify(canvas.toJSON(['id']));
    undoStack.current.push(json);
    redoStack.current = []; // clear redo stack on new action
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(false);
  };

  const undo = () => {
    if (!canvas || undoStack.current.length === 0) return;
    isHistoryUpdate.current = true;
    const currentJson = JSON.stringify(canvas.toJSON(['id']));
    redoStack.current.push(currentJson);
    
    const previousJson = undoStack.current.pop()!;
    canvas.loadFromJSON(previousJson, () => {
      canvas.renderAll();
      isHistoryUpdate.current = false;
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(redoStack.current.length > 0);
    });
  };

  const redo = () => {
    if (!canvas || redoStack.current.length === 0) return;
    isHistoryUpdate.current = true;
    const currentJson = JSON.stringify(canvas.toJSON(['id']));
    undoStack.current.push(currentJson);
    
    const nextJson = redoStack.current.pop()!;
    canvas.loadFromJSON(nextJson, () => {
      canvas.renderAll();
      isHistoryUpdate.current = false;
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(redoStack.current.length > 0);
    });
  };
`;

code = code.replace(/const \[logoBgColor, setLogoBgColor\] = useState<string>\('#ffffff'\);/, "const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');\n" + refsToAdd);

// 2. Bind events in initCanvas
const bindEventsStr = `           c.backgroundImage = img;
           c.renderAll();
           
           // Initialize history
           undoStack.current = [];
           redoStack.current = [];
           setCanUndo(false);
           setCanRedo(false);
           
           c.on('object:added', saveHistory);
           c.on('object:modified', saveHistory);
           c.on('object:removed', saveHistory);`;

code = code.replace(/c\.backgroundImage = img;\s*c\.renderAll\(\);/, bindEventsStr);

// 3. Add UI for Undo/Redo optimized for PC and Mobile
const headerToolbar = `<div className="flex flex-wrap items-center gap-2">
           <div className="flex items-center space-x-1 mr-2 bg-gray-100 p-1 rounded-lg">
             <button onClick={undo} disabled={!canUndo} className={\`px-2 py-1 text-xs font-bold rounded-md transition-colors \${canUndo ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 cursor-not-allowed'}\`}>Undo</button>
             <button onClick={redo} disabled={!canRedo} className={\`px-2 py-1 text-xs font-bold rounded-md transition-colors \${canRedo ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 cursor-not-allowed'}\`}>Redo</button>
           </div>`;

code = code.replace(/<div className="flex flex-wrap items-center gap-2">/, headerToolbar);

// 4. Fix layout for overlapping issue
code = code.replace(/<div className="flex flex-col md:flex-row flex-1 overflow-hidden">/, '<div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0 relative z-0">');
code = code.replace(/<div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-r border-gray-200 p-5 overflow-y-auto space-y-8 shrink-0 h-\[30vh\] sm:h-\[40vh\] md:h-auto order-2 md:order-1">/, '<div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-r border-gray-200 p-5 overflow-y-auto space-y-8 shrink-0 h-[40vh] md:h-auto order-2 md:order-1 relative z-10 min-h-0">');
code = code.replace(/<div ref=\{containerRef\} className="flex-1 bg-zinc-800 overflow-auto p-4 sm:p-8 order-1 md:order-2">/, '<div ref={containerRef} className="flex-1 bg-zinc-800 overflow-auto p-4 sm:p-8 order-1 md:order-2 relative z-0 min-h-0 flex items-center justify-center">');

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
