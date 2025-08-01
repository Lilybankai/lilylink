import { supabase } from '@/lib/supabase/client';
import type { WhiteLabelBranding, Organization } from '@/types';

// Default branding configuration
export const DEFAULT_BRANDING: WhiteLabelBranding = {
  logo: {
    url: '/lilylink-logo.svg',
    width: 120,
    height: 40,
  },
  colors: {
    primary: '#8B5CF6', // Purple-500
    secondary: '#EC4899', // Pink-500
    accent: '#3B82F6', // Blue-500
    background: '#FFFFFF',
    text: '#1F2937', // Gray-800
  },
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
  },
  hidePoweredBy: false,
  customCSS: '',
  emailTemplates: {
    header: 'Lilylink',
    footer: '© 2024 Lilylink. All rights reserved.',
    brandingText: 'Powered by Lilylink',
  },
};

// White-label configuration management
export class WhiteLabelManager {
  private organizationId: string;
  private branding: WhiteLabelBranding | null = null;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Load branding configuration
  async loadBranding(): Promise<WhiteLabelBranding> {
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .select('custom_branding, subscription_tier')
        .eq('id', this.organizationId)
        .single();

      if (error || !organization) {
        return DEFAULT_BRANDING;
      }

      // Check if organization has white-label features
      const hasWhiteLabel = ['agency', 'enterprise'].includes(organization.subscription_tier);
      if (!hasWhiteLabel) {
        return DEFAULT_BRANDING;
      }

      // Merge custom branding with defaults
      this.branding = this.mergeBranding(organization.custom_branding || {});
      return this.branding;

    } catch (error) {
      console.error('Error loading branding:', error);
      return DEFAULT_BRANDING;
    }
  }

  // Save branding configuration
  async saveBranding(branding: Partial<WhiteLabelBranding>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          custom_branding: branding,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.organizationId);

      if (error) {
        console.error('Error saving branding:', error);
        return false;
      }

      this.branding = this.mergeBranding(branding);
      return true;

    } catch (error) {
      console.error('Error saving branding:', error);
      return false;
    }
  }

  // Get current branding (cached)
  getBranding(): WhiteLabelBranding {
    return this.branding || DEFAULT_BRANDING;
  }

  // Merge custom branding with defaults
  private mergeBranding(customBranding: Partial<WhiteLabelBranding>): WhiteLabelBranding {
    return {
      logo: { ...DEFAULT_BRANDING.logo, ...customBranding.logo },
      colors: { ...DEFAULT_BRANDING.colors, ...customBranding.colors },
      typography: { ...DEFAULT_BRANDING.typography, ...customBranding.typography },
      hidePoweredBy: customBranding.hidePoweredBy ?? DEFAULT_BRANDING.hidePoweredBy,
      customDomain: customBranding.customDomain,
      customCSS: customBranding.customCSS || DEFAULT_BRANDING.customCSS,
      emailTemplates: {
        ...DEFAULT_BRANDING.emailTemplates,
        ...customBranding.emailTemplates
      },
    };
  }

  // Generate CSS variables for theming
  generateCSSVariables(): Record<string, string> {
    const branding = this.getBranding();
    
    return {
      '--brand-primary': branding.colors?.primary || DEFAULT_BRANDING.colors!.primary,
      '--brand-secondary': branding.colors?.secondary || DEFAULT_BRANDING.colors!.secondary,
      '--brand-accent': branding.colors?.accent || DEFAULT_BRANDING.colors!.accent,
      '--brand-background': branding.colors?.background || DEFAULT_BRANDING.colors!.background,
      '--brand-text': branding.colors?.text || DEFAULT_BRANDING.colors!.text,
      '--brand-font-family': branding.typography?.fontFamily || DEFAULT_BRANDING.typography!.fontFamily,
      '--brand-heading-font': branding.typography?.headingFont || DEFAULT_BRANDING.typography!.headingFont,
    };
  }

  // Generate custom CSS
  generateCustomCSS(): string {
    const variables = this.generateCSSVariables();
    const branding = this.getBranding();
    
    let css = ':root {\n';
    Object.entries(variables).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`;
    });
    css += '}\n\n';

    // Add custom CSS if provided
    if (branding.customCSS) {
      css += branding.customCSS + '\n';
    }

    // Add branding-specific styles
    css += `
/* White-label branding styles */
.brand-primary { color: var(--brand-primary); }
.brand-secondary { color: var(--brand-secondary); }
.brand-accent { color: var(--brand-accent); }
.brand-bg { background-color: var(--brand-background); }
.brand-text { color: var(--brand-text); }

.brand-gradient {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

.brand-font { font-family: var(--brand-font-family); }
.brand-heading { font-family: var(--brand-heading-font); }

/* Hide powered by if configured */
${branding.hidePoweredBy ? '.powered-by { display: none !important; }' : ''}
`;

    return css;
  }
}

// Utility functions
export function isWhiteLabelEnabled(subscriptionTier: string): boolean {
  return ['agency', 'enterprise'].includes(subscriptionTier);
}

export function canCustomizeBranding(subscriptionTier: string): boolean {
  return ['agency', 'enterprise'].includes(subscriptionTier);
}

export function canUseCustomDomain(subscriptionTier: string): boolean {
  return ['pro', 'agency', 'enterprise'].includes(subscriptionTier);
}

export function getWhiteLabelLimits(subscriptionTier: string) {
  const limits: Record<string, any> = {
    agency: {
      customDomains: 5,
      logoUpload: true,
      customCSS: true,
      hidePoweredBy: true,
      emailTemplates: true,
    },
    enterprise: {
      customDomains: 25,
      logoUpload: true,
      customCSS: true,
      hidePoweredBy: true,
      emailTemplates: true,
      prioritySupport: true,
    },
  };
  
  return limits[subscriptionTier] || {
    customDomains: 0,
    logoUpload: false,
    customCSS: false,
    hidePoweredBy: false,
    emailTemplates: false,
  };
}

// Create white-label manager instance
export function createWhiteLabelManager(organizationId: string): WhiteLabelManager {
  return new WhiteLabelManager(organizationId);
}

// Global branding context for public pages
let globalBranding: WhiteLabelBranding | null = null;

export async function loadGlobalBranding(customDomain?: string): Promise<WhiteLabelBranding> {
  if (!customDomain) {
    return DEFAULT_BRANDING;
  }

  try {
    // Find organization by custom domain
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('id, custom_branding, subscription_tier')
      .eq('custom_domain', customDomain)
      .eq('is_active', true)
      .single();

    if (error || !organization) {
      return DEFAULT_BRANDING;
    }

    const manager = new WhiteLabelManager(organization.id);
    globalBranding = await manager.loadBranding();
    return globalBranding;

  } catch (error) {
    console.error('Error loading global branding:', error);
    return DEFAULT_BRANDING;
  }
}

export function getGlobalBranding(): WhiteLabelBranding {
  return globalBranding || DEFAULT_BRANDING;
}