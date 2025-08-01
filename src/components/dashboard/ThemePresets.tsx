'use client';

import { motion } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { PREDEFINED_THEMES } from '@/constants/themePresets';

interface ThemePresetsProps {
  onPresetSelect: (preset: typeof PREDEFINED_THEMES[0]) => void;
}

export function ThemePresets({ onPresetSelect }: ThemePresetsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Theme</h3>
        <p className="text-sm text-gray-600">
          Start with a predefined theme and customize it to match your brand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PREDEFINED_THEMES.map((preset) => (
          <motion.div
            key={preset.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200">
              <div className="space-y-3">
                {/* Theme Preview */}
                <div 
                  className="h-32 rounded-lg relative overflow-hidden"
                  style={{
                    background: preset.config.background?.value || '#ffffff'
                  }}
                >
                  <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-center">
                    <div 
                      className="text-sm font-semibold mb-1"
                      style={{ 
                        color: preset.config.typography?.title.color,
                        fontFamily: preset.config.typography?.fontFamily
                      }}
                    >
                      {preset.name}
                    </div>
                    <div 
                      className="text-xs mb-2"
                      style={{ 
                        color: preset.config.typography?.description.color,
                        fontFamily: preset.config.typography?.fontFamily
                      }}
                    >
                      Sample description text
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-xs"
                      style={{
                        backgroundColor: preset.config.links?.backgroundColor,
                        color: preset.config.links?.textColor,
                        borderRadius: preset.config.links?.borderRadius
                      }}
                    >
                      Sample Link
                    </div>
                  </div>
                </div>

                {/* Theme Info */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                  
                  <Button
                    onClick={() => onPresetSelect(preset)}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Apply Theme
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}