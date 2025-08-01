
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateLinkInput } from '@/types';

interface ProductLinkSettingsProps {
  formData: CreateLinkInput;
  updateFormData: (updates: Partial<CreateLinkInput>) => void;
}

export function ProductLinkSettings({ formData, updateFormData }: ProductLinkSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price (Optional)</label>
          <div className="flex">
            <select
              value={formData.product_currency}
              onChange={(e) => updateFormData({ product_currency: e.target.value })}
              className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-sm"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <Input
              type="number"
              step="0.01"
              value={formData.product_price || ''}
              onChange={(e) => updateFormData({ product_price: parseFloat(e.target.value) || undefined })}
              placeholder="0.00"
              className="rounded-l-none border-l-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Availability</label>
          <select
            value={formData.product_availability || ''}
            onChange={(e) => updateFormData({ product_availability: e.target.value as any || undefined })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Not specified</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="limited">Limited Stock</option>
            <option value="pre_order">Pre-order</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Product Image (Optional)</label>
        <div className="space-y-3">
          {formData.thumbnail_url && (
            <div className="relative inline-block">
              <img 
                src={formData.thumbnail_url}
                alt="Product preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => updateFormData({ thumbnail_url: undefined })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Input
              type="url"
              value={formData.thumbnail_url || ''}
              onChange={(e) => updateFormData({ thumbnail_url: e.target.value || undefined })}
              placeholder="https://example.com/product-image.jpg"
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      updateFormData({ thumbnail_url: e.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Upload an image or paste a URL. Recommended size: 400x400px
          </p>
        </div>
      </div>
    </div>
  );
}
