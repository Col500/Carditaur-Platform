import { FONT_CATALOG, CATEGORY_FALLBACKS } from './fontCatalog';

export interface DesignElements {
  fontDisplay: string;
  fontBody: string;
  overlayType?: string; // 'gradient', 'solid', 'none'
  overlayOpacity: number;
  decorativeShapes: string[]; // 'snow', 'confetti', 'candles', 'leaves', etc
  effectClass?: string; // e.g. 'blur-glass'
  dividerLine?: boolean;
}

const OCCASION_TAGS: Record<string, string[]> = {
  "christmas": ["fun", "emotional", "playful"],
  "democracy": ["serious", "formal", "community"],
  "birthday": ["fun", "casual", "playful", "emotional"],
  "valentines": ["emotional", "elegant", "formal"],
  "independence": ["formal", "community", "serious"],
  "eid": ["formal", "community", "emotional"],
  "new_years": ["fun", "modern", "bold"],
  "children": ["fun", "cartoon", "playful", "casual"],
  "anniversary": ["elegant", "formal", "emotional"]
};

// Map occasions to specific decorative shapes
const DECORATIVE_MAPPINGS: Record<string, string[]> = {
  "christmas": ["snow particles", "soft glows"],
  "eid": ["crescent + stars", "soft glows"],
  "democracy": ["flag ribbon", "divider lines"],
  "independence": ["flag ribbon", "soft glows"],
  "children": ["balloons + confetti", "abstract waves"],
  "birthday": ["balloons + confetti", "circles"],
  "valentines": ["soft glows", "circles", "gradient overlays"],
  "new_years": ["confetti", "soft glows", "diagonal shapes"],
  "anniversary": ["soft glows", "divider lines"]
};

export function selectDesignElements(occasionName: string): DesignElements {
  const occLower = occasionName.toLowerCase();
  
  // 1. Determine tags based on occasion name
  let matchedTags: string[] = ["modern", "clean"]; // default
  let shapes: string[] = ["circles", "divider lines"]; // default
  
  for (const [key, tags] of Object.entries(OCCASION_TAGS)) {
    if (occLower.includes(key)) {
      matchedTags = tags;
      shapes = DECORATIVE_MAPPINGS[key] || shapes;
      break;
    }
  }

  // 2. Algorithm to select fonts based on tags
  // Display font: matches the primary tag
  const primaryTag = matchedTags[0];
  let fontDisplay = "Inter";
  let fontBody = "Roboto"; // always legible

  const availableDisplayFonts = FONT_CATALOG.filter(f => f.categories.includes(primaryTag));
  
  if (availableDisplayFonts.length > 0) {
    const rIdx = Math.floor(Math.random() * availableDisplayFonts.length);
    fontDisplay = availableDisplayFonts[rIdx].name;
  } else if (CATEGORY_FALLBACKS[primaryTag]) {
    const list = CATEGORY_FALLBACKS[primaryTag];
    fontDisplay = list[Math.floor(Math.random() * list.length)];
  }

  // Pick body font that isn't crazy
  const bodyCandidates = FONT_CATALOG.filter(f => f.categories.includes("clean") || f.categories.includes("professional") || f.categories.includes("versatile"));
  if (bodyCandidates.length > 0) {
    fontBody = bodyCandidates[Math.floor(Math.random() * bodyCandidates.length)].name;
  }

  // 3. Determine overlays and effects
  let overlayType = "gradient";
  let overlayOpacity = 0.5;
  let effectClass = "";
  let dividerLine = false;

  if (matchedTags.includes("formal") || matchedTags.includes("serious")) {
    overlayType = "gradient";
    overlayOpacity = 0.6;
    dividerLine = true;
  } else if (matchedTags.includes("fun") || matchedTags.includes("playful")) {
    overlayType = "solid";
    overlayOpacity = 0.3;
    effectClass = "blur-glass-effect";
  }

  return {
    fontDisplay,
    fontBody,
    overlayType,
    overlayOpacity,
    decorativeShapes: shapes,
    effectClass,
    dividerLine
  };
}
