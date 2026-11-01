import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

text = re.sub(
    r'<div className="flex flex-row items-center gap-3">(\s*<button.*?</a>\s*)</div>\s*</div>\s*</div>\s*\)\)}',
    r'<div className="flex flex-row items-center gap-3">\1</div><div className="flex items-center gap-2 mt-2 bg-white/80 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-sm" style={{ zIndex: 50 }}><span className="text-xs font-mono text-gray-500 font-medium">50%</span><input type="range" min="0.5" max="2.0" step="0.1" value={flyerZoom} onChange={(e) => setFlyerZoom(parseFloat(e.target.value))} className="w-32 accent-charcoal"/><span className="text-xs font-mono text-gray-500 font-medium">200%</span><span className="text-xs font-mono text-blue-600 font-bold ml-2">{Math.round(flyerZoom * 100)}%</span></div></div></div></div>))}',
    text,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(text)
print("Regex replace done")
