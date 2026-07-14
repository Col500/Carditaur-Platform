const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

code = code.replace(/export function AdminFlyers\(\) \{/, 
  "export function AdminFlyers({ onClose }: { onClose?: () => void }) {");

// We should use `onClose` to go back to the menu. However, inside AdminFlyers, when editingFlyer is true, it renders FlyerEditor. 
// Wait, FlyerEditor already has its own back button:
// <button onClick={onClose} className="text-gray-500 hover:text-charcoal mr-4 text-sm font-bold">← Back</button>
// So when editingFlyer is true, it calls onClose which sets editingFlyer to null.
// But when showing the list, we also need a close button to go back to the menu!
code = code.replace(/<div className="flex justify-between items-center mb-6">\s*<h2 className="text-xl font-bold font-display text-charcoal">Flyers Under Review<\/h2>/,
  `<div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
           {onClose && <button onClick={onClose} className="mr-4 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-charcoal">← Back</button>}
           <h2 className="text-xl font-bold font-display text-charcoal">Flyers Under Review</h2>
        </div>`);

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
