const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/accentColor: newBizAccentColor,/g, 'accentColor: newBizAccentColor,\n          extractedColors: extractedBrand?.colors || [],');
fs.writeFileSync(file, content);
