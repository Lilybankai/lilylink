'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ColorPreset {
  name: string;
  description: string;
  button_color: string;
  text_color: string;
  icon_color?: string;
  category: 'vibrant' | 'minimal' | 'professional' | 'creative';
}

interface ColorPresetsProps {
  onSelect: (preset: ColorPreset) => void;
  className?: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  // Vibrant Presets
  {
    name: 'Purple Passion',
    description: 'Bold purple with white text',
    button_color: '#8B5CF6',
    text_color: '#FFFFFF',
    icon_color: '#A855F7',
    category: 'vibrant'
  },
  {
    name: 'Pink Power',
    description: 'Energetic pink gradient feel',
    button_color: '#EC4899',
    text_color: '#FFFFFF',
    icon_color: '#F472B6',
    category: 'vibrant'
  },
  {
    name: 'Ocean Blue',
    description: 'Deep blue with crisp white',
    button_color: '#3B82F6',
    text_color: '#FFFFFF',
    icon_color: '#60A5FA',
    category: 'vibrant'
  },
  {
    name: 'Emerald Dream',
    description: 'Fresh green vibes',
    button_color: '#10B981',
    text_color: '#FFFFFF',
    icon_color: '#34D399',
    category: 'vibrant'
  },
  {
    name: 'Sunset Orange',
    description: 'Warm orange energy',
    button_color: '#F59E0B',
    text_color: '#FFFFFF',
    icon_color: '#FBBF24',
    category: 'vibrant'
  },
  
  // Minimal Presets
  {
    name: 'Pure White',
    description: 'Clean white with dark text',
    button_color: '#FFFFFF',
    text_color: '#1F2937',
    icon_color: '#6B7280',
    category: 'minimal'
  },
  {
    name: 'Soft Gray',
    description: 'Subtle gray tones',
    button_color: '#F3F4F6',
    text_color: '#374151',
    icon_color: '#9CA3AF',
    category: 'minimal'
  },
  {
    name: 'Light Purple',
    description: 'Gentle purple accent',
    button_color: '#F3E8FF',
    text_color: '#5B21B6',
    icon_color: '#8B5CF6',
    category: 'minimal'
  },
  {
    name: 'Cream',
    description: 'Warm cream background',
    button_color: '#FEF7ED',
    text_color: '#9A3412',
    icon_color: '#EA580C',
    category: 'minimal'
  },
  
  // Professional Presets
  {
    name: 'Corporate Blue',
    description: 'Professional navy blue',
    button_color: '#1E40AF',
    text_color: '#FFFFFF',
    icon_color: '#3B82F6',
    category: 'professional'
  },
  {
    name: 'Business Gray',
    description: 'Sophisticated charcoal',
    button_color: '#374151',
    text_color: '#FFFFFF',
    icon_color: '#6B7280',
    category: 'professional'
  },
  {
    name: 'Executive Black',
    description: 'Sleek black design',
    button_color: '#111827',
    text_color: '#FFFFFF',
    icon_color: '#4B5563',
    category: 'professional'
  },
  {
    name: 'Trust Teal',
    description: 'Reliable teal tone',
    button_color: '#0F766E',
    text_color: '#FFFFFF',
    icon_color: '#14B8A6',
    category: 'professional'
  },
  
  // Creative Presets
  {
    name: 'Neon Green',
    description: 'Electric lime energy',
    button_color: '#84CC16',
    text_color: '#1A2E05',
    icon_color: '#65A30D',
    category: 'creative'
  },
  {
    name: 'Hot Pink',
    description: 'Bold magenta statement',
    button_color: '#E11D48',
    text_color: '#FFFFFF',
    icon_color: '#F43F5E',
    category: 'creative'
  },
  {
    name: 'Electric Purple',
    description: 'Vibrant violet vibes',
    button_color: '#7C3AED',
    text_color: '#FFFFFF',
    icon_color: '#8B5CF6',
    category: 'creative'
  },
  {
    name: 'Cyber Yellow',
    description: 'Futuristic yellow glow',
    button_color: '#EAB308',
    text_color: '#1F2937',
    icon_color: '#F59E0B',
    category: 'creative'
  },
];

const CATEGORY_LABELS = {
  vibrant: 'Vibrant',
  minimal: 'Minimal',
  professional: 'Professional',
  creative: 'Creative'
};

export function ColorPresets({ onSelect, className = '' }: ColorPresetsProps) {
  const categories = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>;

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Color Presets
        </h3>
        <p className="text-sm text-gray-600">
          Choose from our curated color combinations or create your own custom colors.
        </p>
      </div>

      {categories.map((category) => {
        const categoryPresets = COLOR_PRESETS.filter(preset => preset.category === category);
        
        return (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {categoryPresets.map((preset) => (
                <motion.button
                  key={preset.name}
                  type="button"
                  onClick={() => onSelect(preset)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative p-4 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-200 text-left group"
                  style={{ 
                    backgroundColor: preset.button_color,
                    color: preset.text_color 
                  }}
                >
                  {/* Preview Content */}
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: preset.icon_color || preset.text_color }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: preset.text_color }}
                      />
                    </div>
                    <span className="font-medium text-sm truncate">
                      {preset.name}
                    </span>
                  </div>
                  
                  <p 
                    className="text-xs opacity-80 line-clamp-1"
                    style={{ color: preset.text_color }}
                  >
                    {preset.description}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex gap-1 mt-3">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: preset.button_color }}
                      title="Button Color"
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: preset.text_color }}
                      title="Text Color"
                    />
                    {preset.icon_color && (
                      <div 
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: preset.icon_color }}
                        title="Icon Color"
                      />
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 