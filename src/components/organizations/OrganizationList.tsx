'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, BuildingOfficeIcon, UsersIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CreateOrganizationForm } from './CreateOrganizationForm';
import { getOrganizations } from '@/lib/api/organizations';
import type { Organization } from '@/types';

interface OrganizationListProps {
  onSelectOrganization?: (organization: Organization) => void;
}

export function OrganizationList({ onSelectOrganization }: OrganizationListProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getOrganizations();
      
      if (response.success && response.data) {
        setOrganizations(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load organizations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newOrganization: Organization) => {
    setOrganizations(prev => [newOrganization, ...prev]);
    setShowCreateModal(false);
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading organizations</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button onClick={loadOrganizations} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <p className="text-gray-600 mt-1">
            Manage your organizations and team collaboration
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first organization.
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create Organization
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {organizations.map((org) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div 
                    className="p-6"
                    onClick={() => onSelectOrganization?.(org)}
                  >
                    {/* Organization Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-500">@{org.slug}</p>
                      </div>
                      <Badge 
                        className={`text-white text-xs px-2 py-1 ${getRoleBadgeColor((org as any).member_role)}`}
                      >
                        {(org as any).member_role || 'Member'}
                      </Badge>
                    </div>

                    {/* Organization Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        <span>Team</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{org.max_profiles} profiles max</span>
                      </div>
                    </div>

                    {/* Subscription Tier */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={org.subscription_tier === 'enterprise' ? 'primary' : 'secondary'}
                        className="capitalize"
                      >
                        {org.subscription_tier}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(org.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Hover Action */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-purple-600 hover:bg-purple-50"
                      >
                        Manage Organization →
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Organization"
        size="md"
      >
        <CreateOrganizationForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}