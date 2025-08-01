import {
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { 
  DEFAULT_THEME_VALUES,
  COMMON_GRADIENTS,
  type ThemeCategory
} from '@/lib/constants/themeConstants';

export interface PreviewDevice {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
  height: string;
}

export const PREVIEW_DEVICES: PreviewDevice[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    icon: ComputerDesktopIcon,
    width: '1024px',
    height: '768px'
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: DeviceTabletIcon,
    width: '768px',
    height: '1024px'
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: DevicePhoneMobileIcon,
    width: '375px',
    height: '667px'
  }
];

export const PREDEFINED_THEMES = [
  {
    id: 'professional-header',
    name: 'Professional Header',
    category: 'professional' as ThemeCategory,
    description: 'Professional layout with header image like Faith Lianne',
    preview: '/themes/professional-header.jpg',
    config: {
      layout: {
        type: 'blocks' as const,
        blocks: [
          { id: 'header', type: 'header' as const, enabled: true, order: 0, config: {} },
          { id: 'profile', type: 'profile' as const, enabled: true, order: 1, config: {} },
          { id: 'links', type: 'links' as const, enabled: true, order: 2, config: {} }
        ]
      },
      header: {
        type: 'image' as const,
        height: 'large' as const,
        media: {
          url: '',
          position: 'center',
          size: 'cover',
          overlay: {
            enabled: true,
            color: '#000000',
            opacity: 0.3
          }
        },
        content: {
          showTitle: true,
          showDescription: true,
          titlePosition: 'center' as const,
          textColor: '#ffffff',
          textShadow: true
        }
      },
      background: {
        type: 'solid' as const,
        value: '#000000'
      },
      typography: {
        fontFamily: 'Inter',
        title: {
          size: '4xl',
          weight: '700',
          color: '#ffffff',
          lineHeight: '1.2'
        },
        description: {
          size: 'lg',
          color: '#e5e7eb',
          lineHeight: '1.6'
        },
        links: {
          size: 'lg',
          weight: '600',
          color: '#ffffff'
        }
      },
      links: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#ffffff',
        borderRadius: '16px',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        hoverEffect: 'lift' as const,
        shadow: '0 8px 25px -5px rgba(0, 0, 0, 0.3)',
        spacing: { padding: '18px', margin: '12px' },
        typography: { size: '18px', weight: '600' },
        icon: { show: true, position: 'left' as const, size: '24px' }
      }
    }
  },
  {
    id: 'vibrant-creator',
    name: 'Vibrant Creator',
    category: 'creative',
    description: 'Bold design with gradient header for content creators',
    preview: '/themes/vibrant-creator.jpg',
    config: {
      layout: {
        type: 'blocks' as const,
        blocks: [
          { id: 'header', type: 'header' as const, enabled: true, order: 0, config: {} },
          { id: 'profile', type: 'profile' as const, enabled: true, order: 1, config: {} },
          { id: 'social', type: 'social' as const, enabled: true, order: 2, config: {} },
          { id: 'links', type: 'links' as const, enabled: true, order: 3, config: {} }
        ]
      },
      header: {
        type: 'gradient' as const,
        height: 'medium' as const,
        gradient: {
          value: COMMON_GRADIENTS.ocean
        },
        content: {
          showTitle: true,
          showDescription: true,
          titlePosition: 'center' as const,
          textColor: '#ffffff',
          textShadow: true
        }
      },
      background: {
        type: 'solid' as const,
        value: '#f8fafc'
      },
      typography: {
        fontFamily: 'Poppins',
        title: {
          size: '4xl',
          weight: '800',
          color: '#ffffff',
          lineHeight: '1.1'
        },
        description: {
          size: 'lg',
          color: '#f3f4f6',
          lineHeight: '1.6'
        },
        links: {
          size: 'lg',
          weight: '600',
          color: '#1f2937'
        }
      },
      links: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderRadius: '20px',
        borderWidth: '0px',
        hoverEffect: 'scale' as const,
        shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        spacing: { padding: '20px', margin: '12px' },
        typography: { size: '18px', weight: '600' },
        icon: { show: true, position: 'left' as const, size: '24px' }
      }
    }
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    category: 'minimal',
    description: 'Clean, minimalist design with plenty of whitespace',
    preview: '/themes/minimal-clean.jpg',
    config: {
      layout: {
        type: 'blocks' as const,
        blocks: [
          { id: 'profile', type: 'profile' as const, enabled: true, order: 0, config: {} },
          { id: 'links', type: 'links' as const, enabled: true, order: 1, config: {} }
        ]
      },
      background: {
        type: 'solid' as const,
        value: '#ffffff'
      },
      typography: {
        fontFamily: 'Inter',
        title: {
          size: '3xl',
          weight: '700',
          color: '#1f2937',
          lineHeight: '1.2'
        },
        description: {
          size: 'lg',
          color: '#6b7280',
          lineHeight: '1.6'
        },
        links: {
          size: 'base',
          weight: '500',
          color: '#374151'
        }
      },
      links: {
        backgroundColor: '#f9fafb',
        textColor: '#374151',
        borderRadius: '12px',
        borderWidth: '1px',
        borderColor: '#e5e7eb',
        hoverEffect: 'subtle' as const,
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        spacing: { padding: '16px', margin: '8px' },
        typography: { size: '16px', weight: '500' },
        icon: { show: false, position: 'left' as const, size: '20px' }
      }
    }
  },
  {
    id: 'vibrant-gradient',
    name: 'Vibrant Gradient',
    category: 'vibrant',
    description: 'Bold gradients and vibrant colors for maximum impact',
    preview: '/themes/vibrant-gradient.jpg',
    config: {
      background: {
        type: 'gradient' as const,
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      typography: {
        fontFamily: 'Poppins',
        title: {
          size: '4xl',
          weight: '800',
          color: '#ffffff',
          lineHeight: '1.1'
        },
        description: {
          size: 'lg',
          color: '#f3f4f6',
          lineHeight: '1.6'
        },
        links: {
          size: 'lg',
          weight: '600',
          color: '#1f2937'
        }
      },
      links: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderRadius: '16px',
        borderWidth: '0px',
        hoverEffect: 'scale' as const,
        shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      layout: {
        maxWidth: '420px',
        spacing: 'relaxed' as const,
        alignment: 'center' as const
      }
    }
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    category: 'professional',
    description: 'Sophisticated design for business and professional use',
    preview: '/themes/professional-corporate.jpg',
    config: {
      background: {
        type: 'solid' as const,
        value: '#f8fafc'
      },
      typography: {
        fontFamily: 'Inter',
        title: {
          size: '3xl',
          weight: '600',
          color: '#1e293b',
          lineHeight: '1.3'
        },
        description: {
          size: 'base',
          color: '#475569',
          lineHeight: '1.6'
        },
        links: {
          size: 'base',
          weight: '500',
          color: '#1e293b'
        }
      },
      links: {
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        borderRadius: '8px',
        borderWidth: '1px',
        borderColor: '#cbd5e1',
        hoverEffect: 'border' as const,
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      layout: {
        maxWidth: '480px',
        spacing: 'normal' as const,
        alignment: 'center' as const
      }
    }
  },
  {
    id: 'creative-artistic',
    name: 'Creative Artistic',
    category: 'creative',
    description: 'Unique and artistic design for creative professionals',
    preview: '/themes/creative-artistic.jpg',
    config: {
      background: {
        type: 'gradient' as const,
        value: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)'
      },
      typography: {
        fontFamily: 'Montserrat',
        title: {
          size: '4xl',
          weight: '900',
          color: '#ffffff',
          lineHeight: '1.1',
          letterSpacing: '-0.025em'
        },
        description: {
          size: 'lg',
          color: '#f9fafb',
          lineHeight: '1.7'
        },
        links: {
          size: 'lg',
          weight: '600',
          color: '#1f2937'
        }
      },
      links: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        textColor: '#1f2937',
        borderRadius: '20px',
        borderWidth: '0px',
        hoverEffect: 'glow' as const,
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      layout: {
        maxWidth: '400px',
        spacing: 'relaxed' as const,
        alignment: 'center' as const
      }
    }
  }
];