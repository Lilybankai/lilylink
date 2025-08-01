/**
 * Theme System Constants
 * 
 * Centralized constants for the Lilylink theme system to ensure consistency
 * across all theme-related components and functionality.
 */

// Theme Categories
export const THEME_CATEGORIES = [
  'minimal',
  'vibrant', 
  'professional',
  'creative'
] as const;

export type ThemeCategory = typeof THEME_CATEGORIES[number];

// Background Types
export const BACKGROUND_TYPES = [
  'solid',
  'gradient', 
  'image',
  'video'
] as const;

export type BackgroundType = typeof BACKGROUND_TYPES[number];

// Layout Types
export const LAYOUT_TYPES = [
  'classic',
  'blocks'
] as const;

export type LayoutType = typeof LAYOUT_TYPES[number];

// Layout Spacing Options
export const LAYOUT_SPACING_OPTIONS = [
  'compact',
  'normal',
  'relaxed'
] as const;

export type LayoutSpacing = typeof LAYOUT_SPACING_OPTIONS[number];

// Layout Alignment Options
export const LAYOUT_ALIGNMENT_OPTIONS = [
  'left',
  'center',
  'right'
] as const;

export type LayoutAlignment = typeof LAYOUT_ALIGNMENT_OPTIONS[number];

// Header Types
export const HEADER_TYPES = [
  'none',
  'solid',
  'gradient',
  'image',
  'video'
] as const;

export type HeaderType = typeof HEADER_TYPES[number];

// Header Heights
export const HEADER_HEIGHTS = [
  'small',
  'medium',
  'large',
  'full'
] as const;

export type HeaderHeight = typeof HEADER_HEIGHTS[number];

// Header Height Mappings
export const HEADER_HEIGHT_VALUES: Record<HeaderHeight, string> = {
  small: '200px',
  medium: '300px',
  large: '400px',
  full: '100vh'
};

// Link Hover Effects
export const LINK_HOVER_EFFECTS = [
  'none',
  'subtle',
  'scale',
  'border',
  'glow',
  'slide',
  'lift',
  'gradient'
] as const;

export type LinkHoverEffect = typeof LINK_HOVER_EFFECTS[number];

// Link Animation Types
export const LINK_ANIMATION_TYPES = [
  'none',
  'pulse',
  'bounce',
  'shake',
  'glow'
] as const;

export type LinkAnimationType = typeof LINK_ANIMATION_TYPES[number];

// Icon Positions
export const ICON_POSITIONS = [
  'left',
  'right',
  'top'
] as const;

export type IconPosition = typeof ICON_POSITIONS[number];

// Text Transform Options
export const TEXT_TRANSFORM_OPTIONS = [
  'none',
  'uppercase',
  'lowercase',
  'capitalize'
] as const;

export type TextTransform = typeof TEXT_TRANSFORM_OPTIONS[number];

// Font Families
export const FONT_FAMILIES = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'Source Sans Pro',
  'Nunito',
  'Raleway',
  'Playfair Display'
] as const;

export type FontFamily = typeof FONT_FAMILIES[number];

// Font Sizes (Tailwind classes)
export const FONT_SIZES = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl'
] as const;

export type FontSize = typeof FONT_SIZES[number];

// Font Weights
export const FONT_WEIGHTS = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900'
] as const;

export type FontWeight = typeof FONT_WEIGHTS[number];

// Brand Colors (from design system)
export const BRAND_COLORS = {
  primary: {
    50: '#F3E8FF',
    100: '#E9D5FF',
    200: '#D8B4FE',
    300: '#C084FC',
    400: '#A855F7',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    DEFAULT: '#8B5CF6'
  },
  secondary: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    DEFAULT: '#EC4899'
  },
  accent: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    DEFAULT: '#3B82F6'
  }
} as const;

// Status Colors
export const STATUS_COLORS = {
  success: '#059669',
  warning: '#D97706', 
  error: '#DC2626',
  info: '#2563EB'
} as const;

// Neutral Colors
export const NEUTRAL_COLORS = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#374151',
  700: '#1F2937',
  800: '#111827',
  900: '#000000'
} as const;

// Common Gradients
export const COMMON_GRADIENTS = {
  sunset: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  cosmic: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
  purple: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  blue: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  emerald: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  warm: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
} as const;

// Block Types
export const BLOCK_TYPES = [
  'header',
  'profile',
  'links',
  'social',
  'contact',
  'gallery',
  'video',
  'music',
  'text',
  'spacer'
] as const;

export type BlockType = typeof BLOCK_TYPES[number];

// Default Container Widths
export const CONTAINER_WIDTHS = {
  mobile: '100%',
  tablet: '768px',
  desktop: '1280px',
  linkPage: '448px' // max-w-md for optimal mobile experience
} as const;

// Default Spacing Values
export const SPACING_VALUES = {
  micro: '4px',
  small: '8px',
  medium: '16px',
  large: '24px',
  xlarge: '32px',
  xxlarge: '48px'
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500
} as const;

// Background Position Options
export const BACKGROUND_POSITIONS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right'
] as const;

export type BackgroundPosition = typeof BACKGROUND_POSITIONS[number];

// Background Size Options  
export const BACKGROUND_SIZES = [
  'auto',
  'cover',
  'contain',
  '100%',
  '50%'
] as const;

export type BackgroundSize = typeof BACKGROUND_SIZES[number];

// Background Repeat Options
export const BACKGROUND_REPEATS = [
  'no-repeat',
  'repeat',
  'repeat-x',
  'repeat-y'
] as const;

export type BackgroundRepeat = typeof BACKGROUND_REPEATS[number];

// Border Radius Options
export const BORDER_RADIUS_OPTIONS = [
  '0px',
  '4px',
  '8px',
  '12px',
  '16px',
  '20px',
  '24px',
  '50%'
] as const;

// Border Width Options
export const BORDER_WIDTH_OPTIONS = [
  '0px',
  '1px',
  '2px',
  '3px',
  '4px'
] as const;

// Shadow Presets
export const SHADOW_PRESETS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(139, 92, 246, 0.3)',
  coloredGlow: '0 0 20px rgba(0, 255, 136, 0.3)'
} as const;

// Default Theme Values
export const DEFAULT_THEME_VALUES = {
  background: {
    type: 'solid' as BackgroundType,
    value: '#ffffff'
  },
  typography: {
    fontFamily: 'Inter' as FontFamily,
    title: {
      size: '3xl' as FontSize,
      weight: '700' as FontWeight,
      color: '#1f2937'
    },
    description: {
      size: 'lg' as FontSize,
      color: '#6b7280'
    },
    links: {
      size: 'base' as FontSize,
      weight: '500' as FontWeight,
      color: '#374151'
    }
  },
  links: {
    backgroundColor: '#f9fafb',
    textColor: '#374151',
    borderRadius: '12px',
    borderWidth: '1px',
    borderColor: '#e5e7eb',
    hoverEffect: 'subtle' as LinkHoverEffect,
    shadow: SHADOW_PRESETS.sm,
    spacing: {
      padding: '16px',
      margin: '8px'
    },
    typography: {
      size: '16px',
      weight: '500'
    },
    icon: {
      show: false,
      position: 'left' as IconPosition,
      size: '20px'
    }
  },
  layout: {
    type: 'blocks' as LayoutType,
    maxWidth: '448px',
    spacing: 'normal' as LayoutSpacing,
    alignment: 'center' as LayoutAlignment
  }
} as const;