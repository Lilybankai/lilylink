'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  FolderIcon, 
  Cog6ToothIcon,
  PlusIcon,
  UserPlusIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import { MembersList } from './MembersList';
import { ManagedProfilesList } from './ManagedProfilesList';
import { InviteMemberForm } from './InviteMemberForm';
import { AddManagedProfileForm } from './AddManagedProfileForm';
import { BrandingCustomizer } from '../white-label/BrandingCustomizer';
import { getOrganization, getUserRole } from '@/lib/api/organizations';
import type { OrganizationWithMembers } from '@/types';

interface OrganizationDashboardProps {
  organizationId: string;
  onBack?: () => void;
}

export function OrganizationDashboard({ organizationId, onBack }: OrganizationDashboardProps) {
  const [organization, setOrganization] = useState<OrganizationWithMembers | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'profiles' | 'branding' | 'settings'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);

  useEffect(() => {
    loadOrganization();
    loadUserRole();
  }, [organizationId]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const response = await getOrganization(organizationId);
      
      if (response.success && response.data) {
        setOrganization(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load organization');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const role = await getUserRole(organizationId);
      setUserRole(role);
    } catch (err) {
      console.error('Error loading user role:', err);
    }
  };

  const canManage = userRole === 'owner' || userRole === 'admin';
  const canInvite = canManage;
  const canAddProfiles = canManage;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BuildingOfficeIcon },
    { id: 'members', label: 'Members', icon: UsersIcon },
    { id: 'profiles', label: 'Managed Profiles', icon: FolderIcon },
    { id: 'branding', label: 'Branding', icon: PaintBrushIcon, requiresManage: true },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, requiresManage: true }
  ].filter(tab => !tab.requiresManage || canManage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading organization</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6 flex gap-3 justify-center">
          {onBack && (
            <Button onClick={onBack} variant="ghost">
              ← Back to Organizations
            </Button>
          )}
          <Button onClick={loadOrganization} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const activeMembers = organization.organization_members?.filter(m => m.is_active) || [];
  const activeProfiles = organization.managed_profiles?.filter(p => p.is_active) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              ← Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-gray-600">@{organization.slug}</p>
          </div>
          <Badge 
            variant={organization.subscription_tier === 'enterprise' ? 'primary' : 'secondary'}
            className="capitalize"
          >
            {organization.subscription_tier}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {canAddProfiles && (
            <Tooltip content="Add managed profile">
              <Button
                onClick={() => setShowAddProfileModal(true)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Profile
              </Button>
            </Tooltip>
          )}
          
          {canInvite && (
            <Tooltip content="Invite team member">
              <Button
                onClick={() => setShowInviteModal(true)}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Invite Member
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{activeMembers.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Managed Profiles</p>
              <p className="text-3xl font-bold text-gray-900">
                {activeProfiles.length}
                <span className="text-lg text-gray-500">/{organization.max_profiles}</span>
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <FolderIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Role</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{userRole}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{organization.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <p className="mt-1 text-sm text-gray-900">@{organization.slug}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subscription</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{organization.subscription_tier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(organization.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'members' && (
          <MembersList 
            organizationId={organizationId}
            members={activeMembers}
            userRole={userRole}
            onMemberUpdate={loadOrganization}
          />
        )}

        {activeTab === 'profiles' && (
          <ManagedProfilesList
            organizationId={organizationId}
            profiles={activeProfiles}
            userRole={userRole}
            onProfileUpdate={loadOrganization}
          />
        )}

        {activeTab === 'branding' && canManage && (
          <BrandingCustomizer
            organization={organization}
            onSave={loadOrganization}
          />
        )}

        {activeTab === 'settings' && canManage && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        size="md"
      >
        <InviteMemberForm
          organizationId={organizationId}
          onSuccess={() => {
            setShowInviteModal(false);
            loadOrganization();
          }}
          onCancel={() => setShowInviteModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showAddProfileModal}
        onClose={() => setShowAddProfileModal(false)}
        title="Add Managed Profile"
        size="md"
      >
        <AddManagedProfileForm
          organizationId={organizationId}
          onSuccess={() => {
            setShowAddProfileModal(false);
            loadOrganization();
          }}
          onCancel={() => setShowAddProfileModal(false)}
        />
      </Modal>
    </div>
  );
}