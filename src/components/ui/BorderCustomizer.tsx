'use client';

import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';

interface BorderCustomizerProps {
  label?: string;
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  radius?: number;
  onBorderChange: (border: { color: string; width: number; style: string; radius: number }) => void;
  disabled?: boolean;
  className?: string;
}

const BORDER_STYLES = [
  { value: 'solid', label: 'Solid', preview: 'border-solid' },
  { value: 'dashed', label: 'Dashed', preview: 'border-dashed' },
  { value: 'dotted', label: 'Dotted', preview: 'border-dotted' },
];

const BORDER_PRESETS = [
  { name: 'Thin Solid', color: '#E5E7EB', width: 1, style: 'solid', radius: 8 },
  { name: 'Medium Solid', color: '#D1D5DB', width: 2, style: 'solid', radius: 12 },
  { name: 'Thick Solid', color: '#9CA3AF', width: 4, style: 'solid', radius: 16 },
  { name: 'Purple Accent', color: '#8B5CF6', width: 2, style: 'solid', radius: 12 },
  { name: 'Dashed Fun', color: '#EC4899', width: 2, style: 'dashed', radius: 8 },
  { name: 'Dotted Playful', color: '#10B981', width: 3, style: 'dotted', radius: 16 },
];

export function BorderCustomizer({
  label = 'Border',
  color = '#E5E7EB',
  width = 1,
  style = 'solid',
  radius = 8,
  onBorderChange,
  disabled = false,
  className = ''
}: BorderCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [currentWidth, setCurrentWidth] = useState(width);
  const [currentStyle, setCurrentStyle] = useState(style);
  const [currentRadius, setCurrentRadius] = useState(radius);

  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor);
    onBorderChange({ color: newColor, width: currentWidth, style: currentStyle, radius: currentRadius });
  };

  const handleWidthChange = (newWidth: number) => {
    setCurrentWidth(newWidth);
    onBorderChange({ color: currentColor, width: newWidth, style: currentStyle, radius: currentRadius });
  };

  const handleStyleChange = (newStyle: string) => {
    setCurrentStyle(newStyle as 'solid' | 'dashed' | 'dotted');
    onBorderChange({ color: currentColor, width: currentWidth, style: newStyle, radius: currentRadius });
  };

  const handleRadiusChange = (newRadius: number) => {
    setCurrentRadius(newRadius);
    onBorderChange({ color: currentColor, width: currentWidth, style: currentStyle, radius: newRadius });
  };

  const handlePresetSelect = (preset: typeof BORDER_PRESETS[0]) => {
    setCurrentColor(preset.color);
    setCurrentWidth(preset.width);
    setCurrentStyle(preset.style as 'solid' | 'dashed' | 'dotted');
    setCurrentRadius(preset.radius);
    onBorderChange(preset);
    setIsOpen(false);
  };

  const getBorderStyle = () => {
    return {
      borderColor: currentColor,
      borderWidth: `${currentWidth}px`,
      borderStyle: currentStyle,
      borderRadius: `${currentRadius}px`,
    };
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Border Preview Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-12 bg-gray-50 transition-all duration-200 flex items-center justify-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
        `}
        style={getBorderStyle()}
      >
        <span className="text-gray-600 text-sm font-medium">
          {currentWidth}px {currentStyle} • {currentRadius}px radius
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] p-4">
          {/* Border Presets */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Border Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {BORDER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 text-left"
                  style={{
                    borderColor: preset.color,
                    borderWidth: `${preset.width}px`,
                    borderStyle: preset.style,
                    borderRadius: `${preset.radius}px`,
                  }}
                >
                  <div className="text-gray-700 text-xs font-medium">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Border Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Custom Border</h4>
            
            {/* Color Picker */}
            <ColorPicker
              label="Border Color"
              value={currentColor}
              onChange={handleColorChange}
            />

            {/* Width Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width: {currentWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={currentWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>8px</span>
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BORDER_STYLES.map((borderStyle) => (
                  <button
                    key={borderStyle.value}
                    type="button"
                    onClick={() => handleStyleChange(borderStyle.value)}
                    className={`
                      p-2 text-xs rounded border transition-all duration-200
                      ${currentStyle === borderStyle.value 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-8 h-1 bg-gray-400 ${borderStyle.preview}`}
                      />
                      <span>{borderStyle.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius: {currentRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={currentRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>32px</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[65]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8B5CF6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8B5CF6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
} 