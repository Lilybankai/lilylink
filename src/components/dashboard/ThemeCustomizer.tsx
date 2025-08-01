'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaintBrushIcon,
  SwatchIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PhotoIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button, Card, PageLoading, Alert, Spinner } from '@/components/ui';
import { BackgroundCustomizer } from '@/components/ui/BackgroundCustomizer';
import { TypographyCustomizer } from '@/components/ui/TypographyCustomizer';
import { CSSEditor } from '@/components/ui/CSSEditor';
import { BrandAssetsManager } from '@/components/ui/BrandAssetsManager';
import { HeaderBlock } from '@/components/ui/HeaderBlock';
import { LinkStyleEditor } from '@/components/ui/LinkStyleEditor';
import { BlockEditor } from '@/components/ui/BlockEditor';
import { ThemePresets } from './ThemePresets';
import { ThemePreview } from './ThemePreview';
import { useThemeCustomizer } from '@/hooks/useThemeCustomizer';
import type { LinkPage } from '@/types';

interface ThemeCustomizerProps {
  linkPage: LinkPage;
  onThemeChange?: (themeConfig: any) => void;
  onBack?: () => void;
}

export function ThemeCustomizer({ linkPage, onThemeChange, onBack }: ThemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'layout' | 'header' | 'links' | 'background' | 'typography' | 'brand' | 'css'>('presets');

  const {
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
    saveAsNewTheme
  } = useThemeCustomizer({
    linkPageId: linkPage.id,
    onThemeChange
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                onClick={onBack}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-purple-500" />
                Customize Theme
              </h1>
              <p className="text-gray-600">
                Customizing theme for <span className="font-medium">{linkPage.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 font-medium">
                Unsaved changes
              </span>
            )}
            
            <Button
              onClick={saveAsNewTheme}
              variant="secondary"
              disabled={isSaving || !themeConfig}
            >
              Save as Template
            </Button>
            
            <Button
              onClick={saveTheme}
              variant="primary"
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" className="w-4 h-4" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customization Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto">
                {[
                  { id: 'presets', label: 'Themes', icon: SparklesIcon },
                  { id: 'layout', label: 'Layout', icon: DevicePhoneMobileIcon },
                  { id: 'header', label: 'Header', icon: PhotoIcon },
                  { id: 'links', label: 'Link Style', icon: SwatchIcon },
                  { id: 'background', label: 'Background', icon: PaintBrushIcon },
                  { id: 'typography', label: 'Typography', icon: DocumentTextIcon },
                  { id: 'brand', label: 'Brand Assets', icon: SwatchIcon },
                  { id: 'css', label: 'Custom CSS', icon: CodeBracketIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200
                      ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
              {activeTab === 'presets' && (
                <ThemePresets onPresetSelect={handlePresetSelect} />
              )}
                {activeTab === 'layout' && (
                  <BlockEditor
                    blocks={pageBlocks}
                    onChange={handleBlocksChange}
                  />
                )}
                {activeTab === 'header' && (
                  <HeaderBlock
                    value={headerConfig}
                    onChange={handleHeaderChange}
                  />
                )}
                {activeTab === 'links' && (
                  <LinkStyleEditor
                    value={linkStyleConfig}
                    onChange={handleLinkStyleChange}
                  />
                )}
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
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <EyeIcon className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                </div>
                
              <ThemePreview
                themeConfig={themeConfig}
                linkPage={linkPage}
                headerConfig={headerConfig}
                linkStyleConfig={linkStyleConfig}
                backgroundConfig={backgroundConfig}
                typographyConfig={typographyConfig}
                brandAssets={brandAssets}
                customCSS={customCSS}
              />
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 