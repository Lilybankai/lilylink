'use client';

import { useState, useEffect } from 'react';
import { SwatchIcon, LinkIcon } from '@heroicons/react/24/outline';
import { detectPlatform } from '@/lib/utils/platformDetection';
import { PREVIEW_DEVICES } from '@/constants/themePresets';
import { fetchLinks } from '@/lib/api/client';
import { Icon } from '@/components/ui';
import type { 
  ThemeConfig, 
  HeaderBlockConfig, 
  LinkStyleConfig, 
  LinkPage,
  TypographyConfig,
  BackgroundConfig,
  BrandAssets,
  Link
} from '@/types';

interface ThemePreviewProps {
  themeConfig: ThemeConfig | null;
  linkPage: LinkPage;
  headerConfig: HeaderBlockConfig;
  linkStyleConfig: LinkStyleConfig;
  backgroundConfig: BackgroundConfig;
  typographyConfig: TypographyConfig;
  brandAssets: BrandAssets;
  customCSS: string;
}

export function ThemePreview({
  themeConfig,
  linkPage,
  headerConfig,
  linkStyleConfig,
  backgroundConfig,
  typographyConfig,
  brandAssets,
  customCSS
}: ThemePreviewProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [links, setLinks] = useState<Link[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);

  // Load actual links for preview
  useEffect(() => {
    loadLinks();
  }, [linkPage.id]);

  const loadLinks = async () => {
    setLinksLoading(true);
    const response = await fetchLinks(linkPage.id);
    if (response.success && response.data) {
      setLinks(response.data);
    }
    setLinksLoading(false);
  };

  if (!themeConfig) return null;

  const device = PREVIEW_DEVICES.find(d => d.id === previewDevice)!;
  
  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex items-center justify-center gap-2">
        {PREVIEW_DEVICES.map((device) => (
          <button
            key={device.id}
            onClick={() => setPreviewDevice(device.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${previewDevice === device.id
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <device.icon className="w-4 h-4" />
            {device.label}
          </button>
        ))}
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center">
        <div 
          className="border-4 border-gray-300 rounded-xl overflow-hidden shadow-xl bg-white transition-all duration-300"
          style={{
            width: device.width,
            height: device.height,
            maxWidth: '100%',
            maxHeight: '600px'
          }}
        >
          <div 
            className="w-full h-full overflow-y-auto"
            style={{
              background: backgroundConfig.value,
              fontFamily: typographyConfig.fontFamily
            }}
          >
            {/* Inject custom CSS */}
            <style dangerouslySetInnerHTML={{ __html: customCSS }} />
            
            {/* Preview Content */}
            <div className="min-h-full">
              {/* Header Block */}
              {headerConfig.type !== 'none' && (
                <div 
                  className="relative overflow-hidden"
                  style={{
                    height: headerConfig.height === 'small' ? '120px' : 
                           headerConfig.height === 'medium' ? '160px' : 
                           headerConfig.height === 'large' ? '200px' : '300px',
                    ...(headerConfig.type === 'gradient' ? {
                      background: headerConfig.gradient?.value
                    } : headerConfig.type === 'image' && headerConfig.media?.url ? {
                      backgroundImage: `url(${headerConfig.media.url})`,
                      backgroundSize: headerConfig.media?.size || 'cover',
                      backgroundPosition: headerConfig.media?.position || 'center',
                      backgroundRepeat: 'no-repeat'
                    } : {
                      backgroundColor: '#f3f4f6'
                    })
                  }}
                >
                  {headerConfig.type === 'video' && headerConfig.media?.url && (
                    <video
                      src={headerConfig.media.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                    />
                  )}
                  
                  {headerConfig.media?.overlay?.enabled && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundColor: headerConfig.media.overlay.color,
                        opacity: headerConfig.media.overlay.opacity
                      }}
                    />
                  )}
                  
                  {(headerConfig.content?.showTitle || headerConfig.content?.showDescription) && (
                    <div className={`absolute inset-0 flex ${
                      headerConfig.content?.titlePosition === 'top' ? 'items-start' :
                      headerConfig.content?.titlePosition === 'bottom' ? 'items-end' :
                      'items-center'
                    } justify-center p-4`}>
                      <div className="text-center">
                        {headerConfig.content?.showTitle && (
                          <h1 
                            className="text-2xl font-bold mb-2"
                            style={{ 
                              color: headerConfig.content.textColor,
                              textShadow: headerConfig.content.textShadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                            }}
                          >
                            {linkPage.title}
                          </h1>
                        )}
                        {headerConfig.content?.showDescription && linkPage.description && (
                          <p 
                            className="text-sm"
                            style={{ 
                              color: headerConfig.content.textColor,
                              textShadow: headerConfig.content.textShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                            }}
                          >
                            {linkPage.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Content */}
              <div className="p-6 flex flex-col items-center text-center">
                {/* Brand Logo (if no header or header doesn't show title) */}
                {(headerConfig.type === 'none' || !headerConfig.content?.showTitle) && brandAssets.logo && (
                  <img
                    src={brandAssets.logo.url}
                    alt="Brand logo"
                    className="h-16 w-auto mb-4 object-contain"
                  />
                )}
                
                {/* Title (if no header or header doesn't show title) */}
                {(headerConfig.type === 'none' || !headerConfig.content?.showTitle) && (
                  <h1 
                    className="mb-2"
                    style={{
                      fontSize: typographyConfig.title.size === '3xl' ? '30px' : 
                                typographyConfig.title.size === '4xl' ? '36px' : '24px',
                      fontWeight: typographyConfig.title.weight,
                      color: typographyConfig.title.color,
                      lineHeight: typographyConfig.title.lineHeight || '1.2',
                      letterSpacing: typographyConfig.title.letterSpacing || '0em'
                    }}
                  >
                    {linkPage.title}
                  </h1>
                )}
                
                {/* Description (if no header or header doesn't show description) */}
                {(headerConfig.type === 'none' || !headerConfig.content?.showDescription) && linkPage.description && (
                  <p 
                    className="mb-6"
                    style={{
                      fontSize: typographyConfig.description.size === 'lg' ? '18px' : '16px',
                      fontWeight: typographyConfig.description.weight || '400',
                      color: typographyConfig.description.color,
                      lineHeight: typographyConfig.description.lineHeight || '1.6'
                    }}
                  >
                    {linkPage.description}
                  </p>
                )}
                
                {/* Render blocks based on layout configuration */}
                {themeConfig?.layout?.blocks ? (
                  // Render blocks in order
                  themeConfig.layout.blocks
                    .filter(block => block.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((block) => {
                      if (block.type === 'social') {
                        // Social media icons block
                        const socialLinks = links.filter(link => {
                          const platform = detectPlatform(link.url);
                          return link.is_active && platform && ['social','media','portfolio'].includes(platform.category);
                        });
                        
                        if (socialLinks.length === 0) return null;
                        
                        return (
                          <div key={block.id} className="flex justify-center gap-4 mb-6">
                            {socialLinks.map((link) => (
                              <div
                                key={link.id}
                                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor: link.icon_color || '#6B7280'
                                }}
                              >
                                {link.icon_name && (
                                  <Icon 
                                    icon={link.icon_name} 
                                    size={24}
                                    color="white"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      } else if (block.type === 'links') {
                        // Main links block
                        const mainLinks = links.filter(link => link.link_type !== 'social' && link.is_active);
                        
                        return (
                          <div key={block.id} className="space-y-3 w-full max-w-sm">
                            {linksLoading ? (
                              // Loading skeleton
                              <>
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="animate-pulse">
                                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                                  </div>
                                ))}
                              </>
                            ) : mainLinks.length === 0 ? (
                              // No links state
                              <div className="text-center py-8">
                                <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-gray-500">No links yet</p>
                              </div>
                            ) : (
                              // Render actual links
                              mainLinks
                                .sort((a, b) => a.display_order - b.display_order)
                                .map((link) => {
                                  const linkStyle: React.CSSProperties = {
                                    backgroundColor: linkStyleConfig.gradient?.enabled 
                                      ? undefined 
                                      : linkStyleConfig.backgroundColor,
                                    background: linkStyleConfig.gradient?.enabled && linkStyleConfig.gradient?.colors && linkStyleConfig.gradient?.direction
                                      ? `linear-gradient(${linkStyleConfig.gradient.direction}, ${linkStyleConfig.gradient.colors.join(', ')})` 
                                      : undefined,
                                    color: linkStyleConfig.textColor,
                                    borderRadius: linkStyleConfig.borderRadius,
                                    border: linkStyleConfig.borderWidth !== '0px' ? 
                                      `${linkStyleConfig.borderWidth} solid ${linkStyleConfig.borderColor}` : 'none',
                                    boxShadow: linkStyleConfig.shadow,
                                    padding: linkStyleConfig.spacing?.padding || '16px',
                                    margin: linkStyleConfig.spacing?.margin || '8px',
                                    fontSize: linkStyleConfig.typography?.size || '16px',
                                    fontWeight: linkStyleConfig.typography?.weight || '500',
                                    letterSpacing: linkStyleConfig.typography?.letterSpacing,
                                    textTransform: linkStyleConfig.typography?.textTransform as any,
                                    textAlign: 'center' as const,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                  };

                                  return (
                                    <div key={link.id} style={linkStyle}>
                                      {/* Link Icon */}
                                      {link.icon_name && (
                                        <div className="flex-shrink-0">
                                          <Icon 
                                            icon={link.icon_name} 
                                            size={20}
                                            color={link.icon_color || linkStyleConfig.textColor}
                                          />
                                        </div>
                                      )}
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                          {link.title}
                                        </div>
                                        {link.description && (
                                          <div className="text-sm opacity-75 truncate">
                                            {link.description}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Product price display */}
                                      {link.link_type === 'product' && link.product_price && (
                                        <div className="text-sm font-semibold">
                                          ${link.product_price}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        );
                      }
                      
                      return null; // For other block types not yet implemented
                    })
                ) : (
                  // Fallback: render all links if no block configuration
                  <div className="space-y-3 w-full max-w-sm">
                    {linksLoading ? (
                      // Loading skeleton
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </>
                    ) : links.length === 0 ? (
                      // No links state
                      <div className="text-center py-8">
                        <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-500">No links yet</p>
                      </div>
                    ) : (
                      // Render actual links
                      links
                        .filter(link => link.is_active)
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((link) => {
                          const linkStyle: React.CSSProperties = {
                            backgroundColor: linkStyleConfig.gradient?.enabled 
                              ? undefined 
                              : linkStyleConfig.backgroundColor,
                            background: linkStyleConfig.gradient?.enabled && linkStyleConfig.gradient?.colors && linkStyleConfig.gradient?.direction
                              ? `linear-gradient(${linkStyleConfig.gradient.direction}, ${linkStyleConfig.gradient.colors.join(', ')})` 
                              : undefined,
                            color: linkStyleConfig.textColor,
                            borderRadius: linkStyleConfig.borderRadius,
                            border: linkStyleConfig.borderWidth !== '0px' ? 
                              `${linkStyleConfig.borderWidth} solid ${linkStyleConfig.borderColor}` : 'none',
                            boxShadow: linkStyleConfig.shadow,
                            padding: linkStyleConfig.spacing?.padding || '16px',
                            margin: linkStyleConfig.spacing?.margin || '8px',
                            fontSize: linkStyleConfig.typography?.size || '16px',
                            fontWeight: linkStyleConfig.typography?.weight || '500',
                            letterSpacing: linkStyleConfig.typography?.letterSpacing,
                            textTransform: linkStyleConfig.typography?.textTransform as any,
                            textAlign: 'center' as const,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          };

                          return (
                            <div key={link.id} style={linkStyle}>
                              {/* Link Icon */}
                              {link.icon_name && (
                                <div className="flex-shrink-0">
                                  <Icon 
                                    icon={link.icon_name} 
                                    size={20}
                                    color={link.icon_color || linkStyleConfig.textColor}
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {link.title}
                                </div>
                                {link.description && (
                                  <div className="text-sm opacity-75 truncate">
                                    {link.description}
                                  </div>
                                )}
                              </div>
                              
                              {/* Product price display */}
                              {link.link_type === 'product' && link.product_price && (
                                <div className="text-sm font-semibold">
                                  ${link.product_price}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}