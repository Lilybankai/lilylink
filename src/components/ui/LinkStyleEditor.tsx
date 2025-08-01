'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SwatchIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PlayIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { Button, ColorPicker, GradientPicker, Input, Card } from '@/components/ui';
import { ColorPresets } from '@/components/ui/ColorPresets';
import { AnimationSelector } from '@/components/ui/AnimationSelector';
import { BorderCustomizer } from '@/components/ui/BorderCustomizer';
import type { LinkStyleConfig } from '@/types';

interface LinkStyleEditorProps {
  value: LinkStyleConfig;
  onChange: (config: LinkStyleConfig) => void;
  className?: string;
}

const HOVER_EFFECTS = [
  { value: 'subtle', label: 'Subtle', description: 'Light color change' },
  { value: 'scale', label: 'Scale', description: 'Grow on hover' },
  { value: 'lift', label: 'Lift', description: 'Shadow elevation' },
  { value: 'border', label: 'Border', description: 'Border highlight' },
  { value: 'glow', label: 'Glow', description: 'Glowing effect' },
  { value: 'gradient', label: 'Gradient', description: 'Gradient shift' },
  { value: 'slide', label: 'Slide', description: 'Background slide' }
];

const GRADIENT_DIRECTIONS = [
  { value: 'to-r', label: 'Left to Right' },
  { value: 'to-l', label: 'Right to Left' },
  { value: 'to-t', label: 'Bottom to Top' },
  { value: 'to-b', label: 'Top to Bottom' },
  { value: 'to-br', label: 'Top-Left to Bottom-Right' },
  { value: 'to-bl', label: 'Top-Right to Bottom-Left' },
  { value: 'to-tr', label: 'Bottom-Left to Top-Right' },
  { value: 'to-tl', label: 'Bottom-Right to Top-Left' }
];

const TEXT_TRANSFORMS = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' }
];

const ICON_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Top' }
];

const PRESET_STYLES = [
  {
    name: 'Minimal',
    config: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      borderRadius: '8px',
      borderWidth: '1px',
      borderColor: '#e5e7eb',
      hoverEffect: 'subtle' as const,
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      spacing: { padding: '16px', margin: '8px' },
      typography: { size: '16px', weight: '500' }
    }
  },
  {
    name: 'Bold',
    config: {
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      borderRadius: '12px',
      borderWidth: '0px',
      hoverEffect: 'scale' as const,
      shadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
      spacing: { padding: '20px', margin: '12px' },
      typography: { size: '18px', weight: '600' }
    }
  },
  {
    name: 'Gradient',
    config: {
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      borderRadius: '16px',
      borderWidth: '0px',
      hoverEffect: 'gradient' as const,
      shadow: '0 8px 25px -5px rgba(139, 92, 246, 0.4)',
      spacing: { padding: '18px', margin: '10px' },
      typography: { size: '17px', weight: '600' },
      gradient: {
        enabled: true,
        colors: ['#8b5cf6', '#ec4899'],
        direction: 'to-r'
      }
    }
  },
  {
    name: 'Outlined',
    config: {
      backgroundColor: 'transparent',
      textColor: '#8b5cf6',
      borderRadius: '10px',
      borderWidth: '2px',
      borderColor: '#8b5cf6',
      hoverEffect: 'border' as const,
      spacing: { padding: '16px', margin: '8px' },
      typography: { size: '16px', weight: '500' }
    }
  },
  {
    name: 'Neon',
    config: {
      backgroundColor: '#1f2937',
      textColor: '#00ff88',
      borderRadius: '8px',
      borderWidth: '1px',
      borderColor: '#00ff88',
      hoverEffect: 'glow' as const,
      shadow: '0 0 20px rgba(0, 255, 136, 0.3)',
      spacing: { padding: '16px', margin: '10px' },
      typography: { size: '16px', weight: '600', textTransform: 'uppercase' }
    }
  },
  {
    name: 'Soft',
    config: {
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
      borderRadius: '20px',
      borderWidth: '0px',
      hoverEffect: 'lift' as const,
      shadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
      spacing: { padding: '18px', margin: '8px' },
      typography: { size: '16px', weight: '500' }
    }
  }
];

