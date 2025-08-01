'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimationSelectorProps {
  label?: string;
  animationType?: string;
  hoverEffect?: string;
  onAnimationChange: (animation: { type: string; hover: string }) => void;
  disabled?: boolean;
  className?: string;
}

const ANIMATION_TYPES = [
  { value: 'none', label: 'None', description: 'No animation' },
  { value: 'pulse', label: 'Pulse', description: 'Gentle pulsing effect' },
  { value: 'bounce', label: 'Bounce', description: 'Bouncing entrance' },
  { value: 'shake', label: 'Shake', description: 'Attention-grabbing shake' },
  { value: 'glow', label: 'Glow', description: 'Soft glowing effect' },
  { value: 'slide', label: 'Slide', description: 'Slide in from side' },
];

const HOVER_EFFECTS = [
  { value: 'none', label: 'None', description: 'No hover effect' },
  { value: 'lift', label: 'Lift', description: 'Subtle lift up' },
  { value: 'scale', label: 'Scale', description: 'Grow slightly larger' },
  { value: 'glow', label: 'Glow', description: 'Add soft glow' },
  { value: 'shadow', label: 'Shadow', description: 'Enhanced shadow' },
  { value: 'rotate', label: 'Rotate', description: 'Slight rotation' },
];

const ANIMATION_PRESETS = [
  { name: 'Subtle', animation: 'none', hover: 'lift', description: 'Clean and minimal' },
  { name: 'Playful', animation: 'bounce', hover: 'scale', description: 'Fun and energetic' },
  { name: 'Professional', animation: 'slide', hover: 'shadow', description: 'Smooth and polished' },
  { name: 'Eye-catching', animation: 'glow', hover: 'glow', description: 'Attention-grabbing' },
  { name: 'Dynamic', animation: 'pulse', hover: 'rotate', description: 'Lively and engaging' },
  { name: 'Bold', animation: 'shake', hover: 'scale', description: 'Strong presence' },
];

export function AnimationSelector({
  label = 'Animation',
  animationType = 'none',
  hoverEffect = 'none',
  onAnimationChange,
  disabled = false,
  className = ''
}: AnimationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(animationType);
  const [currentHover, setCurrentHover] = useState(hoverEffect);
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);

  const handleAnimationChange = (newAnimation: string) => {
    setCurrentAnimation(newAnimation);
    onAnimationChange({ type: newAnimation, hover: currentHover });
  };

  const handleHoverChange = (newHover: string) => {
    setCurrentHover(newHover);
    onAnimationChange({ type: currentAnimation, hover: newHover });
  };

  const handlePresetSelect = (preset: typeof ANIMATION_PRESETS[0]) => {
    setCurrentAnimation(preset.animation);
    setCurrentHover(preset.hover);
    onAnimationChange({ type: preset.animation, hover: preset.hover });
    setIsOpen(false);
  };

  const getAnimationVariants = (type: string) => {
    switch (type) {
      case 'pulse':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'bounce':
        return {
          animate: { y: [0, -10, 0] },
          transition: { duration: 1, repeat: Infinity }
        };
      case 'shake':
        return {
          animate: { x: [0, -5, 5, 0] },
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
        };
      case 'glow':
        return {
          animate: { boxShadow: ['0 0 0 rgba(139, 92, 246, 0)', '0 0 20px rgba(139, 92, 246, 0.5)', '0 0 0 rgba(139, 92, 246, 0)'] },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'slide':
        return {
          initial: { x: -20, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { duration: 0.5 }
        };
      default:
        return {};
    }
  };

  const getHoverVariants = (type: string) => {
    switch (type) {
      case 'lift':
        return { whileHover: { y: -2 } };
      case 'scale':
        return { whileHover: { scale: 1.05 } };
      case 'glow':
        return { whileHover: { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' } };
      case 'shadow':
        return { whileHover: { boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' } };
      case 'rotate':
        return { whileHover: { rotate: 2 } };
      default:
        return {};
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Animation Preview Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-12 bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 flex items-center justify-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
        `}
      >
        <span className="text-gray-600 text-sm font-medium">
          {currentAnimation === 'none' ? 'No animation' : ANIMATION_TYPES.find(a => a.value === currentAnimation)?.label} • {currentHover === 'none' ? 'No hover' : HOVER_EFFECTS.find(h => h.value === currentHover)?.label}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] p-4">
          {/* Animation Presets */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Animation Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {ANIMATION_PRESETS.map((preset) => (
                <motion.button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-purple-700 text-sm font-medium mb-1">
                    {preset.name}
                  </div>
                  <div className="text-purple-600 text-xs">
                    {preset.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Animation Controls */}
          <div className="space-y-6">
            <h4 className="text-sm font-medium text-gray-700">Custom Animation</h4>
            
            {/* Animation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Entrance Animation
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ANIMATION_TYPES.map((animation) => (
                  <motion.button
                    key={animation.value}
                    type="button"
                    onClick={() => handleAnimationChange(animation.value)}
                    onMouseEnter={() => setPreviewAnimation(animation.value)}
                    onMouseLeave={() => setPreviewAnimation(null)}
                    className={`
                      p-3 text-xs rounded border transition-all duration-200 text-left
                      ${currentAnimation === animation.value 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }
                    `}
                    {...(previewAnimation === animation.value ? getAnimationVariants(animation.value) : {})}
                  >
                    <div className="font-medium mb-1">{animation.label}</div>
                    <div className="text-xs opacity-75">{animation.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hover Effect */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hover Effect
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HOVER_EFFECTS.map((hover) => (
                  <motion.button
                    key={hover.value}
                    type="button"
                    onClick={() => handleHoverChange(hover.value)}
                    className={`
                      p-3 text-xs rounded border transition-all duration-200 text-left
                      ${currentHover === hover.value 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }
                    `}
                    {...getHoverVariants(hover.value)}
                  >
                    <div className="font-medium mb-1">{hover.label}</div>
                    <div className="text-xs opacity-75">{hover.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <motion.div
                  className="w-24 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                  {...getAnimationVariants(currentAnimation)}
                  {...getHoverVariants(currentHover)}
                >
                  Sample Link
                </motion.div>
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