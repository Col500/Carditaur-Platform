const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const \[showAdminPanel, setShowAdminPanel\] = useState<boolean>\(false\);/, "const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);\n  const [adminTab, setAdminTab] = useState<'flyers' | 'settings'>('flyers');");

fs.writeFileSync('src/App.tsx', code);
