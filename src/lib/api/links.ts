import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import type { 
  Link,
  CreateLinkInput, 
  UpdateLinkInput,
  ReorderLinksInput,
  ApiResponse 
} from '@/types';

// Create link (client-side)
export async function createLink(input: CreateLinkInput): Promise<ApiResponse<Link>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Verify user owns the page
    const { data: linkPage } = await supabase
      .from('link_pages')
      .select('id')
      .eq('id', input.page_id)
      .eq('user_id', user.id)
      .single();

    if (!linkPage) {
      return {
        data: null,
        error: 'Link page not found or you do not have permission to add links to it.',
        success: false,
      };
    }

    // Get the next display order if not specified
    let displayOrder = input.display_order || 0;
    if (displayOrder === 0) {
      const { data: maxOrderLink } = await supabase
        .from('links')
        .select('display_order')
        .eq('page_id', input.page_id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      displayOrder = (maxOrderLink?.display_order || 0) + 1;
    }

    const { data, error } = await supabase
      .from('links')
      .insert({
        page_id: input.page_id,
        title: input.title,
        url: input.url,
        description: input.description || null,
        icon_url: input.icon_url || null,
        thumbnail_url: input.thumbnail_url || null,
        display_order: displayOrder,
        link_type: input.link_type || 'standard',
        style_options: input.style_options || {},
        schedule_start: input.schedule_start || null,
        schedule_end: input.schedule_end || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create link error:', error);
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
    console.error('Create link error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while creating your link.',
      success: false,
    };
  }
}

// Get links for a page (public)
export async function getLinksByPageId(pageId: string): Promise<ApiResponse<Link[]>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    // Filter out scheduled links that shouldn't be shown yet
    const now = new Date().toISOString();
    const visibleLinks = (data || []).filter(link => {
      if (link.schedule_start && link.schedule_start > now) return false;
      if (link.schedule_end && link.schedule_end < now) return false;
      return true;
    });

    return {
      data: visibleLinks,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Get links by page ID error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching links.',
      success: false,
    };
  }
}

// Get links for a page (owner view - includes inactive and scheduled)
export async function getLinksByPageIdForOwner(pageId: string): Promise<ApiResponse<Link[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Verify user owns the page
    const { data: linkPage } = await supabase
      .from('link_pages')
      .select('id')
      .eq('id', pageId)
      .eq('user_id', user.id)
      .single();

    if (!linkPage) {
      return {
        data: null,
        error: 'Link page not found or you do not have permission to view its links.',
        success: false,
      };
    }

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

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
    console.error('Get links by page ID for owner error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching your links.',
      success: false,
    };
  }
}

// Get link by ID
export async function getLinkById(id: string): Promise<ApiResponse<Link>> {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: 'Link not found',
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
    console.error('Get link by ID error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching the link.',
      success: false,
    };
  }
}

// Update link (client-side)
export async function updateLink(id: string, input: UpdateLinkInput): Promise<ApiResponse<Link>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Verify user owns the link through the page
    const { data: linkWithPage } = await supabase
      .from('links')
      .select(`
        id,
        page_id,
        link_pages!inner(user_id)
      `)
      .eq('id', id)
      .eq('link_pages.user_id', user.id)
      .single();

    if (!linkWithPage) {
      return {
        data: null,
        error: 'Link not found or you do not have permission to edit it.',
        success: false,
      };
    }

    // Prepare update data (remove undefined values)
    const updateData: Partial<Link> = {};
    
    if (input.title !== undefined) updateData.title = input.title;
    if (input.url !== undefined) updateData.url = input.url;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.icon_url !== undefined) updateData.icon_url = input.icon_url;
    if (input.thumbnail_url !== undefined) updateData.thumbnail_url = input.thumbnail_url;
    if (input.display_order !== undefined) updateData.display_order = input.display_order;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.link_type !== undefined) updateData.link_type = input.link_type;
    if (input.style_options !== undefined) updateData.style_options = input.style_options;
    if (input.schedule_start !== undefined) updateData.schedule_start = input.schedule_start;
    if (input.schedule_end !== undefined) updateData.schedule_end = input.schedule_end;

    const { data, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update link error:', error);
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
    console.error('Update link error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while updating your link.',
      success: false,
    };
  }
}

// Delete link (client-side)
export async function deleteLink(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Verify user owns the link through the page
    const { data: linkWithPage } = await supabase
      .from('links')
      .select(`
        id,
        page_id,
        display_order,
        link_pages!inner(user_id)
      `)
      .eq('id', id)
      .eq('link_pages.user_id', user.id)
      .single();

    if (!linkWithPage) {
      return {
        data: null,
        error: 'Link not found or you do not have permission to delete it.',
        success: false,
      };
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete link error:', error);
      return {
        data: null,
        error: 'Failed to delete link. Please try again.',
        success: false,
      };
    }

    // Reorder remaining links to fill the gap
    const { error: reorderError } = await supabase
      .from('links')
      .update({ display_order: supabase.raw('display_order - 1') })
      .eq('page_id', linkWithPage.page_id)
      .gt('display_order', linkWithPage.display_order);

    if (reorderError) {
      console.error('Reorder links after deletion error:', reorderError);
      // Don't fail the deletion for this
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Delete link error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while deleting your link.',
      success: false,
    };
  }
}

