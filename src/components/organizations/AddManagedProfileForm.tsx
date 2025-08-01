'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { addManagedProfile } from '@/lib/api/organizations';
// import { getLinkPages } from '@/lib/api/linkPages'; // TODO: Implement this function
import type { AddManagedProfileInput, LinkPage } from '@/types';

const addManagedProfileSchema = z.object({
  profile_id: z.string().uuid('Invalid profile ID'),
  manager_id: z.string().uuid().optional(),
  access_level: z.enum(['view', 'edit', 'admin']),
  client_name: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  client_notes: z.string().optional()
});

type FormData = z.infer<typeof addManagedProfileSchema>;

interface AddManagedProfileFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddManagedProfileForm({ organizationId, onSuccess, onCancel }: AddManagedProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<LinkPage[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(addManagedProfileSchema),
    defaultValues: {
      access_level: 'edit'
    }
  });

  useEffect(() => {
    loadAvailableProfiles();
  }, []);

  const loadAvailableProfiles = async () => {
    try {
      setLoadingProfiles(true);
      // TODO: Implement getLinkPages API function
      // For now, we'll use mock data
      setAvailableProfiles([
        {
          id: 'mock-profile-1',
          slug: 'demo-profile',
          title: 'Demo Profile',
          description: 'A demo profile for testing',
          user_id: 'current-user',
          is_active: true,
          is_primary: false,
          theme_id: null,
          user_theme_id: null,
          custom_css: null,
          seo_title: null,
          seo_description: null,
          og_image_url: null,
          favicon_url: null,
          background_type: 'gradient',
          background_value: null,
          font_family: 'Inter',
          theme_config: {},
          background_config: {},
          typography_config: {},
          layout_config: {},
          brand_config: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Clean up empty email
      const submitData = {
        ...data,
        client_email: data.client_email || undefined
      };

      const response = await addManagedProfile(organizationId, submitData);
      
      if (response.success) {
        setSuccess(response.message || 'Profile added successfully');
        reset();
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.error || 'Failed to add profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error adding managed profile:', err);
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

        {/* Profile Selection */}
        <div>
          <label htmlFor="profile_id" className="block text-sm font-medium text-gray-700 mb-2">
            Link Page *
          </label>
          {loadingProfiles ? (
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse" />
          ) : (
            <select
              id="profile_id"
              {...register('profile_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a link page to manage</option>
              {availableProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.title} (@{profile.slug})
                </option>
              ))}
            </select>
          )}
          {errors.profile_id && (
            <p className="text-xs text-red-600 mt-1">{errors.profile_id.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Choose which link page this organization should manage.
          </p>
        </div>

        {/* Access Level */}
        <div>
          <label htmlFor="access_level" className="block text-sm font-medium text-gray-700 mb-2">
            Access Level *
          </label>
          <select
            id="access_level"
            {...register('access_level')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="view">View - Can only view the profile</option>
            <option value="edit">Edit - Can view and edit the profile</option>
            <option value="admin">Admin - Full control over the profile</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This determines what organization members can do with this profile.
          </p>
        </div>

        {/* Client Information */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Client Information (Optional)</h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <Input
                id="client_name"
                type="text"
                placeholder="Client or company name"
                {...register('client_name')}
                error={errors.client_name?.message}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">
                Client Email
              </label>
              <Input
                id="client_email"
                type="email"
                placeholder="client@example.com"
                {...register('client_email')}
                error={errors.client_email?.message}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="client_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="client_notes"
                placeholder="Any notes about this client or profile..."
                {...register('client_notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              {errors.client_notes && (
                <p className="text-xs text-red-600 mt-1">{errors.client_notes.message}</p>
              )}
            </div>
          </div>
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
            disabled={isSubmitting || loadingProfiles}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Adding...
              </div>
            ) : (
              'Add Profile'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}