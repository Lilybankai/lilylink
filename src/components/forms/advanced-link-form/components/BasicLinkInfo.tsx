'use client';

import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { CreateLinkInput } from '@/types';

interface BasicLinkInfoProps {
  formData: CreateLinkInput;
  updateFormData: (updates: Partial<CreateLinkInput>) => void;
  urlValidation: { isValid: boolean; message?: string };
  validateUrl: (url: string) => void;
  isDetecting: boolean;
}

export function BasicLinkInfo({
  formData,
  updateFormData,
  urlValidation,
  validateUrl,
  isDetecting,
}: BasicLinkInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="Enter link title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">URL</label>
        <div className="relative">
          <Input
            value={formData.url}
            onChange={(e) => {
              updateFormData({ url: e.target.value });
              validateUrl(e.target.value);
            }}
            placeholder="https://example.com"
            required
            className={!urlValidation.isValid ? 'border-red-500' : ''}
          />
          {isDetecting && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Icon name="loader" className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {!urlValidation.isValid && urlValidation.message && (
          <p className="text-sm text-red-600 mt-1">{urlValidation.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description (Optional)</label>
        <Input
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Brief description of this link"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Link Type</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { value: 'standard', label: 'Standard', icon: 'link' },
            { value: 'social', label: 'Social', icon: 'users' },
            { value: 'product', label: 'Product', icon: 'shopping-bag' },
            { value: 'media', label: 'Media', icon: 'play' },
            { value: 'contact', label: 'Contact', icon: 'mail' }
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFormData({ link_type: type.value as any })}
              className={`p-3 border rounded-lg text-center transition-colors ${
                formData.link_type === type.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon name={type.icon} className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
