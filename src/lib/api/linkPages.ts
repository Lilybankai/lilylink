import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import type { 
  LinkPage,
  CreateLinkPageInput, 
  UpdateLinkPageInput,
  SlugCheckInput,
  ApiResponse 
} from '@/types';

// Create link page (client-side)
export async function createLinkPage(input: CreateLinkPageInput): Promise<ApiResponse<LinkPage>> {
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
      .from('link_pages')
      .insert({
        user_id: user.id,
        slug: input.slug,
        title: input.title,
        description: input.description || null,
        is_primary: input.is_primary || false,
        background_type: input.background_type || 'gradient',
        background_value: input.background_value || null,
        font_family: input.font_family || 'Inter',
        seo_title: input.seo_title || null,
        seo_description: input.seo_description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create link page error:', error);
      
      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('slug')) {
        return {
          data: null,
          error: 'This slug is already taken. Please choose another one.',
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
    console.error('Create link page error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while creating your link page.',
      success: false,
    };
  }
}

// Get user's link pages (server-side)
export async function getUserLinkPages(userId: string): Promise<ApiResponse<LinkPage[]>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('link_pages')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data || [],
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Get user link pages error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching link pages.',
      success: false,
    };
  }
}

// Get current user's link pages (client-side)
export async function getCurrentUserLinkPages(): Promise<ApiResponse<LinkPage[]>> {
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
      .from('link_pages')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data || [],
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Get current user link pages error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching your link pages.',
      success: false,
    };
  }
}

// Get link page by slug (public)
export async function getLinkPageBySlug(slug: string): Promise<ApiResponse<LinkPage>> {
  try {
    const { data, error } = await supabase
      .from('link_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: 'Link page not found',
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
    console.error('Get link page by slug error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching the link page.',
      success: false,
    };
  }
}

// Get link page by ID (server-side)
export async function getLinkPageById(id: string): Promise<ApiResponse<LinkPage>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('link_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: 'Link page not found',
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
    console.error('Get link page by ID error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching the link page.',
      success: false,
    };
  }
}

// Update link page (client-side)
export async function updateLinkPage(id: string, input: UpdateLinkPageInput): Promise<ApiResponse<LinkPage>> {
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
    const updateData: Partial<LinkPage> = {};
    
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.is_primary !== undefined) updateData.is_primary = input.is_primary;
    if (input.custom_css !== undefined) updateData.custom_css = input.custom_css;
    if (input.seo_title !== undefined) updateData.seo_title = input.seo_title;
    if (input.seo_description !== undefined) updateData.seo_description = input.seo_description;
    if (input.og_image_url !== undefined) updateData.og_image_url = input.og_image_url;
    if (input.favicon_url !== undefined) updateData.favicon_url = input.favicon_url;
    if (input.background_type !== undefined) updateData.background_type = input.background_type;
    if (input.background_value !== undefined) updateData.background_value = input.background_value;
    if (input.font_family !== undefined) updateData.font_family = input.font_family;

    const { data, error } = await supabase
      .from('link_pages')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this page
      .select()
      .single();

    if (error) {
      console.error('Update link page error:', error);
      
      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('slug')) {
        return {
          data: null,
          error: 'This slug is already taken. Please choose another one.',
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
    console.error('Update link page error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while updating your link page.',
      success: false,
    };
  }
}

// Delete link page (client-side)
export async function deleteLinkPage(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Check if this is the user's primary page
    const { data: linkPage } = await supabase
      .from('link_pages')
      .select('is_primary')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (linkPage?.is_primary) {
      return {
        data: null,
        error: 'Cannot delete your primary link page. Please set another page as primary first.',
        success: false,
      };
    }

    const { error } = await supabase
      .from('link_pages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this page

    if (error) {
      console.error('Delete link page error:', error);
      return {
        data: null,
        error: 'Failed to delete link page. Please try again.',
        success: false,
      };
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Delete link page error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while deleting your link page.',
      success: false,
    };
  }
}

// Check slug availability
export async function checkSlugAvailability(input: SlugCheckInput): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const { data, error } = await supabase
      .from('link_pages')
      .select('id')
      .eq('slug', input.slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No page found with this slug - it's available
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

    // Page found with this slug - it's not available
    return {
      data: { available: false },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Check slug availability error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while checking slug availability.',
      success: false,
    };
  }
}

// Set primary link page
export async function setPrimaryLinkPage(id: string): Promise<ApiResponse<LinkPage>> {
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
      .from('link_pages')
      .update({ is_primary: true })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this page
      .select()
      .single();

    if (error) {
      console.error('Set primary link page error:', error);
      return {
        data: null,
        error: 'Failed to set primary link page. Please try again.',
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Set primary link page error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while setting the primary link page.',
      success: false,
    };
  }
}

// Get user's primary link page
export async function getPrimaryLinkPage(userId?: string): Promise<ApiResponse<LinkPage>> {
  try {
    let query = supabase
      .from('link_pages')
      .select('*')
      .eq('is_primary', true)
      .eq('is_active', true);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Get current user's primary page
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false,
        };
      }
      
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: 'No primary link page found',
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
    console.error('Get primary link page error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching the primary link page.',
      success: false,
    };
  }
} 