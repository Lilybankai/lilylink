'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaintBrushIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { Button, Card, PageLoading, Alert } from '@/components/ui';
import { BackgroundCustomizer, type BackgroundConfig } from '@/components/ui/BackgroundCustomizer';
import { TypographyCustomizer, type TypographyConfig } from '@/components/ui/TypographyCustomizer';
import { CSSEditor } from '@/components/ui/CSSEditor';
import { BrandAssetsManager, type BrandAssets } from '@/components/ui/BrandAssetsManager';
import { 
  getLinkPageThemeConfig, 
  updateLinkPageThemeConfig, 
  createUserTheme 
} from '@/lib/api/themes';
import type { LinkPage, ThemeConfig } from '@/types';

interface LiveThemeEditorProps {
  linkPage: LinkPage;
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (themeConfig: ThemeConfig) => void;
  previewContent?: React.ReactNode;
}

interface PreviewDevice {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
  maxWidth: string;
}

const PREVIEW_DEVICES: PreviewDevice[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    icon: ComputerDesktopIcon,
    width: '100%',
    maxWidth: '1200px'
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: DeviceTabletIcon,
    width: '768px',
    maxWidth: '768px'
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: DevicePhoneMobileIcon,
    width: '375px',
    maxWidth: '375px'
  }
];

const PREDEFINED_THEMES = [
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    preview: '🤍',
    config: {
      background: { type: 'solid' as const, value: '#ffffff' },
      typography: {
        fontFamily: 'Inter',
        title: { size: '3xl', weight: '700', color: '#1f2937' },
        description: { size: 'lg', color: '#6b7280' },
        links: { size: 'base', weight: '500', color: '#374151' }
      },
      links: {
        backgroundColor: '#f9fafb',
        textColor: '#374151',
        borderRadius: '12px',
        borderWidth: '1px',
        borderColor: '#e5e7eb',
        hoverEffect: 'subtle' as const
      }
    }
  },
  {
    id: 'vibrant-gradient',
    name: 'Vibrant',
    preview: '🌈',
    config: {
      background: { type: 'gradient' as const, value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      typography: {
        fontFamily: 'Poppins',
        title: { size: '4xl', weight: '800', color: '#ffffff' },
        description: { size: 'lg', color: '#f3f4f6' },
        links: { size: 'lg', weight: '600', color: '#1f2937' }
      },
      links: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderRadius: '16px',
        borderWidth: '0px',
        hoverEffect: 'scale' as const
      }
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    preview: '💼',
    config: {
      background: { type: 'solid' as const, value: '#f8fafc' },
      typography: {
        fontFamily: 'Inter',
        title: { size: '3xl', weight: '600', color: '#1e293b' },
        description: { size: 'base', color: '#475569' },
        links: { size: 'base', weight: '500', color: '#1e293b' }
      },
      links: {
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        borderRadius: '8px',
        borderWidth: '1px',
        borderColor: '#cbd5e1',
        hoverEffect: 'border' as const
      }
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    preview: '🎨',
    config: {
      background: { type: 'gradient' as const, value: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)' },
      typography: {
        fontFamily: 'Montserrat',
        title: { size: '4xl', weight: '900', color: '#ffffff' },
        description: { size: 'lg', color: '#f9fafb' },
        links: { size: 'lg', weight: '600', color: '#1f2937' }
      },
      links: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        textColor: '#1f2937',
        borderRadius: '20px',
        borderWidth: '0px',
        hoverEffect: 'glow' as const
      }
    }
  }
];

