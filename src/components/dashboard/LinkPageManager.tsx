'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  StarIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, Button, Badge, Modal, Input, Alert } from '@/components/ui';
import { ThemeCustomizer } from '@/components/dashboard/ThemeCustomizer';
import { LivePreview } from '@/components/editor/LivePreview';
import {
  fetchLinkPages,
  createLinkPage as createLinkPageAPI
} from '@/lib/api/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLinkPageSchema, updateLinkPageSchema } from '@/lib/validations/links';
import type { LinkPage, CreateLinkPageInput, UpdateLinkPageInput } from '@/types';

interface LinkPageManagerProps {
  onSelectPage?: (page: LinkPage) => void;
  selectedPageId?: string;
}

export function LinkPageManager({ onSelectPage, selectedPageId }: LinkPageManagerProps) {
  const [linkPages, setLinkPages] = useState<LinkPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPage, setEditingPage] = useState<LinkPage | null>(null);
  const [deletingPage, setDeleteingPage] = useState<LinkPage | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [themingPage, setThemingPage] = useState<LinkPage | null>(null);
  const [currentThemeConfig, setCurrentThemeConfig] = useState<any>(null);

  // Create form
  const createForm = useForm<CreateLinkPageInput>({
    resolver: zodResolver(createLinkPageSchema),
    defaultValues: {
      slug: '',
      title: '',
      description: '',
      is_primary: false,
      background_type: 'gradient',
      font_family: 'Inter',
    },
  });

  // Edit form
  const editForm = useForm<UpdateLinkPageInput>({
    resolver: zodResolver(updateLinkPageSchema),
  });

  // Load link pages
  const loadLinkPages = async () => {
    setLoading(true);
    setError(null);
    
    const response = await fetchLinkPages();
    if (response.success && response.data) {
      setLinkPages(response.data);
    } else {
      setError(response.error || 'Failed to load link pages');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadLinkPages();
  }, []);

  // Check slug availability with debounce
  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    // TODO: Implement slug availability check
    console.log('Slug availability check not implemented yet', slug);
    const response = { success: true, data: { available: true } };
    
    if (response.success && response.data) {
      setSlugAvailable(response.data.available);
    } else {
      setSlugAvailable(null);
    }
    
    setCheckingSlug(false);
  };

  // Watch slug changes for availability check
  const watchedSlug = createForm.watch('slug');
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedSlug) {
        checkSlug(watchedSlug);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedSlug]);

  // Handle create page
  const handleCreatePage = async (data: CreateLinkPageInput) => {
    const response = await createLinkPageAPI(data);
    
    if (response.success && response.data) {
      setLinkPages(prev => [response.data!, ...prev]);
      setShowCreateModal(false);
      createForm.reset();
      setSlugAvailable(null);
      
      // Select the new page if callback provided
      if (onSelectPage) {
        onSelectPage(response.data);
      }
    } else {
      setError(response.error || 'Failed to create link page');
    }
  };

  // Handle edit page
  const handleEditPage = async (data: UpdateLinkPageInput) => {
    if (!editingPage) return;
    
    // TODO: Implement update link page API
    console.log('Update link page not implemented yet', data);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success && response.data) {
      setLinkPages(prev => 
        prev.map(page => 
          page.id === editingPage.id ? response.data! : page
        )
      );
      setShowEditModal(false);
      setEditingPage(null);
      editForm.reset();
    } else {
      setError(response.error || 'Failed to update link page');
    }
  };

  // Handle delete page
  const handleDeletePage = async () => {
    if (!deletingPage) return;
    
    // TODO: Implement delete link page API
    console.log('Delete link page not implemented yet', deletingPage.id);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success) {
      setLinkPages(prev => prev.filter(page => page.id !== deletingPage.id));
      setShowDeleteModal(false);
      setDeleteingPage(null);
    } else {
      setError(response.error || 'Failed to delete link page');
    }
  };

  // Handle set primary
  const handleSetPrimary = async (page: LinkPage) => {
    // TODO: Implement set primary link page API
    console.log('Set primary link page not implemented yet', page.id);
    const response = { success: false, error: 'Not implemented yet' };
    
    if (response.success && response.data) {
      setLinkPages(prev => 
        prev.map(p => ({
          ...p,
          is_primary: p.id === page.id
        }))
      );
    } else {
      setError(response.error || 'Failed to set primary page');
    }
  };

  // Open edit modal
  const openEditModal = (page: LinkPage) => {
    setEditingPage(page);
    editForm.reset({
      slug: page.slug,
      title: page.title,
      description: page.description || '',
      is_active: page.is_active,
      background_type: page.background_type,
      background_value: page.background_value || '',
      font_family: page.font_family,
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (page: LinkPage) => {
    setDeleteingPage(page);
    setShowDeleteModal(true);
  };

  // Handle open theme editor
  const openThemeEditor = (page: LinkPage) => {
    setThemingPage(page);
    setShowThemeEditor(true);
  };

  // Handle theme change
  const handleThemeChange = (themeConfig: any) => {
    console.log('Theme changed:', themeConfig);
    setCurrentThemeConfig(themeConfig);
    // TODO: Update the page in the list
  };

  // Handle close theme editor
  const handleCloseThemeEditor = () => {
    setShowThemeEditor(false);
    setThemingPage(null);
    setCurrentThemeConfig(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Link Pages</h2>
          <p className="text-gray-600 mt-1">
            Manage your link pages. You can have multiple pages for different purposes.
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Page
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Link Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {linkPages.map((page) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPageId === page.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => onSelectPage?.(page)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {page.title}
                    </h3>
                    {page.is_primary && (
                      <StarIconSolid className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant={page.is_active ? 'success' : 'secondary'}>
                      {page.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 truncate">
                    /{page.slug}
                  </p>
                  {page.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {page.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {!page.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(page);
                        }}
                        className="p-1 h-8 w-8"
                        title="Set as primary"
                      >
                        <StarIcon className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {!page.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(page);
                        }}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/${page.slug}`, '_blank');
                      }}
                      className="flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openThemeEditor(page);
                      }}
                      className="flex items-center gap-1"
                    >
                      <PaintBrushIcon className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {linkPages.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cog6ToothIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No link pages yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first link page to start sharing your links with the world.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Link Page
            </Button>
          </div>
        </Card>
      )}

      {/* Create Page Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          createForm.reset();
          setSlugAvailable(null);
        }}
        title="Create New Link Page"
      >
        <form onSubmit={createForm.handleSubmit(handleCreatePage)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page URL *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  lilylink.com/
                </span>
                <Input
                  {...createForm.register('slug')}
                  placeholder="your-page-name"
                  className="rounded-l-none"
                  error={createForm.formState.errors.slug?.message}
                />
              </div>
              {checkingSlug && (
                <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
              )}
              {slugAvailable === true && (
                <p className="text-sm text-green-600 mt-1">✓ Available</p>
              )}
              {slugAvailable === false && (
                <p className="text-sm text-red-600 mt-1">✗ Not available</p>
              )}
            </div>

            <Input
              label="Page Title *"
              {...createForm.register('title')}
              placeholder="My Awesome Links"
              error={createForm.formState.errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...createForm.register('description')}
                placeholder="Tell visitors what this page is about..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {createForm.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {createForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...createForm.register('is_primary')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Set as primary page
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                createForm.reset();
                setSlugAvailable(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createForm.formState.isSubmitting || slugAvailable === false}
            >
              {createForm.formState.isSubmitting ? 'Creating...' : 'Create Page'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Page Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPage(null);
          editForm.reset();
        }}
        title="Edit Link Page"
      >
        <form onSubmit={editForm.handleSubmit(handleEditPage)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Page Title *"
              {...editForm.register('title')}
              error={editForm.formState.errors.title?.message}
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

            <div className="flex items-center">
              <input
                type="checkbox"
                {...editForm.register('is_active')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Page is active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingPage(null);
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

      {/* Delete Page Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteingPage(null);
        }}
        title="Delete Link Page"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "<strong>{deletingPage?.title}</strong>"? 
            This action cannot be undone and will also delete all links on this page.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteingPage(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePage}
            >
              Delete Page
            </Button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Theme Editor */}
      {showThemeEditor && themingPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="min-h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Theme Editor</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseThemeEditor}
                  className="p-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Button>
              </div>
              <ThemeCustomizer
                linkPage={themingPage}
                onThemeChange={handleThemeChange}
                onBack={handleCloseThemeEditor}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 