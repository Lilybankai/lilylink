import { useState, useEffect, useCallback } from 'react';
import { 
  getLinkPageThemeConfig, 
  updateLinkPageThemeConfig, 
  createUserTheme
} from '@/lib/api/themes';
import { PREDEFINED_THEMES } from '@/constants/themePresets';
import type { 
  ThemeConfig, 
  HeaderBlockConfig, 
  LinkStyleConfig, 
  PageBlock,
  BackgroundConfig,
  TypographyConfig,
  BrandAssets
} from '@/types';

interface UseThemeCustomizerProps {
  linkPageId: string;
  onThemeChange?: (themeConfig: ThemeConfig) => void;
}

export function useThemeCustomizer({ linkPageId, onThemeChange }: UseThemeCustomizerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Theme configuration state
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: 'solid',
    value: '#ffffff'
  });
  const [typographyConfig, setTypographyConfig] = useState<TypographyConfig>({
    fontFamily: 'Inter',
    title: { size: '3xl', weight: '700', color: '#1f2937' },
    description: { size: 'lg', color: '#6b7280' },
    links: { size: 'base', weight: '500', color: '#374151' }
  });
  const [brandAssets, setBrandAssets] = useState<BrandAssets>({
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937'
    },
    colorPalettes: []
  });
  const [customCSS, setCustomCSS] = useState('');
  
  // New block-based configuration state
  const [headerConfig, setHeaderConfig] = useState<HeaderBlockConfig>({
    type: 'none',
    height: 'medium'
  });
  const [linkStyleConfig, setLinkStyleConfig] = useState<LinkStyleConfig>({
    backgroundColor: '#ffffff',
    textColor: '#374151',
    borderRadius: '12px',
    borderWidth: '1px',
    borderColor: '#e5e7eb',
    hoverEffect: 'subtle',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    spacing: { padding: '16px', margin: '8px' },
    typography: { size: '16px', weight: '500' },
    icon: { show: false, position: 'left', size: '20px' }
  });
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([
    { id: 'profile', type: 'profile', enabled: true, order: 0, config: {} },
    { id: 'links', type: 'links', enabled: true, order: 1, config: {} }
  ]);

  // Load current theme configuration
  useEffect(() => {
    loadThemeConfig();
  }, [linkPageId]);

  const loadThemeConfig = async () => {
    try {
      setIsLoading(true);
      const response = await getLinkPageThemeConfig(linkPageId);
      
      if (response.success && response.data) {
        const config = response.data;
        setThemeConfig(config);
        
        // Extract individual configurations
        if (config.background) {
          setBackgroundConfig(config.background);
        }
        if (config.typography) {
          setTypographyConfig(config.typography);
        }
        if (config.brand) {
          setBrandAssets(prev => ({ ...prev, ...config.brand }));
        }
        if (config.header) {
          setHeaderConfig(config.header);
        }
        if (config.links) {
          setLinkStyleConfig(config.links);
        }
        if (config.layout?.blocks) {
          setPageBlocks(config.layout.blocks);
        }
      }
    } catch (error) {
      console.error('Failed to load theme config:', error);
      setError('Failed to load theme configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = useCallback((preset: typeof PREDEFINED_THEMES[0]) => {
    const config = preset.config;
    
    // Update all configurations
    if (config.background) {
      setBackgroundConfig(config.background);
    }
    if (config.typography) {
      setTypographyConfig(config.typography);
    }
    if (config.header) {
      setHeaderConfig(config.header);
    }
    if (config.links) {
      setLinkStyleConfig(config.links);
    }
    if (config.layout?.blocks) {
      setPageBlocks(config.layout.blocks);
    }
    
    // Merge into theme config
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      ...config
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const handleBackgroundChange = useCallback((config: BackgroundConfig) => {
    setBackgroundConfig(config);
    
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      background: config
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const handleTypographyChange = useCallback((config: TypographyConfig) => {
    setTypographyConfig(config);
    
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      typography: config
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const handleBrandAssetsChange = useCallback((assets: BrandAssets) => {
    setBrandAssets(assets);
    
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      brand: assets
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const handleCSSChange = useCallback((css: string) => {
    setCustomCSS(css);
    setHasUnsavedChanges(true);
  }, []);

  const handleHeaderChange = useCallback((config: HeaderBlockConfig) => {
    setHeaderConfig(config);
    
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      header: config
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const handleLinkStyleChange = useCallback((config: LinkStyleConfig) => {
    setLinkStyleConfig(config);
    
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      links: config
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const handleBlocksChange = useCallback((blocks: PageBlock[]) => {
    setPageBlocks(blocks);
    
    const newThemeConfig: ThemeConfig = {
      ...themeConfig,
      layout: {
        ...themeConfig?.layout,
        type: 'blocks',
        blocks
      }
    };
    
    setThemeConfig(newThemeConfig);
    setHasUnsavedChanges(true);
    
    if (onThemeChange) {
      onThemeChange(newThemeConfig);
    }
  }, [themeConfig, onThemeChange]);

  const saveTheme = async () => {
    if (!themeConfig) return;

    try {
      setIsSaving(true);
      const response = await updateLinkPageThemeConfig(linkPageId, themeConfig);
      
      if (response.success) {
        setHasUnsavedChanges(false);
        setError(null);
      } else {
        setError('Failed to save theme configuration');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      setError('Failed to save theme configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsNewTheme = async () => {
    if (!themeConfig) return;

    const themeName = prompt('Enter a name for your custom theme:');
    if (!themeName) return;

    try {
      setIsSaving(true);
      const response = await createUserTheme({
        name: themeName,
        custom_config: themeConfig
      });
      
      if (response.success) {
        setError(null);
        // Optionally show success message
      } else {
        setError('Failed to save custom theme');
      }
    } catch (error) {
      console.error('Failed to save custom theme:', error);
      setError('Failed to save custom theme');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // State
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    themeConfig,
    backgroundConfig,
    typographyConfig,
    brandAssets,
    customCSS,
    headerConfig,
    linkStyleConfig,
    pageBlocks,
    
    // Actions
    handlePresetSelect,
    handleBackgroundChange,
    handleTypographyChange,
    handleBrandAssetsChange,
    handleCSSChange,
    handleHeaderChange,
    handleLinkStyleChange,
    handleBlocksChange,
    saveTheme,
    saveAsNewTheme,
    loadThemeConfig
  };
}