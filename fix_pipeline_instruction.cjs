const fs = require('fs');
let code = fs.readFileSync('src/pipeline.ts', 'utf8');

// Replace the FLYER COPY section
code = code.replace(/═══════════════════════════════\nFLYER COPY \(Admin reserves these\)\n═══════════════════════════════\nWrite the following copy. It applies to all three concepts equally.\n1. Headline \(Short, punchy title\)\n2. Body Message \(A warm occasion-specific opening, 2-3 sentences. Never rigid, always human. Max 35 words.\)\n3. Sign-Off \(If provided in profile, use it. E.g. "Warm regards, John Doe, Managing Director"\)\n4. Contact Info \(Format clearly using provided phone\/email\/socials from the business profile\)/, `═══════════════════════════════
FLYER COPY (Admin reserves these)
═══════════════════════════════
Write the following copy FOR EACH VARIATION. Each variation must have distinct wording to match its unique concept/mood:
1. Headline (Short, punchy title)
2. Body Message (A warm occasion-specific opening, 2-3 sentences. Never rigid, always human. Max 35 words.)
3. Sign-Off (If provided in profile, use it. E.g. "Warm regards, John Doe, Managing Director")
4. Contact Info (Format clearly using provided phone/email/socials from the business profile)

You must also recommend specific Typography (font families and hex colors) for the admin to use when they overlay these text blocks onto the generated image.`);

// Replace the OUTPUT FORMAT section
code = code.replace(/raw JSON only.*?\]\s*\n\}/s, `Raw JSON only. No explanation. No preamble. No markdown fences.
Start with { end with }.

{
  "variations": [
    {
      "conceptName": "string — creative direction label",
      "layoutFamily": "string — layout family used",
      "ideogramPrompt": "string — max 150 words, includes ONLY business name and headline",
      "headline": "string — short punchy title",
      "bodyMessage": "string — the main body text",
      "signOff": "string — formatted sign-off if applicable",
      "contactInfo": "string — formatted contact details",
      "typography": {
        "headlineFont": "string — e.g. 'Space Grotesk' or 'Fredoka'",
        "headlineColor": "string — hex code",
        "bodyFont": "string — e.g. 'Inter' or 'JetBrains Mono'",
        "bodyColor": "string — hex code"
      }
    }
  ]
}`);

fs.writeFileSync('src/pipeline.ts', code);
