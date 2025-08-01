'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhotoIcon,
  VideoCameraIcon,
  PaintBrushIcon,
  CloudArrowUpIcon,
  TrashIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Button, ColorPicker, GradientPicker, Input, Card } from '@/components/ui';
import { generateBackgroundStyles, type BackgroundStyleConfig } from '@/lib/utils/backgroundStyles';

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'video';
  value: string;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  position?: string;
  size?: string;
  repeat?: string;
}

interface BackgroundCustomizerProps {
  value: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#1e293b', '#0f172a', '#374151', '#111827',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f59e0b', '#10b981', '#ef4444'
];

const PRESET_GRADIENTS = [
  {
    name: 'Purple Dream',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'Ocean Blue',
    value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
  },
  {
    name: 'Sunset',
    value: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)'
  },
  {
    name: 'Forest',
    value: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)'
  },
  {
    name: 'Cosmic',
    value: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)'
  },
  {
    name: 'Midnight',
    value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  {
    name: 'Fire',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
  },
  {
    name: 'Ice',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
];

const BACKGROUND_POSITIONS = [
  { label: 'Center', value: 'center' },
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Top Left', value: 'top left' },
  { label: 'Top Right', value: 'top right' },
  { label: 'Bottom Left', value: 'bottom left' },
  { label: 'Bottom Right', value: 'bottom right' }
];

const BACKGROUND_SIZES = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Auto', value: 'auto' },
  { label: '100%', value: '100% 100%' }
];

