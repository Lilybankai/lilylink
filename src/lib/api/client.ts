import { ApiResponse } from '@/types';
import { LinkPage, Link, CreateLinkPageInput, CreateLinkInput } from '@/types';

// Client-side API functions that use fetch instead of server Supabase client

export async function fetchLinkPages(): Promise<ApiResponse<LinkPage[]>> {
  try {
    const response = await fetch('/api/link-pages');
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to fetch link pages' };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function createLinkPage(data: CreateLinkPageInput): Promise<ApiResponse<LinkPage>> {
  try {
    const response = await fetch('/api/link-pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create link page' };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function fetchLinks(pageId: string): Promise<ApiResponse<Link[]>> {
  try {
    const response = await fetch(`/api/links?pageId=${pageId}`);
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to fetch links' };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function createLink(data: CreateLinkInput): Promise<ApiResponse<Link>> {
  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create link' };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
} 