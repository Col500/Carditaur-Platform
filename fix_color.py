import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Fix changeColor
old_cc = """  const changeColor = (color: string) => {
     if (!activeObj || !canvas) return;
     activeObj.set('fill', color);
     canvas.renderAll();
     saveHistory(canvas);
  };"""
  
new_cc = """  const changeColor = (color: string) => {
     if (!activeObj || !canvas) return;
     if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
         activeObj.set('fill', color);
     } else {
         if ((activeObj as any).fill && (activeObj as any).fill !== 'transparent') {
             activeObj.set('fill', color);
         }
         if ((activeObj as any).stroke && (activeObj as any).stroke !== 'transparent') {
             activeObj.set('stroke', color);
         }
     }
     canvas.renderAll();
     saveHistory(canvas);
  };"""
text = text.replace(old_cc, new_cc)

# We need to find the Active Selection Formatting Toolbar and rearrange it
old_toolbar = """            {(activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') && (
              <>
                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => changeColor('#ffffff')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
                   <button onClick={() => changeColor('#000000')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
                   {Array.from(new Set([business?.brandColor, business?.accentColor, ...(business?.extractedColors || [])].filter(Boolean).map(c => c.toLowerCase()))).filter(c => c !== '#ffffff' && c !== '#000000').slice(0, 5).map((col: string) => (
                      <button key={col} onClick={() => changeColor(col)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: col }}></button>
                   ))}
                   
                   <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer overflow-hidden border border-gray-200" title="Custom Color">
                      <input type="color" className="absolute inset-[-10px] w-[50px] h-[50px] opacity-0 cursor-pointer" onChange={(e) => changeColor(e.target.value)} value={(activeObj as any)?.fill || '#000000'} />
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: (activeObj as any)?.fill || '#000000' }}></div>
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
                </div>"""

new_toolbar = """            {activeObj.name !== 'logo' && (
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
              <>"""

text = text.replace(old_toolbar, new_toolbar)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated changeColor")
