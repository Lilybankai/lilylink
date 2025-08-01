'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PhotoIcon, 
  PaintBrushIcon, 
  CodeBracketIcon,
  EyeIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Badge } from '@/components/ui/Badge';
import { createWhiteLabelManager, isWhiteLabelEnabled, getWhiteLabelLimits } from '@/lib/white-label';
import type { WhiteLabelBranding, Organization } from '@/types';

interface BrandingCustomizerProps {
  organization: Organization;
  onSave?: () => void;
}

export function BrandingCustomizer({ organization, onSave }: BrandingCustomizerProps) {
  const [branding, setBranding] = useState<WhiteLabelBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'logo' | 'colors' | 'typography' | 'advanced'>('logo');

  const whiteLabelManager = createWhiteLabelManager(organization.id);
  const hasWhiteLabel = isWhiteLabelEnabled(organization.subscription_tier);
  const limits = getWhiteLabelLimits(organization.subscription_tier);

  useEffect(() => {
    loadBranding();
  }, [organization.id]);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const brandingData = await whiteLabelManager.loadBranding();
      setBranding(brandingData);
    } catch (err) {
      setError('Failed to load branding configuration');
      console.error('Error loading branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async () => {
    if (!branding) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const success = await whiteLabelManager.saveBranding(branding);
      
      if (success) {
        setSuccess('Branding configuration saved successfully');
        onSave?.();
      } else {
        setError('Failed to save branding configuration');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error saving branding:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateBranding = (updates: Partial<WhiteLabelBranding>) => {
    setBranding(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateColors = (colorUpdates: Partial<WhiteLabelBranding['colors']>) => {
    setBranding(prev => prev ? {
      ...prev,
      colors: { ...prev.colors, ...colorUpdates }
    } : null);
  };

  const updateTypography = (typographyUpdates: Partial<WhiteLabelBranding['typography']>) => {
    setBranding(prev => prev ? {
      ...prev,
      typography: { ...prev.typography, ...typographyUpdates }
    } : null);
  };

  if (!hasWhiteLabel) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PaintBrushIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            White-Label Branding
          </h3>
          <p className="text-gray-600 mb-4">
            Customize your organization's branding and remove Lilylink branding from client pages.
          </p>
          <Badge variant="secondary" className="mb-4">
            Available on Agency & Enterprise plans
          </Badge>
          <Button variant="primary" className="w-full">
            Upgrade to Agency Plan
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!branding) {
    return (
      <Alert variant="error">
        <p>Failed to load branding configuration</p>
      </Alert>
    );
  }

  const tabs = [
    { id: 'logo', name: 'Logo & Images', icon: PhotoIcon },
    { id: 'colors', name: 'Colors', icon: PaintBrushIcon },
    { id: 'typography', name: 'Typography', icon: CodeBracketIcon },
    { id: 'advanced', name: 'Advanced', icon: CodeBracketIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">White-Label Branding</h2>
          <p className="text-sm text-gray-600">
            Customize your organization's branding for client-facing pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="primary" 
            onClick={saveBranding}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </div>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'logo' && (
          <LogoCustomizer
            branding={branding}
            onUpdate={updateBranding}
            limits={limits}
          />
        )}

        {activeTab === 'colors' && (
          <ColorCustomizer
            branding={branding}
            onUpdate={updateColors}
          />
        )}

        {activeTab === 'typography' && (
          <TypographyCustomizer
            branding={branding}
            onUpdate={updateTypography}
          />
        )}

        {activeTab === 'advanced' && (
          <AdvancedCustomizer
            branding={branding}
            onUpdate={updateBranding}
            limits={limits}
          />
        )}
      </motion.div>
    </div>
  );
}

// Logo Customizer Component
function LogoCustomizer({ 
  branding, 
  onUpdate, 
  limits 
}: { 
  branding: WhiteLabelBranding; 
  onUpdate: (updates: Partial<WhiteLabelBranding>) => void;
  limits: any;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {branding.logo?.url ? (
                <div className="space-y-3">
                  <img 
                    src={branding.logo.url} 
                    alt="Logo" 
                    className="mx-auto max-h-16"
                    style={{
                      width: branding.logo.width || 'auto',
                      height: branding.logo.height || 'auto'
                    }}
                  />
                  <Button variant="outline" size="sm">
                    Change Logo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <Button variant="outline" size="sm">
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logo Dimensions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Width (px)
              </label>
              <Input
                type="number"
                value={branding.logo?.width || 120}
                onChange={(e) => onUpdate({
                  logo: { ...branding.logo, width: parseInt(e.target.value) }
                })}
                placeholder="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Height (px)
              </label>
              <Input
                type="number"
                value={branding.logo?.height || 40}
                onChange={(e) => onUpdate({
                  logo: { ...branding.logo, height: parseInt(e.target.value) }
                })}
                placeholder="40"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Color Customizer Component
function ColorCustomizer({ 
  branding, 
  onUpdate 
}: { 
  branding: WhiteLabelBranding; 
  onUpdate: (updates: Partial<WhiteLabelBranding['colors']>) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <ColorPicker
              value={branding.colors?.primary || '#8B5CF6'}
              onChange={(color) => onUpdate({ primary: color })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <ColorPicker
              value={branding.colors?.secondary || '#EC4899'}
              onChange={(color) => onUpdate({ secondary: color })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <ColorPicker
              value={branding.colors?.accent || '#3B82F6'}
              onChange={(color) => onUpdate({ accent: color })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <ColorPicker
              value={branding.colors?.background || '#FFFFFF'}
              onChange={(color) => onUpdate({ background: color })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <ColorPicker
              value={branding.colors?.text || '#1F2937'}
              onChange={(color) => onUpdate({ text: color })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Typography Customizer Component
function TypographyCustomizer({ 
  branding, 
  onUpdate 
}: { 
  branding: WhiteLabelBranding; 
  onUpdate: (updates: Partial<WhiteLabelBranding['typography']>) => void;
}) {
  const fonts = [
    'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Source Sans Pro', 'Raleway', 'Nunito', 'PT Sans'
  ];

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Typography</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Font
            </label>
            <select
              value={branding.typography?.fontFamily || 'Inter'}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={branding.typography?.headingFont || 'Inter'}
              onChange={(e) => onUpdate({ headingFont: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Typography Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
          <div 
            style={{ 
              fontFamily: branding.typography?.fontFamily || 'Inter',
              color: branding.colors?.text || '#1F2937'
            }}
          >
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: branding.typography?.headingFont || 'Inter',
                color: branding.colors?.primary || '#8B5CF6'
              }}
            >
              Sample Heading
            </h1>
            <p className="text-base">
              This is a sample paragraph to show how your typography choices will look on client pages.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Advanced Customizer Component
function AdvancedCustomizer({ 
  branding, 
  onUpdate, 
  limits 
}: { 
  branding: WhiteLabelBranding; 
  onUpdate: (updates: Partial<WhiteLabelBranding>) => void;
  limits: any;
}) {
  return (
    <div className="space-y-6">
      {/* Hide Powered By */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Hide "Powered by Lilylink"</h3>
            <p className="text-sm text-gray-600">
              Remove Lilylink branding from client-facing pages
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={branding.hidePoweredBy || false}
              onChange={(e) => onUpdate({ hidePoweredBy: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </Card>

      {/* Custom Domain */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Domain</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain Name
            </label>
            <Input
              type="text"
              value={branding.customDomain || ''}
              onChange={(e) => onUpdate({ customDomain: e.target.value })}
              placeholder="links.yourdomain.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use up to {limits.customDomains} custom domains
            </p>
          </div>
        </div>
      </Card>

      {/* Custom CSS */}
      {limits.customCSS && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Styles
            </label>
            <textarea
              value={branding.customCSS || ''}
              onChange={(e) => onUpdate({ customCSS: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="/* Add your custom CSS here */
.custom-button {
  background: linear-gradient(45deg, #8B5CF6, #EC4899);
  border-radius: 12px;
}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Custom CSS will be applied to all client-facing pages
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}