const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

code = code.replace(/img\.magicPrompt = img\.prompt \|\| variation\.ideogramPrompt;/g, 'img.magicPrompt = img.prompt || variation.ideogramPrompt;\n             img.variation = variation;');

fs.writeFileSync('src/pipeline.ts', code);
