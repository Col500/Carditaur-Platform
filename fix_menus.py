import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# I will replace everything from {/* Bottom Scrollable Navigation Toolbar */} down to the end of that div.
start_marker = "      {/* Bottom Scrollable Navigation Toolbar */}"
end_marker = "      )}\n    </div>"
start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    old_menus = text[start_idx:end_idx]
    
    new_menus = """      {/* Bottom Scrollable Navigation Toolbar */}
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
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-gray-700"><TypeIcon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
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
                   
                   <button onClick={() => addShape('circle')} className="flex flex-col items-center justify-center min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1"><div className="w-4 h-4 rounded-full border-2 border-charcoal"></div></div>
                      <span className="text-[9px] font-bold">Circle</span>
                   </button>
                   <button onClick={() => addShape('rectangle')} className="flex flex-col items-center justify-center min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1"><div className="w-4 h-4 border-2 border-charcoal"></div></div>
                      <span className="text-[9px] font-bold">Rectangle</span>
                   </button>
                   <button onClick={() => addShape('triangle')} className="flex flex-col items-center justify-center min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1"><div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-transparent border-b-charcoal"></div></div>
                      <span className="text-[9px] font-bold">Triangle</span>
                   </button>
                   <button onClick={() => addShape('star')} className="flex flex-col items-center justify-center min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 text-charcoal">★</div>
                      <span className="text-[9px] font-bold">Star</span>
                   </button>
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

          </div>
      </div>
"""
    text = text[:start_idx] + new_menus + text[end_idx:]
    with open('src/components/AdminFlyers.tsx', 'w') as f:
        f.write(text)
    print("Replaced menus")
