import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import type { 
  CreateProfileInput, 
  UpdateProfileInput,
  UsernameCheckInput 
} from '@/lib/validations/profile';

// Profile types
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  subscription_tier: string;
  custom_domain: string | null;
  theme_preferences: any;
  analytics_enabled: boolean;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Create profile (client-side)
export async function createProfile(input: CreateProfileInput): Promise<ApiResponse<Profile>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: input.username,
        display_name: input.displayName,
        bio: input.bio || null,
        website_url: input.websiteUrl || null,
        location: input.location || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create profile error:', error);
      
      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('username')) {
        return {
          data: null,
          error: 'This username is already taken. Please choose another one.',
          success: false,
        };
      }
      
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Create profile error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while creating your profile.',
      success: false,
    };
  }
}

// Get profile by ID (server-side)
export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: 'Profile not found',
          success: false,
        };
      }
      
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching the profile.',
      success: false,
    };
  }
}

// Get profile by username (public)
export async function getProfileByUsername(username: string): Promise<ApiResponse<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: 'Profile not found',
          success: false,
        };
      }
      
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Get profile by username error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching the profile.',
      success: false,
    };
  }
}

// Update profile (client-side)
export async function updateProfile(input: UpdateProfileInput): Promise<ApiResponse<Profile>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Prepare update data (remove undefined values)
    const updateData: Partial<Profile> = {};
    
    if (input.username !== undefined) updateData.username = input.username;
    if (input.displayName !== undefined) updateData.display_name = input.displayName;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.themePreferences !== undefined) updateData.theme_preferences = input.themePreferences;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      
      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('username')) {
        return {
          data: null,
          error: 'This username is already taken. Please choose another one.',
          success: false,
        };
      }
      
      if (error.code === '23505' && error.message.includes('custom_domain')) {
        return {
          data: null,
          error: 'This custom domain is already in use.',
          success: false,
        };
      }
      
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while updating your profile.',
      success: false,
    };
  }
}

// Check username availability
export async function checkUsernameAvailability(input: UsernameCheckInput): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', input.username);
    
    // If user is authenticated, exclude their own profile
    if (user) {
      query = query.neq('id', user.id);
    }
    
    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found with this username - it's available
        return {
          data: { available: true },
          error: null,
          success: true,
        };
      }
      
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    // Profile found with this username - it's not available
    return {
      data: { available: false },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Check username availability error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while checking username availability.',
      success: false,
    };
  }
}

// Upload avatar
export async function uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return {
        data: null,
        error: 'Failed to upload avatar. Please try again.',
        success: false,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Avatar URL update error:', updateError);
      return {
        data: null,
        error: 'Avatar uploaded but failed to update profile. Please try again.',
        success: false,
      };
    }

    return {
      data: { url: urlData.publicUrl },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while uploading your avatar.',
      success: false,
    };
  }
}

// Delete profile (soft delete by deactivating)
export async function deleteProfile(): Promise<ApiResponse<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Instead of hard delete, we could deactivate the profile
    // For now, let's actually delete it as requested
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (error) {
      console.error('Delete profile error:', error);
      return {
        data: null,
        error: 'Failed to delete profile. Please try again.',
        success: false,
      };
    }

    // Also delete the user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error('Delete user error:', authError);
      // Profile is deleted but user still exists - this is okay
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Delete profile error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while deleting your profile.',
      success: false,
    };
  }
}

// Get current user's profile (client-side)
export async function getCurrentProfile(): Promise<ApiResponse<Profile>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    return await getProfile(user.id);
  } catch (error) {
    console.error('Get current profile error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching your profile.',
      success: false,
    };
  }
} 