import type { OrganizationMember } from '@/types';

// Permission definitions
export const PERMISSIONS = {
  // Organization management
  ORGANIZATION_VIEW: 'organization:view',
  ORGANIZATION_EDIT: 'organization:edit',
  ORGANIZATION_DELETE: 'organization:delete',
  ORGANIZATION_SETTINGS: 'organization:settings',
  
  // Member management
  MEMBER_VIEW: 'member:view',
  MEMBER_INVITE: 'member:invite',
  MEMBER_EDIT: 'member:edit',
  MEMBER_REMOVE: 'member:remove',
  
  // Profile management
  PROFILE_VIEW: 'profile:view',
  PROFILE_ADD: 'profile:add',
  PROFILE_EDIT: 'profile:edit',
  PROFILE_REMOVE: 'profile:remove',
  PROFILE_ASSIGN: 'profile:assign',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // White-label features
  BRANDING_EDIT: 'branding:edit',
  CUSTOM_DOMAIN: 'custom:domain',
  WHITE_LABEL: 'white:label',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    // All permissions for owners
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_EDIT,
    PERMISSIONS.ORGANIZATION_DELETE,
    PERMISSIONS.ORGANIZATION_SETTINGS,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_EDIT,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_ADD,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.PROFILE_REMOVE,
    PERMISSIONS.PROFILE_ASSIGN,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.BRANDING_EDIT,
    PERMISSIONS.CUSTOM_DOMAIN,
    PERMISSIONS.WHITE_LABEL,
  ],
  admin: [
    // Most permissions except organization deletion
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_EDIT,
    PERMISSIONS.ORGANIZATION_SETTINGS,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_EDIT,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_ADD,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.PROFILE_REMOVE,
    PERMISSIONS.PROFILE_ASSIGN,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.BRANDING_EDIT,
  ],
  member: [
    // Limited permissions for regular members
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_EDIT, // Only assigned profiles
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  viewer: [
    // Read-only permissions
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
};

// Permission checking functions
export function hasPermission(
  userRole: string,
  permission: Permission,
  customPermissions?: Record<string, boolean>
): boolean {
  // Check custom permissions first
  if (customPermissions && permission in customPermissions) {
    return customPermissions[permission];
  }
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  userRole: string,
  permissions: Permission[],
  customPermissions?: Record<string, boolean>
): boolean {
  return permissions.some(permission => 
    hasPermission(userRole, permission, customPermissions)
  );
}

export function hasAllPermissions(
  userRole: string,
  permissions: Permission[],
  customPermissions?: Record<string, boolean>
): boolean {
  return permissions.every(permission => 
    hasPermission(userRole, permission, customPermissions)
  );
}

// Check if user can manage another member
export function canManageMember(
  userRole: string,
  targetMemberRole: string,
  isOwner: boolean = false
): boolean {
  // Owners can manage anyone
  if (isOwner) return true;
  
  // Admins can manage members and viewers, but not other admins or owners
  if (userRole === 'admin') {
    return ['member', 'viewer'].includes(targetMemberRole);
  }
  
  // Members and viewers cannot manage others
  return false;
}

// Check if user can access profile based on assignment
export function canAccessProfile(
  userRole: string,
  profileAccess: 'view' | 'edit' | 'admin',
  isAssigned: boolean = false,
  isOrgAdmin: boolean = false
): boolean {
  // Organization admins and owners can access any profile
  if (isOrgAdmin || userRole === 'owner') return true;
  
  // Members can only access assigned profiles
  if (userRole === 'member' && isAssigned) {
    return true;
  }
  
  // Viewers can view any profile but not edit
  if (userRole === 'viewer' && profileAccess === 'view') {
    return true;
  }
  
  return false;
}

// Subscription tier permissions
export function hasSubscriptionFeature(
  subscriptionTier: string,
  feature: string
): boolean {
  const tierFeatures: Record<string, string[]> = {
    free: ['basic_analytics', 'basic_themes'],
    starter: ['basic_analytics', 'basic_themes', 'custom_themes', 'remove_branding'],
    pro: ['basic_analytics', 'basic_themes', 'custom_themes', 'remove_branding', 'custom_domain', 'advanced_analytics', 'ai_features'],
    agency: ['basic_analytics', 'basic_themes', 'custom_themes', 'remove_branding', 'custom_domain', 'advanced_analytics', 'ai_features', 'white_label', 'team_management', 'bulk_operations'],
    enterprise: ['basic_analytics', 'basic_themes', 'custom_themes', 'remove_branding', 'custom_domain', 'advanced_analytics', 'ai_features', 'white_label', 'team_management', 'bulk_operations', 'priority_support', 'custom_integrations'],
  };
  
  const features = tierFeatures[subscriptionTier] || [];
  return features.includes(feature);
}

// Organization limits based on subscription
export function getOrganizationLimits(subscriptionTier: string) {
  const limits: Record<string, any> = {
    agency: {
      maxProfiles: 25,
      maxMembers: 10,
      customDomains: 5,
      whiteLabel: true,
    },
    enterprise: {
      maxProfiles: 100,
      maxMembers: 50,
      customDomains: 25,
      whiteLabel: true,
      prioritySupport: true,
    },
  };
  
  return limits[subscriptionTier] || {
    maxProfiles: 10,
    maxMembers: 5,
    customDomains: 1,
    whiteLabel: false,
  };
}