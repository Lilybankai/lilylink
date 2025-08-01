'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type CallbackStatus = 'loading' | 'success' | 'error';

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Auth Callback Started:', {
          searchParams: Object.fromEntries(searchParams.entries()),
          timestamp: new Date().toISOString()
        });

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('🔐 Auth Callback Error:', {
            error: error.message,
            timestamp: new Date().toISOString()
          });
          
          setStatus('error');
          setMessage(error.message || 'Authentication failed');
          return;
        }

        if (data.session) {
          console.log('🔐 Auth Callback Success:', {
            userId: data.session.user.id,
            email: data.session.user.email,
            emailVerified: data.session.user.email_confirmed_at,
            timestamp: new Date().toISOString()
          });

          setStatus('success');
          setMessage('Authentication successful! Redirecting...');

          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.session.user.id)
            .single();

          console.log('👤 Profile Check in Callback:', {
            hasProfile: !!profile,
            profileError: profileError?.message,
            timestamp: new Date().toISOString()
          });

          // Redirect based on profile existence
          setTimeout(() => {
            if (profile) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
          }, 2000);
        } else {
          console.log('🔐 Auth Callback - No Session:', {
            timestamp: new Date().toISOString()
          });
          
          setStatus('error');
          setMessage('No active session found');
          
          // Redirect to login after delay
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } catch (error) {
        console.error('🔐 Auth Callback Exception:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
        
        // Redirect to login after delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Spinner size="xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying your account...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your authentication
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="animate-pulse">
                <div className="h-2 bg-green-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Return to Sign In
                </button>
                <p className="text-sm text-gray-500">
                  Redirecting automatically in a few seconds...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
} 