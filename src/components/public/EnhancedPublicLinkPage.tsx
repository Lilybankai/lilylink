'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { generateBackgroundStyles, type BackgroundStyleConfig } from '@/lib/utils/backgroundStyles';
// Placeholder components for media embeds (to be implemented)
const SpotifyEmbed = ({ url, autoPlay }: { url: string; autoPlay?: boolean }) => (
  <div className="p-4 bg-green-100 rounded-lg text-center">
    <p className="text-sm text-green-800">Spotify Embed: {url}</p>
  </div>
);

const AppleMusicEmbed = ({ url }: { url: string }) => (
  <div className="p-4 bg-gray-100 rounded-lg text-center">
    <p className="text-sm text-gray-800">Apple Music Embed: {url}</p>
  </div>
);

const PodcastEmbed = ({ url }: { url: string }) => (
  <div className="p-4 bg-purple-100 rounded-lg text-center">
    <p className="text-sm text-purple-800">Podcast Embed: {url}</p>
  </div>
);

const CalendarBookingEmbed = ({ url }: { url: string }) => (
  <div className="p-4 bg-blue-100 rounded-lg text-center">
    <p className="text-sm text-blue-800">Calendar Booking: {url}</p>
  </div>
);

const PaymentDonationButton = ({ type, amount, currency, url }: { type: string; amount?: number; currency?: string; url: string }) => (
  <div className="p-4 bg-yellow-100 rounded-lg text-center">
    <p className="text-sm text-yellow-800">{type}: {amount} {currency} - {url}</p>
  </div>
);
import { getLinkPageThemeConfig } from '@/lib/api/themes';
import { detectPlatform } from '@/lib/utils/platformDetection';
import { Icon } from '@/components/ui';
import type { LinkPage, Link, ThemeConfig } from '@/types';

interface EnhancedPublicLinkPageProps {
  linkPage: LinkPage;
  links: Link[];
  themeConfig?: ThemeConfig | null;
}

interface LinkClickEvent {
  linkId: string;
  url: string;
  platform?: string;
}

