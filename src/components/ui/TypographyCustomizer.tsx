'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ColorPicker, Input, Card, Button } from '@/components/ui';

export interface TypographyConfig {
  fontFamily: string;
  title: {
    size: string;
    weight: string;
    color: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  description: {
    size: string;
    weight?: string;
    color: string;
    lineHeight?: string;
  };
  links: {
    size: string;
    weight?: string;
    color: string;
  };
}

interface TypographyCustomizerProps {
  value: TypographyConfig;
  onChange: (config: TypographyConfig) => void;
  className?: string;
}

interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
  files: Record<string, string>;
}

// Popular Google Fonts with categories
const POPULAR_FONTS = [
  { family: 'Inter', category: 'sans-serif', description: 'Modern and versatile' },
  { family: 'Poppins', category: 'sans-serif', description: 'Friendly and approachable' },
  { family: 'Roboto', category: 'sans-serif', description: 'Clean and readable' },
  { family: 'Montserrat', category: 'sans-serif', description: 'Bold and impactful' },
  { family: 'Open Sans', category: 'sans-serif', description: 'Highly readable' },
  { family: 'Lato', category: 'sans-serif', description: 'Professional' },
  { family: 'Source Sans Pro', category: 'sans-serif', description: 'Technical and clean' },
  { family: 'Nunito', category: 'sans-serif', description: 'Rounded and friendly' },
  { family: 'Raleway', category: 'sans-serif', description: 'Elegant and refined' },
  { family: 'Ubuntu', category: 'sans-serif', description: 'Modern humanist' },
  { family: 'Playfair Display', category: 'serif', description: 'Elegant display' },
  { family: 'Merriweather', category: 'serif', description: 'Readable serif' },
  { family: 'Crimson Text', category: 'serif', description: 'Classic book font' },
  { family: 'Libre Baskerville', category: 'serif', description: 'Traditional serif' },
  { family: 'Fira Code', category: 'monospace', description: 'Code-friendly' },
  { family: 'JetBrains Mono', category: 'monospace', description: 'Developer favorite' }
];

const FONT_SIZES = [
  { label: 'Extra Small', value: 'xs', pixels: '12px' },
  { label: 'Small', value: 'sm', pixels: '14px' },
  { label: 'Base', value: 'base', pixels: '16px' },
  { label: 'Large', value: 'lg', pixels: '18px' },
  { label: 'Extra Large', value: 'xl', pixels: '20px' },
  { label: '2X Large', value: '2xl', pixels: '24px' },
  { label: '3X Large', value: '3xl', pixels: '30px' },
  { label: '4X Large', value: '4xl', pixels: '36px' },
  { label: '5X Large', value: '5xl', pixels: '48px' }
];

const FONT_WEIGHTS = [
  { label: 'Thin', value: '100' },
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' }
];

const LINE_HEIGHTS = [
  { label: 'Tight', value: '1.25' },
  { label: 'Snug', value: '1.375' },
  { label: 'Normal', value: '1.5' },
  { label: 'Relaxed', value: '1.625' },
  { label: 'Loose', value: '2' }
];

const LETTER_SPACINGS = [
  { label: 'Tighter', value: '-0.05em' },
  { label: 'Tight', value: '-0.025em' },
  { label: 'Normal', value: '0em' },
  { label: 'Wide', value: '0.025em' },
  { label: 'Wider', value: '0.05em' },
  { label: 'Widest', value: '0.1em' }
];

