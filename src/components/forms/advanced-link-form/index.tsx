
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Icon, IconPicker } from '@/components/ui/Icon';
import { CreateLinkInput, Link } from '@/types';
import { validateContactLink } from '@/lib/api/platforms';
import { type IconData } from '@/lib/icons';
import { CollapsibleSection } from './components/CollapsibleSection';
import { BasicLinkInfo } from './components/BasicLinkInfo';
import { PlatformDetectionAlert } from './components/PlatformDetectionAlert';
import { FormActions } from './components/FormActions';
import { ProductLinkSettings } from './components/link-settings/ProductLinkSettings';
import { ContactLinkSettings } from './components/link-settings/ContactLinkSettings';
import { MediaLinkSettings } from './components/link-settings/MediaLinkSettings';
import { useLinkFormState } from './hooks/useLinkFormState';
import { usePlatformDetection } from './hooks/usePlatformDetection';
import { useUrlValidation } from './hooks/useUrlValidation';
import { useCollapsibleSections } from './hooks/useCollapsibleSections';
import { Button } from '@/components/ui';

interface AdvancedLinkFormProps {
  pageId: string;
  existingLink?: Link;
  onSubmit: (linkData: CreateLinkInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AdvancedLinkForm({
  pageId,
  existingLink,
  onSubmit,
  onCancel,
  isLoading = false,
}: AdvancedLinkFormProps) {
  const { formData, updateFormData } = useLinkFormState(pageId, existingLink);
  const { urlValidation, validateUrl, setUrlValidation } = useUrlValidation();
  const [selectedIcon, setSelectedIcon] = useState<IconData | null>(null);
  const { platformDetection, isDetecting, detectPlatform, setPlatformDetection } = usePlatformDetection(
    formData,
    updateFormData,
    setSelectedIcon
  );
  const { openSections, toggleSection } = useCollapsibleSections(formData.link_type || 'standard');

  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (formData.url && formData.url.length > 10) {
      detectPlatform();
    } else {
      setPlatformDetection(null);
    }
    validateUrl(formData.url);
  }, [formData.url, detectPlatform, setPlatformDetection, validateUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlValidation.isValid) {
      return;
    }

    if (formData.link_type === 'contact' && formData.contact_type) {
      let contactValue = '';
      switch (formData.contact_type) {
        case 'email':
          contactValue = formData.email_address || '';
          break;
        case 'phone':
        case 'whatsapp':
          contactValue = formData.phone_number || '';
          break;
      }
      if (contactValue) {
        const contactValidation = validateContactLink(formData.contact_type, contactValue);
        if (!contactValidation.isValid) {
          setUrlValidation({
            isValid: false,
            message: contactValidation.error || 'Invalid contact information',
          });
          return;
        }
        formData.url = contactValidation.formattedValue!;
      }
    }

    const cleanFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined && value !== '')
    );

    const linkData: CreateLinkInput = {
      ...cleanFormData,
      icon_name: selectedIcon?.icon || undefined,
      icon_color: selectedIcon?.color || undefined,
    };

    await onSubmit(linkData);
  };

  const getLinkSettingsBadge = () => {
    if (formData.link_type === 'standard') return '';
    if (formData.link_type === 'product' && formData.product_price) return 'Price Set';
    if (formData.link_type === 'contact' && formData.contact_type) return formData.contact_type;
    if (formData.link_type === 'media' && formData.auto_play) return 'Auto-play';
    return formData.link_type;
  };

  return (
    <Card className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{existingLink ? 'Edit Link' : 'Add New Link'}</h3>
        <Button variant="ghost" onClick={onCancel}>
          <Icon name="x" className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicLinkInfo
          formData={formData}
          updateFormData={updateFormData}
          urlValidation={urlValidation}
          validateUrl={validateUrl}
          isDetecting={isDetecting}
        />
        <PlatformDetectionAlert platformDetection={platformDetection} />

        <div className="space-y-4">
          {formData.link_type !== 'standard' && (
            <CollapsibleSection
              title="Link Settings"
              icon={
                formData.link_type === 'product'
                  ? 'shopping-bag'
                  : formData.link_type === 'contact'
                  ? 'mail'
                  : formData.link_type === 'media'
                  ? 'play'
                  : 'users'
              }
              isOpen={openSections.linkSettings}
              onToggle={() => toggleSection('linkSettings')}
              badge={getLinkSettingsBadge()}
            >
              {formData.link_type === 'product' && (
                <ProductLinkSettings formData={formData} updateFormData={updateFormData} />
              )}
              {formData.link_type === 'contact' && (
                <ContactLinkSettings formData={formData} updateFormData={updateFormData} />
              )}
              {formData.link_type === 'media' && (
                <MediaLinkSettings formData={formData} updateFormData={updateFormData} />
              )}
            </CollapsibleSection>
          )}
        </div>

        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isUrlValid={urlValidation.isValid}
          isEditing={!!existingLink}
        />
      </form>

      {showIconPicker && (
        <IconPicker
          selectedIcon={selectedIcon}
          onSelect={(icon) => {
            setSelectedIcon(icon);
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </Card>
  );
}
