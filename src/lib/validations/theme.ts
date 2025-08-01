/**
 * Theme Validation Schemas
 * 
 * Centralized Zod schemas for theme validation using consistent constants
 */

import { z } from 'zod';
import {
  BACKGROUND_TYPES,
  LAYOUT_TYPES,
  LAYOUT_SPACING_OPTIONS,
  LAYOUT_ALIGNMENT_OPTIONS,
  HEADER_TYPES,
  HEADER_HEIGHTS,
  LINK_HOVER_EFFECTS,
  LINK_ANIMATION_TYPES,
  ICON_POSITIONS,
  TEXT_TRANSFORM_OPTIONS,
  FONT_FAMILIES,
  BACKGROUND_POSITIONS,
  BACKGROUND_SIZES,
  BACKGROUND_REPEATS,
  BLOCK_TYPES
} from '@/lib/constants/themeConstants';

// Background Configuration Schema
export const BackgroundConfigSchema = z.object({
  type: z.enum(BACKGROUND_TYPES),
  value: z.string(),
  overlay: z.object({
    enabled: z.boolean(),
    color: z.string(),
    opacity: z.number().min(0).max(1)
  }).optional(),
  position: z.enum(BACKGROUND_POSITIONS).optional(),
  size: z.enum(BACKGROUND_SIZES).optional(),
  repeat: z.enum(BACKGROUND_REPEATS).optional()
});

// Typography Configuration Schema
export const TypographyConfigSchema = z.object({
  fontFamily: z.enum(FONT_FAMILIES),
  title: z.object({
    size: z.string(),
    weight: z.string(),
    color: z.string(),
    lineHeight: z.string().optional(),
    letterSpacing: z.string().optional()
  }),
  description: z.object({
    size: z.string(),
    weight: z.string().optional(),
    color: z.string(),
    lineHeight: z.string().optional()
  }),
  links: z.object({
    size: z.string(),
    weight: z.string().optional(),
    color: z.string()
  })
});

// Link Style Configuration Schema
export const LinkStyleConfigSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.string().optional(),
  borderWidth: z.string().optional(),
  borderColor: z.string().optional(),
  hoverEffect: z.enum(LINK_HOVER_EFFECTS).optional(),
  shadow: z.string().optional(),
  spacing: z.object({
    padding: z.string().optional(),
    margin: z.string().optional()
  }).optional(),
  typography: z.object({
    size: z.string().optional(),
    weight: z.string().optional(),
    letterSpacing: z.string().optional(),
    textTransform: z.enum(TEXT_TRANSFORM_OPTIONS).optional()
  }).optional(),
  icon: z.object({
    show: z.boolean().optional(),
    position: z.enum(ICON_POSITIONS).optional(),
    size: z.string().optional(),
    color: z.string().optional()
  }).optional(),
  gradient: z.object({
    enabled: z.boolean().optional(),
    colors: z.array(z.string()).optional(),
    direction: z.string().optional()
  }).optional(),
  animation: z.object({
    type: z.enum(LINK_ANIMATION_TYPES).optional(),
    duration: z.number().optional()
  }).optional()
});

// Header Configuration Schema
export const HeaderConfigSchema = z.object({
  type: z.enum(HEADER_TYPES).optional(),
  height: z.enum(HEADER_HEIGHTS).optional(),
  media: z.object({
    url: z.string().optional(),
    position: z.enum(BACKGROUND_POSITIONS).optional(),
    size: z.enum(BACKGROUND_SIZES).optional()
  }).optional(),
  gradient: z.object({
    value: z.string().optional()
  }).optional(),
  content: z.object({
    showTitle: z.boolean().optional(),
    showDescription: z.boolean().optional(),
    titlePosition: z.enum(LAYOUT_ALIGNMENT_OPTIONS).optional(),
    textColor: z.string().optional(),
    textShadow: z.boolean().optional()
  }).optional()
});

// Page Block Schema
export const PageBlockSchema = z.object({
  id: z.string(),
  type: z.enum(BLOCK_TYPES),
  enabled: z.boolean(),
  order: z.number(),
  config: z.record(z.any()).optional()
});

// Layout Configuration Schema
export const LayoutConfigSchema = z.object({
  type: z.enum(LAYOUT_TYPES).optional(),
  maxWidth: z.string().optional(),
  spacing: z.enum(LAYOUT_SPACING_OPTIONS).optional(),
  alignment: z.enum(LAYOUT_ALIGNMENT_OPTIONS).optional(),
  blocks: z.array(PageBlockSchema).optional()
});

// Brand Configuration Schema
export const BrandConfigSchema = z.object({
  logo: z.object({
    url: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    position: z.enum(['top', 'center', 'bottom'])
  }).optional(),
  favicon: z.object({
    url: z.string(),
    size: z.number()
  }).optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string()
  }).optional(),
  colorPalettes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    colors: z.array(z.string())
  })).optional(),
  hideBranding: z.boolean().optional()
});

// Complete Theme Configuration Schema
export const ThemeConfigSchema = z.object({
  background: BackgroundConfigSchema.optional(),
  typography: TypographyConfigSchema.optional(),
  links: LinkStyleConfigSchema.optional(),
  header: HeaderConfigSchema.optional(),
  layout: LayoutConfigSchema.optional(),
  brand: BrandConfigSchema.optional(),
  customCSS: z.string().optional(),
  animations: z.object({
    enabled: z.boolean(),
    pageTransition: z.string(),
    linkHover: z.string(),
    scrollEffects: z.boolean()
  }).optional()
}).passthrough();

// Export individual schemas for component-level validation
export {
  BackgroundConfigSchema as BackgroundConfig,
  TypographyConfigSchema as TypographyConfig,
  LinkStyleConfigSchema as LinkStyleConfig,
  HeaderConfigSchema as HeaderConfig,
  LayoutConfigSchema as LayoutConfig,
  BrandConfigSchema as BrandConfig,
  PageBlockSchema as PageBlock
};

// Type exports
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>;
export type TypographyConfig = z.infer<typeof TypographyConfigSchema>;
export type LinkStyleConfig = z.infer<typeof LinkStyleConfigSchema>;
export type HeaderConfig = z.infer<typeof HeaderConfigSchema>;
export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;
export type BrandConfig = z.infer<typeof BrandConfigSchema>;
export type PageBlock = z.infer<typeof PageBlockSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// Validation helper functions
export function validateThemeConfig(config: unknown): ThemeConfig {
  return ThemeConfigSchema.parse(config);
}

export function isValidThemeConfig(config: unknown): config is ThemeConfig {
  return ThemeConfigSchema.safeParse(config).success;
}

export function validateBackgroundConfig(config: unknown): BackgroundConfig {
  return BackgroundConfigSchema.parse(config);
}

export function validateTypographyConfig(config: unknown): TypographyConfig {
  return TypographyConfigSchema.parse(config);
}

export function validateLinkStyleConfig(config: unknown): LinkStyleConfig {
  return LinkStyleConfigSchema.parse(config);
}

export function validateHeaderConfig(config: unknown): HeaderConfig {
  return HeaderConfigSchema.parse(config);
}

export function validateLayoutConfig(config: unknown): LayoutConfig {
  return LayoutConfigSchema.parse(config);
}

export function validateBrandConfig(config: unknown): BrandConfig {
  return BrandConfigSchema.parse(config);
}