export type TemplateType =
  | "hero_center"
  | "split_layout"
  | "split_screen"
  | "overlay_story"
  | "minimal_card"
  | "dual_visual"
  | "footer_brand"
  | "minimal_corporate"
  | "image_heavy"
  | "premium_luxury"
  | "centered_burst"
  | "editorial_strip"
  | "diagonal_split"
  | "floating_card"
  | "layered_overlap";

export interface TemplateConfig {
  template_id: string;
  name: string;
  description: string;
  layout_type: TemplateType;

  canvas: {
    width: number;
    height: number;
  };

  regions: Region[];

  content_slots: Record<string, ContentSlot>;

  style_system: StyleSystem;

  asset_rules: AssetRules;
}

export interface Region {
  id: string;
  type: "image" | "text" | "video";
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  alignment?: "left" | "center" | "right";
}

export interface ContentSlot {
  type: "text" | "image" | "video";
  required: boolean;
  max_length?: number;
  tags?: string[];
}

export interface StyleSystem {
  themes: Theme[];
  typography: Typography[];
  spacing_modes: string[];
}

export interface Theme {
  id: string;
  colors: Record<string, string>;
}

export interface Typography {
  id: string;
  heading_font: string;
  body_font: string;
}

export interface AssetRules {
  image_tags: string[];
  video_allowed: boolean;
  fallback_image: string;
}