export function LinkStyleEditor({ value, onChange, className = '' }: LinkStyleEditorProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'layout' | 'effects' | 'typography'>('presets');
  const [useColorPresets, setUseColorPresets] = useState(true);

  const handleChange = useCallback((updates: Partial<LinkStyleConfig>) => {
    onChange({
      ...value,
      ...updates
    });
  }, [value, onChange]);

  const handlePresetSelect = useCallback((preset: typeof PRESET_STYLES[0]) => {
    onChange({
      ...value,
      ...preset.config,
      // Preserve existing settings that aren't in the preset
      spacing: { ...value.spacing, ...preset.config.spacing },
      typography: { ...value.typography, ...preset.config.typography },
      icon: value.icon || { show: false, position: 'left', size: '20px' },
      gradient: preset.config.gradient || value.gradient,
      animation: value.animation
    });
  }, [value, onChange]);

  const handleColorPresetSelect = useCallback((colors: { background: string; text: string }) => {
    handleChange({
      backgroundColor: colors.background,
      textColor: colors.text
    });
  }, [handleChange]);

  const renderPreview = () => {
    const previewStyle: React.CSSProperties = {
      backgroundColor: value.gradient?.enabled 
        ? undefined 
        : value.backgroundColor,
      background: value.gradient?.enabled 
        ? `linear-gradient(${value.gradient.direction}, ${value.gradient.colors.join(', ')})` 
        : undefined,
      color: value.textColor,
      borderRadius: value.borderRadius,
      border: value.borderWidth !== '0px' ? `${value.borderWidth} solid ${value.borderColor}` : 'none',
      boxShadow: value.shadow,
      padding: value.spacing?.padding || '16px',
      margin: value.spacing?.margin || '8px',
      fontSize: value.typography?.size || '16px',
      fontWeight: value.typography?.weight || '500',
      letterSpacing: value.typography?.letterSpacing,
      textTransform: value.typography?.textTransform as any,
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Preview</p>
        <div style={previewStyle}>
          {value.icon?.show && value.icon.position === 'left' && (
            <SwatchIcon 
              className="flex-shrink-0" 
              style={{ 
                width: value.icon.size, 
                height: value.icon.size,
                color: value.icon.color || 'currentColor'
              }} 
            />
          )}
          {value.icon?.show && value.icon.position === 'top' && (
            <div className="flex flex-col items-center gap-2">
              <SwatchIcon 
                style={{ 
                  width: value.icon.size, 
                  height: value.icon.size,
                  color: value.icon.color || 'currentColor'
                }} 
              />
              <span>Sample Link</span>
            </div>
          )}
          {(!value.icon?.show || value.icon.position !== 'top') && (
            <span>Sample Link</span>
          )}
          {value.icon?.show && value.icon.position === 'right' && (
            <SwatchIcon 
              className="flex-shrink-0" 
              style={{ 
                width: value.icon.size, 
                height: value.icon.size,
                color: value.icon.color || 'currentColor'
              }} 
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {[
            { id: 'presets', label: 'Presets', icon: SparklesIcon },
            { id: 'colors', label: 'Colors', icon: SwatchIcon },
            { id: 'layout', label: 'Layout', icon: CubeIcon },
            { id: 'effects', label: 'Effects', icon: AdjustmentsHorizontalIcon },
            { id: 'typography', label: 'Typography', icon: EyeIcon }
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

      {/* Preview */}
      {renderPreview()}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'presets' && (
          <motion.div
            key="presets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Style Presets</h3>
            <p className="text-sm text-gray-600">
              Choose a preset style and customize it further in other tabs
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRESET_STYLES.map((preset) => (
                <motion.div
                  key={preset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
                    <div className="space-y-3">
                      {/* Preview */}
                      <div className="h-16 flex items-center justify-center">
                        <div
                          className="px-4 py-2 rounded text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: preset.config.gradient?.enabled 
                              ? undefined 
                              : preset.config.backgroundColor,
                            background: preset.config.gradient?.enabled 
                              ? `linear-gradient(${preset.config.gradient.direction}, ${preset.config.gradient.colors.join(', ')})` 
                              : undefined,
                            color: preset.config.textColor,
                            borderRadius: preset.config.borderRadius,
                            border: preset.config.borderWidth !== '0px' ? `${preset.config.borderWidth} solid ${preset.config.borderColor}` : 'none',
                            boxShadow: preset.config.shadow
                          }}
                        >
                          {preset.name}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-1">{preset.name}</h4>
                        <Button
                          onClick={() => handlePresetSelect(preset)}
                          variant="primary"
                          size="sm"
                          className="w-full"
                        >
                          Apply Style
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'colors' && (
          <motion.div
            key="colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">Colors</h3>
            
            {/* Color Mode Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Choose colors for your links</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setUseColorPresets(true)}
                  className={`px-3 py-1 text-xs rounded ${
                    useColorPresets ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Presets
                </button>
                <button
                  onClick={() => setUseColorPresets(false)}
                  className={`px-3 py-1 text-xs rounded ${
                    !useColorPresets ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {useColorPresets ? (
              <ColorPresets onSelect={handleColorPresetSelect} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <ColorPicker
                    value={value.backgroundColor}
                    onChange={(color) => handleChange({ backgroundColor: color })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <ColorPicker
                    value={value.textColor}
                    onChange={(color) => handleChange({ textColor: color })}
                  />
                </div>
              </div>
            )}

            {/* Gradient Options */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Gradient Background</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value.gradient?.enabled || false}
                      onChange={(e) => handleChange({
                        gradient: {
                          enabled: e.target.checked,
                          colors: value.gradient?.colors || [value.backgroundColor, '#ec4899'],
                          direction: value.gradient?.direction || 'to-r'
                        }
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-600">Enable</span>
                  </label>
                </div>

                {value.gradient?.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gradient Colors</label>
                      <div className="grid grid-cols-2 gap-3">
                        <ColorPicker
                          value={value.gradient.colors[0] || value.backgroundColor}
                          onChange={(color) => handleChange({
                            gradient: {
                              ...value.gradient!,
                              colors: [color, value.gradient!.colors[1] || '#ec4899']
                            }
                          })}
                        />
                        <ColorPicker
                          value={value.gradient.colors[1] || '#ec4899'}
                          onChange={(color) => handleChange({
                            gradient: {
                              ...value.gradient!,
                              colors: [value.gradient!.colors[0] || value.backgroundColor, color]
                            }
                          })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Direction</label>
                      <select
                        value={value.gradient.direction}
                        onChange={(e) => handleChange({
                          gradient: { ...value.gradient!, direction: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {GRADIENT_DIRECTIONS.map((dir) => (
                          <option key={dir.value} value={dir.value}>
                            {dir.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'layout' && (
          <motion.div
            key="layout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">Layout & Spacing</h3>
            
            {/* Border Customizer */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Borders</h4>
              <BorderCustomizer
                borderRadius={parseInt(value.borderRadius)}
                borderWidth={parseInt(value.borderWidth)}
                borderColor={value.borderColor || '#e5e7eb'}
                onBorderRadiusChange={(radius) => handleChange({ borderRadius: `${radius}px` })}
                onBorderWidthChange={(width) => handleChange({ borderWidth: `${width}px` })}
                onBorderColorChange={(color) => handleChange({ borderColor: color })}
              />
            </Card>

            {/* Spacing */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Spacing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Padding</label>
                  <Input
                    value={value.spacing?.padding || '16px'}
                    onChange={(e) => handleChange({
                      spacing: { ...value.spacing, padding: e.target.value }
                    })}
                    placeholder="16px"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Margin</label>
                  <Input
                    value={value.spacing?.margin || '8px'}
                    onChange={(e) => handleChange({
                      spacing: { ...value.spacing, margin: e.target.value }
                    })}
                    placeholder="8px"
                  />
                </div>
              </div>
            </Card>

            {/* Shadow */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Shadow</h4>
              <Input
                value={value.shadow || ''}
                onChange={(e) => handleChange({ shadow: e.target.value })}
                placeholder="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSS box-shadow value (e.g., "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              </p>
            </Card>
          </motion.div>
        )}

        {activeTab === 'effects' && (
          <motion.div
            key="effects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">Effects & Animations</h3>
            
            {/* Hover Effects */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Hover Effect</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HOVER_EFFECTS.map((effect) => (
                  <button
                    key={effect.value}
                    onClick={() => handleChange({ hoverEffect: effect.value as any })}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${value.hoverEffect === effect.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{effect.label}</div>
                    <div className="text-xs opacity-75">{effect.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Animations */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Animations</h4>
              <AnimationSelector
                selectedAnimation={value.animation?.type || 'none'}
                onAnimationChange={(type) => handleChange({
                  animation: {
                    type: type as any,
                    duration: value.animation?.duration || 1000
                  }
                })}
              />
              
              {value.animation?.type !== 'none' && (
                <div className="mt-4">
                  <label className="block text-xs text-gray-600 mb-1">
                    Duration: {value.animation?.duration || 1000}ms
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="100"
                    value={value.animation?.duration || 1000}
                    onChange={(e) => handleChange({
                      animation: {
                        ...value.animation!,
                        duration: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'typography' && (
          <motion.div
            key="typography"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <Input
                  value={value.typography?.size || '16px'}
                  onChange={(e) => handleChange({
                    typography: { ...value.typography, size: e.target.value }
                  })}
                  placeholder="16px"
                />
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-sm font-medium mb-2">Font Weight</label>
                <select
                  value={value.typography?.weight || '500'}
                  onChange={(e) => handleChange({
                    typography: { ...value.typography, weight: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                </select>
              </div>

              {/* Letter Spacing */}
              <div>
                <label className="block text-sm font-medium mb-2">Letter Spacing</label>
                <Input
                  value={value.typography?.letterSpacing || ''}
                  onChange={(e) => handleChange({
                    typography: { ...value.typography, letterSpacing: e.target.value }
                  })}
                  placeholder="0.025em"
                />
              </div>

              {/* Text Transform */}
              <div>
                <label className="block text-sm font-medium mb-2">Text Transform</label>
                <select
                  value={value.typography?.textTransform || 'none'}
                  onChange={(e) => handleChange({
                    typography: { ...value.typography, textTransform: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {TEXT_TRANSFORMS.map((transform) => (
                    <option key={transform.value} value={transform.value}>
                      {transform.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Icon Settings */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Icons</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={value.icon?.show || false}
                      onChange={(e) => handleChange({
                        icon: {
                          show: e.target.checked,
                          position: value.icon?.position || 'left',
                          size: value.icon?.size || '20px',
                          color: value.icon?.color
                        }
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-600">Show Icons</span>
                  </label>
                </div>

                {value.icon?.show && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Position</label>
                      <select
                        value={value.icon.position}
                        onChange={(e) => handleChange({
                          icon: { ...value.icon!, position: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {ICON_POSITIONS.map((pos) => (
                          <option key={pos.value} value={pos.value}>
                            {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Size</label>
                      <Input
                        value={value.icon.size}
                        onChange={(e) => handleChange({
                          icon: { ...value.icon!, size: e.target.value }
                        })}
                        placeholder="20px"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color (optional)</label>
                      <ColorPicker
                        value={value.icon.color || value.textColor}
                        onChange={(color) => handleChange({
                          icon: { ...value.icon!, color }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}