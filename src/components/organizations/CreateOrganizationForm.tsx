'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { createOrganization, checkSlugAvailability } from '@/lib/api/organizations';
import type { Organization, CreateOrganizationInput } from '@/types';

const createOrganizationSchema = z.object({
  name: z.string()
    .min(1, 'Organization name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, underscores, and hyphens')
    .toLowerCase(),
  subscription_tier: z.enum(['agency', 'enterprise']).optional(),
  max_profiles: z.number().min(1).max(1000).optional()
});

type FormData = z.infer<typeof createOrganizationSchema>;

interface CreateOrganizationFormProps {
  onSuccess: (organization: Organization) => void;
  onCancel: () => void;
}

export function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      subscription_tier: 'agency',
      max_profiles: 10
    }
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    setValue('slug', slug);
    setSlugAvailable(null);
    
    if (slug.length >= 3) {
      checkSlug(slug);
    }
  };

  const checkSlug = async (slug: string) => {
    if (slug.length < 3) return;
    
    setCheckingSlug(true);
    try {
      const available = await checkSlugAvailability(slug);
      setSlugAvailable(available);
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase();
    setValue('slug', slug);
    setSlugAvailable(null);
    
    if (slug.length >= 3) {
      checkSlug(slug);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (slugAvailable === false) {
      setError('Please choose an available slug');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createOrganization(data);
      
      if (response.success && response.data) {
        onSuccess(response.data);
      } else {
        setError(response.error || 'Failed to create organization');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error creating organization:', err);
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

        {/* Organization Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Enter organization name"
            {...register('name')}
            onChange={handleNameChange}
            error={errors.name?.message}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be displayed as your organization's public name.
          </p>
        </div>

        {/* Organization Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Organization Slug *
          </label>
          <div className="relative">
            <Input
              id="slug"
              type="text"
              placeholder="organization-slug"
              {...register('slug')}
              onChange={handleSlugChange}
              error={errors.slug?.message}
              className="w-full pr-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {checkingSlug && (
                <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
              )}
              {!checkingSlug && slugAvailable === true && (
                <CheckIcon className="h-4 w-4 text-green-500" />
              )}
              {!checkingSlug && slugAvailable === false && (
                <XMarkIcon className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This will be used in your organization's URL. Only letters, numbers, underscores, and hyphens allowed.
          </p>
          {slugAvailable === false && (
            <p className="text-xs text-red-600 mt-1">
              This slug is already taken. Please choose another one.
            </p>
          )}
        </div>

        {/* Subscription Tier */}
        <div>
          <label htmlFor="subscription_tier" className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Tier
          </label>
          <select
            id="subscription_tier"
            {...register('subscription_tier')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="agency">Agency ($30/month)</option>
            <option value="enterprise">Enterprise (Contact Sales)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            You can change this later in your organization settings.
          </p>
        </div>

        {/* Max Profiles */}
        <div>
          <label htmlFor="max_profiles" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Profiles
          </label>
          <Input
            id="max_profiles"
            type="number"
            min={1}
            max={1000}
            {...register('max_profiles', { valueAsNumber: true })}
            error={errors.max_profiles?.message}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            The maximum number of client profiles this organization can manage.
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
            disabled={isSubmitting || slugAvailable === false}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Creating...
              </div>
            ) : (
              'Create Organization'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}