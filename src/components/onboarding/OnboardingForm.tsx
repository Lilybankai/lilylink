'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProfileSchema,
  type CreateProfileInput,
} from '@/lib/validations/profile';
import { createProfile, checkUsernameAvailability } from '@/lib/api/profiles';
import { Input, LoadingButton, Alert } from '@/components/ui';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { User } from '@supabase/supabase-js';

interface OnboardingFormProps {
  user: User;
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  console.log('🚀 OnboardingForm Debug:', {
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString(),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateProfileInput>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      displayName:
        user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    },
  });

  const watchedUsername = watch('username');

  // Check username availability with debouncing
  useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameStatus('checking');

      console.log('🔍 Checking username availability:', {
        username: watchedUsername,
        timestamp: new Date().toISOString(),
      });

      try {
        const result = await checkUsernameAvailability({
          username: watchedUsername,
        });

        if (result.success && result.data) {
          setUsernameStatus(result.data.available ? 'available' : 'taken');

          console.log('✅ Username check result:', {
            username: watchedUsername,
            available: result.data.available,
            timestamp: new Date().toISOString(),
          });
        } else {
          console.error('❌ Username check failed:', result.error);
          setUsernameStatus('idle');
        }
      } catch (error) {
        console.error('❌ Username check error:', error);
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  const onSubmit = async (data: CreateProfileInput) => {
    try {
      setIsLoading(true);
      setFormError(null);

      console.log('🚀 Creating profile:', {
        username: data.username,
        displayName: data.displayName,
        timestamp: new Date().toISOString(),
      });

      const result = await createProfile(data);

      if (result.success && result.data) {
        console.log('✅ Profile created successfully:', {
          profileId: result.data.id,
          username: result.data.username,
          timestamp: new Date().toISOString(),
        });

        router.push('/dashboard');
      } else {
        console.error('❌ Profile creation failed:', result.error);

        if (result.error?.includes('username')) {
          setError('username', {
            type: 'manual',
            message: result.error,
          });
        } else {
          setFormError(
            result.error || 'Failed to create profile. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-purple-600" />
        );
      case 'available':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'taken':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getUsernameMessage = () => {
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* General Error Alert */}
      {formError && (
        <Alert
          variant="error"
          title="Profile creation failed"
          description={formError}
          dismissible
          onDismiss={() => setFormError(null)}
        />
      )}

      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Username *
        </label>
        <div className="relative">
          <Input
            {...register('username')}
            type="text"
            id="username"
            placeholder="Choose a unique username"
            error={!!errors.username || usernameStatus === 'taken'}
            disabled={isLoading}
            className="w-full pr-12"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getUsernameIcon()}
          </div>
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
        {!errors.username && getUsernameMessage() && (
          <p
            className={`mt-1 text-sm ${
              usernameStatus === 'available'
                ? 'text-green-600'
                : usernameStatus === 'taken'
                  ? 'text-red-600'
                  : 'text-gray-500'
            }`}
          >
            {getUsernameMessage()}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Your profile will be available at lilylink.com/
          {watchedUsername || 'username'}
        </p>
      </div>

      {/* Display Name Field */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Display Name *
        </label>
        <Input
          {...register('displayName')}
          type="text"
          id="displayName"
          placeholder="How should we display your name?"
          error={!!errors.displayName}
          disabled={isLoading}
          className="w-full"
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          This is how your name will appear on your profile
        </p>
      </div>

      {/* Bio Field */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Bio <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={3}
          placeholder="Tell people a bit about yourself..."
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
          maxLength={160}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {watch('bio')?.length || 0}/160 characters
        </p>
      </div>

      {/* Website URL Field */}
      <div>
        <label
          htmlFor="websiteUrl"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Website <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          {...register('websiteUrl')}
          type="url"
          id="websiteUrl"
          placeholder="https://your-website.com"
          error={!!errors.websiteUrl}
          disabled={isLoading}
          className="w-full"
        />
        {errors.websiteUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.websiteUrl.message}
          </p>
        )}
      </div>

      {/* Location Field */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Location <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          {...register('location')}
          type="text"
          id="location"
          placeholder="Where are you based?"
          error={!!errors.location}
          disabled={isLoading}
          className="w-full"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        loading={isLoading || isSubmitting}
        variant="primary"
        className="w-full py-3 text-base font-semibold"
        disabled={
          isLoading ||
          usernameStatus === 'taken' ||
          usernameStatus === 'checking'
        }
      >
        {isLoading ? 'Creating your profile...' : 'Create Profile & Continue'}
      </LoadingButton>

      <p className="text-center text-xs text-gray-500">
        By creating your profile, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gray-700">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-gray-700">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}
