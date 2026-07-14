# Project Persistence Rules: Carditaur Architecture

- **Rendering Engine:** The application uses a deterministic template-based rendering engine.
- **Predefined Layouts:** Visual layouts are predefined using structured templates (HTML/CSS or canvas-based).
- **Rule-Based Selection:** When a user selects an event, a rule-based engine selects an appropriate template based on industry, tone, and occasion metadata.
- **Targeted AI Usage:** A lightweight AI component is optionally used ONLY for generating copy (headlines, greetings, captions) and for suggesting stock image search queries.
- **Strictly Deterministic Rendering:** The frontend renders the final output using a deterministic renderer (Puppeteer/Remotion), ensuring consistent spacing, typography, and branding.
- **Combinatorial Design System:** You are not designing individual flyers—you are building a combinatorial design system. A single template is a structured layout with interchangeable parameters, not a fixed design.
- **Scale via Multiplication:** Scale comes from multiplying variation layers: layouts (e.g., 50 structures) × fonts and typography systems × color themes × assets × text patterns × micro-layout tweaks (alignment, spacing, crop, opacity).
- **Perceived Uniqueness:** Perceived uniqueness comes mainly from images, color, typography, and wording, not fundamentally different layouts.
- **Assembly over Generation:** You are assembling parameterized variations of one system, not using AI to generate visual layouts.
- **Model-Agnostic Prompting:** All prompt engineering rules for copywriting and image generation must be model-agnostic. Any prompt guidelines or corrections provided should apply globally to all models (Gemini, DeepSeek, ChatGPT). Maintain shared instruction variables (e.g., `systemInstruction`, `promptText`) to ensure logic is not duplicated.
