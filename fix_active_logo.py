import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Add logo editing block
old_shadow = """            <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0 min-w-[100px]">
               <span className="text-[10px] sm:text-xs font-bold text-gray-500">Opacity</span>
               <input type="range" min="0" max="1" step="0.05" value={activeObj.opacity ?? 1} onChange={(e) => {
                   if (!canvas || !activeObj) return;
                   activeObj.set('opacity', parseFloat(e.target.value));
                   canvas.renderAll();
                   saveHistory(canvas);
               }} className="w-16 sm:w-20 accent-charcoal" />
            </div>"""

new_shadow = """            <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0 min-w-[100px]">
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
            )}"""

text = text.replace(old_shadow, new_shadow)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated active logo options")
