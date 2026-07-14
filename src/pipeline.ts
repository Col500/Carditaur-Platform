import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';
import FormData from 'form-data';

// Placeholder API Constants
let IDEOGRAM_API_KEY = "UseZ10RT5rsI-x5MAyo_q7WGrDS3SXZPYFsjgLEmJrCBDinAaoQDSoqyjUAHgIxjSXdsp1AcYeejUMLsGN_eRQ";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
let DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

export interface BusinessRecord {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  logoUrl?: string;
  brandColor: string;
  accentColor: string;
  brandTone?: string;
  useSignOff?: boolean;
  signOffName?: string;
  signOffRole?: string;
  customEvents?: { id: string; name: string; date: string; type: 'birthday' | 'anniversary' | 'other'; notes?: string; isAnnual?: boolean }[];
}

export interface OccasionRecord {
  id: string;
  name: string;
  date: string;
  culturalContext?: string;
}

async function updateApiKeysFromConfig() {
  try {
     const configData = await fs.readFile(path.join(process.cwd(), 'data', 'config.json'), 'utf8');
     const config = JSON.parse(configData);
     if (config.ideogramApiKey) IDEOGRAM_API_KEY = config.ideogramApiKey;
     if (config.deepseekApiKey) DEEPSEEK_API_KEY = config.deepseekApiKey;
  } catch(e) {}
}

export function getSystemInstruction(currentMonthName: string, currentYear: number) {
  return `You are a creative director and copywriter for Carditaur, a premium design agency platform. Your job is to write:
1. Flyer copy (Headline, Body Message, Contact Info, Sign-off)
2. Three Ideogram image generation prompts that ONLY include the Business Name and Headline as rendered text.

Design standard: Apple marketing, Stripe visual design, luxury editorial.
Every output must feel premium, intentional, emotionally relevant.

NEVER produce: cluttered compositions, generic clipart, decorative noise,
cheap aesthetics, near-identical variations.

═══════════════════════════════
INPUT YOU RECEIVE
═══════════════════════════════

- Business Profile (name, industry, brand color, accent color, tone, sign-off details, contact info)
- Occasion (name, emotional meaning, cultural context)
- Example Library entries (2–3 pre-selected)
- Client Creative Memory (approved/rejected styles — may be empty)

═══════════════════════════════
FLYER COPY (Admin reserves these)
═══════════════════════════════
Write the following copy FOR EACH VARIATION. Each variation must have distinct wording to match its unique concept/mood:
1. Headline (Short, punchy title)
2. Body Message (A warm occasion-specific opening, 2-3 sentences. Never rigid, always human. Max 35 words.)
3. Sign-Off (If provided in profile, use it. E.g. "Warm regards, John Doe, Managing Director")
4. Contact Info (Format clearly using provided phone/email/socials from the business profile)

You must also recommend specific Typography (font families and hex colors) for the admin to use when they overlay these text blocks onto the generated image.

═══════════════════════════════
THREE DISTINCT CONCEPTS
═══════════════════════════════

Generate three concepts that are obviously and intentionally different.

Name each concept before writing it:
Concept A: [e.g. "Corporate Gravitas"]
Concept B: [e.g. "Minimal Bold Editorial"]
Concept C: [e.g. "Warm Human Celebration"]

Each concept must differ across at least three of these dimensions:
- Layout family
- Dimensions/size
- Scene subject (cityscape / abstract / human / geometric / nature)
- Color treatment (duotone / full color / monochrome / dark / light)
- Typography character (bold / elegant / minimal / dramatic)
- Compositional mood (energetic / calm / celebratory / serious)

═══════════════════════════════
IDEOGRAM PROMPT RULES
═══════════════════════════════

Maximum 150 words per prompt.
Write in pure visual language mixed with exact flyer copy.

WHAT IDEOGRAM RENDERS — include ONLY these texts:
- The full visual scene and composition
- Business name — rendered clearly and legibly in the design
- Headline

WHAT IDEOGRAM DOES NOT RENDER:
- Body message
- Sign-Off
- Contact Details
- Logo
These will be added manually in the admin panel by the creative team. DO NOT put them in the Ideogram prompt!

TEXT IN PROMPTS:
Put the Business Name and Headline in quotation marks.
Specify font style, weight, and color for each text element.

COLOR RULE:
Always reference brand color [hex] and accent color [hex] in the prompt.
Brand and accent colors must appear somewhere in the design.

Prompt structure in order:
1. Scene (inspired by design example and occasion)
2. Mood and color
3. Flyer text — ONLY Business Name and Headline
4. Decorative elements
5. Quality closer — "[3–5 mood words]. Ultra high quality, print-ready graphic design. No watermarks, no placeholder logos."

═══════════════════════════════
OUTPUT FORMAT
═══════════════════════════════

Raw JSON only. No explanation. No preamble. No markdown fences.
Start with { end with }.

{
  "headline": "string — short punchy title",
  "bodyMessage": "string — the main body text",
  "signOff": "string — formatted sign-off if applicable",
  "contactInfo": "string — formatted contact details",
  "variations": [
    {
      "conceptName": "string — creative direction label",
      "layoutFamily": "string — layout family used",
      "ideogramPrompt": "string — max 150 words, includes ONLY business name and headline"
    }
  ]
}
`;
}

