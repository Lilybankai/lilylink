'use client';

import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';

interface GradientPickerProps {
  label?: string;
  startColor?: string;
  endColor?: string;
  direction?: string;
  onGradientChange: (gradient: { start: string; end: string; direction: string }) => void;
  disabled?: boolean;
  className?: string;
}

const GRADIENT_DIRECTIONS = [
  { value: 'to-r', label: 'Left to Right', preview: 'bg-gradient-to-r' },
  { value: 'to-l', label: 'Right to Left', preview: 'bg-gradient-to-l' },
  { value: 'to-t', label: 'Bottom to Top', preview: 'bg-gradient-to-t' },
  { value: 'to-b', label: 'Top to Bottom', preview: 'bg-gradient-to-b' },
  { value: 'to-br', label: 'Top-Left to Bottom-Right', preview: 'bg-gradient-to-br' },
  { value: 'to-bl', label: 'Top-Right to Bottom-Left', preview: 'bg-gradient-to-bl' },
  { value: 'to-tr', label: 'Bottom-Left to Top-Right', preview: 'bg-gradient-to-tr' },
  { value: 'to-tl', label: 'Bottom-Right to Top-Left', preview: 'bg-gradient-to-tl' },
];

const GRADIENT_PRESETS = [
  { name: 'Ocean Breeze', start: '#3B82F6', end: '#06B6D4', direction: 'to-r' },
  { name: 'Sunset Glow', start: '#F59E0B', end: '#EF4444', direction: 'to-br' },
  { name: 'Purple Dream', start: '#8B5CF6', end: '#EC4899', direction: 'to-r' },
  { name: 'Forest Fresh', start: '#10B981', end: '#84CC16', direction: 'to-br' },
  { name: 'Midnight Blue', start: '#1E40AF', end: '#3730A3', direction: 'to-b' },
  { name: 'Rose Gold', start: '#EC4899', end: '#F59E0B', direction: 'to-r' },
  { name: 'Emerald Mist', start: '#059669', end: '#047857', direction: 'to-tr' },
  { name: 'Cyber Neon', start: '#06B6D4', end: '#8B5CF6', direction: 'to-bl' },
];

export function GradientPicker({
  label = 'Gradient',
  startColor = '#8B5CF6',
  endColor = '#EC4899',
  direction = 'to-r',
  onGradientChange,
  disabled = false,
  className = ''
}: GradientPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStart, setCurrentStart] = useState(startColor);
  const [currentEnd, setCurrentEnd] = useState(endColor);
  const [currentDirection, setCurrentDirection] = useState(direction);

  const handleStartColorChange = (color: string) => {
    setCurrentStart(color);
    onGradientChange({ start: color, end: currentEnd, direction: currentDirection });
  };

  const handleEndColorChange = (color: string) => {
    setCurrentEnd(color);
    onGradientChange({ start: currentStart, end: color, direction: currentDirection });
  };

  const handleDirectionChange = (newDirection: string) => {
    setCurrentDirection(newDirection);
    onGradientChange({ start: currentStart, end: currentEnd, direction: newDirection });
  };

  const handlePresetSelect = (preset: typeof GRADIENT_PRESETS[0]) => {
    setCurrentStart(preset.start);
    setCurrentEnd(preset.end);
    setCurrentDirection(preset.direction);
    onGradientChange(preset);
    setIsOpen(false);
  };

  const getGradientStyle = () => {
    return {
      background: `linear-gradient(${currentDirection.replace('to-', '')}, ${currentStart}, ${currentEnd})`
    };
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Gradient Preview Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-12 rounded-lg border-2 border-gray-300 transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 cursor-pointer'}
          relative overflow-hidden
        `}
        style={getGradientStyle()}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <span className="text-white text-sm font-medium drop-shadow">
            {currentStart} → {currentEnd}
          </span>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] p-4">
          {/* Gradient Presets */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Gradient Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-200 text-left"
                  style={{
                    background: `linear-gradient(${preset.direction.replace('to-', '')}, ${preset.start}, ${preset.end})`
                  }}
                >
                  <div className="text-white text-xs font-medium drop-shadow">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Gradient Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Custom Gradient</h4>
            
            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker
                label="Start Color"
                value={currentStart}
                onChange={handleStartColorChange}
              />
              <ColorPicker
                label="End Color"
                value={currentEnd}
                onChange={handleEndColorChange}
              />
            </div>

            {/* Direction Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_DIRECTIONS.map((dir) => (
                  <button
                    key={dir.value}
                    type="button"
                    onClick={() => handleDirectionChange(dir.value)}
                    className={`
                      p-2 text-xs rounded border transition-all duration-200
                      ${currentDirection === dir.value 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{
                          background: `linear-gradient(${dir.value.replace('to-', '')}, ${currentStart}, ${currentEnd})`
                        }}
                      />
                      <span>{dir.label}</span>
                    </div>
                  </button>
                ))}
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
    </div>
  );
} 