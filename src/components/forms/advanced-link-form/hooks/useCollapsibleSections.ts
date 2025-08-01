
import { useState, useEffect } from 'react';

export const useCollapsibleSections = (linkType: string) => {
  const [openSections, setOpenSections] = useState({
    linkSettings: linkType !== 'standard',
    appearance: false,
    advanced: false,
  });

  useEffect(() => {
    if (linkType !== 'standard') {
      setOpenSections(prev => ({ ...prev, linkSettings: true }));
    }
  }, [linkType]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return { openSections, toggleSection };
};
