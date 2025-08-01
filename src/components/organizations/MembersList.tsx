'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { updateMember, removeMember } from '@/lib/api/organizations';
import type { OrganizationMember } from '@/types';

interface MembersListProps {
  organizationId: string;
  members: OrganizationMember[];
  userRole: string | null;
  onMemberUpdate: () => void;
}

export function MembersList({ organizationId, members, userRole, onMemberUpdate }: MembersListProps) {
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const canManage = userRole === 'owner' || userRole === 'admin';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'admin':
        return 'bg-gradient-to-r from-blue-500 to-teal-500';
      case 'member':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'viewer':
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!canManage) return;

    setLoading(memberId);
    try {
      const response = await updateMember(organizationId, memberId, { role: newRole as any });
      if (response.success) {
        onMemberUpdate();
        setShowEditModal(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManage) return;

    setLoading(memberId);
    try {
      const response = await removeMember(organizationId, memberId);
      if (response.success) {
        onMemberUpdate();
        setShowDeleteModal(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <p className="text-sm text-gray-500">{members.length} members</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {members.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {member.user?.avatar_url ? (
                      <img
                        src={member.user.avatar_url}
                        alt={member.user.display_name || member.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {member.user?.display_name || member.user?.username || 'Unknown User'}
                    </h4>
                    <p className="text-sm text-gray-500">@{member.user?.username}</p>
                    {member.user?.bio && (
                      <p className="text-xs text-gray-400 mt-1">{member.user.bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    className={`text-white text-xs px-3 py-1 ${getRoleBadgeColor(member.role)}`}
                  >
                    {member.role}
                  </Badge>

                  <div className="text-xs text-gray-500">
                    {member.joined_at ? (
                      <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                    ) : (
                      <span>Invited {new Date(member.invited_at).toLocaleDateString()}</span>
                    )}
                  </div>

                  {canManage && member.role !== 'owner' && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMember(member)}
                        className="p-1"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                      
                      {selectedMember?.id === member.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              setShowEditModal(true);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <PencilIcon className="h-3 w-3" />
                            Edit Role
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
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        title="Edit Member Role"
        size="sm"
      >
        {selectedMember && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Change role for {selectedMember.user?.display_name || selectedMember.user?.username}
            </p>
            
            <div className="space-y-2">
              {['admin', 'member', 'viewer'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleUpdateRole(selectedMember.id, role)}
                  disabled={loading === selectedMember.id}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedMember.role === role
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium capitalize">{role}</div>
                  <div className="text-xs text-gray-500">
                    {role === 'admin' && 'Can manage members and profiles'}
                    {role === 'member' && 'Can view and edit assigned profiles'}
                    {role === 'viewer' && 'Can only view organization data'}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMember(null);
        }}
        title="Remove Member"
        size="sm"
      >
        {selectedMember && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove{' '}
              <strong>{selectedMember.user?.display_name || selectedMember.user?.username}</strong>{' '}
              from this organization? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRemoveMember(selectedMember.id)}
                disabled={loading === selectedMember.id}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading === selectedMember.id ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}