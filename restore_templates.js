const fs = require('fs');
const path = require('path');

const templates = [
  { id: 'diagonal_split_01', type: 'diagonal_split', name: 'Diagonal Split' },
  { id: 'editorial_strip_01', type: 'editorial_strip', name: 'Editorial Strip' },
  { id: 'floating_card_01', type: 'floating_card', name: 'Floating Card' },
  { id: 'hero_center_01', type: 'hero_center', name: 'Hero Center' },
  { id: 'image_heavy_01', type: 'image_heavy', name: 'Image Heavy' },
  { id: 'luxury_premium_01', type: 'premium_luxury', name: 'Premium Luxury' },
  { id: 'minimal_corp_01', type: 'minimal_corporate', name: 'Minimal Corporate' },
  { id: 'overlay_story', type: 'overlay_story', name: 'Overlay Story' },
  { id: 'playful_burst_01', type: 'centered_burst', name: 'Playful Burst' },
  { id: 'split_layout_01', type: 'split_layout', name: 'Split Layout' }
];

const dir = path.join(process.cwd(), 'templates');

templates.forEach(t => {
  const tDir = path.join(dir, t.id);
  if (!fs.existsSync(tDir)) {
    fs.mkdirSync(tDir, { recursive: true });
  }

  const config = {
    template_id: t.id,
    name: t.name,
    description: `A ${t.name} layout`,
    layout_type: t.type,
    canvas: { width: 1080, height: 1080 },
    regions: [],
    content_slots: {},
    style_system: { themes: [], typography: [], spacing_modes: [] },
    asset_rules: { image_tags: ["hero"], video_allowed: false, fallback_image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff" }
  };
  fs.writeFileSync(path.join(tDir, 'config.json'), JSON.stringify(config, null, 2));

  // A basic, clean structure that we can later edit
  const html = `<div class="${t.id}-container">
  <div class="image-area">
    <img src="{{primaryImage}}" class="main-image" />
  </div>
  <div class="content-area">
    <h1 class="headline">{{{slots.headline}}}</h1>
    <p class="subtext">{{slots.subtext}}</p>
    <div class="brand-footer">
      <img src="{{brandLogo}}" class="logo" />
      <div class="contact-info">
        <p class="cta">{{slots.cta}}</p>
        <p class="contact">{{slots.contact_info}}</p>
      </div>
    </div>
  </div>
  <style>
    .${t.id}-container {
       width: 1080px; height: 1080px; display: flex; flex-direction: column; overflow: hidden;
       background-color: {{#if theme.colors.background}}{{theme.colors.background}}{{else}}#FFFFFF{{/if}};
    }
    .image-area { flex: 1; overflow: hidden; position: relative; }
    .main-image { width: 100%; height: 100%; object-fit: cover; }
    .content-area {
       flex: 1; padding: 60px; display: flex; flex-direction: column; justify-content: center; text-align: center;
    }
    .headline {
       font-family: '{{#if theme.typography.heading_font}}{{theme.typography.heading_font}}{{else}}Inter{{/if}}', sans-serif;
       font-size: 64px; font-weight: 800; margin: 0 0 20px 0; line-height: 1.1;
       color: {{#if theme.colors.text}}{{theme.colors.text}}{{else}}#111111{{/if}};
       word-wrap: break-word; overflow-wrap: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .subtext {
       font-family: '{{#if theme.typography.body_font}}{{theme.typography.body_font}}{{else}}Inter{{/if}}', sans-serif;
       font-size: 24px; margin: 0 0 40px 0;
       color: {{#if theme.colors.secondary}}{{theme.colors.secondary}}{{else}}#444444{{/if}};
       word-wrap: break-word; overflow-wrap: break-word; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .brand-footer {
       display: flex; align-items: center; justify-content: space-between; margin-top: auto;
    }
    .logo { height: 60px; max-width: 200px; object-fit: contain; }
    .contact-info { text-align: right; }
    .cta { font-size: 20px; font-weight: 700; margin: 0; color: {{#if theme.colors.text}}{{theme.colors.text}}{{else}}#111{{/if}}; }
    .contact { font-size: 16px; margin: 5px 0 0 0; color: {{#if theme.colors.secondary}}{{theme.colors.secondary}}{{else}}#666{{/if}}; }
  </style>
</div>`;
  fs.writeFileSync(path.join(tDir, 'template.html'), html);
});