export function TypographyCustomizer({ value, onChange, className = '' }: TypographyCustomizerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'family' | 'title' | 'description' | 'links'>('family');

  // Load Google Font dynamically
  const loadGoogleFont = useCallback((fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setLoadedFonts(prev => new Set(prev).add(fontFamily));
  }, [loadedFonts]);

  // Load current font family
  useEffect(() => {
    if (value.fontFamily) {
      loadGoogleFont(value.fontFamily);
    }
  }, [value.fontFamily, loadGoogleFont]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    loadGoogleFont(fontFamily);
    onChange({
      ...value,
      fontFamily
    });
  }, [value, onChange, loadGoogleFont]);

  const handleTitleChange = useCallback((property: keyof TypographyConfig['title'], propertyValue: string) => {
    onChange({
      ...value,
      title: {
        ...value.title,
        [property]: propertyValue
      }
    });
  }, [value, onChange]);

  const handleDescriptionChange = useCallback((property: keyof TypographyConfig['description'], propertyValue: string) => {
    onChange({
      ...value,
      description: {
        ...value.description,
        [property]: propertyValue
      }
    });
  }, [value, onChange]);

  const handleLinksChange = useCallback((property: keyof TypographyConfig['links'], propertyValue: string) => {
    onChange({
      ...value,
      links: {
        ...value.links,
        [property]: propertyValue
      }
    });
  }, [value, onChange]);

  const filteredFonts = POPULAR_FONTS.filter(font => {
    const matchesSearch = font.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         font.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderFontFamilyTab = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'sans-serif', 'serif', 'monospace'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                ${selectedCategory === category
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Font List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredFonts.map((font) => (
          <motion.button
            key={font.family}
            onClick={() => handleFontFamilyChange(font.family)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full p-3 text-left rounded-lg border-2 transition-all duration-200
              ${value.fontFamily === font.family
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
              }
            `}
            style={{ fontFamily: font.family }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{font.family}</div>
                <div className="text-sm text-gray-600">{font.description}</div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {font.category}
              </div>
            </div>
            <div className="mt-2 text-lg" style={{ fontFamily: font.family }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderTitleTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <select
            value={value.title.size}
            onChange={(e) => handleTitleChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label} ({size.pixels})
              </option>
            ))}
          </select>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
          <select
            value={value.title.weight}
            onChange={(e) => handleTitleChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
          <select
            value={value.title.lineHeight || '1.5'}
            onChange={(e) => handleTitleChange('lineHeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {LINE_HEIGHTS.map((height) => (
              <option key={height.value} value={height.value}>
                {height.label}
              </option>
            ))}
          </select>
        </div>

        {/* Letter Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
          <select
            value={value.title.letterSpacing || '0em'}
            onChange={(e) => handleTitleChange('letterSpacing', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {LETTER_SPACINGS.map((spacing) => (
              <option key={spacing.value} value={spacing.value}>
                {spacing.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <ColorPicker
          value={value.title.color}
          onChange={(color) => handleTitleChange('color', color)}
        />
      </div>
    </div>
  );

  const renderDescriptionTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <select
            value={value.description.size}
            onChange={(e) => handleDescriptionChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label} ({size.pixels})
              </option>
            ))}
          </select>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
          <select
            value={value.description.weight || '400'}
            onChange={(e) => handleDescriptionChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
          <select
            value={value.description.lineHeight || '1.5'}
            onChange={(e) => handleDescriptionChange('lineHeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {LINE_HEIGHTS.map((height) => (
              <option key={height.value} value={height.value}>
                {height.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <ColorPicker
          value={value.description.color}
          onChange={(color) => handleDescriptionChange('color', color)}
        />
      </div>
    </div>
  );

  const renderLinksTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <select
            value={value.links.size}
            onChange={(e) => handleLinksChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label} ({size.pixels})
              </option>
            ))}
          </select>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
          <select
            value={value.links.weight || '400'}
            onChange={(e) => handleLinksChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <ColorPicker
          value={value.links.color}
          onChange={(color) => handleLinksChange('color', color)}
        />
      </div>
    </div>
  );

  const renderPreview = () => {
    const titleStyles: React.CSSProperties = {
      fontFamily: value.fontFamily,
      fontSize: FONT_SIZES.find(s => s.value === value.title.size)?.pixels || '24px',
      fontWeight: value.title.weight,
      color: value.title.color,
      lineHeight: value.title.lineHeight || '1.5',
      letterSpacing: value.title.letterSpacing || '0em'
    };

    const descriptionStyles: React.CSSProperties = {
      fontFamily: value.fontFamily,
      fontSize: FONT_SIZES.find(s => s.value === value.description.size)?.pixels || '16px',
      fontWeight: value.description.weight || '400',
      color: value.description.color,
      lineHeight: value.description.lineHeight || '1.5'
    };

    const linkStyles: React.CSSProperties = {
      fontFamily: value.fontFamily,
      fontSize: FONT_SIZES.find(s => s.value === value.links.size)?.pixels || '16px',
      fontWeight: value.links.weight || '400',
      color: value.links.color
    };

    return (
      <Card className="p-6 bg-gray-50">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Typography Preview</h4>
          
          <div style={titleStyles}>
            Your Page Title
          </div>
          
          <div style={descriptionStyles}>
            This is a sample description that shows how your text will appear on your link page. It demonstrates the font family, size, weight, and color you've selected.
          </div>
          
          <div 
            className="bg-white p-3 rounded-lg border border-gray-200"
            style={linkStyles}
          >
            Sample Link Button
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview */}
      {renderPreview()}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'family', label: 'Font Family', icon: DocumentTextIcon },
            { id: 'title', label: 'Title', icon: AdjustmentsHorizontalIcon },
            { id: 'description', label: 'Description', icon: AdjustmentsHorizontalIcon },
            { id: 'links', label: 'Links', icon: AdjustmentsHorizontalIcon }
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
          {activeTab === 'family' && renderFontFamilyTab()}
          {activeTab === 'title' && renderTitleTab()}
          {activeTab === 'description' && renderDescriptionTab()}
          {activeTab === 'links' && renderLinksTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 