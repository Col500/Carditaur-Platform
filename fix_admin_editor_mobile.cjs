const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

code = code.replace(/<div className="flex flex-1 overflow-hidden">/, `<div className="flex flex-col md:flex-row flex-1 overflow-hidden">`);

code = code.replace(/<div className="w-72 bg-white border-r border-gray-200 p-5 overflow-y-auto space-y-8 shrink-0">/, `<div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-r border-gray-200 p-5 overflow-y-auto space-y-8 shrink-0 h-[40vh] md:h-auto order-2 md:order-1">`);

code = code.replace(/<div ref=\{containerRef\} className="flex-1 bg-zinc-800 overflow-auto p-4 sm:p-8">/, `<div ref={containerRef} className="flex-1 bg-zinc-800 overflow-auto p-4 sm:p-8 order-1 md:order-2">`);

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
