const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

const updatedSchema = `responseSchema: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  bodyMessage: { type: Type.STRING },
                  signOff: { type: Type.STRING },
                  contactInfo: { type: Type.STRING },
                  variations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        conceptName: { type: Type.STRING },
                        layoutFamily: { type: Type.STRING },
                        ideogramPrompt: { type: Type.STRING }
                      },
                      required: ["ideogramPrompt"]
                    }
                  }
                },
                required: ["headline", "bodyMessage", "variations"]
              }`;

code = code.replace(/responseSchema: \{[\s\S]*?required: \["variations"\]\n\s*\}/g, updatedSchema);
fs.writeFileSync('src/pipeline.ts', code);
