'use client';

import { useState, useEffect } from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions, canManageMember, canAccessProfile, type Permission } from '@/lib/permissions';
import { getUserRole } from '@/lib/api/organizations';

interface UsePermissionsProps {
  organizationId: string;
  refreshTrigger?: number;
}

interface PermissionState {
  userRole: string | null;
  permissions: Record<string, boolean>;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
}

export function usePermissions({ organizationId, refreshTrigger }: UsePermissionsProps) {
  const [state, setState] = useState<PermissionState>({
    userRole: null,
    permissions: {},
    isOwner: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadPermissions();
  }, [organizationId, refreshTrigger]);

  const loadPermissions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const role = await getUserRole(organizationId);
      if (!role) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Access denied'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        userRole: role,
        isOwner: role === 'owner',
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load permissions'
      }));
    }
  };

  // Permission checking functions
  const can = (permission: Permission, customPermissions?: Record<string, boolean>): boolean => {
    if (!state.userRole) return false;
    return hasPermission(state.userRole, permission, customPermissions);
  };

  const canAny = (permissions: Permission[], customPermissions?: Record<string, boolean>): boolean => {
    if (!state.userRole) return false;
    return hasAnyPermission(state.userRole, permissions, customPermissions);
  };

  const canAll = (permissions: Permission[], customPermissions?: Record<string, boolean>): boolean => {
    if (!state.userRole) return false;
    return hasAllPermissions(state.userRole, permissions, customPermissions);
  };

  const canManage = (targetRole: string): boolean => {
    if (!state.userRole) return false;
    return canManageMember(state.userRole, targetRole, state.isOwner);
  };

  const canAccessProfileData = (
    profileAccess: 'view' | 'edit' | 'admin',
    isAssigned: boolean = false
  ): boolean => {
    if (!state.userRole) return false;
    const isOrgAdmin = ['owner', 'admin'].includes(state.userRole);
    return canAccessProfile(state.userRole, profileAccess, isAssigned, isOrgAdmin);
  };

  return {
    ...state,
    can,
    canAny,
    canAll,
    canManage,
    canAccessProfile: canAccessProfileData,
    refresh: loadPermissions
  };
}

// Hook for checking specific permissions without organization context
export function useUserPermissions() {
  const checkPermission = (
    userRole: string,
    permission: Permission,
    customPermissions?: Record<string, boolean>
  ): boolean => {
    return hasPermission(userRole, permission, customPermissions);
  };

  const checkAnyPermission = (
    userRole: string,
    permissions: Permission[],
    customPermissions?: Record<string, boolean>
  ): boolean => {
    return hasAnyPermission(userRole, permissions, customPermissions);
  };

  const checkAllPermissions = (
    userRole: string,
    permissions: Permission[],
    customPermissions?: Record<string, boolean>
  ): boolean => {
    return hasAllPermissions(userRole, permissions, customPermissions);
  };

  const checkCanManage = (userRole: string, targetRole: string, isOwner: boolean = false): boolean => {
    return canManageMember(userRole, targetRole, isOwner);
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkCanManage
  };
}