// Reorder links (for drag-and-drop)
export async function reorderLinks(input: ReorderLinksInput): Promise<ApiResponse<boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Verify user owns the page
    const { data: linkPage } = await supabase
      .from('link_pages')
      .select('id')
      .eq('id', input.page_id)
      .eq('user_id', user.id)
      .single();

    if (!linkPage) {
      return {
        data: null,
        error: 'Link page not found or you do not have permission to reorder its links.',
        success: false,
      };
    }

    // Update each link's display order
    const updatePromises = input.link_orders.map(({ id, display_order }) =>
      supabase
        .from('links')
        .update({ display_order })
        .eq('id', id)
        .eq('page_id', input.page_id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check if any updates failed
    const failedUpdates = results.filter(result => result.error);
    if (failedUpdates.length > 0) {
      console.error('Reorder links errors:', failedUpdates.map(r => r.error));
      return {
        data: null,
        error: 'Failed to reorder some links. Please try again.',
        success: false,
      };
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Reorder links error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while reordering your links.',
      success: false,
    };
  }
}

// Track link click (for analytics)
export async function trackLinkClick(linkId: string, metadata?: {
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<ApiResponse<boolean>> {
  try {
    // Get link and page info
    const { data: link } = await supabase
      .from('links')
      .select(`
        id,
        page_id,
        click_count,
        link_pages!inner(id)
      `)
      .eq('id', linkId)
      .single();

    if (!link) {
      return {
        data: null,
        error: 'Link not found',
        success: false,
      };
    }

    // Insert click tracking record
    const { error: trackError } = await supabase
      .from('link_clicks')
      .insert({
        link_id: linkId,
        page_id: link.page_id,
        user_agent: metadata?.userAgent || null,
        referrer: metadata?.referrer || null,
        utm_source: metadata?.utmSource || null,
        utm_medium: metadata?.utmMedium || null,
        utm_campaign: metadata?.utmCampaign || null,
      });

    if (trackError) {
      console.error('Track link click error:', trackError);
      // Don't fail the request for tracking errors
    }

    // Increment click count
    const { error: incrementError } = await supabase
      .from('links')
      .update({ click_count: (link.click_count || 0) + 1 })
      .eq('id', linkId);

    if (incrementError) {
      console.error('Increment click count error:', incrementError);
      // Don't fail the request for this
    }

    return {
      data: true,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Track link click error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while tracking the click.',
      success: false,
    };
  }
}

// Get user's all links across all pages
export async function getUserLinks(): Promise<ApiResponse<Link[]>> {
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
      .from('links')
      .select(`
        *,
        link_pages!inner(
          id,
          title,
          slug,
          user_id
        )
      `)
      .eq('link_pages.user_id', user.id)
      .order('created_at', { ascending: false });

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
    console.error('Get user links error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while fetching your links.',
      success: false,
    };
  }
}

// Duplicate link
export async function duplicateLink(id: string): Promise<ApiResponse<Link>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        data: null,
        error: 'User not authenticated',
        success: false,
      };
    }

    // Get the original link
    const { data: originalLink } = await supabase
      .from('links')
      .select(`
        *,
        link_pages!inner(user_id)
      `)
      .eq('id', id)
      .eq('link_pages.user_id', user.id)
      .single();

    if (!originalLink) {
      return {
        data: null,
        error: 'Link not found or you do not have permission to duplicate it.',
        success: false,
      };
    }

    // Get the next display order
    const { data: maxOrderLink } = await supabase
      .from('links')
      .select('display_order')
      .eq('page_id', originalLink.page_id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderLink?.display_order || 0) + 1;

    // Create the duplicate
    const { data, error } = await supabase
      .from('links')
      .insert({
        page_id: originalLink.page_id,
        title: `${originalLink.title} (Copy)`,
        url: originalLink.url,
        description: originalLink.description,
        icon_url: originalLink.icon_url,
        thumbnail_url: originalLink.thumbnail_url,
        display_order: nextOrder,
        link_type: originalLink.link_type,
        style_options: originalLink.style_options,
        schedule_start: originalLink.schedule_start,
        schedule_end: originalLink.schedule_end,
      })
      .select()
      .single();

    if (error) {
      console.error('Duplicate link error:', error);
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
    console.error('Duplicate link error:', error);
    return {
      data: null,
      error: 'An unexpected error occurred while duplicating your link.',
      success: false,
    };
  }
} 