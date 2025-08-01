'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { handleAuthError } from '@/lib/auth/client';
import { Input, Alert, LoadingButton } from '@/components/ui';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔐 Login Attempt:', {
        email: data.email,
        timestamp: new Date().toISOString(),
      });

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('🔐 Login Error:', {
          error: error.message,
          code: error.status,
          timestamp: new Date().toISOString(),
        });

        const authError = handleAuthError(error);

        if (authError.field) {
          setError(authError.field as keyof LoginInput, {
            type: 'manual',
            message: authError.message,
          });
        } else {
          setAuthError(authError.message);
        }
        return;
      }

      if (authData.user) {
        console.log('🔐 Login Success:', {
          userId: authData.user.id,
          email: authData.user.email,
          timestamp: new Date().toISOString(),
        });

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', authData.user.id)
          .single();

        console.log('👤 Profile Check:', {
          hasProfile: !!profile,
          profileError: profileError?.message,
          timestamp: new Date().toISOString(),
        });

        if (profile) {
          console.log('✅ Redirecting to dashboard');
          // Refresh to ensure session is picked up by middleware
          window.location.href = '/dashboard';
        } else {
          console.log('✅ Redirecting to onboarding');
          // Refresh to ensure session is picked up by middleware
          window.location.href = '/onboarding';
        }
      }
    } catch (error) {
      console.error('🔐 Login Exception:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* General Error Alert */}
      {authError && (
        <Alert
          variant="error"
          title="Sign in failed"
          description={authError}
          dismissible
          onDismiss={() => setAuthError(null)}
        />
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email address
        </label>
        <Input
          {...register('email')}
          type="email"
          id="email"
          placeholder="Enter your email"
          error={!!errors.email}
          disabled={isLoading}
          className="w-full"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Enter your password"
            error={!!errors.password}
            disabled={isLoading}
            className="w-full pr-12"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        loading={isLoading || isSubmitting}
        variant="primary"
        className="w-full py-3 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </LoadingButton>
    </form>
  );
}
