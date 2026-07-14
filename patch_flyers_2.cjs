const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `const response = await fetch("/api/generate-flyers-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusinessId,
          occasionId: selectedOccasionId,
          userInput: customUserInput,
          width: selectedWidth,
          height: selectedHeight,
          writingStyle,
          designLayout,
          overrideOccasionName: activeOccasion?.name,
          isPaidUser
        }),
      });

      clearInterval(interval);
      clearInterval(pctInterval);
      setFlyerProgressPercent(100);

      if (response.ok) {
        const data = await response.json();
        setGeneratedFlyers(data.flyers);
        setCurrentFlyerIndex(0);
        setActiveTab("monitor");
      } else {
        alert("Server returned an error generating the flyer. Check logs.");
      }`;

content = content.replace(/const response = await fetch\("\/api\/generate-flyer"[\s\S]*?alert\("Server returned an error generating the flyer\. Check logs\."\);\s*\}/, replacement);

fs.writeFileSync('src/App.tsx', content);
console.log('Done patch 2 fixed');
