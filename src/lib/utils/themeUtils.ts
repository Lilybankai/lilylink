/**
 * Theme Utility Functions
 * 
 * Helper functions for working with theme configurations, applying styles,
 * and managing theme-related operations.
 */

import type { ThemeConfig } from '@/lib/validations/theme';
import {
  DEFAULT_THEME_VALUES,
  HEADER_HEIGHT_VALUES,
  SHADOW_PRESETS,
  COMMON_GRADIENTS,
  type HeaderHeight,
  type BackgroundType,
  type LinkHoverEffect
} from '@/lib/constants/themeConstants';

/**
 * Merges theme configurations with defaults
 */
export function mergeWithDefaults(themeConfig: Partial<ThemeConfig>): ThemeConfig {
  return {
    background: {
      ...DEFAULT_THEME_VALUES.background,
      ...themeConfig.background
    },
    typography: {
      ...DEFAULT_THEME_VALUES.typography,
      title: {
        ...DEFAULT_THEME_VALUES.typography.title,
        ...themeConfig.typography?.title
      },
      description: {
        ...DEFAULT_THEME_VALUES.typography.description,
        ...themeConfig.typography?.description
      },
      links: {
        ...DEFAULT_THEME_VALUES.typography.links,
        ...themeConfig.typography?.links
      },
      ...themeConfig.typography
    },
    links: {
      ...DEFAULT_THEME_VALUES.links,
      spacing: {
        ...DEFAULT_THEME_VALUES.links.spacing,
        ...themeConfig.links?.spacing
      },
      typography: {
        ...DEFAULT_THEME_VALUES.links.typography,
        ...themeConfig.links?.typography
      },
      icon: {
        ...DEFAULT_THEME_VALUES.links.icon,
        ...themeConfig.links?.icon
      },
      ...themeConfig.links
    },
    layout: {
      ...DEFAULT_THEME_VALUES.layout,
      ...themeConfig.layout
    },
    header: themeConfig.header,
    brand: themeConfig.brand,
    customCSS: themeConfig.customCSS,
    animations: themeConfig.animations
  };
}

/**
 * Gets the CSS height value for a header height setting
 */
export function getHeaderHeight(height?: HeaderHeight): string {
  return height ? HEADER_HEIGHT_VALUES[height] : HEADER_HEIGHT_VALUES.medium;
}

/**
 * Determines if a background type requires additional properties
 */
export function requiresMediaProperties(backgroundType: BackgroundType): boolean {
  return backgroundType === 'image' || backgroundType === 'video';
}

/**
 * Gets a predefined shadow by name
 */
export function getShadowPreset(name: keyof typeof SHADOW_PRESETS): string {
  return SHADOW_PRESETS[name];
}

/**
 * Gets a predefined gradient by name
 */
export function getCommonGradient(name: keyof typeof COMMON_GRADIENTS): string {
  return COMMON_GRADIENTS[name];
}

/**
 * Generates CSS class names for hover effects
 */
