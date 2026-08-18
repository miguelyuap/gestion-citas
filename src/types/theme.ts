export type TemplateType = 'modern' | 'elegant' | 'bold';

export type ButtonStyleType = 'rounded' | 'pill' | 'square' | 'sharp';

export type SectionKey =
  | 'hero'
  | 'services'
  | 'staff'
  | 'about'
  | 'gallery'
  | 'testimonials'
  | 'booking_cta'
  | 'contact';

export interface TenantTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  muted_text_color: string;
  accent_color: string;
  font_family: string;
  border_radius: string;
  button_style: ButtonStyleType;
}

export interface TenantSettings {
  template: TemplateType;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url?: string | null;
  hero_badge?: string | null;
  hero_cta_text: string;
  hero_secondary_cta_text?: string | null;
  about_title?: string | null;
  about_text?: string | null;
  about_image_url?: string | null;
  whatsapp_number?: string | null;
}

export interface TenantSectionConfig {
  section_key: SectionKey;
  is_enabled: boolean;
  display_order: number;
}

export interface TenantSocials {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
}

export interface TenantGalleryItem {
  id: string;
  tenant_id: string;
  image_url: string;
  caption?: string | null;
  display_order: number;
}

export interface TenantTestimonialItem {
  id: string;
  tenant_id: string;
  client_name: string;
  client_avatar?: string | null;
  rating: number;
  comment: string;
  display_order: number;
}

export interface PresetPalette {
  id: string;
  name: string;
  theme: TenantTheme;
}

export interface CompleteTenantAppearance {
  settings: TenantSettings;
  theme: TenantTheme;
  sections: TenantSectionConfig[];
  socials: TenantSocials;
  gallery: TenantGalleryItem[];
  testimonials: TenantTestimonialItem[];
}
