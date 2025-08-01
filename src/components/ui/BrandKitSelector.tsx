'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BrandKitSelectorProps {
  label?: string;
  selectedKit?: string;
  onKitSelect: (kit: BrandKit) => void;
  disabled?: boolean;
  className?: string;
}

interface BrandKit {
  id: string;
  name: string;
  description: string;
  industry: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  gradients: Array<{
    name: string;
    start: string;
    end: string;
    direction: string;
  }>;
  typography: {
    primary_font: string;
    secondary_font: string;
    font_weights: number[];
  };
  animations: {
    hover_effects: string[];
    entrance_animations: string[];
  };
}

// Predefined brand kits for different industries
const BRAND_KITS: BrandKit[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern, clean design perfect for technology companies and startups',
    industry: 'tech',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#06B6D4',
      text: '#FFFFFF',
      background: '#F8FAFC'
    },
    gradients: [
      { name: 'Blue Ocean', start: '#3B82F6', end: '#06B6D4', direction: 'to-r' },
      { name: 'Deep Tech', start: '#1E40AF', end: '#3730A3', direction: 'to-br' }
    ],
    typography: {
      primary_font: 'Inter',
      secondary_font: 'JetBrains Mono',
      font_weights: [400, 500, 600, 700]
    },
    animations: {
      hover_effects: ['lift', 'glow'],
      entrance_animations: ['slide', 'glow']
    }
  },
  {
    id: 'fashion-brand',
    name: 'Fashion Brand',
    description: 'Elegant and stylish design for fashion and lifestyle brands',
    industry: 'fashion',
    colors: {
      primary: '#EC4899',
      secondary: '#BE185D',
      accent: '#F59E0B',
      text: '#FFFFFF',
      background: '#FDF2F8'
    },
    gradients: [
      { name: 'Rose Gold', start: '#EC4899', end: '#F59E0B', direction: 'to-r' },
      { name: 'Deep Rose', start: '#BE185D', end: '#831843', direction: 'to-br' }
    ],
    typography: {
      primary_font: 'Poppins',
      secondary_font: 'Playfair Display',
      font_weights: [300, 400, 500, 600, 700]
    },
    animations: {
      hover_effects: ['scale', 'glow'],
      entrance_animations: ['bounce', 'glow']
    }
  },
  {
    id: 'food-restaurant',
    name: 'Food & Restaurant',
    description: 'Warm, inviting colors perfect for restaurants and food businesses',
    industry: 'food',
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#EF4444',
      text: '#FFFFFF',
      background: '#FEF7ED'
    },
    gradients: [
      { name: 'Sunset Spice', start: '#F59E0B', end: '#EF4444', direction: 'to-r' },
      { name: 'Golden Hour', start: '#D97706', end: '#B45309', direction: 'to-br' }
    ],
    typography: {
      primary_font: 'Nunito',
      secondary_font: 'Dancing Script',
      font_weights: [400, 500, 600, 700, 800]
    },
    animations: {
      hover_effects: ['bounce', 'shadow'],
      entrance_animations: ['pulse', 'bounce']
    }
  },
  {
    id: 'fitness-health',
    name: 'Fitness & Health',
    description: 'Energetic design for fitness, health, and wellness brands',
    industry: 'fitness',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#06B6D4',
      text: '#FFFFFF',
      background: '#F0FDF4'
    },
    gradients: [
      { name: 'Fresh Energy', start: '#10B981', end: '#06B6D4', direction: 'to-r' },
      { name: 'Deep Forest', start: '#059669', end: '#047857', direction: 'to-br' }
    ],
    typography: {
      primary_font: 'Roboto',
      secondary_font: 'Oswald',
      font_weights: [400, 500, 600, 700, 800]
    },
    animations: {
      hover_effects: ['pulse', 'scale'],
      entrance_animations: ['bounce', 'pulse']
    }
  },
  {
    id: 'music-artist',
    name: 'Music & Artist',
    description: 'Creative and vibrant design for musicians and artists',
    industry: 'music',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#EC4899',
      text: '#FFFFFF',
      background: '#F5F3FF'
    },
    gradients: [
      { name: 'Purple Haze', start: '#8B5CF6', end: '#EC4899', direction: 'to-r' },
      { name: 'Deep Purple', start: '#7C3AED', end: '#5B21B6', direction: 'to-br' }
    ],
    typography: {
      primary_font: 'Montserrat',
      secondary_font: 'Fredoka One',
      font_weights: [400, 500, 600, 700, 800]
    },
    animations: {
      hover_effects: ['rotate', 'glow'],
      entrance_animations: ['bounce', 'shake']
    }
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    description: 'Clean, trustworthy design for professional services',
    industry: 'business',
    colors: {
      primary: '#1E40AF',
      secondary: '#1E3A8A',
      accent: '#059669',
      text: '#FFFFFF',
      background: '#F8FAFC'
    },
    gradients: [
      { name: 'Corporate Blue', start: '#1E40AF', end: '#059669', direction: 'to-r' },
      { name: 'Deep Business', start: '#1E3A8A', end: '#1E293B', direction: 'to-br' }
    ],
    typography: {
      primary_font: 'Inter',
      secondary_font: 'Source Sans Pro',
      font_weights: [400, 500, 600, 700]
    },
    animations: {
      hover_effects: ['lift', 'shadow'],
      entrance_animations: ['slide', 'none']
    }
  }
];

