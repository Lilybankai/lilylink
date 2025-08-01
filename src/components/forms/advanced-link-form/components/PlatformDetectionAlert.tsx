'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { PlatformDetectionResult } from '@/types';

interface PlatformDetectionAlertProps {
  platformDetection: PlatformDetectionResult | null;
}

export function PlatformDetectionAlert({ platformDetection }: PlatformDetectionAlertProps) {
  return (
    <AnimatePresence>
      {platformDetection && platformDetection.type !== 'standard' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Icon
                name={platformDetection.suggested_icon || 'link'}
                className="w-6 h-6"
                style={{ color: platformDetection.suggested_color }}
              />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                {platformDetection.type === 'social' && 'Social Media Link Detected'}
                {platformDetection.type === 'media' && 'Media Link Detected'}
                {platformDetection.type === 'product' && 'Product Link Detected'}
              </h4>
              <p className="text-sm text-blue-700">
                Platform: {platformDetection.platform_data?.display_name || platformDetection.platform}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
