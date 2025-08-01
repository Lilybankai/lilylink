import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, canManageMember, type Permission } from './index';

interface PermissionCheckOptions {
  requiredPermissions?: Permission[];
  requireAny?: boolean; // If true, user needs ANY of the permissions, otherwise ALL
  checkProfileAccess?: boolean;
  checkMemberManagement?: boolean;
}

export async function checkOrganizationPermissions(
  request: NextRequest,
  organizationId: string,
  options: PermissionCheckOptions = {}
): Promise<{
  success: boolean;
  user?: any;
  member?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Get user's membership in the organization
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        permissions,
        is_active,
        organizations!inner (
          id,
          owner_id,
          subscription_tier
        )
      `)
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Access denied - not a member of this organization'
      };
    }

    // Check if organization is active
    if (!member.organizations) {
      return {
        success: false,
        error: 'Organization not found or inactive'
      };
    }

    // Check required permissions
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasRequiredPermissions = options.requireAny
        ? options.requiredPermissions.some(permission => 
            hasPermission(member.role, permission, member.permissions)
          )
        : options.requiredPermissions.every(permission => 
            hasPermission(member.role, permission, member.permissions)
          );

      if (!hasRequiredPermissions) {
        return {
          success: false,
          error: 'Insufficient permissions'
        };
      }
    }

    return {
      success: true,
      user,
      member: {
        ...member,
        isOwner: member.organizations.owner_id === user.id
      }
    };

  } catch (error) {
    console.error('Permission check error:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

export async function checkMemberManagementPermissions(
  request: NextRequest,
  organizationId: string,
  targetMemberId?: string
): Promise<{
  success: boolean;
  user?: any;
  member?: any;
  targetMember?: any;
  error?: string;
}> {
  const permissionCheck = await checkOrganizationPermissions(request, organizationId, {
    requiredPermissions: ['member:edit', 'member:remove'],
    requireAny: true
  });

  if (!permissionCheck.success) {
    return permissionCheck;
  }

  // If checking specific member management, get target member details
  if (targetMemberId) {
    const supabase = await createClient();
    
    const { data: targetMember, error } = await supabase
      .from('organization_members')
      .select('id, role, user_id')
      .eq('id', targetMemberId)
      .eq('organization_id', organizationId)
      .single();

    if (error || !targetMember) {
      return {
        success: false,
        error: 'Target member not found'
      };
    }

    // Check if user can manage this specific member
    const canManage = canManageMember(
      permissionCheck.member?.role,
      targetMember.role,
      permissionCheck.member?.isOwner
    );

    if (!canManage) {
      return {
        success: false,
        error: 'Cannot manage this member due to role restrictions'
      };
    }

    return {
      ...permissionCheck,
      targetMember
    };
  }

  return permissionCheck;
}

export async function checkProfileManagementPermissions(
  request: NextRequest,
  organizationId: string,
  profileId?: string
): Promise<{
  success: boolean;
  user?: any;
  member?: any;
  profileAccess?: any;
  error?: string;
}> {
  const permissionCheck = await checkOrganizationPermissions(request, organizationId, {
    requiredPermissions: ['profile:view'],
    requireAny: false
  });

  if (!permissionCheck.success) {
    return permissionCheck;
  }

  // If checking specific profile access, verify assignment
  if (profileId) {
    const supabase = await createClient();
    
    const { data: profileAccess, error } = await supabase
      .from('managed_profiles')
      .select('id, access_level, manager_id')
      .eq('organization_id', organizationId)
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .single();

    if (error || !profileAccess) {
      return {
        success: false,
        error: 'Profile not managed by this organization'
      };
    }

    // Check if user has access to this specific profile
    const isAssigned = profileAccess.manager_id === permissionCheck.user?.id;
    const isOrgAdmin = ['owner', 'admin'].includes(permissionCheck.member?.role);

    if (!isOrgAdmin && !isAssigned && permissionCheck.member?.role !== 'viewer') {
      return {
        success: false,
        error: 'Access denied - profile not assigned to you'
      };
    }

    return {
      ...permissionCheck,
      profileAccess
    };
  }

  return permissionCheck;
}

// Middleware wrapper for API routes
export function withOrganizationPermissions(
  handler: (req: NextRequest, context: any, permissionData: any) => Promise<NextResponse>,
  options: PermissionCheckOptions = {}
) {
  return async (request: NextRequest, context: any) => {
    const organizationId = context.params?.id || context.params?.organizationId;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const permissionCheck = await checkOrganizationPermissions(
      request,
      organizationId,
      options
    );

    if (!permissionCheck.success) {
      const status = permissionCheck.error === 'Authentication required' ? 401 : 403;
      return NextResponse.json(
        { error: permissionCheck.error },
        { status }
      );
    }

    return handler(request, context, permissionCheck);
  };
}

export function withMemberPermissions(
  handler: (req: NextRequest, context: any, permissionData: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const organizationId = context.params?.id;
    const memberId = context.params?.memberId;
    
    const permissionCheck = await checkMemberManagementPermissions(
      request,
      organizationId,
      memberId
    );

    if (!permissionCheck.success) {
      const status = permissionCheck.error === 'Authentication required' ? 401 : 403;
      return NextResponse.json(
        { error: permissionCheck.error },
        { status }
      );
    }

    return handler(request, context, permissionCheck);
  };
}

export function withProfilePermissions(
  handler: (req: NextRequest, context: any, permissionData: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const organizationId = context.params?.id;
    const profileId = context.params?.profileId;
    
    const permissionCheck = await checkProfileManagementPermissions(
      request,
      organizationId,
      profileId
    );

    if (!permissionCheck.success) {
      const status = permissionCheck.error === 'Authentication required' ? 401 : 403;
      return NextResponse.json(
        { error: permissionCheck.error },
        { status }
      );
    }

    return handler(request, context, permissionCheck);
  };
}