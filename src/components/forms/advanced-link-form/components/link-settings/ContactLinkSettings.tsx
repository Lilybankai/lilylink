
import { Input } from '@/components/ui/Input';
import { CreateLinkInput } from '@/types';

interface ContactLinkSettingsProps {
  formData: CreateLinkInput;
  updateFormData: (updates: Partial<CreateLinkInput>) => void;
}

export function ContactLinkSettings({ formData, updateFormData }: ContactLinkSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Contact Type</label>
        <select
          value={formData.contact_type || ''}
          onChange={(e) => updateFormData({ contact_type: e.target.value as any || undefined })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select contact type</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="form">Contact Form</option>
          <option value="calendar">Calendar Booking</option>
        </select>
      </div>

      {formData.contact_type === 'phone' && (
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <Input
            value={formData.phone_number}
            onChange={(e) => updateFormData({ phone_number: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      )}

      {(formData.contact_type === 'email' || formData.contact_type === 'form') && (
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <Input
            type="email"
            value={formData.email_address}
            onChange={(e) => updateFormData({ email_address: e.target.value })}
            placeholder="contact@example.com"
          />
        </div>
      )}

      {formData.contact_type === 'calendar' && (
        <div>
          <label className="block text-sm font-medium mb-2">Calendar URL</label>
          <Input
            type="url"
            value={formData.url}
            onChange={(e) => updateFormData({ url: e.target.value })}
            placeholder="https://calendly.com/your-username or https://cal.com/your-username"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste your Calendly, Cal.com, or other calendar booking URL
          </p>
        </div>
      )}

      {formData.contact_type === 'form' && (
        <div className="space-y-4 border-t pt-4">
          <h5 className="font-medium text-gray-900">Payment Settings (Optional)</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Type</label>
              <select
                value={formData.payment_type || ''}
                onChange={(e) => updateFormData({ payment_type: e.target.value as any || undefined })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">No payment</option>
                <option value="payment">Payment</option>
                <option value="donation">Donation</option>
                <option value="tip">Tip</option>
              </select>
            </div>

            {formData.payment_type && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="flex">
                  <select
                    value={formData.payment_currency}
                    onChange={(e) => updateFormData({ payment_currency: e.target.value })}
                    className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.payment_amount || ''}
                    onChange={(e) => updateFormData({ payment_amount: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                    className="rounded-l-none border-l-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
