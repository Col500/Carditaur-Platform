import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';

export function AdminFlyers({ onClose }: { onClose?: () => void }) {
  const [flyers, setFlyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlyer, setEditingFlyer] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadNewFlyer = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      try {
          const res = await fetch('/api/businesses');
          const data = await res.json();
          if (!data || data.length === 0) {
              alert("No businesses found");
              setIsUploading(false);
              return;
          }
          const businessId = data[0].id;
          
          const reader = new FileReader();
          reader.onload = async (f) => {
              const base64 = f.target?.result as string;
              const res2 = await fetch('/api/admin/flyers/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ imageBase64: base64, businessId, occasionName: 'Custom Upload' })
              });
              const newFlyerData = await res2.json();
              if (newFlyerData.success) {
                  await fetchFlyers();
                  localStorage.setItem('coloh_editing_flyer_id', newFlyerData.flyer.id);
                  setEditingFlyer(newFlyerData.flyer);
              }
              setIsUploading(false);
          };
          reader.readAsDataURL(file);
      } catch (err) {
          console.error(err);
          setIsUploading(false);
      }
  };

  useEffect(() => {
     if (flyers.length > 0) {
        const activeId = localStorage.getItem('coloh_editing_flyer_id');
        if (activeId) {
            const f = flyers.find(fl => fl.id === activeId);
            if (f) setEditingFlyer(f);
        }
     }
  }, [flyers]);

  const fetchFlyers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/flyers');
      const data = await res.json();
      setFlyers(data.flyers || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlyers();
  }, []);

  if (editingFlyer) {
    return <FlyerEditor flyer={editingFlyer} onClose={() => { localStorage.removeItem('coloh_editing_flyer_id'); setEditingFlyer(null); }} onSaved={fetchFlyers} />;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
           {onClose && <button onClick={onClose} className="mr-4 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-charcoal">← Back</button>}
           <h2 className="text-xl font-bold font-display text-charcoal">Flyers Under Review</h2>
        </div>
        <div className="flex items-center gap-4">
            <label className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer font-bold">
                {isUploading ? 'Uploading...' : 'Upload Flyer'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadNewFlyer} disabled={isUploading} />
            </label>
            <button onClick={fetchFlyers} className="text-xs text-gray-500 hover:text-charcoal underline">Refresh</button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pb-20">
          {flyers.map((flyer, idx) => (
            <div key={flyer.id || idx} className="border border-gray-200 rounded-xl p-4 flex flex-col bg-gray-50">
              <div className="relative aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img src={flyer.imageUrl} className="w-full h-full object-cover" alt="" />
                {flyer.status === 'pending_review' && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">PENDING</div>
                )}
                {flyer.status === 'approved' && (
                  <div className="absolute top-2 left-2 bg-green-400 text-green-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">APPROVED</div>
                )}
              </div>
              <div className="font-bold text-sm truncate">{flyer.occasionName}</div>
              <div className="text-[10px] text-gray-500 mb-4">{new Date(flyer.createdAt).toLocaleDateString()}</div>
              <button
                onClick={() => { localStorage.setItem('coloh_editing_flyer_id', flyer.id); setEditingFlyer(flyer); }}
                className="mt-auto w-full py-2.5 bg-charcoal text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Review & Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import { LucideImage, LucideType, LucidePhone, LucideUpload, LucideTrash2, LucideBold, LucideItalic, LucideUnderline, LucideDownload, LucideSparkles, LucidePipette, LucideUndo2, LucideShapes, LucideArrowLeft, LucideRedo2, LucideCheckCircle2, LucideUnlock, LucideLock, TypeIcon, LucidePanelTop, LucidePanelBottom, LucidePanelLeft, LucidePanelRight, LucideBan, LucideMaximize } from 'lucide-react';


const FONTS = [
  "Fredoka", "Playfair Display", "Outfit", "Space Grotesk", "JetBrains Mono", "Inter",
  "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Oswald", "Raleway",
  "Merriweather", "Nunito", "Ubuntu", "Rubik", "Work Sans", "Quicksand", "Lora",
  "Bebas Neue", "Dancing Script", "Pacifico", "Caveat", "Righteous", "Permanent Marker",
  "Cinzel", "Abril Fatface", "Cormorant Garamond", "Alfa Slab One",
  "Anton", "Archivo Black", "Bungee", "Lobster", "Satisfy",
  "Teko", "Titan One", "Viga", "Yeseva One", "Vollkorn"
];

function FlyerEditor({ flyer, onClose, onSaved }: { flyer: any, onClose: () => void, onSaved: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObj, setActiveObj] = useState<fabric.Object | null>(null);
  
  const [business, setBusiness] = useState<any>(null);
  const [logoMode, setLogoMode] = useState<'transparent' | 'block' | 'translucent'>('transparent');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');
    const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes' | 'logo' | 'addons'>('main');
  const [addonType, setAddonType] = useState<'none' | 'header' | 'footer' | 'left' | 'right'>('none');
  const [addonColor, setAddonColor] = useState<string>('#1E824C');
  const [addonThickness, setAddonThickness] = useState<number>(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringTrash, setIsHoveringTrash] = useState(false);
  const undoStack = useRef<any[]>([]);
  const redoStack = useRef<any[]>([]);
  const isHistoryUpdate = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  
  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); }
  }, []);

  useEffect(() => {
     fetch(`/api/businesses/${flyer.businessId}`)
       .then(r => r.json())
       .then(data => setBusiness(data))
       .catch(console.error);
  }, [flyer.businessId]);

  
  const saveHistory = (c: fabric.Canvas) => {
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
  };

    const undo = async () => {
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
        
        const existing = canvas.getObjects().find((o: any) => o.isAddon);
        if (existing) {
            setAddonType((existing as any).addonType);
            setAddonColor((existing as any).fill);
            setAddonThickness((existing as any).addonThickness);
        } else {
            setAddonType('none');
        }
    } catch (e) {
        console.error(e);
    } finally {
        isHistoryUpdate.current = false;
    }
  };

    const redo = async () => {
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
        
        const existing = canvas.getObjects().find((o: any) => o.isAddon);
        if (existing) {
            setAddonType((existing as any).addonType);
            setAddonColor((existing as any).fill);
            setAddonThickness((existing as any).addonThickness);
        } else {
            setAddonType('none');
        }
    } catch (e) {
        console.error(e);
    } finally {
        isHistoryUpdate.current = false;
    }
  };


  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    let isMounted = true;
    let c = new fabric.Canvas(canvasRef.current, {
       preserveObjectStacking: true,
       selection: true,
    });
    
    const init = async () => {
       const containerWidth = containerRef.current.clientWidth;
       const containerHeight = containerRef.current.clientHeight;
       
       c.setDimensions({ width: containerWidth - 40, height: containerHeight - 40 });
       
       if (flyer.imageUrl) {
           try {
               const res = await fetch(flyer.imageUrl);
               const blob = await res.blob();
               const objectURL = URL.createObjectURL(blob);
               const img = await fabric.FabricImage.fromURL(objectURL);
               if (!isMounted) return;
               
               const scaleX = c.width! / img.width!;
               const scaleY = c.height! / img.height!;
               const scale = Math.min(scaleX, scaleY);
               
               c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
               
               img.set({ scaleX: scale, scaleY: scale, originX: 'left', originY: 'top' });
               c.backgroundImage = img;
           } catch(e) {
               console.error('Failed to load image', e);
           }
       }
       
       if (!isMounted) return;
       
       c.on('selection:cleared', () => setActiveObj(null));
       c.on('selection:created', (e) => setActiveObj(e.selected?.[0] || null));
       c.on('selection:updated', (e) => setActiveObj(e.selected?.[0] || null));
       c.on('object:modified', () => saveHistory(c));
       c.on('object:added', () => saveHistory(c));
       c.on('object:removed', () => saveHistory(c));
       
       // Zoom and pan logic
       c.on('mouse:wheel', function(opt) {
          var evt = opt.e as any;
          if (evt.ctrlKey) {
              var delta = evt.deltaY;
              var zoom = c.getZoom();
              zoom *= 0.999 ** delta;
              if (zoom > 5) zoom = 5;
              if (zoom < 0.1) zoom = 0.1;
              c.zoomToPoint(new fabric.Point(evt.offsetX, evt.offsetY), zoom);
              evt.preventDefault();
              evt.stopPropagation();
          } else {
              var vpt = c.viewportTransform;
              if (vpt) {
                  vpt[4] -= evt.deltaX || 0;
                  vpt[5] -= evt.deltaY || 0;
                  c.requestRenderAll();
              }
              evt.preventDefault();
              evt.stopPropagation();
          }
       });

       // Enable panning with alt+drag or middle mouse button
       c.on('mouse:down', function(opt) {
          var evt = opt.e as any;
          if (evt.altKey === true || evt.button === 1) {
             (this as any).isDragging = true;
             (this as any).selection = false;
             (this as any).lastPosX = evt.clientX || (evt.touches ? evt.touches[0].clientX : 0);
             (this as any).lastPosY = evt.clientY || (evt.touches ? evt.touches[0].clientY : 0);
          }
       });
       c.on('mouse:move', function(opt) {
          if ((this as any).isDragging) {
             var e = opt.e as any;
             var vpt = this.viewportTransform;
             if (vpt) {
                 var cx = e.clientX || (e.touches ? e.touches[0].clientX : 0);
                 var cy = e.clientY || (e.touches ? e.touches[0].clientY : 0);
                 vpt[4] += cx - (this as any).lastPosX;
                 vpt[5] += cy - (this as any).lastPosY;
                 this.requestRenderAll();
                 (this as any).lastPosX = cx;
                 (this as any).lastPosY = cy;
             }
          }
       });
       c.on('mouse:up', function(opt) {
          if (this.viewportTransform) this.setViewportTransform(this.viewportTransform);
          (this as any).isDragging = false;
          (this as any).selection = true;
       });
       
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
       
       c.renderAll();
       setCanvas(c);
       
       setTimeout(() => {
           if (!isMounted) return;
           isHistoryUpdate.current = false;
           undoStack.current = [];
           redoStack.current = [];
           saveHistory(c);
       }, 100);
    };
    
    init();
    
    return () => {
        isMounted = false;
        c.dispose();
    };
  }, [canvasRef, containerRef, flyer.imageUrl]);
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
    const actualText = text || `[Empty ${label}]`;

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

  
  const addShape = (type: string, outlined = false) => {
    if (!canvas) return;
    let shape: fabric.Object | null = null;
    const center = { left: canvas.width! / canvas.getZoom() / 2, top: canvas.height! / canvas.getZoom() / 2 };
    
    const fill = outlined ? 'transparent' : '#1E824C';
    const stroke = outlined ? '#1E824C' : undefined;
    const strokeWidth = outlined ? 4 : 0;
    
    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 50, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'rectangle') {
        shape = new fabric.Rect({ width: 100, height: 100, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'star') {
        const starPoints = [
            {x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57},
            {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57},
            {x: 2, y: 35}, {x: 39, y: 35}
        ];
        shape = new fabric.Polygon(starPoints, { fill: outlined ? 'transparent' : '#F5A623', stroke: outlined ? '#F5A623' : undefined, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'glitter') {
        shape = new fabric.Textbox('✦', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#F5A623', stroke: outlined ? '#F5A623' : undefined, strokeWidth: outlined ? 2 : 0, fontFamily: 'Arial' });
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
       
       if (logoMode === 'block' || logoMode === 'translucent') {
          const padding = 40;
          const rect = new fabric.Rect({
             width: img.getScaledWidth() + padding,
             height: img.getScaledHeight() + padding,
             fill: logoBgColor,
             opacity: logoMode === 'translucent' ? 0.5 : 1,
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
       objToAdd.set({ name: 'logo' });
       
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
    canvas.renderAll();
    
    try {
      await fetch(`/api/admin/flyers/${flyer.businessId}/${flyer.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl })
      });
      await fetch(`/api/admin/flyers/${flyer.businessId}/${flyer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      try {
        localStorage.removeItem('coloh_flyer_backup_' + flyer.id);
      } catch(e) {}
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
    canvas.renderAll();
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `flyer_${flyer.id}.png`;
    a.click();
  };

  
  const applyAddon = (type: string, color: string, thicknessStr: number) => {
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
        (addonRect as any).sendToBack();
    }
    
    canvas.renderAll();
    saveHistory(canvas);
  };

  const changeColor = (color: string) => {
     if (!activeObj || !canvas) return;
     if (['i-text', 'textbox', 'text', 'rect', 'circle', 'triangle', 'polygon', 'path'].includes(activeObj.type!)) {
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
             <button onClick={undo} disabled={!canUndo} className={`p-1.5 sm:p-2 rounded-full transition-colors ${canUndo ? 'text-charcoal hover:bg-gray-200' : 'text-gray-300'}`}>
                <LucideUndo2 className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <button onClick={redo} disabled={!canRedo} className={`p-1.5 sm:p-2 rounded-full transition-colors ${canRedo ? 'text-charcoal hover:bg-gray-200' : 'text-gray-300'}`}>
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
      <div ref={containerRef} className="flex-1 w-full h-full bg-white overflow-auto flex items-center justify-center p-4 sm:p-8 pt-24 sm:pt-28 pb-32 sm:pb-36 z-0">
          <div className="w-max shadow-2xl ring-1 ring-white/10" style={{ backgroundColor: '#f3f4f6' }}>
             <canvas ref={canvasRef}></canvas>
             
             {isDragging && (
                <div className={`fixed bottom-8 left-8 w-16 h-16 rounded-full flex items-center justify-center transition-all z-[100] shadow-2xl border-2 border-red-200 ${isHoveringTrash ? 'bg-red-500 scale-125 text-white' : 'bg-red-100 text-red-500 opacity-50'}`}>
                    <LucideTrash2 className="w-8 h-8" />
                </div>
             )}
          </div>
      </div>

            {/* Active Selection Formatting Toolbar */}
      {activeObj && (
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 h-20 sm:h-24 shadow-2xl flex items-center justify-center">
          <div className="flex items-center overflow-x-auto h-full px-4 gap-4 sm:gap-6 max-w-4xl w-full overflow-x-auto scroll-smooth">
            
            {activeObj.name !== 'logo' && (
                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => changeColor('#ffffff')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
                   <button onClick={() => changeColor('#000000')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
                   {Array.from(new Set([business?.brandColor, business?.accentColor, ...(business?.extractedColors || [])].filter(Boolean).map(c => c.toLowerCase()))).filter(c => c !== '#ffffff' && c !== '#000000').slice(0, 5).map((col: string) => (
                      <button key={col} onClick={() => changeColor(col)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: col }}></button>
                   ))}
                   
                   <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer overflow-hidden border border-gray-200" title="Custom Color">
                      <input type="color" className="absolute inset-[-10px] w-[50px] h-[50px] opacity-0 cursor-pointer" onChange={(e) => changeColor(e.target.value)} value={((activeObj as any)?.fill && (activeObj as any)?.fill !== 'transparent') ? (activeObj as any)?.fill : ((activeObj as any)?.stroke || '#000000')} />
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: ((activeObj as any)?.fill && (activeObj as any)?.fill !== 'transparent') ? (activeObj as any)?.fill : ((activeObj as any)?.stroke || '#000000') }}></div>
                   </div>

                   {typeof window !== 'undefined' && 'EyeDropper' in window && (
                     <button onClick={async () => {
                       try {
                         const eyeDropper = new (window as any).EyeDropper();
                         const result = await eyeDropper.open();
                         changeColor(result.sRGBHex);
                       } catch (e) {
                         console.error(e);
                       }
                     }} className="p-1 sm:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal border border-gray-200 shadow-sm transition-transform hover:scale-110" title="Pick Color">
                        <LucidePipette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     </button>
                   )}
                </div>
            )}
            {(activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') && (
              <>

                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <select
                      className="w-24 sm:w-32 text-[10px] sm:text-xs p-1.5 sm:p-2 border border-gray-200 rounded-lg text-charcoal outline-none focus:border-blue-400 bg-gray-50"
                      onChange={(e) => {
                         if (!canvas || !activeObj) return;
                         (activeObj as any).set('fontFamily', e.target.value);
                         canvas.renderAll();
                         saveHistory(canvas);
                      }}
                      value={(activeObj as any)?.fontFamily || 'Fredoka'}
                   >
                     
    {FONTS.map(f => (
      <option key={f} value={f}>{f}</option>
    ))}
  
                   </select>
                </div>
                
                <div className="flex items-center gap-1 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => {
                      if (!canvas || !activeObj) return;
                      const isBold = (activeObj as any).fontWeight === 'bold';
                      (activeObj as any).set('fontWeight', isBold ? 'normal' : 'bold');
                      canvas.renderAll();
                      saveHistory(canvas);
                   }} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${(activeObj as any)?.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-charcoal hover:bg-gray-200'}`} title="Bold">
                      <LucideBold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </button>
                   <button onClick={() => {
                      if (!canvas || !activeObj) return;
                      const isItalic = (activeObj as any).fontStyle === 'italic';
                      (activeObj as any).set('fontStyle', isItalic ? 'normal' : 'italic');
                      canvas.renderAll();
                      saveHistory(canvas);
                   }} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${(activeObj as any)?.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-charcoal hover:bg-gray-200'}`} title="Italic">
                      <LucideItalic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </button>
                   <button onClick={() => {
                      if (!canvas || !activeObj) return;
                      const isUnderline = (activeObj as any).underline;
                      (activeObj as any).set('underline', !isUnderline);
                      canvas.renderAll();
                      saveHistory(canvas);
                   }} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${(activeObj as any)?.underline ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-charcoal hover:bg-gray-200'}`} title="Underline">
                      <LucideUnderline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   </button>
                </div>

                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => changeShadow(!(activeObj as any).shadow)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] sm:text-xs font-bold transition-colors">
                      Shadow
                   </button>
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0 min-w-[100px]">
               <span className="text-[10px] sm:text-xs font-bold text-gray-500">Opacity</span>
               <input type="range" min="0" max="1" step="0.05" value={activeObj.opacity ?? 1} onChange={(e) => {
                   if (!canvas || !activeObj) return;
                   activeObj.set('opacity', parseFloat(e.target.value));
                   canvas.renderAll();
                   saveHistory(canvas);
               }} className="w-16 sm:w-20 accent-charcoal" />
            </div>
            
            {activeObj.name === 'logo' && (
              <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => {
                      if (!canvas || !activeObj || !business?.logoUrl) return;
                      activeObj.set('name', 'old-logo');
                      setLogoMode('transparent');
                      addBusinessLogo().then(() => {
                         const objs = canvas.getObjects();
                         const old = objs.find(o => o.name === 'old-logo');
                         if (old) canvas.remove(old);
                      });
                   }} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold">
                      Transparent
                   </button>
                   <button onClick={() => {
                      if (!canvas || !activeObj || !business?.logoUrl) return;
                      activeObj.set('name', 'old-logo');
                      setLogoMode('block');
                      addBusinessLogo().then(() => {
                         const objs = canvas.getObjects();
                         const old = objs.find(o => o.name === 'old-logo');
                         if (old) canvas.remove(old);
                      });
                   }} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold">
                      Solid
                   </button>
                   <button onClick={() => {
                      if (!canvas || !activeObj || !business?.logoUrl) return;
                      activeObj.set('name', 'old-logo');
                      setLogoMode('translucent');
                      addBusinessLogo().then(() => {
                         const objs = canvas.getObjects();
                         const old = objs.find(o => o.name === 'old-logo');
                         if (old) canvas.remove(old);
                      });
                   }} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold">
                      Translucent
                   </button>
                   <input type="color" className="w-6 h-6 rounded cursor-pointer" value={logoBgColor} onChange={(e) => {
                      setLogoBgColor(e.target.value);
                      if (!canvas || !activeObj || !business?.logoUrl) return;
                      activeObj.set('name', 'old-logo');
                      addBusinessLogo().then(() => {
                         const objs = canvas.getObjects();
                         const old = objs.find(o => o.name === 'old-logo');
                         if (old) canvas.remove(old);
                      });
                   }} />
              </div>
            )}

            <div className="flex items-center shrink-0 ml-auto gap-2">
               <button onClick={() => {
                  if (!canvas || !activeObj) return;
                  const isLocked = activeObj.lockMovementX;
                  activeObj.set({
                     lockMovementX: !isLocked,
                     lockMovementY: !isLocked,
                     lockRotation: !isLocked,
                     lockScalingX: !isLocked,
                     lockScalingY: !isLocked,
                     hasControls: isLocked,
                     borderColor: !isLocked ? '#ff0000' : 'rgba(102,153,255,0.75)'
                  });
                  canvas.discardActiveObject();
                  canvas.setActiveObject(activeObj);
                  canvas.renderAll();
                  saveHistory(canvas);
               }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-1 sm:gap-2">
                  {activeObj.lockMovementX ? <LucideUnlock className="w-3 h-3 sm:w-4 sm:h-4" /> : <LucideLock className="w-3 h-3 sm:w-4 sm:h-4" />} {activeObj.lockMovementX ? 'Unlock' : 'Lock'}
               </button>
               
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
        </div>
      )}

      {/* Bottom Scrollable Navigation Toolbar */}
      {!activeObj && (
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 h-20 sm:h-24 shadow-2xl flex items-center justify-center">
          <div className="flex items-center overflow-x-auto h-full px-4 gap-4 sm:gap-8 max-w-4xl w-full scroll-smooth">
             
             {activeToolMenu === 'main' && (
                <>
                   <button onClick={() => setActiveToolMenu('text')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideType className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Text</span>
                   </button>
                   <button onClick={() => setActiveToolMenu('shapes')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideShapes className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Shapes</span>
                   </button>
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <button onClick={() => setActiveToolMenu('logo')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                          <LucideImage className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Profile Logo</span>
                   </button>

                   <button onClick={() => setActiveToolMenu('addons')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-green-600">
                          <LucideMaximize className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">360<br/>Add-ons</span>
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
                </>
             )}

             {activeToolMenu === 'text' && (
                <>
                   <button onClick={() => setActiveToolMenu('main')} className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideUndo2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Back</span>
                   </button>
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <button onClick={() => addText(flyer.headline, 'Headline', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700"><LucideType className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Headline</span>
                   </button>
                   <button onClick={() => addText(flyer.bodyMessage, 'Body', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700"><LucideType className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Body Text</span>
                   </button>
                   <button onClick={() => addText(flyer.signOff, 'Sign-off', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700"><LucideType className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Sign-off</span>
                   </button>
                   <button onClick={() => {
                      if (!business) return;
                      const parts = [];
                      if (business.phone) parts.push(`☏ ${business.phone}`);
                      if (business.email) parts.push(`✉ ${business.email}`);
                      if (business.instagram) parts.push(`@${business.instagram.replace('@', '')}`);
                      if (business.xUsername) parts.push(`𝕏 ${business.xUsername.replace('@', '')}`);
                      if (parts.length === 0) parts.push('Contact Details');
                      addText(parts.join('  |  '), 'Contact Info', flyer.typography);
                   }} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700"><LucidePhone className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Contacts</span>
                   </button>
                   <button onClick={() => addText('Custom Text', 'Custom', flyer.typography)} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700"><LucideType className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Custom<br/>Text</span>
                   </button>
                </>
             )}

             {activeToolMenu === 'shapes' && (
                <>
                   <button onClick={() => setActiveToolMenu('main')} className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideUndo2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Back</span>
                   </button>
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <div className="flex flex-col gap-1 items-center justify-center px-2">
                       <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Filled</span>
                       <div className="flex gap-2">
                           <button onClick={() => addShape('circle')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 rounded-full bg-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('rectangle')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 bg-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('triangle')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-transparent border-b-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('star')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all font-bold text-xs">
                              ★
                           </button>
                       </div>
                   </div>

                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>

                   <div className="flex flex-col gap-1 items-center justify-center px-2">
                       <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Outlined</span>
                       <div className="flex gap-2">
                           <button onClick={() => addShape('circle', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 rounded-full border-2 border-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('rectangle', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 border-2 border-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('triangle', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="12 2 22 20 2 20 12 2"></polygon></svg>
                           </button>
                           <button onClick={() => addShape('star', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                           </button>
                       </div>
                   </div>
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <button onClick={() => addShape('glitter')} className="flex flex-col items-center justify-center min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 text-charcoal"><LucideSparkles className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">Glitter</span>
                   </button>
                </>
             )}

             {activeToolMenu === 'logo' && (
                <>
                   <button onClick={() => setActiveToolMenu('main')} className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideUndo2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Back</span>
                   </button>
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <button onClick={() => setLogoMode('transparent')} className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] ${logoMode === 'transparent' ? 'text-blue-600' : 'text-gray-500 hover:text-charcoal'} hover:scale-105 transition-all`}>
                      <div className={`p-2 sm:p-3 rounded-full mb-1 sm:mb-2 ${logoMode === 'transparent' ? 'bg-blue-100' : 'bg-gray-100'}`}><LucideImage className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Transparent</span>
                   </button>
                   <button onClick={() => setLogoMode('block')} className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] ${logoMode === 'block' ? 'text-blue-600' : 'text-gray-500 hover:text-charcoal'} hover:scale-105 transition-all`}>
                      <div className={`p-2 sm:p-3 rounded-full mb-1 sm:mb-2 ${logoMode === 'block' ? 'bg-blue-100' : 'bg-gray-100'}`}><LucideImage className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Solid Block</span>
                   </button>
                   <button onClick={() => setLogoMode('translucent')} className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] ${logoMode === 'translucent' ? 'text-blue-600' : 'text-gray-500 hover:text-charcoal'} hover:scale-105 transition-all`}>
                      <div className={`p-2 sm:p-3 rounded-full mb-1 sm:mb-2 ${logoMode === 'translucent' ? 'bg-blue-100' : 'bg-gray-100'}`}><LucideImage className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" /></div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Translucent</span>
                   </button>

                   {(logoMode === 'block' || logoMode === 'translucent') && (
                      <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px]">
                          <input type="color" className="w-8 h-8 rounded cursor-pointer mb-1" value={logoBgColor} onChange={(e) => setLogoBgColor(e.target.value)} />
                          <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-gray-500">Bg Color</span>
                      </div>
                   )}
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <button onClick={() => { addBusinessLogo(); setActiveToolMenu('main'); }} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-blue-600 hover:scale-105 transition-all">
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                          <LucideUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Add Logo</span>
                   </button>
                </>
             )}

             {activeToolMenu === 'addons' && (
                <>
                   <button onClick={() => setActiveToolMenu('main')} className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideUndo2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Back</span>
                   </button>
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>

                   <button onClick={() => applyAddon('none', addonColor, addonThickness)} className={`flex flex-col items-center justify-center min-w-[60px] ${addonType === 'none' ? 'text-green-600' : 'text-gray-500'} hover:scale-105 transition-all`}>
                      <div className={`p-2 rounded-full mb-1 ${addonType === 'none' ? 'bg-green-100' : 'bg-gray-100'}`}><LucideBan className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">None</span>
                   </button>

                   <button onClick={() => applyAddon('header', addonColor, addonThickness)} className={`flex flex-col items-center justify-center min-w-[60px] ${addonType === 'header' ? 'text-green-600' : 'text-gray-500'} hover:scale-105 transition-all`}>
                      <div className={`p-2 rounded-full mb-1 ${addonType === 'header' ? 'bg-green-100' : 'bg-gray-100'}`}><LucidePanelTop className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">Header</span>
                   </button>
                   
                   <button onClick={() => applyAddon('footer', addonColor, addonThickness)} className={`flex flex-col items-center justify-center min-w-[60px] ${addonType === 'footer' ? 'text-green-600' : 'text-gray-500'} hover:scale-105 transition-all`}>
                      <div className={`p-2 rounded-full mb-1 ${addonType === 'footer' ? 'bg-green-100' : 'bg-gray-100'}`}><LucidePanelBottom className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">Footer</span>
                   </button>

                   <button onClick={() => applyAddon('left', addonColor, addonThickness)} className={`flex flex-col items-center justify-center min-w-[60px] ${addonType === 'left' ? 'text-green-600' : 'text-gray-500'} hover:scale-105 transition-all`}>
                      <div className={`p-2 rounded-full mb-1 ${addonType === 'left' ? 'bg-green-100' : 'bg-gray-100'}`}><LucidePanelLeft className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">Left Sider</span>
                   </button>

                   <button onClick={() => applyAddon('right', addonColor, addonThickness)} className={`flex flex-col items-center justify-center min-w-[60px] ${addonType === 'right' ? 'text-green-600' : 'text-gray-500'} hover:scale-105 transition-all`}>
                      <div className={`p-2 rounded-full mb-1 ${addonType === 'right' ? 'bg-green-100' : 'bg-gray-100'}`}><LucidePanelRight className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">Right Sider</span>
                   </button>
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <div className="flex flex-col items-center justify-center min-w-[60px] px-2">
                       <span className="text-[9px] font-bold text-gray-500 mb-1">Color</span>
                       <input type="color" className="w-6 h-6 rounded cursor-pointer" value={addonColor} onChange={(e) => applyAddon(addonType, e.target.value, addonThickness)} />
                   </div>
                   
                   <div className="flex flex-col items-center justify-center min-w-[80px] px-2">
                       <span className="text-[9px] font-bold text-gray-500 mb-1">Thickness</span>
                       <input type="range" min="20" max="300" step="10" className="w-20" value={addonThickness} onChange={(e) => applyAddon(addonType, addonColor, parseInt(e.target.value))} />
                   </div>
                </>
             )}


          </div>
      </div>
      )}
    </div>
  );
}
