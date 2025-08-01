'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { generateBackgroundStyles, generateHeaderBackgroundStyles, type BackgroundStyleConfig } from '@/lib/utils/backgroundStyles';
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
import type { LinkPage, Link, ThemeConfig, PageBlock, HeaderBlockConfig, LinkStyleConfig } from '@/types';

interface BlockBasedPublicPageProps {
  linkPage: LinkPage;
  links: Link[];
  themeConfig?: ThemeConfig | null;
}

interface PublicBlockProps {
  block: PageBlock;
  linkPage: LinkPage;
  links: Link[];
  themeConfig: ThemeConfig;
  onLinkClick: (link: Link) => void;
  viewCount: number;
}

function HeaderBlockComponent({ block, linkPage, themeConfig }: { block: PageBlock; linkPage: LinkPage; themeConfig: ThemeConfig }) {
  const headerConfig = themeConfig.header;
  
  if (!headerConfig || headerConfig.type === 'none') {
    return null;
  }

  const getHeightStyle = (height: HeaderBlockConfig['height']) => {
    switch (height) {
      case 'small': return '200px';
      case 'medium': return '300px';
      case 'large': return '400px';
      case 'full': return '100vh';
      default: return '300px';
    }
  };

  const headerStyle: React.CSSProperties = {
    height: getHeightStyle(headerConfig.height),
    position: 'relative',
    overflow: 'hidden',
    ...generateHeaderBackgroundStyles(headerConfig)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={headerStyle}
    >
      {/* Video element */}
      {headerConfig.type === 'video' && headerConfig.media?.url && (
        <video
          src={headerConfig.media.url}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
        />
      )}

      {/* Media overlay */}
      {headerConfig.media?.overlay?.enabled && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: headerConfig.media.overlay.color,
            opacity: headerConfig.media.overlay.opacity
          }}
        />
      )}

      {/* Content overlay */}
      {(headerConfig.content?.showTitle || headerConfig.content?.showDescription) && (
        <div className={`absolute inset-0 flex items-${headerConfig.content?.titlePosition || 'center'} justify-center p-8`}>
          <div className="text-center max-w-4xl">
            {headerConfig.content?.showTitle && (
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold mb-4"
                style={{ 
                  color: headerConfig.content.textColor,
                  textShadow: headerConfig.content.textShadow ? '0 4px 8px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {linkPage.title}
              </motion.h1>
            )}
            {headerConfig.content?.showDescription && linkPage.description && (
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg md:text-xl"
                style={{ 
                  color: headerConfig.content.textColor,
                  textShadow: headerConfig.content.textShadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {linkPage.description}
              </motion.p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ProfileBlockComponent({ block, linkPage, themeConfig, viewCount }: { block: PageBlock; linkPage: LinkPage; themeConfig: ThemeConfig; viewCount: number }) {
  const showTitle = !themeConfig.header?.content?.showTitle;
  const showDescription = !themeConfig.header?.content?.showDescription;

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: themeConfig.typography?.title.size === '3xl' ? '30px' : 
              themeConfig.typography?.title.size === '4xl' ? '36px' : '24px',
    fontWeight: themeConfig.typography?.title.weight || '700',
    color: themeConfig.typography?.title.color || '#1f2937',
    lineHeight: themeConfig.typography?.title.lineHeight || '1.2',
    letterSpacing: themeConfig.typography?.title.letterSpacing || '0em',
    fontFamily: themeConfig.typography?.fontFamily || 'Inter'
  });

  const getDescriptionStyle = (): React.CSSProperties => ({
    fontSize: themeConfig.typography?.description.size === 'lg' ? '18px' : '16px',
    fontWeight: themeConfig.typography?.description.weight || '400',
    color: themeConfig.typography?.description.color || '#6b7280',
    lineHeight: themeConfig.typography?.description.lineHeight || '1.6',
    fontFamily: themeConfig.typography?.fontFamily || 'Inter'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-center py-8"
    >
      {/* Brand Logo */}
      {themeConfig.brand?.logo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
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

      {/* Title (if not shown in header) */}
      {showTitle && (
        <h1 className="mb-4 drop-shadow-lg" style={getTitleStyle()}>
          {linkPage.title}
        </h1>
      )}
      
      {/* Description (if not shown in header) */}
      {showDescription && linkPage.description && (
        <p className="mb-4 drop-shadow" style={getDescriptionStyle()}>
          {linkPage.description}
        </p>
      )}

      {/* View Counter */}
      {viewCount > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm opacity-75 mt-4">
          <EyeIcon className="w-4 h-4" />
          <span>{viewCount.toLocaleString()} views</span>
        </div>
      )}
    </motion.div>
  );
}

function LinksBlockComponent({ block, links, themeConfig, onLinkClick }: { block: PageBlock; links: Link[]; themeConfig: ThemeConfig; onLinkClick: (link: Link) => void }) {
  const linkStyleConfig = themeConfig.links;

  const getLinkStyle = (link: Link): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: linkStyleConfig?.gradient?.enabled 
        ? undefined 
        : linkStyleConfig?.backgroundColor || '#ffffff',
      background: linkStyleConfig?.gradient?.enabled 
        ? `linear-gradient(${linkStyleConfig.gradient.direction}, ${linkStyleConfig.gradient.colors.join(', ')})` 
        : undefined,
      color: linkStyleConfig?.textColor || '#374151',
      borderRadius: linkStyleConfig?.borderRadius || '12px',
      border: linkStyleConfig?.borderWidth !== '0px' ? 
        `${linkStyleConfig?.borderWidth || '1px'} solid ${linkStyleConfig?.borderColor || '#e5e7eb'}` : 'none',
      boxShadow: linkStyleConfig?.shadow || '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: linkStyleConfig?.spacing?.padding || '16px',
      margin: linkStyleConfig?.spacing?.margin || '8px',
      fontSize: linkStyleConfig?.typography?.size || '16px',
      fontWeight: linkStyleConfig?.typography?.weight || '500',
      letterSpacing: linkStyleConfig?.typography?.letterSpacing,
      textTransform: linkStyleConfig?.typography?.textTransform as any,
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textDecoration: 'none',
      fontFamily: themeConfig.typography?.fontFamily || 'Inter'
    };

    // Apply hover effects via CSS classes
    return baseStyle;
  };

  const getHoverClass = () => {
    const hoverEffect = linkStyleConfig?.hoverEffect || 'subtle';
    const hoverClasses = {
      subtle: 'hover:opacity-80',
      scale: 'hover:scale-105 transform',
      lift: 'hover:-translate-y-1 hover:shadow-lg transform',
      border: 'hover:border-opacity-100',
      glow: 'hover:shadow-2xl',
      gradient: 'hover:bg-gradient-to-r',
      slide: 'hover:bg-gradient-to-r'
    };
    return hoverClasses[hoverEffect] || hoverClasses.subtle;
  };

  const renderLinkContent = (link: Link) => {
    const showIcon = linkStyleConfig?.icon?.show && link.icon_name;
    const iconPosition = linkStyleConfig?.icon?.position || 'left';
    const iconSize = linkStyleConfig?.icon?.size || '20px';
    const iconColor = linkStyleConfig?.icon?.color || 'currentColor';

    // For embedded content
    if (link.link_type === 'media') {
      const platform = detectPlatform(link.url);
      
      if (platform === 'spotify') {
        return <SpotifyEmbed url={link.url} autoPlay={link.auto_play} />;
      } else if (platform === 'apple-music') {
        return <AppleMusicEmbed url={link.url} />;
      } else if (platform === 'podcast') {
        return <PodcastEmbed url={link.url} />;
      }
    }

    if (link.link_type === 'contact' && link.contact_type === 'calendar') {
      return <CalendarBookingEmbed url={link.url} />;
    }

    if (link.link_type === 'contact' && link.payment_type) {
      return (
        <PaymentDonationButton
          type={link.payment_type}
          amount={link.payment_amount}
          currency={link.payment_currency}
          url={link.url}
        />
      );
    }

    // Regular link button
    return (
      <div className="w-full">
        {showIcon && iconPosition === 'top' && (
          <div className="flex flex-col items-center gap-2">
            <div 
              style={{ 
                width: iconSize, 
                height: iconSize,
                color: iconColor,
                fontSize: iconSize
              }}
            >
              {link.icon_name}
            </div>
            <span>{link.title}</span>
          </div>
        )}
        
        {(!showIcon || iconPosition !== 'top') && (
          <div className="flex items-center justify-center gap-2">
            {showIcon && iconPosition === 'left' && (
              <div 
                style={{ 
                  width: iconSize, 
                  height: iconSize,
                  color: iconColor,
                  fontSize: iconSize
                }}
              >
                {link.icon_name}
              </div>
            )}
            <span>{link.title}</span>
            {showIcon && iconPosition === 'right' && (
              <div 
                style={{ 
                  width: iconSize, 
                  height: iconSize,
                  color: iconColor,
                  fontSize: iconSize
                }}
              >
                {link.icon_name}
              </div>
            )}
            {!showIcon && link.link_type === 'standard' && (
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
            )}
          </div>
        )}
      </div>
    );
  };

  const activeLinks = links
    .filter(link => link.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-md mx-auto space-y-3"
    >
      <AnimatePresence>
        {activeLinks.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div
              onClick={() => onLinkClick(link)}
              className={`${getHoverClass()} transition-all duration-200`}
              style={getLinkStyle(link)}
            >
              {renderLinkContent(link)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function TextBlockComponent({ block }: { block: PageBlock }) {
  // This would render custom text content from block.config
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-4"
    >
      <div dangerouslySetInnerHTML={{ __html: block.config.content || '' }} />
    </motion.div>
  );
}

function SocialBlockComponent({ block }: { block: PageBlock }) {
  // This would render social media icons from block.config
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center gap-4 py-4"
    >
      {/* Social icons would go here */}
    </motion.div>
  );
}

function SpacerBlockComponent({ block }: { block: PageBlock }) {
  const height = block.config.height || 40;
  return <div style={{ height: `${height}px` }} />;
}

function PublicBlock({ block, linkPage, links, themeConfig, onLinkClick, viewCount }: PublicBlockProps) {
  if (!block.enabled) return null;

  switch (block.type) {
    case 'header':
      return <HeaderBlockComponent block={block} linkPage={linkPage} themeConfig={themeConfig} />;
    case 'profile':
      return <ProfileBlockComponent block={block} linkPage={linkPage} themeConfig={themeConfig} viewCount={viewCount} />;
    case 'links':
      return <LinksBlockComponent block={block} links={links} themeConfig={themeConfig} onLinkClick={onLinkClick} />;
    case 'text':
      return <TextBlockComponent block={block} />;
    case 'social':
      return <SocialBlockComponent block={block} />;
    case 'spacer':
      return <SpacerBlockComponent block={block} />;
    default:
      return null;
  }
}

export function BlockBasedPublicPage({ linkPage, links, themeConfig: initialThemeConfig }: BlockBasedPublicPageProps) {
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
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!themeConfig?.background) return {};

    return generateBackgroundStyles(themeConfig.background as BackgroundStyleConfig);
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

  // Check if using block-based layout
  const isBlockLayout = themeConfig?.layout?.type === 'blocks' && themeConfig.layout.blocks;
  
  if (!isBlockLayout) {
    // Fallback to default layout
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

    // Use default blocks
    const defaultBlocks: PageBlock[] = [
      { id: 'profile', type: 'profile', enabled: true, order: 0, config: {} },
      { id: 'links', type: 'links', enabled: true, order: 1, config: {} }
    ];

    return (
      <div className="min-h-screen relative" style={getBackgroundStyle()}>
        {renderVideoBackground()}
        {renderOverlay()}
        
        {themeConfig?.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: themeConfig.customCSS }} />
        )}

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className={`w-full ${alignmentClass} ${spacingClass}`} style={{ maxWidth: layoutMaxWidth }}>
            {defaultBlocks.map((block) => (
              <PublicBlock
                key={block.id}
                block={block}
                linkPage={linkPage}
                links={links}
                themeConfig={themeConfig}
                onLinkClick={handleLinkClick}
                viewCount={viewCount}
              />
            ))}
            
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
          </div>
        </div>

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

  // Block-based layout
  const enabledBlocks = themeConfig.layout.blocks
    .filter(block => block.enabled)
    .sort((a, b) => a.order - b.order);

  const hasHeader = enabledBlocks.some(block => block.type === 'header');

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      {renderVideoBackground()}
      {renderOverlay()}
      
      {themeConfig?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: themeConfig.customCSS }} />
      )}

      <div className="relative z-10">
        {enabledBlocks.map((block) => (
          <div
            key={block.id}
            className={block.type === 'header' ? '' : 'container mx-auto px-4'}
            style={{
              maxWidth: block.type === 'header' ? '100%' : themeConfig.layout?.maxWidth || '400px'
            }}
          >
            <PublicBlock
              block={block}
              linkPage={linkPage}
              links={links}
              themeConfig={themeConfig}
              onLinkClick={handleLinkClick}
              viewCount={viewCount}
            />
          </div>
        ))}
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="container mx-auto px-4 mt-12 text-center"
          style={{ maxWidth: themeConfig.layout?.maxWidth || '400px' }}
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
      </div>

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