'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { removeManagedProfile } from '@/lib/api/organizations';
import type { ManagedProfile } from '@/types';

interface ManagedProfilesListProps {
  organizationId: string;
  profiles: ManagedProfile[];
  userRole: string | null;
  onProfileUpdate: () => void;
}

export function ManagedProfilesList({ organizationId, profiles, userRole, onProfileUpdate }: ManagedProfilesListProps) {
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const canManage = userRole === 'owner' || userRole === 'admin';

  const getAccessLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'edit':
        return 'bg-gradient-to-r from-blue-500 to-teal-500';
      case 'view':
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRemoveProfile = async (profileId: string) => {
    if (!canManage) return;

    setLoading(profileId);
    try {
      const response = await removeManagedProfile(organizationId, profileId);
      if (response.success) {
        onProfileUpdate();
        setShowDeleteModal(false);
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('Error removing managed profile:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Managed Profiles</h3>
        <p className="text-sm text-gray-500">{profiles.length} profiles</p>
      </div>

      {profiles.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-2 text-sm font-medium text-gray-900">No managed profiles</h4>
          <p className="mt-1 text-sm text-gray-500">
            Add link pages to this organization to start managing them.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {profiles.map((managedProfile) => (
            <motion.div
              key={managedProfile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <FolderIcon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {managedProfile.profile?.title || 'Unknown Profile'}
                        </h4>
                        {managedProfile.profile?.slug && (
                          <a
                            href={`/${managedProfile.profile.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        @{managedProfile.profile?.slug || 'unknown'}
                      </p>
                      
                      {managedProfile.client_name && (
                        <div className="mt-1">
                          <p className="text-xs font-medium text-gray-700">
                            Client: {managedProfile.client_name}
                          </p>
                          {managedProfile.client_email && (
                            <p className="text-xs text-gray-500">
                              {managedProfile.client_email}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {managedProfile.manager?.display_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Managed by: {managedProfile.manager.display_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`text-white text-xs px-3 py-1 ${getAccessLevelBadgeColor(managedProfile.access_level)}`}
                    >
                      {managedProfile.access_level}
                    </Badge>

                    <div className="text-xs text-gray-500">
                      Added {new Date(managedProfile.created_at).toLocaleDateString()}
                    </div>

                    {canManage && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProfile(managedProfile)}
                          className="p-1"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                        
                        {selectedProfile?.id === managedProfile.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => {
                                // TODO: Implement edit functionality
                                setSelectedProfile(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <PencilIcon className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteModal(true);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            >
                              <TrashIcon className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {managedProfile.client_notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      <strong>Notes:</strong> {managedProfile.client_notes}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProfile(null);
        }}
        title="Remove Managed Profile"
        size="sm"
      >
        {selectedProfile && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove{' '}
              <strong>{selectedProfile.profile?.title}</strong>{' '}
              from this organization? This will not delete the profile itself, only remove it from organization management.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProfile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRemoveProfile(selectedProfile.id)}
                disabled={loading === selectedProfile.id}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading === selectedProfile.id ? 'Removing...' : 'Remove Profile'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}