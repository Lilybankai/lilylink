
import { useState } from 'react';
import { detectPlatformWithData } from '@/lib/api/platforms';
import { detectPlatformFromUrl } from '@/lib/icons';
import { CreateLinkInput, PlatformDetectionResult } from '@/types';
import { IconData } from '@/lib/icons';

export const usePlatformDetection = (
  formData: CreateLinkInput,
  updateFormData: (updates: Partial<CreateLinkInput>) => void,
  setSelectedIcon: (icon: IconData | null) => void
) => {
  const [platformDetection, setPlatformDetection] = useState<PlatformDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectPlatform = async () => {
    if (!formData.url) return;

    setIsDetecting(true);
    try {
      const detection = await detectPlatformWithData(formData.url);
      setPlatformDetection(detection);

      try {
        const detectedIcon = detectPlatformFromUrl(formData.url);
        if (detectedIcon) {
          setSelectedIcon(detectedIcon);
          if (!formData.title) {
            updateFormData({ title: detectedIcon.name });
          }
        }
      } catch (error) {
        // Invalid URL, ignore for icon detection
      }

      if (detection.type !== 'standard' && formData.link_type === 'standard') {
        updateFormData({ link_type: detection.type });
      }
    } catch (error) {
      console.error('Platform detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  return { platformDetection, isDetecting, detectPlatform, setPlatformDetection };
};
