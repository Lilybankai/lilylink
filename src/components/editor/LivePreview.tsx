'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  LinkIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { fetchLinks } from '@/lib/api/client';
import { detectPlatform } from '@/lib/utils/platformDetection';
import type { LinkPage, Link, ThemeConfig } from '@/types';

interface LivePreviewProps {
  linkPage: LinkPage;
  themeConfig?: ThemeConfig | null;
}

export function LivePreview({ linkPage, themeConfig }: LivePreviewProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, [linkPage.id]);

  const loadLinks = async () => {
    setLoading(true);
    const response = await fetchLinks(linkPage.id);
    if (response.success && response.data) {
      setLinks(response.data);
    }
    setLoading(false);
  };

  const getBackgroundStyle = () => {
    if (themeConfig?.background) {
      const bg = themeConfig.background;
      if (bg.type === 'solid') {
        return { backgroundColor: bg.value };
      } else if (bg.type === 'gradient') {
        return { background: bg.value };
      } else if (bg.type === 'image') {
        return {
          backgroundImage: `url(${bg.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
    }
    
    // Fallback to link page background
    switch (linkPage.background_type) {
      case 'solid':
        return { backgroundColor: linkPage.background_value || '#f8fafc' };
      case 'image':
        return {
          backgroundImage: `url(${linkPage.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return {
          background: linkPage.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }
  };

  const getTypographyStyle = (element: 'title' | 'description' | 'links') => {
    if (themeConfig?.typography) {
      const typography = themeConfig.typography;
      const styles: any = {
        fontFamily: typography.fontFamily || linkPage.font_family || 'Inter'
      };

      if (typography[element]) {
        const elementStyle = typography[element];
        if (elementStyle.size) {
          styles.fontSize = elementStyle.size;
        }
        if (elementStyle.weight) {
          styles.fontWeight = elementStyle.weight;
        }
        if (elementStyle.color) {
          styles.color = elementStyle.color;
        }
      }

      return styles;
    }

    return {
      fontFamily: linkPage.font_family || 'Inter'
    };
  };

  const getLinkStyle = (link: Link) => {
    const baseStyle = {
      display: 'block',
      padding: '16px',
      borderRadius: '12px',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      marginBottom: '12px',
      ...getTypographyStyle('links')
    };

    if (themeConfig?.links) {
      const linkConfig = themeConfig.links;
      return {
        ...baseStyle,
        backgroundColor: linkConfig.backgroundColor || '#ffffff',
        color: linkConfig.textColor || '#374151',
        borderRadius: linkConfig.borderRadius || '12px',
        borderWidth: linkConfig.borderWidth || '1px',
        borderStyle: 'solid',
        borderColor: linkConfig.borderColor || '#e5e7eb'
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#ffffff',
      color: '#374151',
      border: '1px solid #e5e7eb'
    };
  };

  const renderLinkIcon = (link: Link) => {
    if (link.icon_url) {
      return (
        <img 
          src={link.icon_url} 
          alt="" 
          className="w-6 h-6 rounded-full object-cover"
        />
      );
    }

    const platform = detectPlatform(link.url);
    const iconMap: Record<string, React.ReactNode> = {
      instagram: <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />,
      twitter: <div className="w-6 h-6 bg-blue-500 rounded-full" />,
      youtube: <div className="w-6 h-6 bg-red-500 rounded-full" />,
      linkedin: <div className="w-6 h-6 bg-blue-600 rounded-full" />,
      tiktok: <div className="w-6 h-6 bg-black rounded-full" />,
      spotify: <div className="w-6 h-6 bg-green-500 rounded-full" />,
      default: <LinkIcon className="w-6 h-6 text-gray-400" />
    };

    return iconMap[platform] || iconMap.default;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading preview...</div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full overflow-y-auto"
      style={getBackgroundStyle()}
    >
      <div className="min-h-full flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Profile Section */}
          <div className="text-center space-y-4">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center">
              <EyeIcon className="w-8 h-8 text-white/70" />
            </div>

            {/* Title */}
            <h1 
              className="text-2xl font-bold"
              style={getTypographyStyle('title')}
            >
              {linkPage.title}
            </h1>

            {/* Description */}
            {linkPage.description && (
              <p 
                className="text-lg opacity-90"
                style={getTypographyStyle('description')}
              >
                {linkPage.description}
              </p>
            )}
          </div>

          {/* Render blocks based on theme configuration */}
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
                        <motion.div
                          key={link.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                            style={{
                              backgroundColor: link.icon_color || '#6B7280'
                            }}
                          >
                            {renderLinkIcon(link)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                } else if (block.type === 'links') {
                  // Main links block
                  const mainLinks = links.filter(link => link.link_type !== 'social' && link.is_active);
                  
                  return (
                    <div key={block.id} className="space-y-3">
                      {mainLinks.length === 0 ? (
                        <div className="text-center py-8">
                          <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-white/70">No links yet</p>
                        </div>
                      ) : (
                        mainLinks
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((link) => (
                            <motion.div
                              key={link.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                style={getLinkStyle(link)}
                                className="flex items-center gap-3 cursor-pointer hover:shadow-lg"
                              >
                                {renderLinkIcon(link)}
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
                                <ShareIcon className="w-4 h-4 opacity-50" />
                              </div>
                            </motion.div>
                          ))
                      )}
                    </div>
                  );
                }
                
                return null; // For other block types not yet implemented
              })
          ) : (
            // Fallback: render all links if no block configuration
            <div className="space-y-3">
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-white/70">No links yet</p>
                </div>
              ) : (
                links
                  .filter(link => link.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((link) => (
                    <motion.div
                      key={link.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        style={getLinkStyle(link)}
                        className="flex items-center gap-3 cursor-pointer hover:shadow-lg"
                      >
                        {renderLinkIcon(link)}
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
                        <ShareIcon className="w-4 h-4 opacity-50" />
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6">
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
              <HeartIcon className="w-4 h-4" />
              <span>Made with Lilylink</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 