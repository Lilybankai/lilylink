'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { passwordResetRequestSchema, type PasswordResetRequestInput } from '@/lib/validations/auth';
import { handleAuthError } from '@/lib/auth/client';
import { Input, LoadingButton, Alert } from '@/components/ui';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export function ForgotPasswordForm() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = async (data: PasswordResetRequestInput) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔐 Password Reset Request:', {
        email: data.email,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('🔐 Password Reset Error:', {
          error: error.message,
          timestamp: new Date().toISOString()
        });

        const authError = handleAuthError(error);
        
        if (authError.field) {
          setError(authError.field as keyof PasswordResetRequestInput, {
            type: 'manual',
            message: authError.message,
          });
        } else {
          setAuthError(authError.message);
        }
        return;
      }

      console.log('🔐 Password Reset Email Sent:', {
        email: data.email,
        timestamp: new Date().toISOString()
      });

      setEmailAddress(data.email);
      setEmailSent(true);
    } catch (error) {
      console.error('🔐 Password Reset Exception:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <EnvelopeIcon className="h-8 w-8 text-blue-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Check your email
          </h3>
          <p className="text-gray-600 mb-4">
            We've sent a password reset link to{' '}
            <span className="font-medium">{emailAddress}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in your email to reset your password. The link will expire in 1 hour.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => setEmailSent(false)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
            >
              Didn't receive the email? Try again
            </button>
            
            <p className="text-xs text-gray-500">
              Make sure to check your spam folder
            </p>
          </div>
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
          title="Reset request failed"
          description={authError}
          dismissible
          onDismiss={() => setAuthError(null)}
        />
      )}

      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <EnvelopeIcon className="h-6 w-6 text-purple-600" />
        </div>
        <p className="text-gray-600 text-sm">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email address
        </label>
        <Input
          {...register('email')}
          type="email"
          id="email"
          placeholder="Enter your email address"
          error={!!errors.email}
          disabled={isLoading}
          className="w-full"
          autoFocus
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
        {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
      </LoadingButton>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Remember your password?{' '}
          <a href="/auth/login" className="text-purple-600 hover:text-purple-700 underline">
            Sign in instead
          </a>
        </p>
      </div>
    </form>
  );
} 