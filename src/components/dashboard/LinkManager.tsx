'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableContextType,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  GlobeAltIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Modal, Input, Alert, Icon } from '@/components/ui';
import {
  fetchLinks,
  createLink as createLinkAPI
} from '@/lib/api/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateLinkSchema } from '@/lib/validations/links';
import { AdvancedLinkForm } from '@/components/forms/advanced-link-form';
import type { Link, CreateLinkInput, UpdateLinkInput, LinkPage } from '@/types';

interface LinkManagerProps {
  selectedPage: LinkPage | null;
}

interface SortableLinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onDuplicate: (link: Link) => void;
  onToggleActive: (link: Link) => void;
}

function SortableLinkItem({ link, onEdit, onDelete, onDuplicate, onToggleActive }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLinkTypeColor = (type: string) => {
    switch (type) {
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'product': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-purple-100 text-purple-800';
      case 'contact': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isScheduled = link.schedule_start || link.schedule_end;
  const now = new Date().toISOString();
  const isCurrentlyVisible = !link.schedule_start || link.schedule_start <= now;
  const isExpired = link.schedule_end && link.schedule_end < now;

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card className={`p-4 ${isDragging ? 'shadow-lg' : ''} ${!link.is_active ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <Bars3Icon className="h-5 w-5" />
          </div>

          {/* Link Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {/* Link Icon */}
              <div className="flex-shrink-0">
                {link.icon_name ? (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: link.icon_color || '#6B7280' }}>
                    <Icon 
                      icon={link.icon_name} 
                      size={24}
                      color="white"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {link.title}
                  </h4>
                  <Badge className={`text-xs ${getLinkTypeColor(link.link_type)}`}>
                    {link.link_type}
                  </Badge>
                  {!link.is_active && <Badge variant="secondary">Inactive</Badge>}
                  {isScheduled && (
                    <Badge variant={isExpired ? 'error' : isCurrentlyVisible ? 'success' : 'warning'}>
                      {isExpired ? 'Expired' : isCurrentlyVisible ? 'Live' : 'Scheduled'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600 truncate max-w-xs"
              >
                <GlobeAltIcon className="h-3 w-3 flex-shrink-0" />
                {link.url}
              </a>
              <span className="flex items-center gap-1 text-gray-500">
                <EyeIcon className="h-3 w-3" />
                {link.click_count} clicks
              </span>
            </div>

            {link.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {link.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(link)}
              className="p-2 h-8 w-8"
              title={link.is_active ? 'Deactivate link' : 'Activate link'}
            >
              <EyeIcon className={`h-4 w-4 ${link.is_active ? 'text-green-600' : 'text-gray-400'}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(link)}
              className="p-2 h-8 w-8"
              title="Duplicate link"
            >
                                <DocumentDuplicateIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(link)}
              className="p-2 h-8 w-8"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(link)}
              className="p-2 h-8 w-8 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function LinkManager({ selectedPage }: LinkManagerProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  



  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );



  // Edit form
  const editForm = useForm<UpdateLinkInput>({
    resolver: zodResolver(updateLinkSchema),
  });

  // Load links when page changes
  useEffect(() => {
    if (selectedPage) {
      loadLinks();
    } else {
      setLinks([]);
    }
  }, [selectedPage]);

  // Load links
  const loadLinks = async () => {
    if (!selectedPage) return;
    
    setLoading(true);
    setError(null);
    
    const response = await fetchLinks(selectedPage.id);
    if (response.success && response.data) {
      setLinks(response.data);
    } else {
      setError(response.error || 'Failed to load links');
    }
    
    setLoading(false);
  };

  // Handle create link
  const handleCreateLink = async (data: CreateLinkInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createLinkAPI(data);
      
      if (response.success && response.data) {
        setLinks(prev => [...prev, response.data!]);
        // Modal will close automatically via the onSubmit handler
      } else {
        setError(response.error || 'Failed to create link');
      }
    } catch (error) {
      console.error('Error creating link:', error);
      setError('Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit link
  const handleEditLink = async (data: UpdateLinkInput) => {
    if (!editingLink) return;
    
    // TODO: Implement update link API
    console.log('Update link not implemented yet', data);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success && response.data) {
      setLinks(prev => 
        prev.map(link => 
          link.id === editingLink.id ? response.data! : link
        )
      );
      setShowEditModal(false);
      setEditingLink(null);
      editForm.reset();
    } else {
      setError(response.error || 'Failed to update link');
    }
  };

  // Handle delete link
  const handleDeleteLink = async () => {
    if (!deletingLink) return;
    
    // TODO: Implement delete link API
    console.log('Delete link not implemented yet', deletingLink.id);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success) {
      setLinks(prev => prev.filter(link => link.id !== deletingLink.id));
      setShowDeleteModal(false);
      setDeletingLink(null);
    } else {
      setError(response.error || 'Failed to delete link');
    }
  };

  // Handle duplicate link
  const handleDuplicateLink = async (link: Link) => {
    // TODO: Implement duplicate link API
    console.log('Duplicate link not implemented yet', link.id);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success && response.data) {
      setLinks(prev => [...prev, response.data!]);
    } else {
      setError(response.error || 'Failed to duplicate link');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (link: Link) => {
    // TODO: Implement toggle link API
    console.log('Toggle link not implemented yet', link.id);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success && response.data) {
      setLinks(prev => 
        prev.map(l => 
          l.id === link.id ? response.data! : l
        )
      );
    } else {
      setError(response.error || 'Failed to update link status');
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = links.findIndex(link => link.id === active.id);
    const newIndex = links.findIndex(link => link.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newLinks = arrayMove(links, oldIndex, newIndex);
    setLinks(newLinks);

    // Update display orders
    const linkOrders = newLinks.map((link, index) => ({
      id: link.id,
      display_order: index,
    }));

    // TODO: Implement reorder links API
    console.log('Reorder links not implemented yet', linkOrders);
    const response = { success: false, error: 'Not implemented yet' };

    if (!response.success) {
      // Revert on error
      setLinks(links);
      setError(response.error || 'Failed to reorder links');
    }
  };

  // Open edit modal
  const openEditModal = (link: Link) => {
    setEditingLink(link);
    editForm.reset({
      title: link.title,
      url: link.url,
      description: link.description || '',
      link_type: link.link_type,
      is_active: link.is_active,
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (link: Link) => {
    setDeletingLink(link);
    setShowDeleteModal(true);
  };

  if (!selectedPage) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No page selected
          </h3>
          <p className="text-gray-600">
            Select a link page from the sidebar to manage its links.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Links for "{selectedPage.title}"
          </h2>
          <p className="text-gray-600 mt-1">
            Drag and drop to reorder your links. {links.length} link{links.length !== 1 ? 's' : ''} total.
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Links List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : links.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              <AnimatePresence>
                {links.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SortableLinkItem
                      link={link}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                      onDuplicate={handleDuplicateLink}
                      onToggleActive={handleToggleActive}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No links yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first link to get started. You can add social media profiles, websites, products, and more.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Add Your First Link
            </Button>
          </div>
        </Card>
      )}

      {/* Create Link Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Link"
        size="lg"
      >
        <AdvancedLinkForm
          pageId={selectedPage.id}
          onSubmit={async (data) => {
            await handleCreateLink(data);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Edit Link Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingLink(null);
          editForm.reset();
        }}
        title="Edit Link"
      >
        <form onSubmit={editForm.handleSubmit(handleEditLink)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Link Title *"
              {...editForm.register('title')}
              error={editForm.formState.errors.title?.message}
            />

            <Input
              label="URL *"
              {...editForm.register('url')}
              error={editForm.formState.errors.url?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...editForm.register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Type
              </label>
              <select
                {...editForm.register('link_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="social">Social Media</option>
                <option value="product">Product/Store</option>
                <option value="media">Media/Content</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...editForm.register('is_active')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Link is active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingLink(null);
                editForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={editForm.formState.isSubmitting}
            >
              {editForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Link Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingLink(null);
        }}
        title="Delete Link"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "<strong>{deletingLink?.title}</strong>"? 
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingLink(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLink}
            >
              Delete Link
            </Button>
            </div>
        </div>
      </Modal>


    </div>
  );
} 