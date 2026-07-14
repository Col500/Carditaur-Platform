const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

const changeFontStr = `const changeFont = (fontFamily: string) => {
     if (!activeObj || !canvas) return;
     if (activeObj.type === 'i-text' || activeObj.type === 'textbox' || activeObj.type === 'text') {
        activeObj.set('fontFamily', fontFamily);
     }
     canvas.renderAll();
  };`;

code = code.replace(/const changeShadow = \(hasShadow: boolean\) => \{/, changeFontStr + '\n\n  const changeShadow = (hasShadow: boolean) => {');

const fontSelectorUI = `<div>
                       <span className="text-[10px] font-bold text-gray-500 block mb-2">Font Family</span>
                       <select 
                          className="w-full text-xs p-2 border border-gray-200 rounded-lg text-charcoal outline-none focus:border-blue-400"
                          onChange={(e) => changeFont(e.target.value)}
                          value={(activeObj as any)?.fontFamily || 'Fredoka'}
                       >
                         <option value="Fredoka">Fredoka</option>
                         <option value="Space Grotesk">Space Grotesk</option>
                         <option value="Inter">Inter</option>
                         <option value="JetBrains Mono">JetBrains Mono</option>
                         <option value="Arial">Arial</option>
                         <option value="Times New Roman">Times New Roman</option>
                       </select>
                   </div>
                   
                   <div>`;

code = code.replace(/<div>\s*<span className="text-\[10px\] font-bold text-gray-500 block mb-2">Effects<\/span>/, fontSelectorUI + '\n                       <span className="text-[10px] font-bold text-gray-500 block mb-2">Effects</span>');

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
