'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { inviteMember } from '@/lib/api/organizations';
import type { InviteMemberInput } from '@/types';

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
  permissions: z.record(z.any()).optional()
});

type FormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InviteMemberForm({ organizationId, onSuccess, onCancel }: InviteMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      role: 'member'
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await inviteMember(organizationId, data);
      
      if (response.success) {
        setSuccess(response.message || 'Invitation sent successfully');
        reset();
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error inviting member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <Input
            id="email"
            type="email"
            placeholder="member@example.com"
            {...register('email')}
            error={errors.email?.message}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll send an invitation email to this address.
          </p>
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            id="role"
            {...register('role')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="viewer">Viewer - Can only view organization data</option>
            <option value="member">Member - Can view and edit assigned profiles</option>
            <option value="admin">Admin - Can manage members and profiles</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            You can change this role later in the member settings.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </div>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}