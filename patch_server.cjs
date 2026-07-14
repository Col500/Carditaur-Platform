const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `        try {
           const content = await fs.readFile(filePath, 'utf8');
           data = JSON.parse(content);
        } catch (err) {`;
const replacementStr = `        try {
           const content = await fs.readFile(filePath, 'utf8');
           data = JSON.parse(content).filter((f) => f.status === 'approved');
        } catch (err) {`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
