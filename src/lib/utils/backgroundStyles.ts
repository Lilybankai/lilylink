/**
 * Background Style Utilities
 * 
 * This module provides utilities for handling background styles properly
 * to avoid React warnings about mixing shorthand and individual properties.
 */

export interface BackgroundStyleConfig {
  type: 'solid' | 'gradient' | 'image' | 'video';
  value: string;
  position?: string;
  size?: string;
  repeat?: string;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

/**
 * Generates CSS background styles without conflicts
 * Always use individual properties instead of shorthand to avoid React warnings
 */
export function generateBackgroundStyles(config: BackgroundStyleConfig): React.CSSProperties {
  const styles: React.CSSProperties = {};

  switch (config.type) {
    case 'solid':
      styles.backgroundColor = config.value;
      break;

    case 'gradient':
      styles.backgroundImage = config.value;
      break;

    case 'image':
      styles.backgroundImage = `url(${config.value})`;
      styles.backgroundPosition = config.position || 'center';
      styles.backgroundSize = config.size || 'cover';
      styles.backgroundRepeat = config.repeat || 'no-repeat';
      break;

    case 'video':
      // Video backgrounds handled separately
      styles.backgroundColor = '#000000';
      break;

    default:
      styles.backgroundColor = '#ffffff';
  }

  return styles;
}

/**
 * Generates header background styles specifically for header blocks
 */
export function generateHeaderBackgroundStyles(headerConfig: any): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (!headerConfig) {
    return styles;
  }

  switch (headerConfig.type) {
    case 'gradient':
      if (headerConfig.gradient?.value) {
        styles.backgroundImage = headerConfig.gradient.value;
      }
      break;

    case 'image':
      if (headerConfig.media?.url) {
        styles.backgroundImage = `url(${headerConfig.media.url})`;
        styles.backgroundPosition = headerConfig.media.position || 'center';
        styles.backgroundSize = headerConfig.media.size || 'cover';
        styles.backgroundRepeat = 'no-repeat';
      } else {
        styles.backgroundColor = '#000000';
      }
      break;

    case 'video':
      styles.backgroundColor = '#000000';
      break;

    case 'solid':
    default:
      styles.backgroundColor = '#f3f4f6';
      break;
  }

  return styles;
}

/**
 * Cleans up style objects to remove conflicting properties
 */
export function cleanupStyleObject(styles: React.CSSProperties): React.CSSProperties {
  const cleaned = { ...styles };

  // If backgroundImage is set, remove backgroundColor to avoid conflicts
  if (cleaned.backgroundImage && cleaned.backgroundColor) {
    delete cleaned.backgroundColor;
  }

  return cleaned;
}

/**
 * Merges background styles safely without conflicts
 */
export function mergeBackgroundStyles(
  baseStyles: React.CSSProperties,
  backgroundConfig: BackgroundStyleConfig
): React.CSSProperties {
  const backgroundStyles = generateBackgroundStyles(backgroundConfig);
  
  // Remove any existing background properties from base styles
  const cleanedBase = { ...baseStyles };
  delete cleanedBase.background;
  delete cleanedBase.backgroundColor;
  delete cleanedBase.backgroundImage;
  delete cleanedBase.backgroundPosition;
  delete cleanedBase.backgroundSize;
  delete cleanedBase.backgroundRepeat;

  return {
    ...cleanedBase,
    ...backgroundStyles
  };
}