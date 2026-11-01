import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';
import FormData from 'form-data';

// API Constants & Dynamic Key Resolution
let IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || "";
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
  extractedColors?: string[];
  brandTone?: string;
  useSignOff?: boolean;
  signOffName?: string;
  signOffRole?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  xUsername?: string;
  description?: string;
  customEvents?: { id: string; name: string; date: string; type: 'birthday' | 'anniversary' | 'other'; notes?: string; isAnnual?: boolean }[];
}

export interface OccasionRecord {
  id: string;
  name: string;
  date: string;
  culturalContext?: string;
}

export interface SizeConfig {
  aspectRatio: string;
  width: number;
  height: number;
  label: string;
}

export const DIVERSE_SIZE_PRESETS: SizeConfig[] = [
  { aspectRatio: "1x1", width: 1080, height: 1080, label: "Square (1:1)" },
  { aspectRatio: "9x16", width: 1080, height: 1920, label: "Story / Status (9:16)" },
  { aspectRatio: "4x5", width: 1080, height: 1350, label: "Portrait Feed (4:5)" },
  { aspectRatio: "3x4", width: 1080, height: 1440, label: "Poster (3:4)" },
  { aspectRatio: "16x9", width: 1920, height: 1080, label: "Landscape (16:9)" },
];

export function resolveAspectRatioAndDimensions(
  sizePreset?: string,
  customWidth?: number,
  customHeight?: number,
  variationIndex: number = 0
): SizeConfig {
  const normalizedPreset = (sizePreset || "auto-diverse").toLowerCase().trim();

  // If customer explicitly requested a fixed single size:
  if (normalizedPreset === "1080x1080" || normalizedPreset === "1x1" || normalizedPreset === "square" || normalizedPreset === "1:1") {
    return { aspectRatio: "1x1", width: 1080, height: 1080, label: "Square (1:1)" };
  }
  if (normalizedPreset === "1080x1350" || normalizedPreset === "4x5" || normalizedPreset === "portrait" || normalizedPreset === "4:5") {
    return { aspectRatio: "4x5", width: 1080, height: 1350, label: "Portrait Feed (4:5)" };
  }
  if (normalizedPreset === "1080x1920" || normalizedPreset === "9x16" || normalizedPreset === "story" || normalizedPreset === "status" || normalizedPreset === "9:16") {
    return { aspectRatio: "9x16", width: 1080, height: 1920, label: "Story / Status (9:16)" };
  }
  if (normalizedPreset === "1920x1080" || normalizedPreset === "16x9" || normalizedPreset === "landscape" || normalizedPreset === "16:9") {
    return { aspectRatio: "16x9", width: 1920, height: 1080, label: "Landscape (16:9)" };
  }
  if (normalizedPreset === "1080x1440" || normalizedPreset === "3x4" || normalizedPreset === "3:4") {
    return { aspectRatio: "3x4", width: 1080, height: 1440, label: "Poster (3:4)" };
  }

  // If custom width and height are provided and not auto-diverse
  if (customWidth && customHeight && normalizedPreset !== "auto-diverse") {
    const ratio = customWidth / customHeight;
    if (ratio >= 0.95 && ratio <= 1.05) {
      return { aspectRatio: "1x1", width: customWidth, height: customHeight, label: `Square (${customWidth}x${customHeight})` };
    } else if (ratio >= 0.72 && ratio <= 0.85) {
      return { aspectRatio: "4x5", width: customWidth, height: customHeight, label: `Portrait (${customWidth}x${customHeight})` };
    } else if (ratio >= 0.5 && ratio <= 0.65) {
      return { aspectRatio: "9x16", width: customWidth, height: customHeight, label: `Story (${customWidth}x${customHeight})` };
    } else if (ratio >= 0.66 && ratio <= 0.78) {
      return { aspectRatio: "3x4", width: customWidth, height: customHeight, label: `Poster (${customWidth}x${customHeight})` };
    } else if (ratio >= 1.5 && ratio <= 1.9) {
      return { aspectRatio: "16x9", width: customWidth, height: customHeight, label: `Landscape (${customWidth}x${customHeight})` };
    }
    return { aspectRatio: "1x1", width: customWidth, height: customHeight, label: `Custom (${customWidth}x${customHeight})` };
  }

  // Default: Auto (Diverse Multi-Sizes across the generations: 1x1, 4x5, 9x16)
  return DIVERSE_SIZE_PRESETS[variationIndex % DIVERSE_SIZE_PRESETS.length];
}

