const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

code = code.replace(/\n\`;\n\}\n\n\`;\n\}/, '\n`;\n}');
fs.writeFileSync('src/pipeline.ts', code);
