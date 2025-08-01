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
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  ColorPicker,
  GradientPicker,
  Input,
  Card,
} from '@/components/ui';
import { generateHeaderBackgroundStyles } from '@/lib/utils/backgroundStyles';
import type { HeaderBlockConfig } from '@/types';

interface HeaderBlockProps {
  value: HeaderBlockConfig;
  onChange: (config: HeaderBlockConfig) => void;
  className?: string;
}

const HEADER_HEIGHTS = [
  { label: 'Small (200px)', value: 'small' as const },
  { label: 'Medium (300px)', value: 'medium' as const },
  { label: 'Large (400px)', value: 'large' as const },
  { label: 'Full Screen', value: 'full' as const },
];

const PRESET_GRADIENTS = [
  {
    name: 'Sunset Vibes',
    value: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)',
  },
  {
    name: 'Ocean Breeze',
    value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
  },
  {
    name: 'Purple Dream',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    name: 'Forest Mist',
    value: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
  },
  {
    name: 'Rose Gold',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  },
  {
    name: 'Midnight Blue',
    value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  },
];

const BACKGROUND_POSITIONS = [
  { label: 'Center', value: 'center' },
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

const BACKGROUND_SIZES = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Auto', value: 'auto' },
];

export function HeaderBlock({
  value,
  onChange,
  className = '',
}: HeaderBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = useCallback(
    (type: HeaderBlockConfig['type']) => {
      const newConfig: HeaderBlockConfig = {
        ...value,
        type,
        height: value.height || 'medium',
      };

      // Set appropriate defaults for each type
      switch (type) {
        case 'gradient':
          newConfig.gradient = { value: PRESET_GRADIENTS[0].value };
          break;
        case 'image':
        case 'video':
          newConfig.media = {
            url: '',
            position: 'center',
            size: 'cover',
          };
          break;
        case 'none':
          // Clear media and gradient
          newConfig.media = undefined;
          newConfig.gradient = undefined;
          break;
      }

      onChange(newConfig);
    },
    [value, onChange]
  );

  const handleMediaChange = useCallback(
    (mediaConfig: Partial<HeaderBlockConfig['media']>) => {
      onChange({
        ...value,
        media: {
          url: value.media?.url || '',
          position: value.media?.position || 'center',
          size: value.media?.size || 'cover',
          ...mediaConfig,
        },
      });
    },
    [value, onChange]
  );

  const handleOverlayChange = useCallback(
    (overlayConfig: Partial<HeaderBlockConfig['media']['overlay']>) => {
      const currentOverlay = value.media?.overlay;
      onChange({
        ...value,
        media: {
          ...value.media,
          url: value.media?.url || '',
          position: value.media?.position || 'center',
          size: value.media?.size || 'cover',
          overlay: {
            enabled: currentOverlay?.enabled || false,
            color: currentOverlay?.color || '#000000',
            opacity: currentOverlay?.opacity || 0.3,
            ...overlayConfig,
          },
        },
      });
    },
    [value, onChange]
  );

  const handleContentChange = useCallback(
    (contentConfig: Partial<HeaderBlockConfig['content']>) => {
      onChange({
        ...value,
        content: {
          showTitle: value.content?.showTitle ?? true,
          showDescription: value.content?.showDescription ?? true,
          titlePosition: value.content?.titlePosition || 'center',
          textColor: value.content?.textColor || '#ffffff',
          textShadow: value.content?.textShadow ?? true,
          ...contentConfig,
        },
      });
    },
    [value, onChange]
  );

  // File upload simulation
  const simulateFileUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const url = URL.createObjectURL(file);
    setIsUploading(false);
    setUploadProgress(0);
    return url;
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    try {
      const url = await simulateFileUpload(file);
      handleTypeChange(type);
      handleMediaChange({ url });
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

  const getHeightStyle = (height: HeaderBlockConfig['height']) => {
    switch (height) {
      case 'small':
        return '200px';
      case 'medium':
        return '300px';
      case 'large':
        return '400px';
      case 'full':
        return '100vh';
      default:
        return '300px';
    }
  };

  const renderPreview = () => {
    const previewStyle: React.CSSProperties = {
      height: getHeightStyle(value.height),
      position: 'relative',
      ...generateHeaderBackgroundStyles(value),
    };

    // Special case for 'none' type
    if (value.type === 'none') {
      previewStyle.backgroundColor = '#f3f4f6';
      previewStyle.border = '2px dashed #d1d5db';
    }

    return (
      <div className="relative">
        <div className="w-full rounded-lg overflow-hidden" style={previewStyle}>
          {/* Video element */}
          {value.type === 'video' && value.media?.url && (
            <video
              src={value.media.url}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          )}

          {/* Overlay */}
          {value.media?.overlay?.enabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: value.media.overlay.color,
                opacity: value.media.overlay.opacity,
              }}
            />
          )}

          {/* Content overlay */}
          {value.type !== 'none' && (
            <div
              className={`absolute inset-0 flex items-${value.content?.titlePosition || 'center'} justify-center p-8`}
            >
              <div className="text-center">
                {value.content?.showTitle && (
                  <h1
                    className="text-4xl font-bold mb-4"
                    style={{
                      color: value.content.textColor,
                      textShadow: value.content.textShadow
                        ? '0 2px 4px rgba(0,0,0,0.5)'
                        : 'none',
                    }}
                  >
                    Your Name
                  </h1>
                )}
                {value.content?.showDescription && (
                  <p
                    className="text-lg"
                    style={{
                      color: value.content.textColor,
                      textShadow: value.content.textShadow
                        ? '0 1px 2px rgba(0,0,0,0.5)'
                        : 'none',
                    }}
                  >
                    Your description goes here
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {value.type === 'none' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No header content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Type Selector */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Header Type</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { type: 'none' as const, icon: XMarkIcon, label: 'None' },
            {
              type: 'gradient' as const,
              icon: PaintBrushIcon,
              label: 'Gradient',
            },
            { type: 'image' as const, icon: PhotoIcon, label: 'Image' },
            { type: 'video' as const, icon: VideoCameraIcon, label: 'Video' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                ${
                  value.type === type
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

      {/* Height Selector */}
      {value.type !== 'none' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Header Height
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {HEADER_HEIGHTS.map(height => (
              <button
                key={height.value}
                onClick={() => onChange({ ...value, height: height.value })}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-sm
                  ${
                    value.height === height.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 text-gray-600'
                  }
                `}
              >
                {height.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {value.type !== 'none' && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
          {renderPreview()}
        </div>
      )}

      {/* Type-specific Controls */}
      <AnimatePresence mode="wait">
        {value.type === 'gradient' && (
          <motion.div
            key="gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-700">
              Gradient Background
            </h3>

            {/* Preset Gradients */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Preset Gradients</p>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_GRADIENTS.map(gradient => (
                  <button
                    key={gradient.name}
                    onClick={() =>
                      onChange({
                        ...value,
                        gradient: { value: gradient.value },
                      })
                    }
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${
                        value.gradient?.value === gradient.value
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
                value={value.gradient?.value || PRESET_GRADIENTS[0].value}
                onChange={gradientValue =>
                  onChange({ ...value, gradient: { value: gradientValue } })
                }
              />
            </div>
          </motion.div>
        )}

        {(value.type === 'image' || value.type === 'video') && (
          <motion.div
            key="media"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-700">
              {value.type === 'image' ? 'Image' : 'Video'} Background
            </h3>

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                ${
                  isDragging
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
                  {value.type === 'image' ? (
                    <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto" />
                  ) : (
                    <VideoCameraIcon className="w-8 h-8 text-gray-400 mx-auto" />
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop{' '}
                      {value.type === 'image' ? 'an image' : 'a video'}, or{' '}
                      <button
                        onClick={() =>
                          value.type === 'image'
                            ? fileInputRef.current?.click()
                            : videoInputRef.current?.click()
                        }
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      {value.type === 'image'
                        ? 'PNG, JPG, GIF up to 10MB'
                        : 'MP4, WebM up to 50MB'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div>
              <p className="text-xs text-gray-600 mb-2">
                Or enter {value.type} URL
              </p>
              <Input
                placeholder={`https://example.com/${value.type}.${value.type === 'image' ? 'jpg' : 'mp4'}`}
                value={value.media?.url || ''}
                onChange={e => handleMediaChange({ url: e.target.value })}
              />
            </div>

            {/* Media Controls */}
            {value.media?.url && value.type === 'image' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Position
                    </label>
                    <select
                      value={value.media.position || 'center'}
                      onChange={e =>
                        handleMediaChange({ position: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {BACKGROUND_POSITIONS.map(pos => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Size
                    </label>
                    <select
                      value={value.media.size || 'cover'}
                      onChange={e =>
                        handleMediaChange({ size: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {BACKGROUND_SIZES.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleMediaChange({ url: '' })}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  Remove {value.type}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Overlay Settings */}
      {value.type !== 'none' && (
        <Card className="p-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Content Overlay
            </h4>

            {/* Show/Hide Content */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.content?.showTitle ?? true}
                  onChange={e =>
                    handleContentChange({ showTitle: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Show Title</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.content?.showDescription ?? true}
                  onChange={e =>
                    handleContentChange({ showDescription: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Show Description</span>
              </label>
            </div>

            {/* Text Position */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Text Position
              </label>
              <select
                value={value.content?.titlePosition || 'center'}
                onChange={e =>
                  handleContentChange({ titlePosition: e.target.value as any })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Text Color
              </label>
              <ColorPicker
                value={value.content?.textColor || '#ffffff'}
                onChange={color => handleContentChange({ textColor: color })}
              />
            </div>

            {/* Text Shadow */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.content?.textShadow ?? true}
                onChange={e =>
                  handleContentChange({ textShadow: e.target.checked })
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">Text Shadow</span>
            </label>
          </div>
        </Card>
      )}

      {/* Media Overlay Settings */}
      {(value.type === 'image' || value.type === 'video') && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Background Overlay
              </h4>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.media?.overlay?.enabled || false}
                  onChange={e =>
                    handleOverlayChange({ enabled: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-600">Enable</span>
              </label>
            </div>

            {value.media?.overlay?.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Overlay Color
                  </label>
                  <ColorPicker
                    value={value.media.overlay.color || '#000000'}
                    onChange={color => handleOverlayChange({ color })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opacity:{' '}
                    {Math.round((value.media.overlay.opacity || 0.3) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={value.media.overlay.opacity || 0.3}
                    onChange={e =>
                      handleOverlayChange({
                        opacity: parseFloat(e.target.value),
                      })
                    }
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
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'image');
        }}
        className="hidden"
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'video');
        }}
        className="hidden"
      />
    </div>
  );
}
