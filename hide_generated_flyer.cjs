const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setGeneratedFlyers\\(data.flyers\\);\s*setCurrentFlyerIndex\\(0\\);\s*setActiveTab\\("monitor"\\);/, `// Don't show pending flyers to customer immediately
        setGeneratedFlyers([]);
        showToast("Flyer request sent! Our creative team is reviewing and finalizing your designs.", "success");
        // setActiveTab("monitor"); // They don't need to go to monitor if there are no flyers yet`);

fs.writeFileSync('src/App.tsx', code);
