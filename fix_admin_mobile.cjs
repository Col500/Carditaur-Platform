const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<motion\.div\s*initial=\{\{ opacity: 0 \}\}\s*animate=\{\{ opacity: 1 \}\}\s*exit=\{\{ opacity: 0 \}\}\s*className="fixed inset-0 z-\[120\] flex items-center justify-center p-4 bg-black\/60 backdrop-blur-md"\s*>/, `<motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center sm:p-4 bg-white sm:bg-black/60 sm:backdrop-blur-md"
          >`);

code = code.replace(/className="bg-white rounded-\[2rem\] p-6 w-full max-w-6xl shadow-2xl relative h-\[90vh\] overflow-hidden flex flex-col"/, `className="bg-white w-full h-full sm:rounded-[2rem] sm:p-6 sm:max-w-6xl sm:shadow-2xl relative sm:h-[90vh] overflow-hidden flex flex-col p-4"`);

fs.writeFileSync('src/App.tsx', code);