export async function updateApiKeysFromConfig() {
  if (process.env.IDEOGRAM_API_KEY) {
    IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY;
  }
  if (process.env.DEEPSEEK_API_KEY) {
    DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  }
  try {
     const configData = await fs.readFile(path.join(process.cwd(), 'data', 'config.json'), 'utf8');
     const config = JSON.parse(configData);
     if (config.ideogramApiKey) IDEOGRAM_API_KEY = config.ideogramApiKey;
     if (config.deepseekApiKey) DEEPSEEK_API_KEY = config.deepseekApiKey;
  } catch(e) {}
}

export function getIdeogramApiKey(): string {
  return process.env.IDEOGRAM_API_KEY || IDEOGRAM_API_KEY || "";
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

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI(geminiKey ? { apiKey: geminiKey } : {});
  
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const targetNewYear = currentMonth >= 9 ? currentYear + 1 : currentYear;

  const systemInstruction = getSystemInstruction(currentMonthName, currentYear);

  const examplePromptsText = examplePrompts.length > 0 
    ? '\nINSPIRATION STYLE GUIDES (Extract techniques only: extract composition angles, visual hierarchy techniques, and lighting styles from these examples. Do NOT copy the exact text, industry, or subjects from the examples directly):\n' + examplePrompts.slice(0, 2).map((p, i) => 'Style Reference ' + (i+1) + ':\n' + p).join('\n\n') 
    : '';

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
  const maxRetries = 2;

  let lastError = "";
  if (geminiKey) {
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
            lastError = err.message || "Unknown error";
            retryCount++;
            if (lastError.includes("429") || lastError.includes("quota") || lastError.includes("RESOURCE_EXHAUSTED") || lastError.includes("503") || lastError.includes("UNAVAILABLE")) {
                break;
            }
        }
    }
  }

  // Fallback to DeepSeek if Gemini fails and we have a key
  if (DEEPSEEK_API_KEY) {
      try {
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
              },
              timeout: 20000
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
          console.warn("DeepSeek generation failed:", deepseekErr.message);
      }
  }

  throw new Error(`AI generation failed: ${lastError || 'Unable to generate copy with AI. Please check your API key.'}`);
}