export async function generatePromptPreview(businessId: string, occasionId: string, overrideOccasionName?: string) {
  await updateApiKeysFromConfig();
  const businessesPath = path.resolve(process.cwd(), 'data', 'businesses.json');
  let businesses: BusinessRecord[] = [];
  try {
    const bizData = await fs.readFile(businessesPath, 'utf8');
    businesses = JSON.parse(bizData);
  } catch (err) {
    businesses = [];
  }

  let business = businesses.find(b => b.id === businessId);
  if (!business) {
    business = {
      id: businessId || 'default',
      businessName: 'Apex Logistics',
      industry: 'Logistics',
      location: 'Abuja, Nigeria',
      brandColor: '#1F4D43',
      accentColor: '#E8B14A',
      brandTone: 'corporate'
    };
  }

  const occasionsPath = path.resolve(process.cwd(), 'data', 'occasions.json');
  let occasions: OccasionRecord[] = [];
  try {
    const occData = await fs.readFile(occasionsPath, 'utf8');
    occasions = JSON.parse(occData);
  } catch (err) {
    occasions = [];
  }

  let occasion = occasions.find(o => o.id === occasionId || o.name === occasionId);
  
  if (!occasion && business.customEvents) {
     const customEvt = business.customEvents.find((e: any) => e.id === occasionId);
     if (customEvt) {
        occasion = {
           id: customEvt.id,
           name: customEvt.name,
           date: customEvt.date || new Date().toISOString().split('T')[0],
           culturalContext: 'Custom business occasion.'
        };
     }
  }

  if (!occasion) {
    occasion = {
      id: occasionId,
      name: overrideOccasionName || occasionId,
      date: new Date().toISOString().split('T')[0],
      culturalContext: 'A special day to celebrate.'
    };
  } else if (overrideOccasionName) {
    occasion.name = overrideOccasionName;
  }

  // 0. Load example prompts
  const examplePromptsPath = path.resolve(process.cwd(), 'data', 'example_prompts.json');
  let examplePrompts: string[] = [];
  try {
    const examplesData = await fs.readFile(examplePromptsPath, 'utf8');
    examplePrompts = JSON.parse(examplesData);
  } catch (err) {
    // silently ignore if not found
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const targetNewYear = currentMonth >= 9 ? currentYear + 1 : currentYear;

  const systemInstruction = getSystemInstruction(currentMonthName, currentYear);

  const examplePromptsText = examplePrompts.length > 0 ? '\nINSPIRATION PROMPTS (Do not outright copy these inspiration prompts, just take a few things/insights from 1 or 2 of the templates to shape your prompts combined with the brand profile):\n' + examplePrompts.slice(0, 3).map((p, i) => 'Example ' + (i+1) + ':\n' + p).join('\n\n') : '';

  const promptText = `SYSTEM CONTEXT - REAL CURRENT DATE AND TIME: ${currentDate}
CURRENT SEASON NEW YEAR TARGET: ${targetNewYear} (If this is a New Year occasion, use ${targetNewYear} in the flyer text. If we are late in the year, it's for the upcoming year.)
NUMBER OF VARIATIONS NEEDED: 3
(Each variation should have a unique, distinct copy and a slightly different artistic prompt.)${examplePromptsText}

Business Profile:
Name: ${business.businessName}
Industry: ${business.industry}
Location: ${business.location}
Brand Color: ${business.brandColor}
Accent Color: ${business.accentColor}
Extracted Colors: ${(business as any).extractedColors && (business as any).extractedColors.length > 0 ? (business as any).extractedColors.slice(0,4).join(', ') : 'None'}
Tone: ${business.brandTone || 'professional'}
Sign-Off: ${business.useSignOff && business.signOffName ? 'Include sign-off: "' + business.signOffName + (business.signOffRole ? ', ' + business.signOffRole : '') + '" in the greeting message' : 'None'}

Occasion:
Name: ${occasion.name}
Date: ${occasion.date}
Cultural Context: ${occasion.culturalContext || 'Standard celebration'}`;

  let generated: any = {};
  let retryCount = 0;
  const maxRetries = 3;

  let lastError = "Failed to generate prompt";
  while (retryCount < maxRetries) {
      try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
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
              }
            }
          });
          
          let responseText = response.text || '{}';
          responseText = responseText.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim();
          generated = JSON.parse(responseText);
          
          if (generated.variations && generated.variations.length > 0) {
              return { variations: generated.variations, prompt: generated.variations[0].ideogramPrompt, greeting: generated.variations[0].greetingMessage, usedModel: 'Gemini (gemini-2.5-flash)' };
          }
      } catch (err: any) {
          lastError = "Failed: " + (err.message || "Unknown error");
          
          if (lastError.includes("429") || lastError.includes("exceeded your current quota") || lastError.includes("Quota exceeded") || lastError.includes("RESOURCE_EXHAUSTED") || lastError.includes("503") || lastError.includes("UNAVAILABLE")) {
              console.log("Gemini API overloaded or quota exceeded, gracefully falling back...");
              break; // Do not retry on quota error, fall through to fallback
          }
          
          console.warn("Gemini Preview Error (gracefully caught):", err.message);
          retryCount++;
      }
  }

  // Fallback to DeepSeek if Gemini fails and we have a key
  if (DEEPSEEK_API_KEY && (lastError.includes("429") || lastError.includes("exceeded your current quota") || lastError.includes("Quota exceeded") || lastError.includes("503") || lastError.includes("UNAVAILABLE"))) {
      try {
          console.log("Falling back to DeepSeek due to Gemini failure...");
          const deepseekRes = await axios.post('https://api.deepseek.com/chat/completions', {
              model: "deepseek-reasoner",
              messages: [
                  { role: "system", content: systemInstruction + "\n\nReturn ONLY a JSON object with a 'variations' array containing objects with 'greetingMessage' and 'ideogramPrompt' properties. Do not include markdown formatting or backticks. Return valid JSON." },
                  { role: "user", content: promptText }
              ],
              response_format: { type: "text" }
          }, {
              headers: {
                  'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                  'Content-Type': 'application/json'
              }
          });
          
          let responseText = deepseekRes.data.choices[0].message.content || '{}';
          responseText = responseText.replace(/^```json\s*/im, '').replace(/```\s*$/m, '').trim();
          generated = JSON.parse(responseText);
          
          if (generated.variations && generated.variations.length > 0) {
              return { 
                  variations: generated.variations,
                  prompt: generated.variations[0].ideogramPrompt, 
                  greeting: generated.variations[0].greetingMessage, 
                  usedModel: 'DeepSeek (deepseek-reasoner)' 
              };
          }
      } catch (deepseekErr: any) {
          console.warn("DeepSeek generation failed (gracefully caught):", deepseekErr.message);
          // Fall through to hardcoded fallback
      }
  }
  
  if (lastError.includes("429") || lastError.includes("exceeded your current quota") || lastError.includes("Quota exceeded") || lastError.includes("RESOURCE_EXHAUSTED") || lastError.includes("503") || lastError.includes("UNAVAILABLE")) {
    const hardcodedVariations = Array(3).fill({
      ideogramPrompt: `A vibrant, professional flyer designed to celebrate ${overrideOccasionName || 'a special occasion'}. The mood is corporate, elegant, and uplifting. Utilize the brand color ${business?.brandColor || '#1F4D43'} as a primary background element or dominant subject, complemented by ${business?.accentColor || '#E8B14A'} as a striking accent for details or subtle overlay patterns. Incorporate modern geometric patterns or abstract flowing lines that subtly suggest connectivity and smooth transitions, rendered with artistic discretion. The composition should feature generous negative space for a clean, sophisticated look. Consider a soft, matte finish or a subtle frosted glass texture to add depth. Text to include: 'Wishing you a truly special day filled with success and positive connections.' and '${business?.businessName || 'Apex Logistics'}'. Ensure all text colors strictly contrast well with the background. STRONGLY INSTRUCT Ideogram NOT to add any other textual information, words, letters, dates, years, or months to the flyer outside of what is explicitly requested.`,
      greetingMessage: `Wishing you a truly special day filled with success and positive connections from ${business?.businessName || 'our team'}.`
    });
    return {
      variations: hardcodedVariations,
      prompt: hardcodedVariations[0].ideogramPrompt,
      greeting: hardcodedVariations[0].greetingMessage,
      usedModel: 'Fallback Hardcoded Template'
    };
  }

  return { prompt: lastError, greeting: "Failed to generate greeting", variations: [], usedModel: 'Failed' };
}

