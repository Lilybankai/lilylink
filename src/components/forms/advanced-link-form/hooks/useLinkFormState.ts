
import { useState } from 'react';
import { CreateLinkInput, Link } from '@/types';

export const useLinkFormState = (pageId: string, existingLink?: Link) => {
  const [formData, setFormData] = useState<CreateLinkInput>({
    page_id: pageId,
    title: existingLink?.title || '',
    url: existingLink?.url || '',
    description: existingLink?.description || '',
    link_type: existingLink?.link_type || 'standard',
    product_price: existingLink?.product_price || undefined,
    product_currency: existingLink?.product_currency || 'USD',
    product_availability: existingLink?.product_availability || undefined,
    contact_type: existingLink?.contact_type || undefined,
    phone_number: existingLink?.phone_number || '',
    email_address: existingLink?.email_address || '',
    payment_amount: existingLink?.payment_amount || undefined,
    payment_currency: existingLink?.payment_currency || 'USD',
    payment_type: existingLink?.payment_type || undefined,
    auto_play: existingLink?.auto_play || false,
    metadata: existingLink?.metadata || {},
  });

  const updateFormData = (updates: Partial<CreateLinkInput>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return { formData, updateFormData };
};
