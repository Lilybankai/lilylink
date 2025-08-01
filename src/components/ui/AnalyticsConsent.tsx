'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '@/components/ui';

interface AnalyticsConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function AnalyticsConsent({ onAccept, onDecline }: AnalyticsConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('analytics-consent');
    if (!consentChoice) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  const handleClose = () => {
    // If user closes without choosing, we assume decline
    handleDecline();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <Card className="p-6 bg-white shadow-2xl border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Analytics & Privacy
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              We use analytics to understand how our links are performing and to improve your experience. 
              This includes tracking page views, clicks, and basic geographic data. 
              No personal information is collected or stored.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Accept Analytics
              </Button>
              <Button
                onClick={handleDecline}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                Decline
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              You can change your preference anytime in settings
            </p>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility functions for consent management
export const AnalyticsConsentUtil = {
  // Check if user has consented to analytics
  hasConsented(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('analytics-consent') === 'accepted';
  },

  // Check if user has made any choice
  hasChoiceMade(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('analytics-consent') !== null;
  },

  // Clear consent choice (for settings)
  clearChoice(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('analytics-consent');
  },

  // Set consent choice programmatically
  setChoice(accepted: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('analytics-consent', accepted ? 'accepted' : 'declined');
  }
};