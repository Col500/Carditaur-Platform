const fs = require('fs');

let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

// 1. Add new icons
code = code.replace("import { \n  LucideType", "import { \n  LucideShapes,\n  LucideSparkles,\n  LucideType");

// 2. Add fonts array
const fontsArray = `
const FONTS = [
  "Fredoka", "Playfair Display", "Outfit", "Space Grotesk", "JetBrains Mono", "Inter",
  "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Oswald", "Raleway",
  "Merriweather", "Nunito", "Ubuntu", "Rubik", "Work Sans", "Quicksand", "Lora",
  "Bebas Neue", "Dancing Script", "Pacifico", "Caveat", "Righteous", "Permanent Marker",
  "Cinzel", "Abril Fatface", "Cormorant Garamond", "Alfa Slab One",
  "Anton", "Archivo Black", "Bungee", "Lobster", "Satisfy",
  "Teko", "Titan One", "Viga", "Yeseva One", "Vollkorn"
];
`;
code = code.replace("function FlyerEditor(", fontsArray + "\nfunction FlyerEditor(");

// 3. Add font loading in useEffect
const fontLoadEffect = `
  useEffect(() => {
    const link = document.createElement('link');
    link.href = \`https://fonts.googleapis.com/css2?family=\${FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap\`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); }
  }, []);
`;
code = code.replace("useEffect(() => {\n     fetch", fontLoadEffect + "\n  useEffect(() => {\n     fetch");

// 4. Update saveHistory and undo/redo to preserve background
const newHistoryLogic = `
  const saveHistory = (c: fabric.Canvas) => {
    if (isHistoryUpdate.current || !c) return;
    const json = JSON.stringify(c.toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'borderColor']));
    undoStack.current.push(json);
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(false);
  };

  const undo = () => {
    if (!canvas || undoStack.current.length <= 1) return;
    isHistoryUpdate.current = true;
    const currentJson = undoStack.current.pop()!;
    redoStack.current.push(currentJson);
    const previousJson = undoStack.current[undoStack.current.length - 1];
    
    const bg = canvas.backgroundImage;
    canvas.loadFromJSON(previousJson, () => {
      canvas.backgroundImage = bg;
      canvas.renderAll();
      isHistoryUpdate.current = false;
      setCanUndo(undoStack.current.length > 1);
      setCanRedo(redoStack.current.length > 0);
    });
  };

  const redo = () => {
    if (!canvas || redoStack.current.length === 0) return;
    isHistoryUpdate.current = true;
    const nextJson = redoStack.current.pop()!;
    undoStack.current.push(nextJson);
    
    const bg = canvas.backgroundImage;
    canvas.loadFromJSON(nextJson, () => {
      canvas.backgroundImage = bg;
      canvas.renderAll();
      isHistoryUpdate.current = false;
      setCanUndo(undoStack.current.length > 1);
      setCanRedo(redoStack.current.length > 0);
    });
  };
`;

// Regex replace saveHistory, undo, redo blocks
code = code.replace(/const saveHistory =[\s\S]*?const addText =/m, newHistoryLogic + "\n  const addText =");

// 5. Add guidelines to initCanvas
const guidelinesCode = `
           let guides: fabric.Line[] = [];
           const removeGuides = () => {
               guides.forEach(g => c.remove(g));
               guides = [];
           };
           
           c.on('object:moving', (e) => {
               const obj = e.target;
               if (!obj) return;
               
               removeGuides();
               
               const canvasWidth = c.width! / c.getZoom();
               const canvasHeight = c.height! / c.getZoom();
               const centerX = canvasWidth / 2;
               const centerY = canvasHeight / 2;
               const snapThreshold = 10;
               
               let snappedX = false;
               let snappedY = false;

               const drawGuide = (x1: number, y1: number, x2: number, y2: number) => {
                   const line = new fabric.Line([x1, y1, x2, y2], {
                       stroke: 'magenta', strokeWidth: 1, selectable: false, evented: false, strokeDashArray: [5, 5]
                   });
                   guides.push(line);
                   c.add(line);
               };

               if (Math.abs(obj.left! - centerX) < snapThreshold) {
                   obj.set({ left: centerX });
                   drawGuide(centerX, -1000, centerX, canvasHeight+1000);
                   snappedX = true;
               }
               if (Math.abs(obj.top! - centerY) < snapThreshold) {
                   obj.set({ top: centerY });
                   drawGuide(-1000, centerY, canvasWidth+1000, centerY);
                   snappedY = true;
               }

               const objects = c.getObjects().filter(o => o !== obj && o.type !== 'line' && o !== c.backgroundImage);
               for (const other of objects) {
                   if (!snappedX && Math.abs(obj.left! - other.left!) < snapThreshold) {
                       obj.set({ left: other.left! });
                       drawGuide(other.left!, -1000, other.left!, canvasHeight+1000);
                       snappedX = true;
                   }
                   if (!snappedY && Math.abs(obj.top! - other.top!) < snapThreshold) {
                       obj.set({ top: other.top! });
                       drawGuide(-1000, other.top!, canvasWidth+1000, other.top!);
                       snappedY = true;
                   }
               }
           });

           c.on('mouse:up', removeGuides);
`;
code = code.replace(/c\.on\('object:removed', \(\) => saveHistory\(c\)\);/, "c.on('object:removed', () => saveHistory(c));\n" + guidelinesCode);

