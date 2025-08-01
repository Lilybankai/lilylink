'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhotoIcon,
  SwatchIcon,
  GlobeAltIcon,
  TrashIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button, Card, ColorPicker, Input, Alert } from '@/components/ui';

export interface BrandAssets {
  logo?: {
    url: string;
    width?: number;
    height?: number;
    position: 'top' | 'center' | 'bottom';
  };
  favicon?: {
    url: string;
    size: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  colorPalettes: Array<{
    id: string;
    name: string;
    colors: string[];
  }>;
}

interface BrandAssetsManagerProps {
  value: BrandAssets;
  onChange: (assets: BrandAssets) => void;
  className?: string;
}

const DEFAULT_BRAND_ASSETS: BrandAssets = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937'
  },
  colorPalettes: []
};

const PRESET_COLOR_PALETTES = [
  {
    id: 'vibrant',
    name: 'Vibrant',
    colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  },
  {
    id: 'professional',
    name: 'Professional',
    colors: ['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1']
  },
  {
    id: 'warm',
    name: 'Warm',
    colors: ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d']
  },
  {
    id: 'cool',
    name: 'Cool',
    colors: ['#0ea5e9', '#0891b2', '#059669', '#7c3aed', '#c026d3']
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#000000', '#374151', '#6b7280', '#9ca3af', '#ffffff']
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6']
  }
];

const LOGO_POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' }
];

const FAVICON_SIZES = [
  { value: 16, label: '16×16' },
  { value: 32, label: '32×32' },
  { value: 48, label: '48×48' },
  { value: 64, label: '64×64' }
];