export function getHoverEffectClasses(effect: LinkHoverEffect): string {
  const baseClasses = 'transition-all duration-200';
  
  switch (effect) {
    case 'scale':
      return `${baseClasses} hover:scale-105`;
    case 'lift':
      return `${baseClasses} hover:-translate-y-1 hover:shadow-lg`;
    case 'glow':
      return `${baseClasses} hover:shadow-lg hover:shadow-purple-500/25`;
    case 'border':
      return `${baseClasses} hover:border-purple-500`;
    case 'slide':
      return `${baseClasses} hover:translate-x-1`;
    case 'gradient':
      return `${baseClasses} hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500`;
    case 'subtle':
      return `${baseClasses} hover:bg-opacity-80`;
    default:
      return baseClasses;
  }
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Determines if a color is light or dark (for contrast calculations)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Gets the appropriate text color (black or white) for a background color
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

/**
 * Generates CSS variables from theme config
 */
export function generateCSSVariables(themeConfig: ThemeConfig): Record<string, string> {
  const variables: Record<string, string> = {};

  if (themeConfig.brand?.colors) {
    variables['--color-primary'] = themeConfig.brand.colors.primary;
    variables['--color-secondary'] = themeConfig.brand.colors.secondary;
    variables['--color-accent'] = themeConfig.brand.colors.accent;
    variables['--color-background'] = themeConfig.brand.colors.background;
    variables['--color-text'] = themeConfig.brand.colors.text;
  }

  if (themeConfig.typography?.fontFamily) {
    variables['--font-family'] = themeConfig.typography.fontFamily;
  }

  if (themeConfig.links?.borderRadius) {
    variables['--link-border-radius'] = themeConfig.links.borderRadius;
  }

  if (themeConfig.layout?.maxWidth) {
    variables['--layout-max-width'] = themeConfig.layout.maxWidth;
  }

  return variables;
}

/**
 * Applies CSS variables to a DOM element
 */
export function applyCSSVariables(element: HTMLElement, variables: Record<string, string>): void {
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Extracts color palette from theme config
 */
export function extractColorPalette(themeConfig: ThemeConfig): string[] {
  const colors: string[] = [];

  if (themeConfig.brand?.colors) {
    colors.push(
      themeConfig.brand.colors.primary,
      themeConfig.brand.colors.secondary,
      themeConfig.brand.colors.accent
    );
  }

  if (themeConfig.background?.type === 'solid') {
    colors.push(themeConfig.background.value);
  }

  if (themeConfig.links?.backgroundColor) {
    colors.push(themeConfig.links.backgroundColor);
  }

  if (themeConfig.links?.textColor) {
    colors.push(themeConfig.links.textColor);
  }

  // Remove duplicates and invalid colors
  return [...new Set(colors)].filter(color => 
    color && typeof color === 'string' && color.match(/^#[0-9A-F]{6}$/i)
  );
}

/**
 * Validates if a theme config is complete
 */
export function isCompleteTheme(themeConfig: Partial<ThemeConfig>): boolean {
  return !!(
    themeConfig.background?.type &&
    themeConfig.background?.value &&
    themeConfig.typography?.fontFamily &&
    themeConfig.links?.backgroundColor &&
    themeConfig.links?.textColor
  );
}

/**
 * Generates a theme preview image URL (placeholder implementation)
 */
export function generateThemePreviewUrl(themeConfig: ThemeConfig, size: 'sm' | 'md' | 'lg' = 'md'): string {
  // This would integrate with an image generation service
  const dimensions = {
    sm: '200x150',
    md: '400x300',
    lg: '800x600'
  };
  
  const params = new URLSearchParams({
    bg: themeConfig.background?.value || '#ffffff',
    font: themeConfig.typography?.fontFamily || 'Inter',
    size: dimensions[size]
  });
  
  return `/api/theme-preview?${params.toString()}`;
}

/**
 * Calculates theme similarity score (for theme recommendations)
 */
export function calculateThemeSimilarity(theme1: ThemeConfig, theme2: ThemeConfig): number {
  let score = 0;
  let comparisons = 0;

  // Compare background types
  if (theme1.background?.type && theme2.background?.type) {
    score += theme1.background.type === theme2.background.type ? 1 : 0;
    comparisons++;
  }

  // Compare font families
  if (theme1.typography?.fontFamily && theme2.typography?.fontFamily) {
    score += theme1.typography.fontFamily === theme2.typography.fontFamily ? 1 : 0;
    comparisons++;
  }

  // Compare hover effects
  if (theme1.links?.hoverEffect && theme2.links?.hoverEffect) {
    score += theme1.links.hoverEffect === theme2.links.hoverEffect ? 1 : 0;
    comparisons++;
  }

  // Compare layout types
  if (theme1.layout?.type && theme2.layout?.type) {
    score += theme1.layout.type === theme2.layout.type ? 1 : 0;
    comparisons++;
  }

  return comparisons > 0 ? score / comparisons : 0;
}

/**
 * Optimizes theme config for performance (removes unused properties)
 */
export function optimizeThemeConfig(themeConfig: ThemeConfig): ThemeConfig {
  const optimized = { ...themeConfig };

  // Remove empty objects
  if (optimized.brand && Object.keys(optimized.brand).length === 0) {
    delete optimized.brand;
  }

  if (optimized.header && Object.keys(optimized.header).length === 0) {
    delete optimized.header;
  }

  if (optimized.animations && Object.keys(optimized.animations).length === 0) {
    delete optimized.animations;
  }

  // Remove empty strings
  if (optimized.customCSS === '') {
    delete optimized.customCSS;
  }

  return optimized;
}

/**
 * Converts theme config to CSS string
 */
export function themeConfigToCSS(themeConfig: ThemeConfig): string {
  const css: string[] = [];
  
  // Add CSS variables
  const variables = generateCSSVariables(themeConfig);
  if (Object.keys(variables).length > 0) {
    css.push(':root {');
    Object.entries(variables).forEach(([property, value]) => {
      css.push(`  ${property}: ${value};`);
    });
    css.push('}');
  }

  // Add custom CSS
  if (themeConfig.customCSS) {
    css.push(themeConfig.customCSS);
  }

  return css.join('\n');
}