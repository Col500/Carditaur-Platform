const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

// I need to replace from `  // Define 10 Logo Placement Templates` to `    // If no base64 logo, just save\n    }`
// Actually, I can just replace the whole Stage 3 logic.

const stage3Match = code.match(/\/\/ 5\. Stage 3: Logo Overlay using Sharp[\s\S]*?\/\/ If no base64 logo, just save\n\s*\}/);
if (stage3Match) {
  code = code.replace(/\/\/ 5\. Stage 3: Logo Overlay using Sharp[\s\S]*?\/\/ If no base64 logo, just save\n\s*\}/, `// 5. Logo overlay removed as per new architecture\n    let finalBuffer = imageBuffer;`);
} else {
  console.log("Stage 3 match not found.");
}

// Update the finalFlyers push
const finalFlyersPushMatch = code.match(/finalFlyers\.push\(\{[\s\S]*?\}\);/);
if (finalFlyersPushMatch) {
  const replacement = `const variation = ideogramResponses[i].variation;
    finalFlyers.push({
      id: "flyer_" + Date.now() + "_" + i,
      imageUrl: \`/flyers/\${filename}\`,
      status: "pending_review",
      headline: variation.headline || "",
      bodyMessage: generated.bodyMessage || variation.bodyMessage || "",
      signOff: generated.signOff || variation.signOff || "",
      contactInfo: generated.contactInfo || variation.contactInfo || "",
      greetingMessage: ideogramResponses[i].greetingMessage || 'Greeting not found',
      occasionName: occasion.name,
      createdAt: new Date().toISOString(),
      flyerData: {
          width: flyerWidth,
          height: flyerHeight
      },
      debug: {
        geminiPrompt: ideogramResponses[i].ideogramPrompt,
        magicPrompt: ideogramResponses[i].magicPrompt,
        usedModel: generated.usedModel,
        ideogramResponse: ideogramResponses[i],
        logoPlacement: null
      }
    });`;
  code = code.replace(/finalFlyers\.push\(\{[\s\S]*?\}\);/, replacement);
}

// Remove the logo templates definition since it's unused
code = code.replace(/  \/\/ Define 10 Logo Placement Templates[\s\S]*?  \];\n/, '');

fs.writeFileSync('src/pipeline.ts', code);
console.log("Updated pipeline flyer saving logic");