const INDUSTRY_ICONS = {
  tech: '💻',
  fashion: '👗',
  food: '🍽️',
  fitness: '💪',
  music: '🎵',
  business: '💼',
  art: '🎨',
  education: '📚',
  healthcare: '🏥',
  other: '✨'
};

export function BrandKitSelector({
  label = 'Brand Kit',
  selectedKit,
  onKitSelect,
  disabled = false,
  className = ''
}: BrandKitSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const filteredKits = selectedIndustry === 'all' 
    ? BRAND_KITS 
    : BRAND_KITS.filter(kit => kit.industry === selectedIndustry);

  const industries = Array.from(new Set(BRAND_KITS.map(kit => kit.industry)));

  const handleKitSelect = (kit: BrandKit) => {
    onKitSelect(kit);
    setIsOpen(false);
  };

  const selectedKitData = BRAND_KITS.find(kit => kit.id === selectedKit);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Brand Kit Preview Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-16 rounded-lg border-2 border-gray-300 transition-all duration-200 relative overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 cursor-pointer'}
        `}
        style={{
          background: selectedKitData 
            ? `linear-gradient(135deg, ${selectedKitData.colors.primary}, ${selectedKitData.colors.secondary})`
            : 'linear-gradient(135deg, #E5E7EB, #9CA3AF)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg font-semibold drop-shadow">
              {selectedKitData ? selectedKitData.name : 'Choose Brand Kit'}
            </div>
            {selectedKitData && (
              <div className="text-white text-xs opacity-90 drop-shadow">
                {INDUSTRY_ICONS[selectedKitData.industry as keyof typeof INDUSTRY_ICONS]} {selectedKitData.industry}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] p-4 max-h-96 overflow-y-auto">
          {/* Industry Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {INDUSTRY_ICONS[industry as keyof typeof INDUSTRY_ICONS]} {industry.charAt(0).toUpperCase() + industry.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Kits Grid */}
          <div className="space-y-3">
            {filteredKits.map((kit) => (
              <motion.button
                key={kit.id}
                type="button"
                onClick={() => handleKitSelect(kit)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${selectedKit === kit.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  {/* Color Preview */}
                  <div className="flex-shrink-0">
                    <div 
                      className="w-16 h-12 rounded-lg border border-gray-200"
                      style={{
                        background: `linear-gradient(135deg, ${kit.colors.primary}, ${kit.colors.secondary})`
                      }}
                    />
                    <div className="flex mt-1 gap-1">
                      {kit.gradients.slice(0, 2).map((gradient, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-200"
                          style={{
                            background: `linear-gradient(${gradient.direction.replace('to-', '')}, ${gradient.start}, ${gradient.end})`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Kit Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{kit.name}</h4>
                      <span className="text-lg">
                        {INDUSTRY_ICONS[kit.industry as keyof typeof INDUSTRY_ICONS]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {kit.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Font: {kit.typography.primary_font}</span>
                      <span>Effects: {kit.animations.hover_effects.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Preview Links */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    {kit.gradients.slice(0, 2).map((gradient, index) => (
                      <div
                        key={index}
                        className="p-2 rounded text-center text-white text-xs font-medium"
                        style={{
                          background: `linear-gradient(${gradient.direction.replace('to-', '')}, ${gradient.start}, ${gradient.end})`
                        }}
                      >
                        {gradient.name}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
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