export function BackgroundCustomizer({ value, onChange, className = '' }: BackgroundCustomizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = useCallback((type: BackgroundConfig['type']) => {
    let newValue = value.value;
    
    // Set appropriate default values for each type
    switch (type) {
      case 'solid':
        newValue = '#ffffff';
        break;
      case 'gradient':
        newValue = PRESET_GRADIENTS[0].value;
        break;
      case 'image':
      case 'video':
        newValue = '';
        break;
    }

    onChange({
      ...value,
      type,
      value: newValue,
      position: type === 'image' || type === 'video' ? 'center' : undefined,
      size: type === 'image' || type === 'video' ? 'cover' : undefined,
      repeat: type === 'image' ? 'no-repeat' : undefined
    });
  }, [value, onChange]);

  const handleValueChange = useCallback((newValue: string) => {
    onChange({
      ...value,
      value: newValue
    });
  }, [value, onChange]);

  const handleOverlayChange = useCallback((overlayConfig: Partial<BackgroundConfig['overlay']>) => {
    onChange({
      ...value,
      overlay: {
        enabled: value.overlay?.enabled || false,
        color: value.overlay?.color || '#000000',
        opacity: value.overlay?.opacity || 0.3,
        ...overlayConfig
      }
    });
  }, [value, onChange]);

  const handlePropertyChange = useCallback((property: keyof BackgroundConfig, propertyValue: string) => {
    onChange({
      ...value,
      [property]: propertyValue
    });
  }, [value, onChange]);

  // File upload simulation (in real implementation, you'd upload to your storage service)
  const simulateFileUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create a blob URL for preview (in real implementation, return the uploaded file URL)
    const url = URL.createObjectURL(file);
    setIsUploading(false);
    setUploadProgress(0);
    return url;
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    try {
      const url = await simulateFileUpload(file);
      onChange({
        ...value,
        type,
        value: url,
        position: 'center',
        size: 'cover',
        repeat: type === 'image' ? 'no-repeat' : undefined
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (!file) return;

    if (file.type.startsWith('image/')) {
      handleFileUpload(file, 'image');
    } else if (file.type.startsWith('video/')) {
      handleFileUpload(file, 'video');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const renderPreview = () => {
    // Use the utility function to generate styles safely
    const previewStyle = generateBackgroundStyles(value as BackgroundStyleConfig);

    // Apply overlay if enabled
    if (value.overlay?.enabled) {
      previewStyle.position = 'relative';
    }

    return (
      <div className="relative">
        <div 
          className="w-full h-32 rounded-lg border-2 border-gray-200"
          style={previewStyle}
        >
          {value.type === 'video' && value.value && (
            <video
              src={value.value}
              className="w-full h-full object-cover rounded-lg"
              muted
              loop
              autoPlay
            />
          )}
        </div>
        
        {value.overlay?.enabled && (
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              backgroundColor: value.overlay.color,
              opacity: value.overlay.opacity
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Background Type Selector */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Background Type</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { type: 'solid' as const, icon: PaintBrushIcon, label: 'Color' },
            { type: 'gradient' as const, icon: AdjustmentsHorizontalIcon, label: 'Gradient' },
            { type: 'image' as const, icon: PhotoIcon, label: 'Image' },
            { type: 'video' as const, icon: VideoCameraIcon, label: 'Video' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                ${value.type === type
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 text-gray-600'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
        {renderPreview()}
      </div>

      {/* Type-specific Controls */}
      <AnimatePresence mode="wait">
        {value.type === 'solid' && (
          <motion.div
            key="solid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-700">Solid Color</h3>
            
            {/* Color Picker */}
            <ColorPicker
              value={value.value}
              onChange={handleValueChange}
            />

            {/* Preset Colors */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Quick Colors</p>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleValueChange(color)}
                    className={`
                      w-8 h-8 rounded-lg border-2 transition-all duration-200
                      ${value.value === color
                        ? 'border-purple-500 scale-110'
                        : 'border-gray-200 hover:border-purple-300'
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {value.type === 'gradient' && (
          <motion.div
            key="gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-700">Gradient</h3>
            
            {/* Preset Gradients */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Preset Gradients</p>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.name}
                    onClick={() => handleValueChange(gradient.value)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${value.value === gradient.value
                        ? 'border-purple-500'
                        : 'border-gray-200 hover:border-purple-300'
                      }
                    `}
                    style={{ background: gradient.value }}
                  >
                    <div className="text-white font-medium text-sm drop-shadow-lg">
                      {gradient.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Gradient */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Custom Gradient</p>
              <GradientPicker
                value={value.value}
                onChange={handleValueChange}
              />
            </div>
          </motion.div>
        )}

        {value.type === 'image' && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-700">Image Background</h3>
            
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                ${isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
                }
              `}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <CloudArrowUpIcon className="w-8 h-8 text-purple-500 mx-auto animate-bounce" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Uploading...</p>
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
                      Drag & drop an image, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Or enter image URL</p>
              <Input
                placeholder="https://example.com/image.jpg"
                value={value.value}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            </div>

            {/* Image Controls */}
            {value.value && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Position</label>
                    <select
                      value={value.position || 'center'}
                      onChange={(e) => handlePropertyChange('position', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {BACKGROUND_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Size</label>
                    <select
                      value={value.size || 'cover'}
                      onChange={(e) => handlePropertyChange('size', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {BACKGROUND_SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleValueChange('')}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  Remove Image
                </button>
              </div>
            )}
          </motion.div>
        )}

        {value.type === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-700">Video Background</h3>
            
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                ${isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
                }
              `}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <CloudArrowUpIcon className="w-8 h-8 text-purple-500 mx-auto animate-bounce" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Uploading...</p>
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
                  <VideoCameraIcon className="w-8 h-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop a video, or{' '}
                      <button
                        onClick={() => videoInputRef.current?.click()}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">MP4, WebM up to 50MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Or enter video URL</p>
              <Input
                placeholder="https://example.com/video.mp4"
                value={value.value}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            </div>

            {value.value && (
              <button
                onClick={() => handleValueChange('')}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
              >
                <TrashIcon className="w-4 h-4" />
                Remove Video
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Controls */}
      {(value.type === 'image' || value.type === 'video') && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Overlay</h4>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.overlay?.enabled || false}
                  onChange={(e) => handleOverlayChange({ enabled: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-600">Enable</span>
              </label>
            </div>

            {value.overlay?.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Overlay Color</label>
                  <ColorPicker
                    value={value.overlay.color || '#000000'}
                    onChange={(color) => handleOverlayChange({ color })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opacity: {Math.round((value.overlay.opacity || 0.3) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value.overlay.opacity || 0.3}
                    onChange={(e) => handleOverlayChange({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'image');
        }}
        className="hidden"
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'video');
        }}
        className="hidden"
      />
    </div>
  );
} 