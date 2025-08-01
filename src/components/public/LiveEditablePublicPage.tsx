'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EnhancedPublicLinkPage } from '@/components/public/EnhancedPublicLinkPage';
import { LiveThemeEditor } from '@/components/editor/LiveThemeEditor';
import { SpotifyEmbed } from '@/components/public/SpotifyEmbed';
import { AppleMusicEmbed } from '@/components/public/AppleMusicEmbed';
import { generateBackgroundStyles, type BackgroundStyleConfig } from '@/lib/utils/backgroundStyles';
import { PodcastEmbed } from '@/components/public/PodcastEmbed';
import { CalendarBookingEmbed } from '@/components/public/CalendarBookingEmbed';
import { PaymentDonationButton } from '@/components/public/PaymentDonationButton';
import { detectPlatform } from '@/lib/utils/platformDetection';
import type { LinkPage, Link, ThemeConfig } from '@/types';

interface LiveEditablePublicPageProps {
  linkPage: LinkPage;
  links: Link[];
  isOwner?: boolean;
}

interface User {
  id: string;
  email?: string;
}

export function LiveEditablePublicPage({ linkPage, links, isOwner = false }: LiveEditablePublicPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  // Check authentication and ownership
  useEffect(() => {
    checkAuth();
    trackPageView();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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

  const handleShare = async () => {
    const shareData = {
      title: linkPage.title,
      text: linkPage.description || `Check out ${linkPage.title}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleThemeChange = (themeConfig: ThemeConfig) => {
    setCurrentTheme(themeConfig);
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (currentTheme?.background) {
      const bg = currentTheme.background;
      const style = generateBackgroundStyles(bg as BackgroundStyleConfig);
      return style;
    }

    // Fallback to original background
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
      default:
        return {
          background: linkPage.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }
  };

  const getTitleStyle = (): React.CSSProperties => {
    if (currentTheme?.typography?.title) {
      const title = currentTheme.typography.title;
      const fontSizeMap: Record<string, string> = {
        'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px',
        '2xl': '24px', '3xl': '30px', '4xl': '36px', '5xl': '48px'
      };

      return {
        fontFamily: currentTheme.typography.fontFamily || 'Inter',
        fontSize: fontSizeMap[title.size] || '30px',
        fontWeight: title.weight || '700',
        color: title.color || '#ffffff',
        lineHeight: title.lineHeight || '1.2',
        letterSpacing: title.letterSpacing || '0em'
      };
    }

    return {
      fontFamily: linkPage.font_family || 'Inter',
      color: '#ffffff',
      fontSize: '30px',
      fontWeight: '700'
    };
  };

  const getDescriptionStyle = (): React.CSSProperties => {
    if (currentTheme?.typography?.description) {
      const desc = currentTheme.typography.description;
      const fontSizeMap: Record<string, string> = {
        'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px'
      };

      return {
        fontFamily: currentTheme.typography.fontFamily || 'Inter',
        fontSize: fontSizeMap[desc.size] || '16px',
        fontWeight: desc.weight || '400',
        color: desc.color || '#f3f4f6',
        lineHeight: desc.lineHeight || '1.6'
      };
    }

    return {
      fontFamily: linkPage.font_family || 'Inter',
      color: '#f3f4f6',
      fontSize: '16px'
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

    // Apply theme link styling
    if (currentTheme?.links) {
      const linkTheme = currentTheme.links;
      if (linkTheme.backgroundColor) baseStyle.backgroundColor = linkTheme.backgroundColor;
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
    if (currentTheme?.typography?.links) {
      const linkTypo = currentTheme.typography.links;
      const fontSizeMap: Record<string, string> = {
        'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px'
      };
      
      baseStyle.fontFamily = currentTheme.typography.fontFamily || 'Inter';
      baseStyle.fontSize = fontSizeMap[linkTypo.size] || '16px';
      baseStyle.fontWeight = linkTypo.weight || '500';
    }

    return baseStyle;
  };

  const getHoverEffectClass = (): string => {
    const hoverEffect = currentTheme?.links?.hoverEffect || 'subtle';
    
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
          className={`w-full ${getHoverEffectClass()} transition-all duration-200 group`}
          style={getLinkStyle(link)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {link.icon_url && (
                <img
                  src={link.icon_url}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              )}
              
              <div className="text-left">
                <div className="font-semibold">{link.title}</div>
                {link.description && (
                  <div className="text-sm opacity-75 mt-1">{link.description}</div>
                )}
              </div>
            </div>
            
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
    if (currentTheme?.background?.type === 'video' && currentTheme.background.value) {
      return (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={currentTheme.background.value} type="video/mp4" />
        </video>
      );
    }
    return null;
  };

  const renderOverlay = () => {
    if (currentTheme?.background?.overlay?.enabled) {
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: currentTheme.background.overlay.color,
            opacity: currentTheme.background.overlay.opacity
          }}
        />
      );
    }
    return null;
  };

  const layoutMaxWidth = currentTheme?.layout?.maxWidth || '400px';
  const layoutSpacing = currentTheme?.layout?.spacing || 'normal';
  const layoutAlignment = currentTheme?.layout?.alignment || 'center';

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

  // Check if user is the owner of this page
  const isPageOwner = user && linkPage.user_id === user.id;

  return (
    <div className="relative">
      {/* Edit Mode Toggle (only for page owner) */}
      {isPageOwner && !isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-40"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200"
            >
              <ShareIcon className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-purple-500 text-white rounded-full px-4 py-3 shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span className="font-medium">Edit</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Share button for visitors */}
      {!isPageOwner && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleShare}
          className="fixed top-4 right-4 z-40 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200"
        >
          <ShareIcon className="w-5 h-5 text-gray-700" />
        </motion.button>
      )}

      {/* Main Page Content */}
      <div className="min-h-screen relative" style={getBackgroundStyle()}>
        {/* Video Background */}
        {renderVideoBackground()}
        
        {/* Overlay */}
        {renderOverlay()}

        {/* Custom CSS */}
        {currentTheme?.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: currentTheme.customCSS }} />
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
            {currentTheme?.brand?.logo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 text-center"
              >
                <img
                  src={currentTheme.brand.logo.url}
                  alt="Brand logo"
                  className="h-16 w-auto object-contain mx-auto"
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

            {/* Links */}
            <div className={spacingClass}>
              <AnimatePresence>
                {links
                  .filter(link => link.is_active)
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
              {!currentTheme?.brand?.hideBranding && (
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
        {currentTheme?.brand?.favicon && (
          <link
            rel="icon"
            type="image/x-icon"
            href={currentTheme.brand.favicon.url}
          />
        )}
      </div>

      {/* Live Theme Editor */}
      <LiveThemeEditor
        linkPage={linkPage}
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
} 