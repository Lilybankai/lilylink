'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Predefined color palette
  const colorPalette = [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
    '#EF4444', '#6366F1', '#8B5A2B', '#059669', '#DC2626',
    '#7C3AED', '#DB2777', '#2563EB', '#059669', '#D97706',
    '#B91C1C', '#4F46E5', '#A855F7', '#06B6D4', '#65A30D',
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB',
    '#F3F4F6', '#F9FAFB', '#FFFFFF'
  ];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidColor(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  };

  const isValidColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Color Preview Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          style={{ backgroundColor: isValidColor(inputValue) ? inputValue : '#FFFFFF' }}
        />

        {/* Color Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
          placeholder="#8B5CF6"
        />

        {/* Native Color Input (Hidden) */}
        <input
          type="color"
          value={isValidColor(inputValue) ? inputValue : '#8B5CF6'}
          onChange={(e) => handleColorSelect(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        />
      </div>

      {/* Color Palette Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[280px]"
          >
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Color Palette</h4>
              <div className="grid grid-cols-7 gap-2">
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`
                      w-8 h-8 rounded border-2 hover:scale-110 transition-transform
                      ${color === inputValue ? 'border-gray-900' : 'border-gray-300'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Color</h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                  placeholder="#8B5CF6"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}