export function LiveThemeEditor({ linkPage, isOpen, onClose, onThemeChange, previewContent }: LiveThemeEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'background' | 'typography' | 'brand' | 'css'>('presets');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Load current theme configuration
  useEffect(() => {
    if (isOpen) {
      loadThemeConfig();
    }
  }, [isOpen, linkPage.id]);

  const loadThemeConfig = async () => {
    try {
      setIsLoading(true);
      const response = await getLinkPageThemeConfig(linkPage.id);
      
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
        if (config.customCSS) {
          setCustomCSS(config.customCSS);
        }
      }
    } catch (error) {
      console.error('Failed to load theme config:', error);
      setError('Failed to load theme configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeConfig = useCallback((newConfig: Partial<ThemeConfig>) => {
    const updatedConfig: ThemeConfig = {
      ...themeConfig,
      ...newConfig
    };
    
    setThemeConfig(updatedConfig);
    setHasUnsavedChanges(true);
    onThemeChange(updatedConfig);
  }, [themeConfig, onThemeChange]);

  const handlePresetSelect = useCallback((preset: typeof PREDEFINED_THEMES[0]) => {
    const config = preset.config;
    
    // Update all configurations
    if (config.background) {
      setBackgroundConfig(config.background);
    }
    if (config.typography) {
      setTypographyConfig(config.typography);
    }
    
    applyThemeConfig(config);
  }, [applyThemeConfig]);

  const handleBackgroundChange = useCallback((config: BackgroundConfig) => {
    setBackgroundConfig(config);
    applyThemeConfig({ background: config });
  }, [applyThemeConfig]);

  const handleTypographyChange = useCallback((config: TypographyConfig) => {
    setTypographyConfig(config);
    applyThemeConfig({ typography: config });
  }, [applyThemeConfig]);

  const handleBrandAssetsChange = useCallback((assets: BrandAssets) => {
    setBrandAssets(assets);
    applyThemeConfig({ brand: assets });
  }, [applyThemeConfig]);

  const handleCSSChange = useCallback((css: string) => {
    setCustomCSS(css);
    applyThemeConfig({ customCSS: css });
  }, [applyThemeConfig]);

  const saveTheme = async () => {
    if (!themeConfig) return;

    try {
      setIsSaving(true);
      setError(null);
      
      const response = await updateLinkPageThemeConfig(linkPage.id, themeConfig);
      
      if (response.success) {
        setHasUnsavedChanges(false);
        setSuccessMessage('Theme saved successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
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

  const discardChanges = () => {
    loadThemeConfig();
    setHasUnsavedChanges(false);
  };

  const renderPresets = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Quick Themes</h3>
      <div className="grid grid-cols-2 gap-3">
        {PREDEFINED_THEMES.map((preset) => (
          <motion.button
            key={preset.id}
            onClick={() => handlePresetSelect(preset)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 text-left"
          >
            <div className="text-2xl mb-2">{preset.preview}</div>
            <div className="font-medium text-sm text-gray-900">{preset.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Editor Panel */}
      <motion.div
        initial={{ x: isCollapsed ? -320 : 0 }}
        animate={{ x: isCollapsed ? -320 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl border-r border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <PaintBrushIcon className="w-5 h-5" />
              <span className="font-semibold">Theme Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-4 h-4" />
                ) : (
                  <ChevronLeftIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Device Preview Selector */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {PREVIEW_DEVICES.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setPreviewDevice(device.id)}
                    className={`
                      flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${previewDevice === device.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <device.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{device.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'presets', label: 'Themes', icon: '🎨' },
                  { id: 'background', label: 'Background', icon: '🖼️' },
                  { id: 'typography', label: 'Text', icon: '📝' },
                  { id: 'brand', label: 'Brand', icon: '🏷️' },
                  { id: 'css', label: 'CSS', icon: '💻' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex-1 py-3 px-2 text-xs font-medium transition-all duration-200 border-b-2
                      ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600 bg-purple-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <PageLoading />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'presets' && renderPresets()}
                    {activeTab === 'background' && (
                      <BackgroundCustomizer
                        value={backgroundConfig}
                        onChange={handleBackgroundChange}
                      />
                    )}
                    {activeTab === 'typography' && (
                      <TypographyCustomizer
                        value={typographyConfig}
                        onChange={handleTypographyChange}
                      />
                    )}
                    {activeTab === 'brand' && (
                      <BrandAssetsManager
                        value={brandAssets}
                        onChange={handleBrandAssetsChange}
                      />
                    )}
                    {activeTab === 'css' && (
                      <CSSEditor
                        value={customCSS}
                        onChange={handleCSSChange}
                        height="300px"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              {error && (
                <Alert type="error" message={error} />
              )}
              
              {successMessage && (
                <Alert type="success" message={successMessage} />
              )}

              {hasUnsavedChanges && (
                <div className="text-xs text-amber-600 font-medium">
                  You have unsaved changes
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={discardChanges}
                    variant="outline"
                    size="sm"
                    disabled={!hasUnsavedChanges || isSaving}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Discard
                  </Button>
                  
                  <Button
                    onClick={saveTheme}
                    variant="secondary"
                    size="sm"
                    disabled={!hasUnsavedChanges || isSaving}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                
                <Button
                  onClick={saveTheme}
                  variant="primary"
                  size="sm"
                  disabled={!hasUnsavedChanges || isSaving}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <CheckIcon className="w-4 h-4 animate-pulse" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Publish Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Collapse Toggle (when collapsed) */}
      {isCollapsed && (
        <motion.button
          initial={{ x: -40 }}
          animate={{ x: 0 }}
          onClick={() => setIsCollapsed(false)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-purple-500 text-white p-3 rounded-r-lg shadow-lg hover:bg-purple-600 transition-colors"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </motion.button>
      )}

      {/* Preview Area Overlay */}
      <div 
        className="absolute top-0 right-0 h-full transition-all duration-300"
        style={{ 
          left: isCollapsed ? '0' : '320px',
          width: isCollapsed ? '100%' : 'calc(100% - 320px)'
        }}
      >
        {/* Preview Container */}
        <div className="h-full flex items-center justify-center p-8">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: PREVIEW_DEVICES.find(d => d.id === previewDevice)?.width,
              maxWidth: PREVIEW_DEVICES.find(d => d.id === previewDevice)?.maxWidth,
              height: previewDevice === 'mobile' ? '667px' : previewDevice === 'tablet' ? '1024px' : '80vh'
            }}
          >
            {/* The actual page content will be rendered here by the parent component */}
            <div className="w-full h-full overflow-y-auto">
              {previewContent || (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Live preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 