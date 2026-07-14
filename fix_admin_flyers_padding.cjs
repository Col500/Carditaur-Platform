const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

code = code.replace(/<div className="p-6 bg-white rounded-2xl shadow-xl h-full flex flex-col">/, `<div className="sm:p-6 bg-white sm:rounded-2xl sm:shadow-xl h-full flex flex-col">`);

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
