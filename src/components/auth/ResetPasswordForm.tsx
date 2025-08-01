'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/auth';
import { handleAuthError } from '@/lib/auth/client';
import { Input, LoadingButton, Alert } from '@/components/ui';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [passwordReset, setPasswordReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const password = watch('password');

  // Check if we have a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔐 Reset Password Session Check:', {
          hasSession: !!session,
          error: error?.message,
          timestamp: new Date().toISOString()
        });
        
        if (error || !session) {
          setIsValidSession(false);
          return;
        }
        
        setIsValidSession(true);
      } catch (error) {
        console.error('🔐 Session Check Error:', error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

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

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      console.log('🔐 Password Reset Attempt:', {
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        console.error('🔐 Password Reset Error:', {
          error: error.message,
          timestamp: new Date().toISOString()
        });

        const authError = handleAuthError(error);
        setAuthError(authError.message);
        return;
      }

      console.log('🔐 Password Reset Success:', {
        timestamp: new Date().toISOString()
      });

      setPasswordReset(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/auth/login?message=password-updated');
      }, 3000);
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

  if (isValidSession === null) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Validating reset link...</p>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Invalid or Expired Link
          </h3>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          
          <div className="space-y-3">
            <a 
              href="/auth/forgot-password"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Request New Reset Link
            </a>
            
            <p className="text-sm text-gray-500">
              Or{' '}
              <a href="/auth/login" className="text-purple-600 hover:text-purple-700 underline">
                return to sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="text-center space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Password Updated Successfully
          </h3>
          <p className="text-gray-600 mb-4">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to sign in...
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
          title="Password reset failed"
          description={authError}
          dismissible
          onDismiss={() => setAuthError(null)}
        />
      )}

      {/* New Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          New Password *
        </label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Enter your new password"
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
                  passwordStrength.strength <= 1 ? 'bg-red-500' :
                  passwordStrength.strength <= 2 ? 'bg-orange-500' :
                  passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                  passwordStrength.strength <= 4 ? 'bg-blue-500' :
                  'bg-green-500'
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
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password *
        </label>
        <div className="relative">
          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="Confirm your new password"
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
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
        {isLoading ? 'Updating password...' : 'Update Password'}
      </LoadingButton>

      {/* Password Requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Password must contain:</p>
        <ul className="space-y-1 ml-4">
          <li className="flex items-center space-x-2">
            <div className={`h-1.5 w-1.5 rounded-full ${password?.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>At least 8 characters</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>One uppercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>One lowercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className={`h-1.5 w-1.5 rounded-full ${/\d/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>One number</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className={`h-1.5 w-1.5 rounded-full ${/[@$!%*?&]/.test(password || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>One special character</span>
          </li>
        </ul>
      </div>
    </form>
  );
} 