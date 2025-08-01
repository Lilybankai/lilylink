
import { useState } from 'react';

export const useUrlValidation = () => {
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true });

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlValidation({ isValid: true });
      return;
    }

    try {
      new URL(url);
      setUrlValidation({ isValid: true });
    } catch {
      setUrlValidation({
        isValid: false,
        message: 'Please enter a valid URL (e.g., https://example.com)',
      });
    }
  };

  return { urlValidation, validateUrl, setUrlValidation };
};
