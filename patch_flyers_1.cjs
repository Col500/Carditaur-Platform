const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Rename "Theme" to "Flyer Studio"
content = content.replace(/Button 3: Theme/g, 'Button 3: Flyer Studio');
content = content.replace(/setFlyerOverlay\("styling"\)/g, 'setFlyerOverlay("studio")');
content = content.replace(/>\s*Style\s*<\/span>/g, '> Flyer Studio </span>');

// 2. Change state variables
content = content.replace(/const \[generatedFlyer, setGeneratedFlyer\] = useState<FlyerResponse \| null>\(\s*null,\s*\);/g, 
  'const [generatedFlyers, setGeneratedFlyers] = useState<FlyerResponse[]>([]);\n  const [currentFlyerIndex, setCurrentFlyerIndex] = useState(0);\n  const [feedbackText, setFeedbackText] = useState("");\n  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);');

content = content.replace(/setGeneratedFlyer\(null\)/g, 'setGeneratedFlyers([])');

fs.writeFileSync('src/App.tsx', content);
console.log('Done step 1 and 2');
