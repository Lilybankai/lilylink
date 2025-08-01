'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isUrlValid: boolean;
  isEditing: boolean;
}

export function FormActions({ onCancel, isLoading, isUrlValid, isEditing }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading || !isUrlValid}
        className="min-w-[100px]"
      >
        {isLoading ? (
          <Icon name="loader" className="w-4 h-4 animate-spin" />
        ) : (
          isEditing ? 'Update Link' : 'Add Link'
        )}
      </Button>
    </div>
  );
}
