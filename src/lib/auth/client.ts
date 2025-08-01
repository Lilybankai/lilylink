'use client';

import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Client-side authentication utilities
// This file can be imported by client components

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export function handleAuthError(error: any): AuthError {
  // Supabase auth error handling
  if (error?.message) {
    switch (error.message) {
      case 'Invalid login credentials':
        return {
          message: 'Invalid email or password. Please check your credentials and try again.',
          code: 'INVALID_CREDENTIALS',
          field: 'password',
        };
      case 'Email not confirmed':
        return {
          message: 'Please check your email and click the confirmation link before signing in.',
          code: 'EMAIL_NOT_CONFIRMED',
          field: 'email',
        };
      case 'User already registered':
        return {
          message: 'An account with this email already exists. Please sign in instead.',
          code: 'USER_EXISTS',
          field: 'email',
        };
      case 'Password should be at least 6 characters':
        return {
          message: 'Password must be at least 6 characters long.',
          code: 'PASSWORD_TOO_SHORT',
          field: 'password',
        };
      case 'Signup requires a valid password':
        return {
          message: 'Please enter a valid password.',
          code: 'INVALID_PASSWORD',
          field: 'password',
        };
      case 'Unable to validate email address: invalid format':
        return {
          message: 'Please enter a valid email address.',
          code: 'INVALID_EMAIL',
          field: 'email',
        };
      case 'Password reset requires a valid password':
        return {
          message: 'Please enter a valid email address.',
          code: 'INVALID_EMAIL',
          field: 'email',
        };
      case 'For security purposes, you can only request this once every 60 seconds':
        return {
          message: 'Please wait 60 seconds before requesting another password reset.',
          code: 'RATE_LIMIT',
        };
      default:
        return {
          message: error.message,
          code: 'UNKNOWN_ERROR',
        };
    }
  }
  
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
  };
}

// Rate limiting for auth operations (client-side)
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if under limit
  if (attempts.count < maxAttempts) {
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }
  
  return false;
}

export async function getCurrentUserClient(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('🔐 Client Auth Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
    
    console.log('🔐 Client Auth Success:', {
      hasUser: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    console.error('🔐 Client Auth Exception:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

// Get user profile client-side
export async function getCurrentUserProfileClient() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('🔐 No authenticated user found');
      return { user: null, profile: null, error: userError };
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('👤 Profile Debug:', {
      hasUser: !!user,
      hasProfile: !!profile,
      profileError: profileError?.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      user,
      profile,
      error: profileError,
    };
  } catch (error) {
    console.error('👤 Profile Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return { user: null, profile: null, error };
  }
}

// Check if user is authenticated (client-side)
export async function isAuthenticatedClient(): Promise<boolean> {
  const user = await getCurrentUserClient();
  return !!user;
}

// Client-side session utilities
export async function getSessionClient() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('🔐 Session Error:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
    
    console.log('🔐 Session Debug:', {
      hasSession: !!session,
      expiresAt: session?.expires_at,
      timestamp: new Date().toISOString()
    });
    
    return session;
  } catch (error) {
    console.error('🔐 Session Exception:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return null;
  }
} 