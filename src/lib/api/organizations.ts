import { supabase } from '@/lib/supabase/client';
import type { 
  Organization,
  OrganizationWithMembers,
  OrganizationMember,
  ManagedProfile,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  InviteMemberInput,
  UpdateMemberInput,
  AddManagedProfileInput,
  UpdateManagedProfileInput,
  ApiResponse
} from '@/types';

// Organization CRUD operations
export async function getOrganizations(): Promise<ApiResponse<Organization[]>> {
  try {
    const response = await fetch('/api/organizations');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organizations');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function getOrganization(id: string): Promise<ApiResponse<OrganizationWithMembers>> {
  try {
    const response = await fetch(`/api/organizations/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organization');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function createOrganization(data: CreateOrganizationInput): Promise<ApiResponse<Organization>> {
  try {
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create organization');
    }
    
    return result;
  } catch (error) {
    console.error('Error creating organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function updateOrganization(
  id: string, 
  data: UpdateOrganizationInput
): Promise<ApiResponse<Organization>> {
  try {
    const response = await fetch(`/api/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update organization');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function deleteOrganization(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/organizations/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete organization');
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

// Member management
export async function getOrganizationMembers(organizationId: string): Promise<ApiResponse<OrganizationMember[]>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/members`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch members');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching members:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function inviteMember(
  organizationId: string, 
  data: InviteMemberInput
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to invite member');
    }
    
    return result;
  } catch (error) {
    console.error('Error inviting member:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function updateMember(
  organizationId: string,
  memberId: string,
  data: UpdateMemberInput
): Promise<ApiResponse<OrganizationMember>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update member');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating member:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function removeMember(organizationId: string, memberId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to remove member');
    }
    
    return result;
  } catch (error) {
    console.error('Error removing member:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

// Managed profiles
export async function getManagedProfiles(organizationId: string): Promise<ApiResponse<ManagedProfile[]>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/managed-profiles`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch managed profiles');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching managed profiles:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function addManagedProfile(
  organizationId: string, 
  data: AddManagedProfileInput
): Promise<ApiResponse<ManagedProfile>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/managed-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to add managed profile');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding managed profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function updateManagedProfile(
  organizationId: string,
  profileId: string,
  data: UpdateManagedProfileInput
): Promise<ApiResponse<ManagedProfile>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/managed-profiles/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update managed profile');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating managed profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

export async function removeManagedProfile(
  organizationId: string, 
  profileId: string
): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/organizations/${organizationId}/managed-profiles/${profileId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to remove managed profile');
    }
    
    return result;
  } catch (error) {
    console.error('Error removing managed profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

// Utility functions
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    return !data && !error;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
}

export async function getUserRole(organizationId: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function canUserAccessOrganization(organizationId: string): Promise<boolean> {
  const role = await getUserRole(organizationId);
  return role !== null;
}

export async function canUserManageOrganization(organizationId: string): Promise<boolean> {
  const role = await getUserRole(organizationId);
  return role === 'owner' || role === 'admin';
}