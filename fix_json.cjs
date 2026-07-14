const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');
code = code.replace(/const json = JSON.stringify\(c.toJSON\(\)\);/g, "const json = JSON.stringify((c as any).toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'hasControls', 'borderColor']));");
fs.writeFileSync('src/components/AdminFlyers.tsx', code);
