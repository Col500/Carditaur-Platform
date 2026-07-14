import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_logo = """                   <button onClick={() => setActiveToolMenu('logo')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 text-blue-600">
                          <LucideImage className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Profile Logo</span>
                   </button>"""

new_logo = """                   <button onClick={() => setActiveToolMenu('logo')} className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
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
                   </button>"""

text = text.replace(old_logo, new_logo)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated main menu")
