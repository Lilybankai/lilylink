import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

// Get current user server-side
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Get user profile with user data
export async function getCurrentUserProfile() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { user: null, profile: null, error: userError };
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return {
      user,
      profile,
      error: profileError,
    };
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return { user: null, profile: null, error };
  }
}

// Require authentication (redirect if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

// Require authentication with profile
export async function requireAuthWithProfile() {
  const { user, profile, error } = await getCurrentUserProfile();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  if (!profile && !error) {
    // User exists but no profile - redirect to onboarding
    redirect('/onboarding');
  }
  
  return { user, profile };
}

// Check if user is authenticated (no redirect)
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Session management utilities
export async function getSession() {
  const supabase = await createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

// Check if user has specific role or permission
export async function hasPermission(permission: string): Promise<boolean> {
  const { profile } = await getCurrentUserProfile();
  
  if (!profile) return false;
  
  // Check subscription tier permissions
  switch (permission) {
    case 'custom_domain':
      return ['pro', 'agency'].includes(profile.subscription_tier);
    case 'advanced_analytics':
      return ['pro', 'agency'].includes(profile.subscription_tier);
    case 'white_label':
      return profile.subscription_tier === 'agency';
    case 'unlimited_links':
      return ['starter', 'pro', 'agency'].includes(profile.subscription_tier);
    default:
      return true; // Default permissions for free users
  }
} 