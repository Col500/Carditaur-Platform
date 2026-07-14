import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

# Add trash overlay
overlay = """             <canvas ref={canvasRef}></canvas>
             
             {isDragging && (
                <div className={`absolute bottom-4 left-4 w-16 h-16 rounded-full flex items-center justify-center transition-all ${isHoveringTrash ? 'bg-red-500 scale-125 text-white' : 'bg-red-100 text-red-500 opacity-50'}`}>
                    <LucideTrash2 className="w-8 h-8" />
                </div>
             )}
          </div>"""

text = text.replace("             <canvas ref={canvasRef}></canvas>\n          </div>", overlay)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated trash overlay")
