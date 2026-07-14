const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

code = code.replace(/headline: variation\.headline \|\| "",/, 'headline: generated.headline || variation.headline || "",');
fs.writeFileSync('src/pipeline.ts', code);
