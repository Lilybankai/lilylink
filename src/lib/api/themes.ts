import { supabase } from '@/lib/supabase/client';
import type { Theme, UserTheme, ThemeConfig, ApiResponse } from '@/types';

// Fetch all available themes
export async function getThemes(): Promise<ApiResponse<Theme[]>> {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .order('category, display_name');

    if (error) {
      console.error('Error fetching themes:', error);
      return {
        data: [],
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
    console.error('Error fetching themes:', error);
    return {
      data: [],
      error: 'Failed to fetch themes',
      success: false,
    };
  }
}

// Fetch themes by category
export async function getThemesByCategory(category: string): Promise<ApiResponse<Theme[]>> {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('display_name');

    if (error) {
      console.error('Error fetching themes by category:', error);
      return {
        data: [],
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
    console.error('Error fetching themes by category:', error);
    return {
      data: [],
      error: 'Failed to fetch themes',
      success: false,
    };
  }
}

// Fetch user's custom themes
export async function getUserThemes(): Promise<ApiResponse<UserTheme[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: [],
        error: 'User not authenticated',
        success: false,
      };
    }

    const { data, error } = await supabase
      .from('user_themes')
      .select(`
        *,
        theme:themes(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user themes:', error);
      return {
        data: [],
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
    console.error('Error fetching user themes:', error);
    return {
      data: [],
      error: 'Failed to fetch user themes',
      success: false,
    };
  }
}

// Get user's default theme
export async function getUserDefaultTheme(): Promise<ApiResponse<UserTheme | null>> {
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
      .from('user_themes')
      .select(`
        *,
        theme:themes(*)
      `)
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching default theme:', error);
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data || null,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching default theme:', error);
    return {
      data: null,
      error: 'Failed to fetch default theme',
      success: false,
    };
  }
}

// Create a new user theme
export interface CreateUserThemeInput {
  name: string;
  theme_id?: string;
  custom_config?: Partial<ThemeConfig>;
  is_default?: boolean;
}

export async function createUserTheme(input: CreateUserThemeInput): Promise<ApiResponse<UserTheme>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: null as any,
        error: 'User not authenticated',
        success: false,
      };
    }

    const { data, error } = await supabase
      .from('user_themes')
      .insert({
        user_id: user.id,
        name: input.name,
        theme_id: input.theme_id || null,
        custom_config: input.custom_config || {},
        is_default: input.is_default || false,
      })
      .select(`
        *,
        theme:themes(*)
      `)
      .single();

    if (error) {
      console.error('Error creating user theme:', error);
      return {
        data: null as any,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error creating user theme:', error);
    return {
      data: null as any,
      error: 'Failed to create user theme',
      success: false,
    };
  }
}

// Update a user theme
export interface UpdateUserThemeInput {
  name?: string;
  theme_id?: string;
  custom_config?: Partial<ThemeConfig>;
  is_default?: boolean;
}

export async function updateUserTheme(
  themeId: string, 
  input: UpdateUserThemeInput
): Promise<ApiResponse<UserTheme>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: null as any,
        error: 'User not authenticated',
        success: false,
      };
    }

    const { data, error } = await supabase
      .from('user_themes')
      .update(input)
      .eq('id', themeId)
      .eq('user_id', user.id)
      .select(`
        *,
        theme:themes(*)
      `)
      .single();

    if (error) {
      console.error('Error updating user theme:', error);
      return {
        data: null as any,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error updating user theme:', error);
    return {
      data: null as any,
      error: 'Failed to update user theme',
      success: false,
    };
  }
}

// Delete a user theme
export async function deleteUserTheme(themeId: string): Promise<ApiResponse<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: false,
        error: 'User not authenticated',
        success: false,
      };
    }

    const { error } = await supabase
      .from('user_themes')
      .delete()
      .eq('id', themeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting user theme:', error);
      return {
        data: false,
        error: error.message,
        success: false,
      };
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error deleting user theme:', error);
    return {
      data: false,
      error: 'Failed to delete user theme',
      success: false,
    };
  }
}

// Apply theme to a link page
export async function applyThemeToLinkPage(
  pageId: string, 
  userThemeId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: false,
        error: 'User not authenticated',
        success: false,
      };
    }

    const { error } = await supabase
      .from('link_pages')
      .update({ user_theme_id: userThemeId })
      .eq('id', pageId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error applying theme to link page:', error);
      return {
        data: false,
        error: error.message,
        success: false,
      };
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error applying theme to link page:', error);
    return {
      data: false,
      error: 'Failed to apply theme',
      success: false,
    };
  }
}

// Get merged theme configuration for a link page
export async function getLinkPageThemeConfig(pageId: string): Promise<ApiResponse<ThemeConfig | null>> {
  try {
    console.log('Fetching theme config for page:', pageId);
    
    const response = await fetch(`/api/link-pages/${pageId}/theme`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error fetching theme config:', errorData);
      return {
        data: null,
        error: errorData.error || 'Failed to fetch theme configuration',
        success: false,
      };
    }

    const result = await response.json();
    console.log('Theme config fetched successfully:', result);
    
    return {
      data: result.data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching link page theme config:', error);
    return {
      data: null,
      error: 'Failed to fetch theme configuration',
      success: false,
    };
  }
}

// Update link page theme configuration
export async function updateLinkPageThemeConfig(
  pageId: string, 
  themeConfig: Partial<ThemeConfig>
): Promise<ApiResponse<boolean>> {
  try {
    console.log('Updating theme config for page:', pageId, themeConfig);
    
    const response = await fetch(`/api/link-pages/${pageId}/theme`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(themeConfig),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error updating theme config:', errorData);
      return {
        data: false,
        error: errorData.error || 'Failed to update theme configuration',
        success: false,
      };
    }

    const result = await response.json();
    console.log('Theme config updated successfully:', result);
    
    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error updating link page theme config:', error);
    return {
      data: false,
      error: 'Failed to update theme configuration',
      success: false,
    };
  }
}

// Create a theme from existing link page
export async function createThemeFromLinkPage(
  pageId: string, 
  themeName: string
): Promise<ApiResponse<UserTheme>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: null as any,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Get the current theme configuration from the link page
    const themeConfigResponse = await getLinkPageThemeConfig(pageId);
    if (!themeConfigResponse.success || !themeConfigResponse.data) {
      return {
        data: null as any,
        error: 'Failed to get page theme configuration',
        success: false,
      };
    }

    // Create a new user theme with this configuration
    const createResponse = await createUserTheme({
      name: themeName,
      custom_config: themeConfigResponse.data,
    });

    return createResponse;
  } catch (error) {
    console.error('Error creating theme from link page:', error);
    return {
      data: null as any,
      error: 'Failed to create theme from page',
      success: false,
    };
  }
} 