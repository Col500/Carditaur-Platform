const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

code = code.replace(/headline: generated.headline \|\| variation.headline \|\| "",\n\s*bodyMessage: generated.bodyMessage \|\| variation.bodyMessage \|\| "",\n\s*signOff: generated.signOff \|\| variation.signOff \|\| "",\n\s*contactInfo: generated.contactInfo \|\| variation.contactInfo \|\| "",/g, `headline: variation.headline || generated.headline || "",
      bodyMessage: variation.bodyMessage || generated.bodyMessage || "",
      signOff: variation.signOff || generated.signOff || "",
      contactInfo: variation.contactInfo || generated.contactInfo || "",
      typography: variation.typography || {},`);

fs.writeFileSync('src/pipeline.ts', code);
