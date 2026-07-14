import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_colors = """                   <button onClick={() => changeColor('#ffffff')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
                   <button onClick={() => changeColor('#000000')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
                   {business?.brandColor && <button onClick={() => changeColor(business.brandColor)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: business.brandColor }} title="Brand Color"></button>}
                   {business?.accentColor && <button onClick={() => changeColor(business.accentColor)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: business.accentColor }} title="Accent Color"></button>}
                   {Array.from(new Set(business?.extractedColors || [])).filter(c => c !== business.brandColor && c !== business.accentColor).slice(0, 3).map((col: string) => (
                      <button key={col} onClick={() => changeColor(col)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: col }}></button>
                   ))}"""

new_colors = """                   <button onClick={() => changeColor('#ffffff')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:scale-110 transition-transform"></button>
                   <button onClick={() => changeColor('#000000')} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black border border-gray-800 shadow-sm hover:scale-110 transition-transform"></button>
                   {Array.from(new Set([business?.brandColor, business?.accentColor, ...(business?.extractedColors || [])].filter(Boolean).map(c => c.toLowerCase()))).filter(c => c !== '#ffffff' && c !== '#000000').slice(0, 5).map((col: string) => (
                      <button key={col} onClick={() => changeColor(col)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm hover:scale-110 transition-transform border border-gray-200" style={{ backgroundColor: col }}></button>
                   ))}"""

text = text.replace(old_colors, new_colors)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Replaced colors")