export async function generateFlyersBatch(
  businessId: string, 
  occasionId: string, 
  overrideOccasionName?: string, 
  numImages: number = 2,
  options?: {
    sizePreset?: string;
    width?: number;
    height?: number;
    aspectRatios?: string[];
    tempBiz?: Partial<BusinessRecord>;
  }
) {
  const startTime = Date.now();
  console.log(`--- Starting New Flyer Pipeline for Business ${businessId}, Occasion ${overrideOccasionName || occasionId} (${numImages} variations) ---`);

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
  if (options?.tempBiz) {
    business = {
      id: businessId || 'temp',
      businessName: options.tempBiz.businessName || 'My Brand',
      industry: options.tempBiz.industry || 'Business',
      location: options.tempBiz.location || 'Lagos, Nigeria',
      brandColor: options.tempBiz.brandColor || '#1E824C',
      accentColor: options.tempBiz.accentColor || '#45B1E8',
      extractedColors: options.tempBiz.extractedColors || [],
      brandTone: options.tempBiz.brandTone || 'corporate',
      logoUrl: options.tempBiz.logoUrl || '',
      phone: options.tempBiz.phone || '',
      email: options.tempBiz.email || '',
      instagram: options.tempBiz.instagram || '',
    };
  } else if (!business) {
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
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI(geminiKey ? { apiKey: geminiKey } : {});
  
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const targetNewYear = currentMonth >= 9 ? currentYear + 1 : currentYear;

  const systemInstruction = getSystemInstruction(currentMonthName, currentYear);

  const examplePromptsText = examplePrompts.length > 0 
    ? '\nINSPIRATION STYLE GUIDES (Extract techniques only: extract composition angles, visual hierarchy techniques, and lighting styles from these examples. Do NOT copy the exact text, industry, or subjects from the examples directly):\n' + examplePrompts.slice(0, 2).map((p, i) => 'Style Reference ' + (i+1) + ':\n' + p).join('\n\n') 
    : '';

  const formatContextLines = Array.from({ length: numImages }).map((_, idx) => {
    const size = resolveAspectRatioAndDimensions(options?.sizePreset, options?.width, options?.height, idx);
    return `Variation ${idx + 1} Target Canvas: ${size.label} (Aspect Ratio ${size.aspectRatio})`;
  }).join('\n');

  const promptText = `SYSTEM CONTEXT - REAL CURRENT DATE AND TIME: ${currentDate}
CURRENT SEASON NEW YEAR TARGET: ${targetNewYear} (If this is a New Year occasion, use ${targetNewYear} in the flyer text. If we are late in the year, it's for the upcoming year.)
NUMBER OF VARIATIONS NEEDED: ${numImages}
(Each variation should have a unique, distinct copy, appropriate composition for its canvas size, and a slightly different artistic prompt.)
TARGET CANVAS SIZES:
${formatContextLines}${examplePromptsText}

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
  const maxRetries = 2;

  if (geminiKey) {
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
                generated.usedModel = 'Gemini (gemini-2.5-flash)';
                break; // Success
            }
        } catch (err: any) {
            retryCount++;
            console.warn(`Gemini generation attempt ${retryCount}/${maxRetries} failed:`, err.message);
            if (err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
  }

  // Fallback to DeepSeek if Gemini was not configured or failed
  if ((!generated.variations || generated.variations.length === 0) && DEEPSEEK_API_KEY) {
      try {
          console.log("Using DeepSeek model for copy generation...");
          const deepseekRes = await axios.post('https://api.deepseek.com/chat/completions', {
              model: "deepseek-reasoner",
              messages: [
                  { role: "system", content: systemInstruction + `\n\nReturn ONLY a JSON object with a 'variations' array containing exactly ${numImages} objects with 'headline', 'bodyMessage', and 'ideogramPrompt' properties. Return valid JSON.` },
                  { role: "user", content: promptText }
              ],
              response_format: { type: "text" }
          }, {
              headers: {
                  'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                  'Content-Type': 'application/json'
              },
              timeout: 20000
          });
          
          let responseText = deepseekRes.data.choices[0].message.content || '{}';
          responseText = responseText.replace(/^```json\s*/im, '').replace(/```\s*$/m, '').trim();
          generated = JSON.parse(responseText);
          if (generated.variations && generated.variations.length > 0) {
              generated.usedModel = 'DeepSeek (deepseek-reasoner)';
          }
      } catch (deepseekErr: any) {
          console.warn("DeepSeek generation failed (gracefully caught):", deepseekErr.message);
      }
  }

  // If neither AI model returned variations, throw error
  if (!generated.variations || generated.variations.length === 0) {
      throw new Error('AI copy generation failed: Neither Gemini nor DeepSeek produced valid flyer copy. Please verify your AI API keys in settings.');
  }

  // Ensure we have enough variations
  while (generated.variations.length < numImages) {
     generated.variations.push(generated.variations[0]);
  }

  console.log(`Generated ${generated.variations.length} variations via ${generated.usedModel}.`);

  // 4. Stage 2: Call Ideogram API for the requested variations (Default: 2 variations)
  console.log(`Stage 2: Calling Ideogram API for ${numImages} variations...`);
  
  const activeIdeogramKey = getIdeogramApiKey();
  if (!activeIdeogramKey) {
    throw new Error('Ideogram API Key is missing. Please configure your IDEOGRAM_API_KEY in the AI Studio Secrets panel or Admin Settings.');
  }

  let ideogramResponses = [];
  try {
     const reqs = generated.variations.slice(0, numImages).map(async (variation: any, idx: number) => {
        const sizeConfig = resolveAspectRatioAndDimensions(options?.sizePreset, options?.width, options?.height, idx);
        
        console.log(`Calling Ideogram 4.0 Default API for variation ${idx + 1} with aspect_ratio: ${sizeConfig.aspectRatio} (${sizeConfig.label})...`);
        const ideogramRes = await axios.post('https://api.ideogram.ai/v1/ideogram-v4/generate', {
          text_prompt: variation.ideogramPrompt,
          rendering_speed: "DEFAULT",
          aspect_ratio: sizeConfig.aspectRatio
        }, {
          headers: {
            'Api-Key': activeIdeogramKey,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        });

        const ideogramData = ideogramRes.data?.data?.[0];
        return {
            url: ideogramData?.url,
            variation: variation,
            greetingMessage: variation.greetingMessage || variation.bodyMessage,
            ideogramPrompt: variation.ideogramPrompt,
            magicPrompt: ideogramData?.prompt || variation.ideogramPrompt,
            sizeConfig: sizeConfig,
            rawResolution: ideogramData?.resolution
        };
     });
     
     ideogramResponses = await Promise.all(reqs);
  } catch (err: any) {
    const errorDetails = err.response?.data?.message || err.response?.data?.error || err.message;
    console.error('Ideogram API Error:', err.response?.data || err.message);
    throw new Error(`Ideogram API failed: ${errorDetails}`);
  }

  if (ideogramResponses.length === 0) {
    throw new Error('No images returned from Ideogram');
  }

  // Ensure public/flyers exists
  const flyersDir = path.resolve(process.cwd(), 'public', 'flyers');
  await fs.mkdir(flyersDir, { recursive: true });

  const finalFlyers = [];

  for (let i = 0; i < ideogramResponses.length; i++) {
    const variation = ideogramResponses[i].variation;
    const sizeConfig = ideogramResponses[i].sizeConfig || resolveAspectRatioAndDimensions(options?.sizePreset, options?.width, options?.height, i);
    const imageUrl = ideogramResponses[i].url;
    
    if (!imageUrl) {
      throw new Error(`Ideogram did not provide an image download URL for variation ${i+1}`);
    }
    
    // Download the generated image
    console.log(`Downloading Ideogram image ${i+1}...`);
    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const imageBuffer = Buffer.from(imageRes.data);

    const filename = `${business.id}_${occasion.id}_${Date.now()}_${i}.jpg`;
    const outputPath = path.resolve(flyersDir, filename);

    await fs.writeFile(outputPath, imageBuffer);
    console.log(`Final flyer saved to: ${outputPath}`);
    
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
          width: sizeConfig.width,
          height: sizeConfig.height,
          aspectRatio: sizeConfig.aspectRatio,
          formatLabel: sizeConfig.label
      },
      debug: {
        geminiPrompt: ideogramResponses[i].ideogramPrompt,
        magicPrompt: ideogramResponses[i].magicPrompt,
        usedModel: generated.usedModel,
        aspectRatio: sizeConfig.aspectRatio,
        formatLabel: sizeConfig.label,
        ideogramResponse: {
          ...ideogramResponses[i],
          resolution: ideogramResponses[i].rawResolution || `${sizeConfig.width}x${sizeConfig.height}`
        },
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