export function BrandAssetsManager({ value, onChange, className = '' }: BrandAssetsManagerProps) {
  const [activeTab, setActiveTab] = useState<'logo' | 'favicon' | 'colors'>('logo');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [isCreatingPalette, setIsCreatingPalette] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Simulate file upload (in real implementation, upload to your storage service)
  const simulateFileUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const url = URL.createObjectURL(file);
    setIsUploading(false);
    setUploadProgress(0);
    return url;
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const url = await simulateFileUpload(file);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        onChange({
          ...value,
          logo: {
            url,
            width: img.width,
            height: img.height,
            position: value.logo?.position || 'top'
          }
        });
      };
      img.src = url;
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    try {
      const url = await simulateFileUpload(file);
      onChange({
        ...value,
        favicon: {
          url,
          size: value.favicon?.size || 32
        }
      });
    } catch (error) {
      console.error('Favicon upload failed:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (!file || !file.type.startsWith('image/')) return;

    if (type === 'logo') {
      handleLogoUpload(file);
    } else {
      handleFaviconUpload(file);
    }
  }, []);

  const handleColorChange = useCallback((colorKey: keyof BrandAssets['colors'], color: string) => {
    onChange({
      ...value,
      colors: {
        ...value.colors,
        [colorKey]: color
      }
    });
  }, [value, onChange]);

  const handlePaletteSelect = useCallback((palette: typeof PRESET_COLOR_PALETTES[0]) => {
    onChange({
      ...value,
      colors: {
        primary: palette.colors[0],
        secondary: palette.colors[1],
        accent: palette.colors[2],
        background: palette.colors[3] || '#ffffff',
        text: palette.colors[4] || '#1f2937'
      }
    });
  }, [value, onChange]);

  const createCustomPalette = useCallback(() => {
    if (!newPaletteName.trim()) return;

    const newPalette = {
      id: Date.now().toString(),
      name: newPaletteName,
      colors: Object.values(value.colors)
    };

    onChange({
      ...value,
      colorPalettes: [...value.colorPalettes, newPalette]
    });

    setNewPaletteName('');
    setIsCreatingPalette(false);
  }, [value, onChange, newPaletteName]);

  const deletePalette = useCallback((paletteId: string) => {
    onChange({
      ...value,
      colorPalettes: value.colorPalettes.filter(p => p.id !== paletteId)
    });
  }, [value, onChange]);

  const renderLogoTab = () => (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Brand Logo</h4>
        
        {value.logo ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={value.logo.url}
                alt="Brand logo"
                className="h-16 w-auto object-contain bg-gray-50 rounded-lg p-2"
              />
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                <p className="text-xs text-gray-600">
                  {value.logo.width}×{value.logo.height} pixels
                </p>
              </div>
              
              <Button
                onClick={() => onChange({ ...value, logo: undefined })}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </Card>
        ) : (
          <div
            onDrop={(e) => handleDrop(e, 'logo')}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
              }
            `}
            onClick={() => logoInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="space-y-3">
                <CloudArrowUpIcon className="w-8 h-8 text-purple-500 mx-auto animate-bounce" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Uploading logo...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop your logo, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logo Settings */}
      {value.logo && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Logo Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {LOGO_POSITIONS.map((position) => (
                  <button
                    key={position.value}
                    onClick={() => onChange({
                      ...value,
                      logo: { ...value.logo!, position: position.value as any }
                    })}
                    className={`
                      p-2 text-sm rounded-lg border-2 transition-all duration-200
                      ${value.logo.position === position.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                      }
                    `}
                  >
                    {position.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Alternative */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter logo URL</h4>
        <Input
          placeholder="https://example.com/logo.png"
          value={value.logo?.url || ''}
          onChange={(e) => {
            if (e.target.value) {
              onChange({
                ...value,
                logo: {
                  url: e.target.value,
                  position: 'top'
                }
              });
            }
          }}
        />
      </div>
    </div>
  );

  const renderFaviconTab = () => (
    <div className="space-y-6">
      {/* Favicon Upload */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Favicon</h4>
        <p className="text-xs text-gray-600 mb-4">
          The small icon that appears in browser tabs and bookmarks
        </p>
        
        {value.favicon ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={value.favicon.url}
                  alt="Favicon"
                  className="h-8 w-8 object-contain bg-gray-50 rounded border"
                />
                <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Browser tab preview</span>
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Favicon uploaded</p>
                <p className="text-xs text-gray-600">
                  {value.favicon.size}×{value.favicon.size} pixels
                </p>
              </div>
              
              <Button
                onClick={() => onChange({ ...value, favicon: undefined })}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </Card>
        ) : (
          <div
            onDrop={(e) => handleDrop(e, 'favicon')}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
              }
            `}
            onClick={() => faviconInputRef.current?.click()}
          >
            <div className="space-y-3">
              <GlobeAltIcon className="w-6 h-6 text-gray-400 mx-auto" />
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload favicon or click to browse
                </p>
                <p className="text-xs text-gray-500">ICO, PNG 16×16 to 64×64 pixels</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Favicon Settings */}
      {value.favicon && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Favicon Size</h4>
          <div className="grid grid-cols-4 gap-2">
            {FAVICON_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => onChange({
                  ...value,
                  favicon: { ...value.favicon!, size: size.value }
                })}
                className={`
                  p-2 text-sm rounded-lg border-2 transition-all duration-200
                  ${value.favicon.size === size.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300'
                  }
                `}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Input Alternative */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter favicon URL</h4>
        <Input
          placeholder="https://example.com/favicon.ico"
          value={value.favicon?.url || ''}
          onChange={(e) => {
            if (e.target.value) {
              onChange({
                ...value,
                favicon: {
                  url: e.target.value,
                  size: 32
                }
              });
            }
          }}
        />
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      {/* Brand Colors */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Brand Colors</h4>
        
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(value.colors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {showColorPicker === key && (
                      <CheckIcon className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                  
                  <Input
                    value={color}
                    onChange={(e) => handleColorChange(key as keyof BrandAssets['colors'], e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Color Picker */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <ColorPicker
                value={value.colors[showColorPicker as keyof BrandAssets['colors']]}
                onChange={(color) => handleColorChange(showColorPicker as keyof BrandAssets['colors'], color)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Palettes */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Color Palettes</h4>
        
        <div className="space-y-3">
          {/* Preset Palettes */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Preset Palettes</p>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => handlePaletteSelect(palette)}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">{palette.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Palettes */}
          {value.colorPalettes.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">Your Custom Palettes</p>
              <div className="space-y-2">
                {value.colorPalettes.map((palette) => (
                  <div key={palette.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{palette.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => deletePalette(palette.id)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Custom Palette */}
          <div>
            {isCreatingPalette ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Palette name"
                  value={newPaletteName}
                  onChange={(e) => setNewPaletteName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={createCustomPalette}
                  variant="primary"
                  size="sm"
                  disabled={!newPaletteName.trim()}
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsCreatingPalette(false);
                    setNewPaletteName('');
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsCreatingPalette(true)}
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Save Current Colors as Palette
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SwatchIcon className="w-5 h-5 text-purple-500" />
          Brand Assets
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Customize your brand identity with logos, favicons, and color palettes
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'logo', label: 'Logo', icon: PhotoIcon },
            { id: 'favicon', label: 'Favicon', icon: GlobeAltIcon },
            { id: 'colors', label: 'Colors', icon: SwatchIcon }
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
          {activeTab === 'logo' && renderLogoTab()}
          {activeTab === 'favicon' && renderFaviconTab()}
          {activeTab === 'colors' && renderColorsTab()}
        </motion.div>
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
        }}
        className="hidden"
      />
      
      <input
        ref={faviconInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFaviconUpload(file);
        }}
        className="hidden"
      />
    </div>
  );
} 