export function EnhancedPublicLinkPage({ linkPage, links, themeConfig: initialThemeConfig }: EnhancedPublicLinkPageProps) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(initialThemeConfig || null);
  const [isLoading, setIsLoading] = useState(!initialThemeConfig);
  const [viewCount, setViewCount] = useState(0);

  // Load theme configuration only if not provided as prop
  useEffect(() => {
    if (!initialThemeConfig) {
      loadThemeConfig();
    }
    trackPageView();
  }, [linkPage.id, initialThemeConfig]);

  const loadThemeConfig = async () => {
    try {
      const response = await getLinkPageThemeConfig(linkPage.id);
      if (response.success && response.data) {
        setThemeConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load theme config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackPageView = async () => {
    try {
      // Track page view (implement your analytics here)
      const response = await fetch(`/api/analytics/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: linkPage.id,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setViewCount(data.viewCount || 0);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  const handleLinkClick = async (link: Link) => {
    try {
      // Track click
      await fetch(`/api/analytics/link-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link.id,
          pageId: linkPage.id,
          userAgent: navigator.userAgent
        })
      });

      // Handle different link types
      if (link.link_type === 'contact' && link.contact_type === 'email') {
        window.location.href = `mailto:${link.url}`;
      } else if (link.link_type === 'contact' && link.contact_type === 'phone') {
        window.location.href = `tel:${link.url}`;
      } else if (link.link_type === 'contact' && link.contact_type === 'whatsapp') {
        const phone = link.url.replace(/[^\d]/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
      } else {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to track link click:', error);
      // Still open the link even if tracking fails
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!themeConfig?.background) {
      // Fallback to legacy background system
      switch (linkPage.background_type) {
        case 'solid':
          return { backgroundColor: linkPage.background_value || '#f8fafc' };
        case 'image':
          return {
            backgroundImage: `url(${linkPage.background_value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          };
        case 'video':
          return { backgroundColor: '#000000' };
        default:
          return {
            background: linkPage.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          };
      }
    }

    const bg = themeConfig.background;
    const style = generateBackgroundStyles(bg as BackgroundStyleConfig);

    return style;
  };

  const getTitleStyle = (): React.CSSProperties => {
    if (!themeConfig?.typography?.title) {
      return {
        fontFamily: linkPage.font_family || 'Inter',
        color: '#ffffff'
      };
    }

    const title = themeConfig.typography.title;
    const fontSizeMap: Record<string, string> = {
      'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px',
      '2xl': '24px', '3xl': '30px', '4xl': '36px', '5xl': '48px'
    };

    return {
      fontFamily: themeConfig.typography.fontFamily || 'Inter',
      fontSize: fontSizeMap[title.size] || '30px',
      fontWeight: title.weight || '700',
      color: title.color || '#ffffff',
      lineHeight: title.lineHeight || '1.2',
      letterSpacing: title.letterSpacing || '0em'
    };
  };

  const getDescriptionStyle = (): React.CSSProperties => {
    if (!themeConfig?.typography?.description) {
      return {
        fontFamily: linkPage.font_family || 'Inter',
        color: '#f3f4f6'
      };
    }

    const desc = themeConfig.typography.description;
    const fontSizeMap: Record<string, string> = {
      'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px'
    };

    return {
      fontFamily: themeConfig.typography.fontFamily || 'Inter',
      fontSize: fontSizeMap[desc.size] || '16px',
      fontWeight: desc.weight || '400',
      color: desc.color || '#f3f4f6',
      lineHeight: desc.lineHeight || '1.6'
    };
  };

  const getLinkStyle = (link: Link): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'block',
      padding: '16px 24px',
      textDecoration: 'none',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      textAlign: 'center',
      fontWeight: '500'
    };

    // Apply custom link styling if available
    if (link.style_options && typeof link.style_options === 'object') {
      const styles = link.style_options as any;
      if (styles.backgroundColor) baseStyle.backgroundColor = styles.backgroundColor;
      if (styles.textColor) baseStyle.color = styles.textColor;
      if (styles.borderRadius) baseStyle.borderRadius = styles.borderRadius;
      if (styles.borderWidth) baseStyle.borderWidth = styles.borderWidth;
      if (styles.borderColor) baseStyle.borderColor = styles.borderColor;
    }

    // Apply theme link styling
    if (themeConfig?.links) {
      const linkTheme = themeConfig.links;
      // Gradient takes precedence over solid background color
      if (linkTheme.gradient?.enabled && linkTheme.gradient.colors?.length) {
        const directionMap: Record<string, string> = {
          'to-r': 'to right',
          'to-l': 'to left', 
          'to-t': 'to top',
          'to-b': 'to bottom',
          'to-br': 'to bottom right',
          'to-bl': 'to bottom left',
          'to-tr': 'to top right',
          'to-tl': 'to top left',
        };
        const direction = directionMap[linkTheme.gradient.direction] || linkTheme.gradient.direction || 'to right';
        baseStyle.background = `linear-gradient(${direction}, ${linkTheme.gradient.colors.join(', ')})`;
      } else if (linkTheme.backgroundColor) {
        baseStyle.backgroundColor = linkTheme.backgroundColor;
      }
      if (linkTheme.textColor) baseStyle.color = linkTheme.textColor;
      if (linkTheme.borderRadius) baseStyle.borderRadius = linkTheme.borderRadius;
      if (linkTheme.borderWidth && linkTheme.borderWidth !== '0px') {
        baseStyle.borderWidth = linkTheme.borderWidth;
        if (linkTheme.borderColor) baseStyle.borderColor = linkTheme.borderColor;
      } else {
        baseStyle.border = 'none';
      }
      if (linkTheme.shadow) baseStyle.boxShadow = linkTheme.shadow;
    }

    // Apply typography
    if (themeConfig?.typography?.links) {
      const linkTypo = themeConfig.typography.links;
      const fontSizeMap: Record<string, string> = {
        'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px'
      };
      
      baseStyle.fontFamily = themeConfig.typography.fontFamily || 'Inter';
      baseStyle.fontSize = fontSizeMap[linkTypo.size] || '16px';
      baseStyle.fontWeight = linkTypo.weight || '500';
    }

    return baseStyle;
  };

  const getHoverEffectClass = (link: Link): string => {
    const hoverEffect = themeConfig?.links?.hoverEffect || 'subtle';
    
    switch (hoverEffect) {
      case 'scale':
        return 'hover:scale-105 transform';
      case 'border':
        return 'hover:border-purple-500';
      case 'glow':
        return 'hover:shadow-2xl hover:shadow-purple-500/25';
      case 'slide':
        return 'hover:translate-x-1 transform';
      default:
        return 'hover:bg-opacity-90';
    }
  };

  const renderLink = (link: Link) => {
    const platform = detectPlatform(link.url);
    
    // Handle media embeds
    if (link.link_type === 'media') {
      if (platform === 'spotify') {
        return (
          <div key={link.id} className="mb-6">
            <SpotifyEmbed url={link.url} />
          </div>
        );
      }
      
      if (platform === 'apple-music') {
        return (
          <div key={link.id} className="mb-6">
            <AppleMusicEmbed url={link.url} />
          </div>
        );
      }
      
      if (link.media_type === 'podcast') {
        return (
          <div key={link.id} className="mb-6">
            <PodcastEmbed url={link.url} />
          </div>
        );
      }
    }

    // Handle contact embeds
    if (link.link_type === 'contact' && link.contact_type === 'calendar') {
      return (
        <div key={link.id} className="mb-6">
          <CalendarBookingEmbed url={link.url} />
        </div>
      );
    }

    // Handle payment buttons
    if (link.link_type === 'contact' && link.payment_type) {
      return (
        <div key={link.id} className="mb-4">
          <PaymentDonationButton
            url={link.url}
            title={link.title}
            type={link.payment_type}
            amount={link.price}
          />
        </div>
      );
    }

    // Regular link button
    return (
      <motion.div
        key={link.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4"
      >
        <button
          onClick={() => handleLinkClick(link)}
          className={`w-full ${getHoverEffectClass(link)} transition-all duration-200 group`}
          style={getLinkStyle(link)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Link Icon */}
              {link.icon_url ? (
                <img
                  src={link.icon_url}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              ) : link.icon_name ? (
                <Icon 
                  icon={link.icon_name} 
                  size={20}
                  color={link.icon_color || platform?.color || '#8B5CF6'}
                />
              ) : platform ? (
                <platform.icon 
                  size={20} 
                  color={platform.color}
                />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                </div>
              )}
              
              <div className="text-left">
                <div className="font-semibold">{link.title}</div>
                {link.description && (
                  <div className="text-sm opacity-75 mt-1">{link.description}</div>
                )}
              </div>
            </div>
            
            {/* Product/Price Info */}
            {link.link_type === 'product' && (
              <div className="text-right">
                {link.price && (
                  <div className="font-semibold">${link.price}</div>
                )}
                {link.availability && (
                  <div className="text-xs opacity-75">{link.availability}</div>
                )}
              </div>
            )}
            
            <ArrowTopRightOnSquareIcon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Product Image */}
          {link.link_type === 'product' && link.thumbnail_url && (
            <div className="mt-3">
              <img
                src={link.thumbnail_url}
                alt={link.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </button>
      </motion.div>
    );
  };

  const renderVideoBackground = () => {
    if (themeConfig?.background?.type === 'video' && themeConfig.background.value) {
      return (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={themeConfig.background.value} type="video/mp4" />
        </video>
      );
    }
    return null;
  };

  const renderOverlay = () => {
    if (themeConfig?.background?.overlay?.enabled) {
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: themeConfig.background.overlay.color,
            opacity: themeConfig.background.overlay.opacity
          }}
        />
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const layoutMaxWidth = themeConfig?.layout?.maxWidth || '400px';
  const layoutSpacing = themeConfig?.layout?.spacing || 'normal';
  const layoutAlignment = themeConfig?.layout?.alignment || 'center';

  const spacingClass = {
    compact: 'space-y-2',
    normal: 'space-y-4',
    relaxed: 'space-y-6'
  }[layoutSpacing];

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[layoutAlignment];

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      {/* Video Background */}
      {renderVideoBackground()}
      
      {/* Overlay */}
      {renderOverlay()}

      {/* Custom CSS */}
      {themeConfig?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: themeConfig.customCSS }} />
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full ${alignmentClass}`}
          style={{ maxWidth: layoutMaxWidth }}
        >
          {/* Brand Logo */}
          {themeConfig?.brand?.logo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`mb-6 ${
                themeConfig.brand.logo.position === 'center' ? 'text-center' :
                themeConfig.brand.logo.position === 'left' ? 'text-left' : 'text-right'
              }`}
            >
              <img
                src={themeConfig.brand.logo.url}
                alt="Brand logo"
                className="h-16 w-auto object-contain mx-auto"
                style={{
                  maxWidth: themeConfig.brand.logo.width ? `${themeConfig.brand.logo.width}px` : 'auto',
                  maxHeight: themeConfig.brand.logo.height ? `${themeConfig.brand.logo.height}px` : '64px'
                }}
              />
            </motion.div>
          )}

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="mb-4 drop-shadow-lg" style={getTitleStyle()}>
              {linkPage.title}
            </h1>
            
            {linkPage.description && (
              <p className="mb-4 drop-shadow" style={getDescriptionStyle()}>
                {linkPage.description}
              </p>
            )}

            {/* View Counter */}
            {viewCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm opacity-75">
                <EyeIcon className="w-4 h-4" />
                <span>{viewCount.toLocaleString()} views</span>
              </div>
            )}
          </motion.div>

          {/* Social Media Block */}
          {themeConfig?.layout?.blocks?.some(block => block.type === 'social' && block.enabled) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <div className="flex justify-center gap-4">
                {links
                  .filter(link => {
                    const platform = detectPlatform(link.url);
                    return link.is_active && platform && ['social','media','portfolio'].includes(platform.category);
                  })
                  .sort((a, b) => a.display_order - b.display_order)
                  .map(link => (
                    <motion.button
                      key={link.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLinkClick(link)}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                      title={link.title}
                    >
                      {link.icon_url ? (
                        <img
                          src={link.icon_url}
                          alt={link.title}
                          className="w-6 h-6 object-contain"
                        />
                      ) : link.icon_name ? (
                        <Icon 
                          icon={link.icon_name} 
                          size={24}
                          color={link.icon_color || 'white'}
                        />
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center">
                          {(() => {
                            const platform = detectPlatform(link.url);
                            if (platform) {
                              return <platform.icon size={24} color={platform.color} />;
                            }
                            return <div className="w-5 h-5 bg-gray-400 rounded" />;
                          })()}
                        </div>
                      )}
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Links */}
          <div className={spacingClass}>
            <AnimatePresence>
              {links
                .filter(link => {
                  if (!link.is_active) return false;
                  
                  // If social block is enabled, exclude social/media/portfolio links from main links
                  if (themeConfig?.layout?.blocks?.some(block => block.type === 'social' && block.enabled)) {
                    const platform = detectPlatform(link.url);
                    if (platform && ['social','media','portfolio'].includes(platform.category)) {
                      return false;
                    }
                  }
                  
                  return true;
                })
                .sort((a, b) => a.display_order - b.display_order)
                .map(renderLink)}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 text-center"
          >
            {!themeConfig?.brand?.hideBranding && (
              <div className="text-xs opacity-50">
                <span>Powered by </span>
                <a
                  href="https://lilylink.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75 transition-opacity"
                >
                  Lilylink
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Favicon */}
      {themeConfig?.brand?.favicon && (
        <link
          rel="icon"
          type="image/x-icon"
          href={themeConfig.brand.favicon.url}
        />
      )}
    </div>
  );
} 