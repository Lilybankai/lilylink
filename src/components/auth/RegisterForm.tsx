'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { handleAuthError } from '@/lib/auth/client';
import { Input, LoadingButton, Alert } from '@/components/ui';
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Very Weak', color: 'text-red-500' },
      { strength: 2, text: 'Weak', color: 'text-orange-500' },
      { strength: 3, text: 'Fair', color: 'text-yellow-500' },
      { strength: 4, text: 'Good', color: 'text-blue-500' },
      { strength: 5, text: 'Strong', color: 'text-green-500' },
    ];

    return levels[strength] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔐 Register Attempt:', {
        email: data.email,
        timestamp: new Date().toISOString(),
      });

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('🔐 Register Error:', {
          error: error.message,
          code: error.status,
          timestamp: new Date().toISOString(),
        });

        const authError = handleAuthError(error);

        if (authError.field) {
          setError(authError.field as keyof RegisterInput, {
            type: 'manual',
            message: authError.message,
          });
        } else {
          setAuthError(authError.message);
        }
        return;
      }

      if (authData.user) {
        console.log('🔐 Register Success:', {
          userId: authData.user.id,
          email: authData.user.email,
          emailConfirmed: authData.user.email_confirmed_at,
          timestamp: new Date().toISOString(),
        });

        if (authData.user.email_confirmed_at) {
          // Email already confirmed, redirect to onboarding
          router.push('/onboarding');
        } else {
          // Show email verification message
          setEmailSent(true);
        }
      }
    } catch (error) {
      console.error('🔐 Register Exception:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Check your email
          </h3>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent you a confirmation link. Click the link in your
            email to activate your account.
          </p>
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setEmailSent(false)}
              className="text-purple-600 hover:text-purple-700 underline"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* General Error Alert */}
      {authError && (
        <Alert
          variant="error"
          title="Registration failed"
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
          Email address *
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
          Password *
        </label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Create a strong password"
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

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Password strength:</span>
              <span className={`text-xs font-medium ${passwordStrength.color}`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength.strength <= 1
                    ? 'bg-red-500'
                    : passwordStrength.strength <= 2
                      ? 'bg-orange-500'
                      : passwordStrength.strength <= 3
                        ? 'bg-yellow-500'
                        : passwordStrength.strength <= 4
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                }`}
                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirm Password *
        </label>
        <div className="relative">
          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="Confirm your password"
            error={!!errors.confirmPassword}
            disabled={isLoading}
            className="w-full pr-12"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
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
        {isLoading ? 'Creating account...' : 'Create Account'}
      </LoadingButton>

      {/* Password Requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Password must contain:</p>
        <ul className="space-y-1 ml-4">
          <li className="flex items-center space-x-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${password?.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span>At least 8 characters</span>
          </li>
          <li className="flex items-center space-x-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span>One uppercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span>One lowercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${/\d/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span>One number</span>
          </li>
          <li className="flex items-center space-x-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${/[@$!%*?&]/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <span>One special character</span>
          </li>
        </ul>
      </div>
    </form>
  );
}
