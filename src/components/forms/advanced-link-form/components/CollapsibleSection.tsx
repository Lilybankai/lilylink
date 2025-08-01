'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

export function CollapsibleSection({ title, icon, isOpen, onToggle, children, badge }: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name={icon} className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          className="w-4 h-4 text-gray-400" 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
