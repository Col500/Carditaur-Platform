const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const content = await fs.readFile\\(filePath, 'utf8'\\);\s*data = JSON.parse\\(content\\);/, `const content = await fs.readFile(filePath, 'utf8');
           data = JSON.parse(content);
           // Only return approved flyers to the customer
           data = data.filter((f: any) => f.status === 'approved');`);

fs.writeFileSync('server.ts', code);
