const fs = require('fs');

const content = `import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';

export function AdminFlyers() {
  const [flyers, setFlyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlyer, setEditingFlyer] = useState<any>(null);

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
    return <FlyerEditor flyer={editingFlyer} onClose={() => setEditingFlyer(null)} onSaved={fetchFlyers} />;
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-display text-charcoal">Flyers Under Review</h2>
        <button onClick={fetchFlyers} className="text-xs text-blue-600 underline">Refresh</button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pb-20">
          {flyers.map(flyer => (
            <div key={flyer.id} className="border border-gray-200 rounded-xl p-4 flex flex-col bg-gray-50">
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
                onClick={() => setEditingFlyer(flyer)}
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

function FlyerEditor({ flyer, onClose, onSaved }: { flyer: any, onClose: () => void, onSaved: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObj, setActiveObj] = useState<fabric.Object | null>(null);
  
  const [business, setBusiness] = useState<any>(null);
  const [logoMode, setLogoMode] = useState<'transparent' | 'block'>('transparent');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');

  useEffect(() => {
     fetch(\`/api/businesses/\${flyer.businessId}\`)
       .then(r => r.json())
       .then(data => setBusiness(data))
       .catch(console.error);
  }, [flyer.businessId]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    let c: fabric.Canvas;
    
    const initCanvas = async () => {
       const containerWidth = containerRef.current!.clientWidth;
       const containerHeight = containerRef.current!.clientHeight;
       
       c = new fabric.Canvas(canvasRef.current, {
          backgroundColor: '#f3f4f6',
          preserveObjectStacking: true
       });
       setCanvas(c);
       
       c.on('selection:created', (e) => setActiveObj(e.selected[0]));
       c.on('selection:updated', (e) => setActiveObj(e.selected[0]));
       c.on('selection:cleared', () => setActiveObj(null));

       try {
           const img = await fabric.FabricImage.fromURL(flyer.imageUrl, { crossOrigin: 'anonymous' });
           
           const padding = 40;
           const availableW = containerWidth - padding;
           const availableH = containerHeight - padding;
           
           const scaleX = availableW / img.width!;
           const scaleY = availableH / img.height!;
           const scale = Math.min(scaleX, scaleY);
           
           c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
           c.setZoom(scale);
           
           img.set({
               originX: 'left',
               originY: 'top',
               selectable: false,
               evented: false
           });
           
           // We use it as a background image so it doesn't get selected
           c.backgroundImage = img;
           c.renderAll();
       } catch (err) {
           console.error("Failed to load background image", err);
       }
    };
    
    // Slight delay to ensure container is rendered and sized
    setTimeout(initCanvas, 100);
    
    return () => {
       if (c) c.dispose();
    }
  }, []);

  const addText = (text: string, label: string) => {
    if (!canvas) return;
    const actualText = text || \`[Empty \${label}]\`;
    const t = new fabric.IText(actualText, {
      left: (canvas.width! / canvas.getZoom()) / 2,
      top: (canvas.height! / canvas.getZoom()) / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 48,
      fill: '#ffffff',
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
       const img = await fabric.FabricImage.fromURL(business.logoUrl, { crossOrigin: 'anonymous' });
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
      const img = await fabric.FabricImage.fromURL(data, { crossOrigin: 'anonymous' });
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
    // Revert zoom for export
    const originalZoom = canvas.getZoom();
    canvas.setZoom(1);
    
    // We need to set dimensions back to original to export properly
    const bgImg = canvas.backgroundImage as fabric.Image;
    if (bgImg) {
      canvas.setDimensions({ width: bgImg.width!, height: bgImg.height! });
    }
    
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
    
    // Restore preview zoom and dims
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
     if (activeObj.type === 'i-text') {
        activeObj.set('fill', color);
     }
     canvas.renderAll();
  };
  
  const changeShadow = (hasShadow: boolean) => {
     if (!activeObj || !canvas) return;
     if (activeObj.type === 'i-text') {
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
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-200">
      <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
           <button onClick={onClose} className="text-gray-500 hover:text-charcoal mr-4 text-sm font-bold">← Back</button>
           <span className="font-bold font-display text-lg text-charcoal">Edit Flyer: {flyer.occasionName}</span>
        </div>
        <div className="flex space-x-3">
           <button onClick={downloadFlyerImage} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all text-charcoal">Download Draft</button>
           <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer shadow-sm transition-all text-charcoal">
              Re-Upload
              <input type="file" className="hidden" accept="image/*" onChange={handleDownloadAndReupload} />
           </label>
           <button onClick={saveFlyer} className="px-5 py-2 bg-[#1E824C] text-white rounded-lg text-xs font-bold hover:bg-[#186b3e] shadow-sm transition-all">Approve & Publish</button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Generated Text Blocks */}
        <div className="w-72 bg-white border-r border-gray-200 p-5 overflow-y-auto space-y-8 shrink-0">
           
           {/* Text Blocks */}
           <div>
             <h3 className="font-bold text-[10px] text-gray-400 mb-3 uppercase tracking-wider">Add AI Generated Text</h3>
             <div className="space-y-2">
                 <button onClick={() => addText(flyer.headline, 'Headline')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors text-charcoal group">
                   <span>Headline</span>
                   <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-[10px] font-normal transition-opacity">Click to add</span>
                 </button>
                 <button onClick={() => addText(flyer.bodyMessage, 'Body')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors text-charcoal group">
                   <span>Body Message</span>
                   <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-[10px] font-normal transition-opacity">Click to add</span>
                 </button>
                 <button onClick={() => addText(flyer.signOff, 'Sign-off')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors text-charcoal group">
                   <span>Sign-off</span>
                   <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-[10px] font-normal transition-opacity">Click to add</span>
                 </button>
                 <button onClick={() => addText(flyer.contactInfo, 'Contact')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors text-charcoal group">
                   <span>Contact Info</span>
                   <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-[10px] font-normal transition-opacity">Click to add</span>
                 </button>
             </div>
           </div>
           
           {/* Logo Injection */}
           <div className="pt-6 border-t border-gray-100">
             <h3 className="font-bold text-[10px] text-gray-400 mb-3 uppercase tracking-wider">Business Logo</h3>
             
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 space-y-3">
                 <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-gray-500">Logo Mode:</span>
                     <div className="flex space-x-1 bg-gray-200 p-0.5 rounded-lg">
                         <button onClick={() => setLogoMode('transparent')} className={\`px-2 py-1 text-[9px] font-bold rounded-md transition-colors \${logoMode === 'transparent' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-500'}\`}>Transparent</button>
                         <button onClick={() => setLogoMode('block')} className={\`px-2 py-1 text-[9px] font-bold rounded-md transition-colors \${logoMode === 'block' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-500'}\`}>Block</button>
                     </div>
                 </div>
                 
                 {logoMode === 'block' && (
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500">Block Color:</span>
                        <input type="color" value={logoBgColor} onChange={(e) => setLogoBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                     </div>
                 )}
                 
                 <button onClick={addBusinessLogo} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all">
                    Insert Profile Logo
                 </button>
             </div>
             
             <div className="text-center relative">
                 <span className="text-[10px] text-gray-400 bg-white px-2 relative z-10 font-bold">OR</span>
                 <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2 z-0"></div>
             </div>
             
             <label className="mt-3 w-full block text-center px-3 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
               Upload Custom Logo PNG
               <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
             </label>
           </div>
           
           {/* Active Selection formatting */}
           {activeObj && activeObj.type === 'i-text' && (
             <div className="pt-6 border-t border-gray-100">
               <h3 className="font-bold text-[10px] text-blue-500 mb-3 uppercase tracking-wider flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Text Format
               </h3>
               
               <div className="space-y-4">
                   <div>
                       <span className="text-[10px] font-bold text-gray-500 block mb-2">Color</span>
                       <div className="flex flex-wrap gap-2">
                         <button onClick={() => changeColor('#ffffff')} className="w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
                         <button onClick={() => changeColor('#000000')} className="w-7 h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
                         <button onClick={() => changeColor('#1E824C')} className="w-7 h-7 rounded-full bg-[#1E824C] border border-[#1E824C] shadow-sm hover:scale-110 transition-transform"></button>
                         <button onClick={() => changeColor('#E52B50')} className="w-7 h-7 rounded-full bg-[#E52B50] border border-[#E52B50] shadow-sm hover:scale-110 transition-transform"></button>
                         <button onClick={() => changeColor('#F5A623')} className="w-7 h-7 rounded-full bg-[#F5A623] border border-[#F5A623] shadow-sm hover:scale-110 transition-transform"></button>
                         {business?.brandColor && (
                             <button onClick={() => changeColor(business.brandColor)} className="w-7 h-7 rounded-full border shadow-sm hover:scale-110 transition-transform relative" style={{ backgroundColor: business.brandColor }}>
                                 <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap text-gray-400">Brand</span>
                             </button>
                         )}
                         {business?.accentColor && (
                             <button onClick={() => changeColor(business.accentColor)} className="w-7 h-7 rounded-full border shadow-sm hover:scale-110 transition-transform relative" style={{ backgroundColor: business.accentColor }}>
                                 <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap text-gray-400">Accent</span>
                             </button>
                         )}
                       </div>
                   </div>
                   
                   <div>
                       <span className="text-[10px] font-bold text-gray-500 block mb-2">Effects</span>
                       <div className="flex space-x-2">
                           <button onClick={() => changeShadow(true)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-charcoal">Add Drop Shadow</button>
                           <button onClick={() => changeShadow(false)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-charcoal">Remove Shadow</button>
                       </div>
                   </div>
               </div>
             </div>
           )}
           
           {activeObj && (
              <div className="pt-4 border-t border-gray-100">
                 <button onClick={() => {
                   if (canvas && activeObj) {
                       canvas.remove(activeObj);
                       setActiveObj(null);
                   }
                 }} className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold transition-colors">
                    Delete Selected Element
                 </button>
              </div>
           )}
        </div>
        
        {/* Canvas Area - Dynamic scaling to fit screen without scroll */}
        <div ref={containerRef} className="flex-1 bg-zinc-800 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          <div className="shadow-2xl ring-1 ring-white/10" style={{ backgroundColor: '#f3f4f6' }}>
            <canvas ref={canvasRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdminFlyers.tsx', content);
console.log("Updated AdminFlyers.tsx");
