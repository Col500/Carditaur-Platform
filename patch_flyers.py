import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    content = f.read()

# Add Lucide imports
content = content.replace("LucideTrash2,", "LucideTrash2,\n  LucideLock,\n  LucideUnlock,\n  LucidePhone,\n  LucideItalic,\n  LucideBold,\n  LucideUnderline,\n  LucidePipette,")

# Add missing contact info button
contact_button = """
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
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700">
                    <LucidePhone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Contact</span>
             </button>
             <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
"""

content = content.replace("""             <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
             <button onClick={addBusinessLogo}""", contact_button + """             <button onClick={addBusinessLogo}""")

# Make Canvas background white instead of zinc-800
content = content.replace('bg-zinc-800', 'bg-white')

# Zoom functionality on canvas
zoom_logic = """
       c.on('mouse:wheel', function(opt) {
          var delta = opt.e.deltaY;
          var zoom = c.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 5) zoom = 5;
          if (zoom < 0.1) zoom = 0.1;
          c.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
       });
"""
content = content.replace("c.on('selection:cleared', () => setActiveObj(null));", "c.on('selection:cleared', () => setActiveObj(null));\n" + zoom_logic)

# Replace the active object toolbar
active_toolbar_start = "{/* Active Selection Formatting Toolbar */}"
active_toolbar_end = "{/* Bottom Scrollable Navigation Toolbar */}"

new_active_toolbar = """      {/* Active Selection Formatting Toolbar */}
      {activeObj && (
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 h-20 sm:h-24 shadow-2xl flex items-center justify-center">
          <div className="flex items-center overflow-x-auto h-full px-4 gap-4 sm:gap-6 max-w-4xl w-full hide-scrollbar no-scrollbar scroll-smooth">
            
            {(activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') && (
              <>
                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => changeColor('#ffffff')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
                   <button onClick={() => changeColor('#000000')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
                   {business?.brandColor && <button onClick={() => changeColor(business.brandColor)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: business.brandColor }} title="Brand Color"></button>}
                   {business?.accentColor && <button onClick={() => changeColor(business.accentColor)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: business.accentColor }} title="Accent Color"></button>}
                   {business?.extractedColors?.slice(0, 3).map((col: string) => (
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
                </div>

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
                     <option value="Fredoka">Fredoka</option>
                     <option value="Playfair Display">Playfair Display</option>
                     <option value="Outfit">Outfit</option>
                     <option value="Space Grotesk">Space Grotesk</option>
                     <option value="JetBrains Mono">JetBrains Mono</option>
                     <option value="Inter">Inter</option>
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
"""

pattern = re.compile(re.escape(active_toolbar_start) + ".*?" + re.escape(active_toolbar_end), re.DOTALL)
content = pattern.sub(new_active_toolbar + "\n      " + active_toolbar_end, content)

# Bottom Toolbar should be hidden if activeObj exists
bottom_toolbar_start = """      {/* Bottom Scrollable Navigation Toolbar */}"""
bottom_toolbar_new = """      {/* Bottom Scrollable Navigation Toolbar */}
      {!activeObj && ("""
content = content.replace(bottom_toolbar_start, bottom_toolbar_new)

# Add closing tag for !activeObj wrapper
# Search from bottom to find the last </div>    </div>  );} and insert )}
# It's better to replace "          </div>\n      </div>\n    </div>\n  );\n}" with "          </div>\n      </div>\n      )}\n    </div>\n  );\n}"
content = content.replace("          </div>\n      </div>\n    </div>\n  );\n}", "          </div>\n      </div>\n      )}\n    </div>\n  );\n}")


with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(content)