// 6. Support shapes
const shapesCode = `
  const addShape = (type: string) => {
    if (!canvas) return;
    let shape;
    const center = { left: canvas.width! / canvas.getZoom() / 2, top: canvas.height! / canvas.getZoom() / 2 };
    
    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 50, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'rectangle') {
        shape = new fabric.Rect({ width: 100, height: 100, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'star') {
        const starPoints = [
            {x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57},
            {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57},
            {x: 2, y: 35}, {x: 39, y: 35}
        ];
        shape = new fabric.Polygon(starPoints, { fill: '#F5A623', originX: 'center', originY: 'center', ...center });
    } else if (type === 'glitter') {
        shape = new fabric.Textbox('✦', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#F5A623', fontFamily: 'Arial' });
    } else if (type === 'confetti') {
        shape = new fabric.Textbox('✺', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#E52B50', fontFamily: 'Arial' });
    }
    
    if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        saveHistory(canvas);
    }
  };
`;
code = code.replace(/const addBusinessLogo =/, shapesCode + "\n  const addBusinessLogo =");

// 7. Change changeColor to support shapes
const changeColorLogic = `
  const changeColor = (color: string) => {
     if (!activeObj || !canvas) return;
     if (['i-text', 'textbox', 'text', 'rect', 'circle', 'triangle', 'polygon', 'path'].includes(activeObj.type!)) {
        activeObj.set('fill', color);
     }
     canvas.renderAll();
     saveHistory(canvas);
  };
`;
code = code.replace(/const changeColor =[\s\S]*?const changeFont =/m, changeColorLogic + "\n  const changeFont =");

// 8. Add shapes UI and dynamic fonts list
const activeToolbarRegex = /\{activeObj && \([\s\S]*?\{!activeObj && \(/m;
const activeToolbarMatch = code.match(activeToolbarRegex);

if (activeToolbarMatch) {
  let activeToolbar = activeToolbarMatch[0];
  
  // Make the active toolbar replace the bottom toolbar entirely by modifying the condition
  // Actually, we already have `!activeObj` wrapping the bottom toolbar, so it naturally hides when activeObj is true.
  
  // Expand fonts in select
  const fontOptions = `
    {FONTS.map(f => (
      <option key={f} value={f}>{f}</option>
    ))}
  `;
  activeToolbar = activeToolbar.replace(/<option value="Fredoka">Fredoka<\/option>[\s\S]*?<option value="Inter">Inter<\/option>/, fontOptions);
  
  // Make sure to remove any leftover styling for background
  
  code = code.replace(activeToolbarMatch[0], activeToolbar);
}

// 9. Add Shapes menu to bottom toolbar
const bottomToolbarShapes = `
             <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
             
             <div className="flex items-center gap-2 px-2">
                 <button onClick={() => addShape('circle')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-charcoal"></div>
                 </button>
                 <button onClick={() => addShape('rectangle')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-charcoal"></div>
                 </button>
                 <button onClick={() => addShape('triangle')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-transparent border-b-charcoal"></div>
                 </button>
                 <button onClick={() => addShape('star')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-charcoal">
                    ★
                 </button>
                 <button onClick={() => addShape('glitter')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-charcoal">
                    <LucideSparkles className="w-4 h-4" />
                 </button>
             </div>
             
             <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
`;

code = code.replace(/<div className="w-px h-10 bg-gray-200 shrink-0 mx-1"><\/div>\s*<button onClick=\{addBusinessLogo\}/, bottomToolbarShapes + "\n             <button onClick={addBusinessLogo}");

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
