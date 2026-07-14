import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

old_add = """  const addShape = (type: string) => {
    if (!canvas) return;
    let shape: fabric.Object | null = null;
    const center = { left: canvas.width! / canvas.getZoom() / 2, top: canvas.height! / canvas.getZoom() / 2 };
    
    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 50, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'rectangle') {
        shape = new fabric.Rect({ width: 100, height: 100, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill: '#1E824C', originX: 'center', originY: 'center', ...center });
    } else if (type === 'star') {
        const starPoints = [
            {x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57},
            {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57},
            {x: 2, y: 35}, {x: 39, y: 35}
        ];
        shape = new fabric.Polygon(starPoints, { fill: '#F5A623', originX: 'center', originY: 'center', ...center });
    } else if (type === 'glitter') {
        shape = new fabric.Textbox('✦', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#F5A623', fontFamily: 'Arial' });
    } else if (type === 'confetti') {
        shape = new fabric.Textbox('✺', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#E52B50', fontFamily: 'Arial' });
    }
    
    if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        saveHistory(canvas);
    }
  };"""
  
new_add = """  const addShape = (type: string, outlined = false) => {
    if (!canvas) return;
    let shape: fabric.Object | null = null;
    const center = { left: canvas.width! / canvas.getZoom() / 2, top: canvas.height! / canvas.getZoom() / 2 };
    
    const fill = outlined ? 'transparent' : '#1E824C';
    const stroke = outlined ? '#1E824C' : undefined;
    const strokeWidth = outlined ? 4 : 0;
    
    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 50, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'rectangle') {
        shape = new fabric.Rect({ width: 100, height: 100, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'triangle') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill, stroke, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'star') {
        const starPoints = [
            {x: 50, y: 0}, {x: 61, y: 35}, {x: 98, y: 35}, {x: 68, y: 57},
            {x: 79, y: 91}, {x: 50, y: 70}, {x: 21, y: 91}, {x: 32, y: 57},
            {x: 2, y: 35}, {x: 39, y: 35}
        ];
        shape = new fabric.Polygon(starPoints, { fill: outlined ? 'transparent' : '#F5A623', stroke: outlined ? '#F5A623' : undefined, strokeWidth, originX: 'center', originY: 'center', ...center });
    } else if (type === 'glitter') {
        shape = new fabric.Textbox('✦', { fontSize: 80, originX: 'center', originY: 'center', ...center, fill: '#F5A623', stroke: outlined ? '#F5A623' : undefined, strokeWidth: outlined ? 2 : 0, fontFamily: 'Arial' });
    }
    
    if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        saveHistory(canvas);
    }
  };"""

text = text.replace(old_add, new_add)

# Replace activeToolMenu === 'shapes' contents
old_shapes_menu = """             {activeToolMenu === 'shapes' && (
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
             )}"""

new_shapes_menu = """             {activeToolMenu === 'shapes' && (
                <>
                   <button onClick={() => setActiveToolMenu('main')} className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 sm:mb-2 text-gray-700">
                          <LucideUndo2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">Back</span>
                   </button>
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <div className="flex flex-col gap-1 items-center justify-center px-2">
                       <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Filled</span>
                       <div className="flex gap-2">
                           <button onClick={() => addShape('circle')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 rounded-full bg-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('rectangle')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 bg-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('triangle')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-transparent border-b-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('star')} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all font-bold text-xs">
                              ★
                           </button>
                       </div>
                   </div>

                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>

                   <div className="flex flex-col gap-1 items-center justify-center px-2">
                       <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Outlined</span>
                       <div className="flex gap-2">
                           <button onClick={() => addShape('circle', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 rounded-full border-2 border-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('rectangle', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <div className="w-4 h-4 border-2 border-charcoal"></div>
                           </button>
                           <button onClick={() => addShape('triangle', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="12 2 22 20 2 20 12 2"></polygon></svg>
                           </button>
                           <button onClick={() => addShape('star', true)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal transition-all">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                           </button>
                       </div>
                   </div>
                   
                   <div className="w-px h-10 bg-gray-200 shrink-0 mx-1"></div>
                   
                   <button onClick={() => addShape('glitter')} className="flex flex-col items-center justify-center min-w-[60px] text-gray-500 hover:text-charcoal hover:scale-105 transition-all">
                      <div className="bg-gray-100 p-2 rounded-full mb-1 text-charcoal"><LucideSparkles className="w-4 h-4" /></div>
                      <span className="text-[9px] font-bold">Glitter</span>
                   </button>
                </>
             )}"""

text = text.replace(old_shapes_menu, new_shapes_menu)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated shapes menu")