export async function generateFlyersBatch(businessId: string, occasionId: string, overrideOccasionName?: string, numImages: number = 3) {
  const startTime = Date.now();
  console.log(`--- Starting New Flyer Pipeline for Business ${businessId}, Occasion ${overrideOccasionName || occasionId} ---`);

  // 1. Retrieve Business Record
  const businessesPath = path.resolve(process.cwd(), 'data', 'businesses.json');
  let businesses: BusinessRecord[] = [];
  try {
    const bizData = await fs.readFile(businessesPath, 'utf8');
    businesses = JSON.parse(bizData);
  } catch (err) {
    businesses = [];
  }

  let business = businesses.find(b => b.id === businessId);
  if (!business) {
    console.warn(`Business with ID ${businessId} not found, using default.`);
    business = {
      id: businessId || 'default',
      businessName: 'Apex Logistics',
      industry: 'Logistics',
      location: 'Abuja, Nigeria',
      brandColor: '#1F4D43',
      accentColor: '#E8B14A',
      brandTone: 'corporate'
    };
  }

  await updateApiKeysFromConfig();

  // 2. Retrieve Occasion Record
  const occasionsPath = path.resolve(process.cwd(), 'data', 'occasions.json');
  let occasions: OccasionRecord[] = [];
  try {
    const occData = await fs.readFile(occasionsPath, 'utf8');
    occasions = JSON.parse(occData);
  } catch (err) {
    occasions = [];
  }

  let occasion = occasions.find(o => o.id === occasionId || o.name === occasionId);
  
  if (!occasion && business.customEvents) {
     const customEvt = business.customEvents.find((e: any) => e.id === occasionId);
     if (customEvt) {
        occasion = {
           id: customEvt.id,
           name: customEvt.name,
           date: customEvt.date || new Date().toISOString().split('T')[0],
           culturalContext: 'Custom business occasion.'
        };
     }
  }

  if (!occasion) {
    occasion = {
      id: occasionId,
      name: overrideOccasionName || occasionId,
      date: new Date().toISOString().split('T')[0],
      culturalContext: 'A special day to celebrate.'
    };
  } else if (overrideOccasionName) {
    occasion.name = overrideOccasionName;
  }

  // 2.5 Load example prompts
  const examplePromptsPath = path.resolve(process.cwd(), 'data', 'example_prompts.json');
  let examplePrompts: string[] = [];
  try {
    const examplesData = await fs.readFile(examplePromptsPath, 'utf8');
    examplePrompts = JSON.parse(examplesData);
  } catch (err) {
    // silently ignore if not found
  }

  // 3. Stage 1: AI Copywriting and Prompt Generation via Gemini
  console.log('Stage 1: Generating AI copy and Ideogram prompt...');
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const targetNewYear = currentMonth >= 9 ? currentYear + 1 : currentYear;

  const systemInstruction = getSystemInstruction(currentMonthName, currentYear);

  const examplePromptsText = examplePrompts.length > 0 ? '\nINSPIRATION PROMPTS (Do not outright copy these inspiration prompts, just take a few things/insights from 1 or 2 of the templates to shape your prompts combined with the brand profile):\n' + examplePrompts.slice(0, 3).map((p, i) => 'Example ' + (i+1) + ':\n' + p).join('\n\n') : '';

  const promptText = `SYSTEM CONTEXT - REAL CURRENT DATE AND TIME: ${currentDate}
CURRENT SEASON NEW YEAR TARGET: ${targetNewYear} (If this is a New Year occasion, use ${targetNewYear} in the flyer text. If we are late in the year, it's for the upcoming year.)
NUMBER OF VARIATIONS NEEDED: ${numImages}
(Each variation should have a unique, distinct copy and a slightly different artistic prompt.)${examplePromptsText}

Business Profile:
Name: ${business.businessName}
Industry: ${business.industry}
Location: ${business.location}
Brand Color: ${business.brandColor}
Accent Color: ${business.accentColor}
Extracted Colors: ${(business as any).extractedColors && (business as any).extractedColors.length > 0 ? (business as any).extractedColors.slice(0,4).join(', ') : 'None'}
Tone: ${business.brandTone || 'professional'}
Sign-Off: ${business.useSignOff && business.signOffName ? `Include sign-off: "${business.signOffName}${business.signOffRole ? ', ' + business.signOffRole : ''}" in the greeting message` : 'None'}

Occasion:
Name: ${occasion.name}
Date: ${occasion.date}
Cultural Context: ${occasion.culturalContext || 'Standard celebration'}`;

  let generated: any = {};
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
      try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
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
              }
            }
          });
          
          let responseText = response.text || '{}';
          responseText = responseText.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim();
          generated = JSON.parse(responseText);
          
          if (generated.variations && generated.variations.length > 0) {
              break; // Success
          } else {
              throw new Error('AI generation failed to produce valid variations');
          }
      } catch (err: any) {
          retryCount++;
          
          if (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("exceeded") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
              console.log(`Gemini API overloaded or quota exceeded (attempt ${retryCount}/${maxRetries}), forcing immediate fallback...`);
              retryCount = maxRetries; // Force immediate fallback
          } else {
              console.warn(`Gemini generation failed (attempt ${retryCount}/${maxRetries}):`, err.message);
          }
          
          if (retryCount >= maxRetries) {
             let usedFallback = false;
             if (DEEPSEEK_API_KEY && (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("exceeded") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("503") || err.message?.includes("UNAVAILABLE"))) {
                try {
                    console.log("Falling back to DeepSeek due to Gemini failure...");
                    const deepseekRes = await axios.post('https://api.deepseek.com/chat/completions', {
                        model: "deepseek-reasoner",
                        messages: [
                            { role: "system", content: systemInstruction + `\n\nReturn ONLY a JSON object with a 'variations' array containing exactly ${numImages} objects with 'greetingMessage' and 'ideogramPrompt' properties. Do not include markdown formatting or backticks. Return valid JSON.` },
                            { role: "user", content: promptText }
                        ],
                        response_format: { type: "text" }
                    }, {
                        headers: {
                            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    let responseText = deepseekRes.data.choices[0].message.content || '{}';
                    responseText = responseText.replace(/^```json\s*/im, '').replace(/```\s*$/m, '').trim();
                    generated = JSON.parse(responseText);
                    
                    if (generated.variations && generated.variations.length > 0) {
                        generated.usedModel = 'DeepSeek (deepseek-reasoner)';
                        usedFallback = true;
                        break;
                    }
                } catch (deepseekErr: any) {
                    console.warn("DeepSeek generation failed (gracefully caught):", deepseekErr.message);
                    // Fallthrough
                }
             }
             
             if (!usedFallback && (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("exceeded") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("503") || err.message?.includes("UNAVAILABLE"))) {
                 console.log("Using fallback generated variations due to quota limits...");
                 generated = {
                    usedModel: 'Fallback Hardcoded Template',
                    variations: Array(numImages).fill({
                        greetingMessage: `Wishing you a truly special day filled with success and positive connections from ${business?.businessName || 'our team'}.`,
                        ideogramPrompt: `A vibrant, professional flyer designed to celebrate ${overrideOccasionName || 'a special occasion'}. The mood is corporate, elegant, and uplifting. Utilize the brand color ${business?.brandColor || '#1F4D43'} as a primary background element or dominant subject, complemented by ${business?.accentColor || '#E8B14A'} as a striking accent for details or subtle overlay patterns. Incorporate modern geometric patterns or abstract flowing lines that subtly suggest connectivity and smooth transitions, rendered with artistic discretion. The composition should feature generous negative space for a clean, sophisticated look. Consider a soft, matte finish or a subtle frosted glass texture to add depth. Text to include: 'Wishing you a truly special day filled with success and positive connections.' and '${business?.businessName || 'Apex Logistics'}'. Ensure all text colors strictly contrast well with the background. STRONGLY INSTRUCT Ideogram NOT to add any other textual information, words, letters, dates, years, or months to the flyer outside of what is explicitly requested.`
                    })
                 };
                 break;
             }
             if (!usedFallback) {
                 throw new Error(`Failed to generate content after ${maxRetries} attempts: ${err.message}`);
             }
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
  }

  if (!generated.usedModel && generated.variations && generated.variations.length > 0) {
      generated.usedModel = 'Gemini (gemini-2.5-flash)';
  }

  // Ensure we have enough variations
  while (generated.variations.length < numImages) {
     generated.variations.push(generated.variations[0]);
  }

  console.log(`Generated ${generated.variations.length} variations.`);

  // 4. Stage 2: Flyer image generation via Ideogram API
  console.log('Stage 2: Calling Ideogram API...');
  
  let ideogramResponses = [];
  try {
     const allRatios = ["ASPECT_16_9", "ASPECT_1_1", "ASPECT_9_16"]; // 1920x1080, 1080x1080, 1080x1920
     const reqs = generated.variations.slice(0, numImages).map((variation: any, idx: number) => {
        const ratio = allRatios[idx % allRatios.length];
        // Incorporate size info into prompt context
        let ratioDesc = "Landscape (1920x1080)";
        if (ratio === "ASPECT_1_1") ratioDesc = "Square (1080x1080)";
        if (ratio === "ASPECT_9_16") ratioDesc = "Portrait (1080x1920)";
        
        const payload = {
          image_request: {
            prompt: `[SIZE: ${ratioDesc}] ` + variation.ideogramPrompt,
            aspect_ratio: ratio,
            model: "V_2",
            magic_prompt_option: "ON"
          }
        };

        return axios.post('https://api.ideogram.ai/generate', payload, {
          headers: {
            'Api-Key': IDEOGRAM_API_KEY,
            'Content-Type': 'application/json'
          }
        }).then(res => ({ res, variation }));
     });
     
     const responses = await Promise.all(reqs);
     for (const item of responses) {
         const res = item.res;
         const variation = item.variation;
         
         let images = [];
         if (res.data && res.data.data) {
             images = res.data.data;
         } else if (res.data && res.data.url) {
             images = [res.data];
         } else if (res.data && res.data[0] && res.data[0].url) {
             images = res.data;
         } else {
             console.log("Unexpected Ideogram Response Format:", JSON.stringify(res.data));
             if (res.data && res.data.data) {
                 images = res.data.data;
             }
         }
         
         // Attach variation greeting and prompt to the image responses so we can use them later
         images.forEach((img: any) => {
             img.greetingMessage = variation.greetingMessage;
             img.ideogramPrompt = variation.ideogramPrompt;
             img.magicPrompt = img.prompt || variation.ideogramPrompt;
             img.variation = variation; // The API might return the magic prompt in `prompt`
             ideogramResponses.push(img);
         });
     }
  } catch (err: any) {
    console.error('Ideogram API Error:', err.response?.data || err.message);
    throw new Error('Failed to generate image from Ideogram API');
  }

  if (ideogramResponses.length === 0) {
    throw new Error('No images returned from Ideogram');
  }

  // Ensure public/flyers exists
  const flyersDir = path.resolve(process.cwd(), 'public', 'flyers');
  await fs.mkdir(flyersDir, { recursive: true });

  const finalFlyers = [];


  for (let i = 0; i < ideogramResponses.length; i++) {
    const imageUrl = ideogramResponses[i].url;
    
    // Download the generated image
    console.log(`Downloading Ideogram image ${i+1}...`);
    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageRes.data);

    // 5. Logo overlay removed as per new architecture
    let finalBuffer = imageBuffer;

    const filename = `${business.id}_${occasion.id}_${Date.now()}_${i}.jpg`;
    const outputPath = path.resolve(flyersDir, filename);

    await fs.writeFile(outputPath, finalBuffer);
    console.log(`Final composited flyer saved to: ${outputPath}`);
    
    const variation = ideogramResponses[i].variation;
    finalFlyers.push({
      id: "flyer_" + Date.now() + "_" + i,
      imageUrl: `/flyers/${filename}`,
      status: "pending_review",
      headline: variation.headline || generated.headline || "",
      bodyMessage: variation.bodyMessage || generated.bodyMessage || "",
      signOff: variation.signOff || generated.signOff || "",
      contactInfo: variation.contactInfo || generated.contactInfo || "",
      typography: variation.typography || {},
      greetingMessage: ideogramResponses[i].greetingMessage || 'Greeting not found',
      occasionName: occasion.name,
      createdAt: new Date().toISOString(),
      flyerData: {
          width: 800,
          height: 1000
      },
      debug: {
        geminiPrompt: ideogramResponses[i].ideogramPrompt,
        magicPrompt: ideogramResponses[i].magicPrompt,
        usedModel: generated.usedModel,
        ideogramResponse: ideogramResponses[i],
        logoPlacement: null
      }
    });
  }

  // 6. Save to user profile / generated flyers database
  const userFlyersPath = path.resolve(process.cwd(), 'data', `flyers_${businessId}.json`);
  let userFlyers = [];
  try {
     const existing = await fs.readFile(userFlyersPath, 'utf8');
     userFlyers = JSON.parse(existing);
  } catch (e) {
     userFlyers = [];
  }
  
  userFlyers.push(...finalFlyers);
  await fs.writeFile(userFlyersPath, JSON.stringify(userFlyers, null, 2));

  const endTime = Date.now();
  console.log(`Pipeline complete in ${(endTime - startTime) / 1000} seconds.`);

  return {
    success: true,
    flyers: finalFlyers
  };
}
