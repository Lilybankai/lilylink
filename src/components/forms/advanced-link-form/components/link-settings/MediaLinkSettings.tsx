
import { CreateLinkInput } from '@/types';

interface MediaLinkSettingsProps {
  formData: CreateLinkInput;
  updateFormData: (updates: Partial<CreateLinkInput>) => void;
}

export function MediaLinkSettings({ formData, updateFormData }: MediaLinkSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoplay"
          checked={formData.auto_play}
          onChange={(e) => updateFormData({ auto_play: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="autoplay" className="text-sm">
          Enable auto-play (when supported)
        </label>
      </div>
    </div>
  );
}
