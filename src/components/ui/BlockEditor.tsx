'use client';

import { useState, useCallback } from 'react';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Bars3Icon,
  PhotoIcon,
  UserIcon,
  LinkIcon,
  DocumentTextIcon,
  SparklesIcon,
  ShareIcon,
  RectangleStackIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button, Card } from '@/components/ui';
import type { PageBlock } from '@/types';

interface BlockEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  className?: string;
}

interface SortableBlockProps {
  block: PageBlock;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigure: (id: string) => void;
}

const BLOCK_TYPES = [
  {
    type: 'header' as const,
    label: 'Header',
    description: 'Hero section with image/video background',
    icon: PhotoIcon,
    color: 'purple'
  },
  {
    type: 'profile' as const,
    label: 'Profile',
    description: 'Avatar, name, and bio section',
    icon: UserIcon,
    color: 'blue'
  },
  {
    type: 'links' as const,
    label: 'Links',
    description: 'Your main link buttons',
    icon: LinkIcon,
    color: 'green'
  },
  {
    type: 'text' as const,
    label: 'Text Block',
    description: 'Custom text content',
    icon: DocumentTextIcon,
    color: 'yellow'
  },
  {
    type: 'social' as const,
    label: 'Social Icons',
    description: 'Social media icon links',
    icon: ShareIcon,
    color: 'pink'
  },
  {
    type: 'spacer' as const,
    label: 'Spacer',
    description: 'Add vertical spacing',
    icon: RectangleStackIcon,
    color: 'gray'
  }
];

function SortableBlock({ block, onToggle, onDelete, onConfigure }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockType = BLOCK_TYPES.find(type => type.type === block.type);
  const IconComponent = blockType?.icon || DocumentTextIcon;

  const getColorClasses = (color: string, enabled: boolean) => {
    const colors = {
      purple: enabled ? 'border-purple-200 bg-purple-50' : 'border-purple-100 bg-purple-25',
      blue: enabled ? 'border-blue-200 bg-blue-50' : 'border-blue-100 bg-blue-25',
      green: enabled ? 'border-green-200 bg-green-50' : 'border-green-100 bg-green-25',
      yellow: enabled ? 'border-yellow-200 bg-yellow-50' : 'border-yellow-100 bg-yellow-25',
      pink: enabled ? 'border-pink-200 bg-pink-50' : 'border-pink-100 bg-pink-25',
      gray: enabled ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-25'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getIconColorClasses = (color: string, enabled: boolean) => {
    const colors = {
      purple: enabled ? 'text-purple-600' : 'text-purple-400',
      blue: enabled ? 'text-blue-600' : 'text-blue-400',
      green: enabled ? 'text-green-600' : 'text-green-400',
      yellow: enabled ? 'text-yellow-600' : 'text-yellow-400',
      pink: enabled ? 'text-pink-600' : 'text-pink-400',
      gray: enabled ? 'text-gray-600' : 'text-gray-400'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        border-2 rounded-xl p-4 transition-all duration-200
        ${getColorClasses(blockType?.color || 'gray', block.enabled)}
        ${!block.enabled ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        {/* Block Info */}
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/50 rounded"
          >
            <Bars3Icon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Block Icon */}
          <div className={`p-2 rounded-lg ${getIconColorClasses(blockType?.color || 'gray', block.enabled)}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Block Details */}
          <div>
            <h4 className={`font-medium ${block.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
              {blockType?.label || block.type}
            </h4>
            <p className={`text-sm ${block.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
              {blockType?.description || 'Custom block'}
            </p>
          </div>
        </div>

        {/* Block Controls */}
        <div className="flex items-center gap-2">
          {/* Configure Button */}
          <Button
            onClick={() => onConfigure(block.id)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <SparklesIcon className="w-4 h-4" />
          </Button>

          {/* Visibility Toggle */}
          <Button
            onClick={() => onToggle(block.id)}
            variant="ghost"
            size="sm"
            className={block.enabled ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
          >
            {block.enabled ? (
              <EyeIcon className="w-4 h-4" />
            ) : (
              <EyeSlashIcon className="w-4 h-4" />
            )}
          </Button>

          {/* Delete Button */}
          <Button
            onClick={() => onDelete(block.id)}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BlockEditor({ blocks, onChange, className = '' }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id);
      const newIndex = blocks.findIndex(block => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index
      }));

      onChange(newBlocks);
    }
  }, [blocks, onChange]);

  const handleToggleBlock = useCallback((id: string) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, enabled: !block.enabled } : block
    );
    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleDeleteBlock = useCallback((id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleConfigureBlock = useCallback((id: string) => {
    // This would open a configuration modal/panel for the specific block
    console.log('Configure block:', id);
  }, []);

  const handleAddBlock = useCallback((type: PageBlock['type']) => {
    const newBlock: PageBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      enabled: true,
      order: blocks.length,
      config: {}
    };

    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
  }, [blocks, onChange]);

  const getLayoutPreview = () => {
    const enabledBlocks = blocks.filter(block => block.enabled).sort((a, b) => a.order - b.order);
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Layout Preview</h4>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          {enabledBlocks.map((block) => {
            const blockType = BLOCK_TYPES.find(type => type.type === block.type);
            const IconComponent = blockType?.icon || DocumentTextIcon;
            
            return (
              <div
                key={block.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
              >
                <IconComponent className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{blockType?.label || block.type}</span>
              </div>
            );
          })}
          {enabledBlocks.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              No blocks enabled. Add blocks to build your page layout.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Page Layout</h3>
          <p className="text-sm text-gray-600">
            Drag blocks to reorder, toggle visibility, or add new sections
          </p>
        </div>
        
        <div className="relative">
          <Button
            onClick={() => setShowAddMenu(!showAddMenu)}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Block
          </Button>

          {/* Add Block Menu */}
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
              >
                <div className="p-2">
                  <h4 className="text-sm font-medium text-gray-900 px-3 py-2">Add Block</h4>
                  <div className="space-y-1">
                    {BLOCK_TYPES.map((blockType) => (
                      <button
                        key={blockType.type}
                        onClick={() => handleAddBlock(blockType.type)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`p-1.5 rounded ${
                          blockType.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          blockType.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          blockType.color === 'green' ? 'bg-green-100 text-green-600' :
                          blockType.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                          blockType.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <blockType.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{blockType.label}</div>
                          <div className="text-xs text-gray-500">{blockType.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block List */}
        <div className="lg:col-span-2 space-y-4">
          {blocks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {blocks
                    .sort((a, b) => a.order - b.order)
                    .map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onToggle={handleToggleBlock}
                        onDelete={handleDeleteBlock}
                        onConfigure={handleConfigureBlock}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <Card className="p-8 text-center">
              <RectangleStackIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No blocks yet</h4>
              <p className="text-gray-600 mb-4">
                Start building your page by adding blocks. Each block represents a section of your page.
              </p>
              <Button
                onClick={() => setShowAddMenu(true)}
                variant="primary"
                className="flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="w-4 h-4" />
                Add Your First Block
              </Button>
            </Card>
          )}
        </div>

        {/* Layout Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="p-4">
              {getLayoutPreview()}
            </Card>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
}