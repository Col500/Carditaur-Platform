const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

// 1. Hide the header toolbar on mobile
code = code.replace(/<div className="flex items-center space-x-1 mr-2 bg-gray-100 p-1 rounded-lg">/, '<div className="flex items-center space-x-1 mr-2 bg-gray-100 p-1 rounded-lg hidden md:flex">');

// 2. Add floating toolbar to the canvas container for mobile
const canvasWrapperStr = `<div ref={containerRef} className="flex-1 bg-zinc-800 overflow-auto p-4 sm:p-8 order-1 md:order-2 relative z-0 min-h-0 flex items-center justify-center">`;
const newCanvasWrapperStr = `<div ref={containerRef} className="flex-1 bg-zinc-800 overflow-auto p-4 sm:p-8 order-1 md:order-2 relative z-0 min-h-0 flex items-center justify-center">
          <div className="absolute top-4 left-4 z-20 flex md:hidden bg-white/90 backdrop-blur rounded-lg shadow-lg p-1 space-x-1">
             <button onClick={undo} disabled={!canUndo} className={\`px-3 py-1.5 text-xs font-bold rounded-md transition-colors \${canUndo ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 cursor-not-allowed'}\`}>Undo</button>
             <button onClick={redo} disabled={!canRedo} className={\`px-3 py-1.5 text-xs font-bold rounded-md transition-colors \${canRedo ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 cursor-not-allowed'}\`}>Redo</button>
          </div>`;

code = code.replace(canvasWrapperStr, newCanvasWrapperStr);

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
