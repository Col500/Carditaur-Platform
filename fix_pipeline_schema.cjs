const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

code = code.replace(/responseSchema: \{\s*type: Type.OBJECT,\s*properties: \{\s*headline: \{ type: Type.STRING \},\s*bodyMessage: \{ type: Type.STRING \},\s*signOff: \{ type: Type.STRING \},\s*contactInfo: \{ type: Type.STRING \},\s*variations: \{\s*type: Type.ARRAY,\s*items: \{\s*type: Type.OBJECT,\s*properties: \{\s*conceptName: \{ type: Type.STRING \},\s*layoutFamily: \{ type: Type.STRING \},\s*ideogramPrompt: \{ type: Type.STRING \}\s*\},\s*required: \["ideogramPrompt"\]\s*\}\s*\}\s*\},\s*required: \["headline", "bodyMessage", "variations"\]\s*\}/g, `responseSchema: {
                type: Type.OBJECT,
                properties: {
                  variations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        conceptName: { type: Type.STRING },
                        layoutFamily: { type: Type.STRING },
                        ideogramPrompt: { type: Type.STRING },
                        headline: { type: Type.STRING },
                        bodyMessage: { type: Type.STRING },
                        signOff: { type: Type.STRING },
                        contactInfo: { type: Type.STRING },
                        typography: {
                          type: Type.OBJECT,
                          properties: {
                            headlineFont: { type: Type.STRING },
                            headlineColor: { type: Type.STRING },
                            bodyFont: { type: Type.STRING },
                            bodyColor: { type: Type.STRING }
                          }
                        }
                      },
                      required: ["ideogramPrompt", "headline", "bodyMessage"]
                    }
                  }
                },
                required: ["variations"]
              }`);

fs.writeFileSync('src/pipeline.ts', code);
