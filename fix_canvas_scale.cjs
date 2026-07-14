const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

// 1. Fix canvas sizing logic
const oldInit = `           // Set canvas size to the exact image size
           c.setDimensions({ width: img.width!, height: img.height! });
           c.setZoom(1);`;

const newInit = `           // Auto-scale to fit container on mobile
           const scaleX = (containerWidth - 32) / img.width!;
           const scaleY = (containerHeight - 32) / img.height!;
           let scale = Math.min(scaleX, scaleY);
           if (scale > 1) scale = 1; // Don't upscale past 100%

           c.setDimensions({ width: img.width! * scale, height: img.height! * scale });
           c.setZoom(scale);`;

code = code.replace(oldInit, newInit);

// 2. Fix the header and buttons to be responsive
const oldHeader = `<div className="bg-white p-4 border-b flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
           <button onClick={onClose} className="text-gray-500 hover:text-charcoal mr-4 text-sm font-bold">← Back</button>
           <span className="font-bold font-display text-lg text-charcoal">Edit Flyer: {flyer.occasionName}</span>
        </div>
        <div className="flex space-x-3">
           <button onClick={downloadFlyerImage} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 shadow-sm transition-all text-charcoal">Download Draft</button>
           <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer shadow-sm transition-all text-charcoal">
              Re-Upload
              <input type="file" className="hidden" accept="image/*" onChange={handleDownloadAndReupload} />
           </label>
           <button onClick={saveFlyer} className="px-5 py-2 bg-[#1E824C] text-white rounded-lg text-xs font-bold hover:bg-[#186b3e] shadow-sm transition-all">Approve & Publish</button>
        </div>
      </div>`;

const newHeader = `<div className="bg-white p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm z-10 shrink-0 gap-4">
        <div className="flex items-center">
           <button onClick={onClose} className="text-gray-500 hover:text-charcoal mr-4 text-sm font-bold">← Back</button>
           <span className="font-bold font-display text-lg text-charcoal truncate max-w-[200px] md:max-w-xs">Edit: {flyer.occasionName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <button onClick={downloadFlyerImage} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-gray-50 shadow-sm transition-all text-charcoal">Download</button>
           <label className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-gray-50 cursor-pointer shadow-sm transition-all text-charcoal">
              Re-Upload
              <input type="file" className="hidden" accept="image/*" onChange={handleDownloadAndReupload} />
           </label>
           <button onClick={saveFlyer} className="px-3 py-1.5 bg-[#1E824C] text-white rounded-lg text-[10px] sm:text-xs font-bold hover:bg-[#186b3e] shadow-sm transition-all whitespace-nowrap">Approve & Publish</button>
        </div>
      </div>`;

code = code.replace(oldHeader, newHeader);

// 3. Make tools sidebar height smaller on mobile so flyer gets more space
code = code.replace(/h-\[40vh\] md:h-auto/, "h-[30vh] sm:h-[40vh] md:h-auto");

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
