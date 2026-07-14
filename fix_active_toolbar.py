import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Add opacity slider to active object toolbar
old_shadow = """                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => changeShadow(!(activeObj as any).shadow)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] sm:text-xs font-bold transition-colors">
                      Shadow
                   </button>
                </div>"""

new_shadow = """                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0">
                   <button onClick={() => changeShadow(!(activeObj as any).shadow)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] sm:text-xs font-bold transition-colors">
                      Shadow
                   </button>
                </div>
                <div className="flex items-center gap-2 border-r pr-4 border-gray-200 shrink-0 min-w-[100px]">
                   <span className="text-[10px] sm:text-xs font-bold text-gray-500">Opacity</span>
                   <input type="range" min="0" max="1" step="0.05" value={activeObj.opacity ?? 1} onChange={(e) => {
                       if (!canvas || !activeObj) return;
                       activeObj.set('opacity', parseFloat(e.target.value));
                       canvas.renderAll();
                       saveHistory(canvas);
                   }} className="w-16 sm:w-20 accent-charcoal" />
                </div>"""

text = text.replace(old_shadow, new_shadow)

# Wait, the opacity slider should probably be shown for ANY active object, not just text!
# Let's put it OUTSIDE of the text-only condition.
