'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ColorPickerProps {
  label?: string;
  value?: string;
  onChange: (color: string) => void;
  presets?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#8B5A2B', // Brown
  '#6B7280', // Gray
  '#000000', // Black
  '#FFFFFF', // White
  '#14B8A6', // Teal
];

export function ColorPicker({ 
  label, 
  value = '#8B5CF6', 
  onChange, 
  presets = DEFAULT_PRESETS,
  disabled = false,
  className = ''
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Color Display Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
            transition-colors duration-200
          `}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm font-mono text-gray-700">
              {value}
            </span>
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Panel */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] p-4">
            {/* Preset Colors */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Preset Colors
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {presets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetClick(color)}
                    className={`
                      w-8 h-8 rounded border-2 transition-all duration-200
                      hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500
                      ${value === color ? 'border-gray-800 ring-2 ring-purple-500' : 'border-gray-200'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Custom Color
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent font-mono"
                />
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

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