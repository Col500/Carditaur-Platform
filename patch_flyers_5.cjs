const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/className="absolute right-4 top-1\/2 -translate-y-1\/2 z-50 w-14 h-14 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-\[\#1E824C\] hover:bg-gray-50 transition-all hover:scale-105"/, `className="fixed right-6 bottom-6 z-50 w-16 h-16 bg-[#1E824C] rounded-full shadow-2xl border border-[#15643A] flex items-center justify-center text-white hover:bg-[#15643A] transition-all hover:scale-105"`);

fs.writeFileSync('src/App.tsx', content);
console.log('Done patch 5');
