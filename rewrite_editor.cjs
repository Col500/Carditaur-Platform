const fs = require('fs');

let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

// We need to replace the entire FlyerEditor component.
const flyerEditorStart = code.indexOf('function FlyerEditor(');

const beforeEditor = code.substring(0, flyerEditorStart);

const newEditor = `
import { 
  LucideType, 
  LucideImage, 
  LucideDownload, 
  LucideUpload, 
  LucideUndo2, 
  LucideRedo2, 
  LucideCheckCircle2, 
  LucideArrowLeft,
  LucideTrash2,
  LucideType as TypeIcon
} from 'lucide-react';

function FlyerEditor({ flyer, onClose, onSaved }: { flyer: any, onClose: () => void, onSaved: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObj, setActiveObj] = useState<fabric.Object | null>(null);
  
  const [business, setBusiness] = useState<any>(null);
  const [logoMode, setLogoMode] = useState<'transparent' | 'block'>('transparent');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');
  
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isHistoryUpdate = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
     fetch(\`/api/businesses/\${flyer.businessId}\`)
       .then(r => r.json())
       .then(data => setBusiness(data))
       .catch(console.error);
  }, [flyer.businessId]);

  const saveHistory = (c: fabric.Canvas) => {
    if (isHistoryUpdate.current || !c) return;
    const json = JSON.stringify(c.toJSON(['id']));
    undoStack.current.push(json);
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(false);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    let c: fabric.Canvas;
    
    const initCanvas = async () => {
       if (!canvasRef.current || !containerRef.current) return;
       const containerWidth = containerRef.current.clientWidth;
       const containerHeight = containerRef.current.clientHeight;
       
       c = new fabric.Canvas(canvasRef.current, {
          backgroundColor: '#f3f4f6',
          preserveObjectStacking: true
       });
       setCanvas(c);
       
       c.on('selection:created', (e) => setActiveObj(e.selected[0]));
       c.on('selection:updated', (e) => setActiveObj(e.selected[0]));
       c.on('selection:cleared', () => setActiveObj(null));

       try {
           const res = await fetch(flyer.imageUrl);
           if (!res.ok) throw new Error("Failed to fetch image");
           const blob = await res.blob();
           const objectURL = URL.createObjectURL(blob);
           const img = await fabric.FabricImage.fromURL(objectURL);
           
           // Auto-scale to fit container on mobile
           const scaleX = (containerWidth - 32) / img.width!;
           const scaleY = (containerHeight - 32) / img.height!;
           let scale = Math.min(scaleX, scaleY);
           if (scale > 1) scale = 1; 

           c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
           c.setZoom(scale);
           
           img.set({
               originX: 'left',
               originY: 'top',
               selectable: false,
               evented: false
           });
           
           c.backgroundImage = img;
           c.renderAll();
           
           // Initialize history with base state
           undoStack.current = [JSON.stringify(c.toJSON(['id']))];
           redoStack.current = [];
           setCanUndo(false);
           setCanRedo(false);
           
           c.on('object:added', () => saveHistory(c));
           c.on('object:modified', () => saveHistory(c));
           c.on('object:removed', () => saveHistory(c));

       } catch (err) {
           console.error("Failed to load background image", err);
       }
    };
    
    const timerId = setTimeout(initCanvas, 100);
    
    return () => {
       clearTimeout(timerId);
       if (c) c.dispose();
       if (canvasRef.current) {
          canvasRef.current.removeAttribute('data-fabric');
       }
    }
  }, []);

  const undo = () => {
    if (!canvas || undoStack.current.length <= 1) return;
    isHistoryUpdate.current = true;
    
    // Pop current state and put in redo
    const currentJson = undoStack.current.pop()!;
    redoStack.current.push(currentJson);
    
    // Get previous state (don't pop it, it stays as current)
    const previousJson = undoStack.current[undoStack.current.length - 1];
    canvas.loadFromJSON(previousJson, () => {
      canvas.renderAll();
      isHistoryUpdate.current = false;
      setCanUndo(undoStack.current.length > 1);
      setCanRedo(redoStack.current.length > 0);
    });
  };

  const redo = () => {
    if (!canvas || redoStack.current.length === 0) return;
    isHistoryUpdate.current = true;
    
    // Pop from redo and push to undo
    const nextJson = redoStack.current.pop()!;
    undoStack.current.push(nextJson);
    
    canvas.loadFromJSON(nextJson, () => {
      canvas.renderAll();
      isHistoryUpdate.current = false;
      setCanUndo(undoStack.current.length > 1);
      setCanRedo(redoStack.current.length > 0);
    });
  };

  const addText = (text: string, label: string, typography?: any) => {
    let fontFamily = 'Fredoka';
    let fill = '#ffffff';

    if (typography) {
        if (label === 'Headline') {
            fontFamily = typography.headlineFont || fontFamily;
            fill = typography.headlineColor || fill;
        } else {
            fontFamily = typography.bodyFont || fontFamily;
            fill = typography.bodyColor || fill;
        }
    }

    if (!canvas) return;
    const actualText = text || \`[Empty \${label}]\`;

    const t = new fabric.Textbox(actualText, {
      left: (canvas.width! / canvas.getZoom()) / 2,
      top: (canvas.height! / canvas.getZoom()) / 2,
      width: Math.min(600, (canvas.width! / canvas.getZoom()) * 0.8),
      originX: 'center',
      originY: 'center',
      fontFamily: fontFamily,
      fontSize: label === 'Headline' ? 64 : 36,
      fill: fill,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.6)',
        blur: 10,
        offsetX: 2,
        offsetY: 2
      }),
      textAlign: 'center'
    });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
  };

  const addBusinessLogo = async () => {
     if (!canvas || !business || !business.logoUrl) {
         alert("No business logo found in profile.");
         return;
     }
     try {
       const res = await fetch(business.logoUrl);
       if (!res.ok) throw new Error("Failed to fetch image");
       const blob = await res.blob();
       const objectURL = URL.createObjectURL(blob);
       const img = await fabric.FabricImage.fromURL(objectURL);
       img.scaleToWidth(200);
       img.set({ originX: 'center', originY: 'center' });
       
       let objToAdd: fabric.Object = img;
       
       if (logoMode === 'block') {
          const padding = 40;
          const rect = new fabric.Rect({
             width: img.getScaledWidth() + padding,
             height: img.getScaledHeight() + padding,
             fill: logoBgColor,
             rx: 15,
             ry: 15,
             originX: 'center',
             originY: 'center'
          });
          objToAdd = new fabric.Group([rect, img], {
             originX: 'center',
             originY: 'center'
          });
       }
       
       objToAdd.set({
          left: (canvas.width! / canvas.getZoom()) / 2,
          top: (canvas.height! / canvas.getZoom()) / 2 
        });
       
       canvas.add(objToAdd);
       canvas.setActiveObject(objToAdd);
       canvas.renderAll();
     } catch (e) {
       console.error("Failed to add business logo", e);
       alert("Failed to load business logo.");
     }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await fabric.FabricImage.fromURL(data);
      img.scaleToWidth(200);
      img.set({
          left: (canvas.width! / canvas.getZoom()) / 2,
          top: (canvas.height! / canvas.getZoom()) / 2,
         originX: 'center',
         originY: 'center'
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadAndReupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await fabric.FabricImage.fromURL(data);
      const scaleX = (canvas.width! / canvas.getZoom()) / img.width!;
      const scaleY = (canvas.height! / canvas.getZoom()) / img.height!;
      const scale = Math.min(scaleX, scaleY);
      img.set({ scaleX: scale, scaleY: scale });
      canvas.backgroundImage = img;
      canvas.clear(); 
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
  };

  const saveFlyer = async () => {
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
    canvas.renderAll();
    
    try {
      await fetch(\`/api/admin/flyers/\${flyer.businessId}/\${flyer.id}/image\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl })
      });
      await fetch(\`/api/admin/flyers/\${flyer.businessId}/\${flyer.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      alert('Saved and approved successfully!');
      onSaved();
      onClose();
    } catch (e) {
      alert('Failed to save.');
    }
  };
  
  const downloadFlyerImage = () => {
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
    canvas.renderAll();
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = \`flyer_\${flyer.id}.png\`;
    a.click();
  };

  const changeColor = (color: string) => {
     if (!activeObj || !canvas) return;
     if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
        activeObj.set('fill', color);
     }
     canvas.renderAll();
     saveHistory(canvas);
  };
  
  const changeFont = (fontFamily: string) => {
     if (!activeObj || !canvas) return;
     if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
        activeObj.set('fontFamily', fontFamily);
     }
     canvas.renderAll();
     saveHistory(canvas);
  };

  const changeShadow = (hasShadow: boolean) => {
     if (!activeObj || !canvas) return;
     if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
        if (hasShadow) {
           activeObj.set('shadow', new fabric.Shadow({
             color: 'rgba(0,0,0,0.8)',
             blur: 10,
             offsetX: 2,
             offsetY: 2
           }));
        } else {
           activeObj.set('shadow', null);
        }
     }
     canvas.renderAll();
     saveHistory(canvas);
  };

  return (
    <div className="flex flex-col h-full bg-[#E5E7EB] overflow-hidden relative">
      
      {/* Top Floating Action Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-50 pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto bg-white/90 backdrop-blur-md p-2.5 sm:p-3 rounded-full shadow-lg text-gray-700 hover:text-black hover:scale-105 transition-all">
             <LucideArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-lg">
             <button onClick={undo} disabled={!canUndo} className={\`p-1.5 sm:p-2 rounded-full transition-colors \${canUndo ? 'text-charcoal hover:bg-gray-200' : 'text-gray-300'}\`}>
                <LucideUndo2 className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <button onClick={redo} disabled={!canRedo} className={\`p-1.5 sm:p-2 rounded-full transition-colors \${canRedo ? 'text-charcoal hover:bg-gray-200' : 'text-gray-300'}\`}>
                <LucideRedo2 className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <div className="w-px h-5 sm:h-6 bg-gray-300 mx-1 sm:mx-2"></div>
             <button onClick={downloadFlyerImage} className="p-1.5 sm:p-2 rounded-full text-charcoal hover:bg-gray-200 transition-colors">
                <LucideDownload className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <button onClick={saveFlyer} className="ml-1 sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1E824C] hover:bg-[#186b3e] text-white text-[10px] sm:text-xs font-bold rounded-full shadow transition-colors flex items-center gap-1 sm:gap-2">
                <LucideCheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Publish</span>
             </button>
          </div>
      </div>

      {/* Canvas Wrapper */}
      <div ref={containerRef} className="flex-1 w-full h-full bg-zinc-800 overflow-auto flex items-center justify-center p-4 sm:p-8 pt-24 sm:pt-28 pb-32 sm:pb-36 z-0">
          <div className="w-max shadow-2xl ring-1 ring-white/10" style={{ backgroundColor: '#f3f4f6' }}>
             <canvas ref={canvasRef}></canvas>
          </div>
      </div>

      {/* Active Selection Formatting Toolbar */}
      {activeObj && (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') && (
        <div className="absolute bottom-20 sm:bottom-24 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 flex items-center overflow-x-auto whitespace-nowrap gap-4 sm:gap-6 z-40 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
               <button onClick={() => changeColor('#ffffff')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
               <button onClick={() => changeColor('#000000')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
               <button onClick={() => changeColor('#1E824C')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1E824C] border border-[#1E824C] shadow-sm hover:scale-110 transition-transform"></button>
               <button onClick={() => changeColor('#E52B50')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#E52B50] border border-[#E52B50] shadow-sm hover:scale-110 transition-transform"></button>
               <button onClick={() => changeColor('#F5A623')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F5A623] border border-[#F5A623] shadow-sm hover:scale-110 transition-transform"></button>
            </div>
            
            <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
               <select
                  className="w-24 sm:w-32 text-[10px] sm:text-xs p-1.5 sm:p-2 border border-gray-200 rounded-lg text-charcoal outline-none focus:border-blue-400"
                  onChange={(e) => changeFont(e.target.value)}
                  value={(activeObj as any)?.fontFamily || 'Fredoka'}
               >
                 <option value="Fredoka">Fredoka</option>
                 <option value="Playfair Display">Playfair Display</option>
                 <option value="Outfit">Outfit</option>
                 <option value="Space Grotesk">Space Grotesk</option>
                 <option value="JetBrains Mono">JetBrains Mono</option>
                 <option value="Inter">Inter</option>
               </select>
            </div>
            
            <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
               <button onClick={() => changeShadow(!(activeObj as any).shadow)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] sm:text-xs font-bold transition-colors">
                  Toggle Shadow
               </button>
            </div>
            
            <div className="flex items-center shrink-0">
               <button onClick={() => {
                   if (canvas) {
                       canvas.remove(activeObj);
                       setActiveObj(null);
                       canvas.renderAll();
                       saveHistory(canvas);
                   }
               }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-1 sm:gap-2">
                  <LucideTrash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Delete
               </button>
            </div>
        </div>
      )}

      {/* Bottom Scrollable Navigation Toolbar */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 h-20 sm:h-24 shadow-2xl flex items-center justify-center">
          <div className="flex items-center overflow-x-auto h-full px-4 gap-4 sm:gap-8 max-w-4xl w-full hide-scrollbar no-scrollbar scroll-smooth">
             <button onClick={() => addText(flyer.headline, 'Headline', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <LucideType className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Headline</span>
             </button>
             <button onClick={() => addText(flyer.bodyMessage, 'Body', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Body Text</span>
             </button>
             <button onClick={() => addText(flyer.signOff, 'Sign-off', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <LucideType className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Sign-off</span>
             </button>
             
             <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>

             <button onClick={addBusinessLogo} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                    <LucideImage className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Profile Logo</span>
             </button>
             
             <label className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all cursor-pointer">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <LucideUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Custom<br/>Logo</span>
                <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
             </label>

             <label className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all cursor-pointer">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <LucideImage className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Custom<br/>Bg</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleDownloadAndReupload} />
             </label>
          </div>
      </div>

    </div>
  );
}
`;

const finalCode = beforeEditor + newEditor;
fs.writeFileSync('src/components/AdminFlyers.tsx', finalCode);
