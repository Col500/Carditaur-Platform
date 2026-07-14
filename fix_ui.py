import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_main_menu = """                   <button onClick={() => setActiveToolMenu('logo')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                          <LucideImage className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Logo</span>
                   </button>
                   
                   <label className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal cursor-pointer hover:scale-105 transition-all">"""

new_main_menu = """                   <button onClick={() => setActiveToolMenu('logo')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                          <LucideImage className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Logo</span>
                   </button>

                   <button onClick={() => setActiveToolMenu('addons')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-green-600">
                          <LucideMaximize className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">360 Add-ons</span>
                   </button>
                   
                   <label className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal cursor-pointer hover:scale-105 transition-all">"""

text = text.replace(old_main_menu, new_main_menu)

# Add the 'addons' submenu
old_addons = """                   )}
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>"""

new_addons = """                   )}
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>"""

addons_menu = """
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
"""

# I need to insert this right after logo menu closes, which is:
logo_end = """                      <div className="bg-blue-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                          <LucideUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide text-center">Add Logo</span>
                   </button>
                </>
             )}"""

text = text.replace(logo_end, logo_end + "\n" + addons_menu)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated UI")
