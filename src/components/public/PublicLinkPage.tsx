'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GlobeAltIcon, 
  UserIcon, 
  MapPinIcon,
  ShareIcon,
  HeartIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Icon } from '@/components/ui';
import { trackLinkClick } from '@/lib/api/links';
import { 
  detectPlatform, 
  extractVideoId, 
  getEmbedUrl, 
  formatPrice, 
  getAvailabilityDisplay, 
  getSocialLinks,
  getContactTypeIcon,
  platformMap
} from '@/lib/utils/platformDetection';
import type { LinkPage, Link } from '@/types';

interface PublicLinkPageProps {
  linkPage: LinkPage;
  links: Link[];
}

interface LinkItemProps {
  link: Link;
  index: number;
  onLinkClick: (link: Link) => void;
}

interface SocialIconProps {
  link: Link;
  size?: number;
}

function SocialIcon({ link, size = 40 }: SocialIconProps) {
  const platform = detectPlatform(link.url);
  
  // Show icons for social, media, and portfolio platforms that should appear as quick-access buttons
  if (!platform || !['social', 'media', 'portfolio'].includes(platform.category)) return null;

  const handleClick = async () => {
    // Track the click
    await trackLinkClick(link.id, {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    });
    
    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative group"
      style={{ 
        width: size, 
        height: size,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Use the same icon logic as in the main links */}
      {link.icon_url ? (
        <img 
          src={link.icon_url} 
          alt={`${link.title} icon`}
          className="rounded-full object-cover"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      ) : link.icon_name ? (
        <Icon 
          icon={link.icon_name} 
          size={size * 0.5}
          color={link.icon_color || platform.color}
        />
      ) : platform ? (
        <platform.icon 
          size={size * 0.5} 
          color={platform.color}
          className="transition-transform group-hover:scale-110"
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>🌐</span>
      )}
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {link.title}
      </div>
    </motion.button>
  );
}

function VideoEmbed({ link }: { link: Link }) {
  const platform = detectPlatform(link.url);
  
  if (!platform || !platform.embedSupported) return null;
  
  const videoId = extractVideoId(link.url, platform.name.toLowerCase());
  if (!videoId) return null;
  
  const embedUrl = getEmbedUrl(link.url, platform.name.toLowerCase(), videoId);
  if (!embedUrl) return null;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-4">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

function SpotifyEmbed({ link }: { link: Link }) {
  // Extract Spotify track/album/playlist ID from URL
  const getSpotifyEmbedUrl = (url: string) => {
    const spotifyRegex = /spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/;
    const match = url.match(spotifyRegex);
    
    if (match) {
      const [, type, id] = match;
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    }
    
    return null;
  };

  const embedUrl = getSpotifyEmbedUrl(link.url);
  if (!embedUrl) return null;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg mb-4" style={{ height: '152px' }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full h-full"
      />
    </div>
  );
}

function AppleMusicEmbed({ link }: { link: Link }) {
  // Apple Music embeds are more complex and require Apple Music API
  // For now, we'll show a styled preview that opens the link
  const getAppleMusicInfo = (url: string) => {
    // Extract basic info from Apple Music URL
    if (url.includes('music.apple.com')) {
      return {
        isAppleMusic: true,
        // You could extract more info here with proper parsing
      };
    }
    return null;
  };

  const appleInfo = getAppleMusicInfo(link.url);
  if (!appleInfo) return null;

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 mb-4 shadow-lg">
      <div className="flex items-center gap-3 text-white">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-2xl">🎵</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Listen on Apple Music</p>
          <p className="text-sm text-white/80">{link.title}</p>
        </div>
        <div className="text-white/60">
          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function PodcastEmbed({ link }: { link: Link }) {
  // Check if it's a podcast URL and create appropriate embed
  const getPodcastEmbedUrl = (url: string) => {
    // Spotify podcast
    if (url.includes('spotify.com/episode/') || url.includes('spotify.com/show/')) {
      const episodeMatch = url.match(/spotify\.com\/episode\/([a-zA-Z0-9]+)/);
      const showMatch = url.match(/spotify\.com\/show\/([a-zA-Z0-9]+)/);
      
      if (episodeMatch) {
        return `https://open.spotify.com/embed/episode/${episodeMatch[1]}?utm_source=generator&theme=0`;
      } else if (showMatch) {
        return `https://open.spotify.com/embed/show/${showMatch[1]}?utm_source=generator&theme=0`;
      }
    }
    
    // Apple Podcasts - show styled preview
    if (url.includes('podcasts.apple.com')) {
      return 'apple-podcast';
    }
    
    return null;
  };

  const embedUrl = getPodcastEmbedUrl(link.url);
  if (!embedUrl) return null;

  if (embedUrl === 'apple-podcast') {
    return (
      <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎙️</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Listen on Apple Podcasts</p>
            <p className="text-sm text-white/80">{link.title}</p>
          </div>
          <div className="text-white/60">
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg mb-4" style={{ height: '152px' }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full h-full"
      />
    </div>
  );
}

function CalendarBookingEmbed({ link }: { link: Link }) {
  // Check if it's a calendar booking URL (Calendly, Cal.com, etc.)
  const getCalendarEmbedUrl = (url: string) => {
    // Calendly
    if (url.includes('calendly.com')) {
      // Convert calendly.com URL to embed URL
      const calendlyMatch = url.match(/calendly\.com\/([^?]+)/);
      if (calendlyMatch) {
        return `https://calendly.com/inline-widget/${calendlyMatch[1]}`;
      }
    }
    
    // Cal.com
    if (url.includes('cal.com')) {
      const calMatch = url.match(/cal\.com\/([^?]+)/);
      if (calMatch) {
        return `https://cal.com/${calMatch[1]}/embed`;
      }
    }
    
    return null;
  };

  const embedUrl = getCalendarEmbedUrl(link.url);
  if (!embedUrl) return null;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg mb-4" style={{ height: '400px' }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="400"
        frameBorder="0"
        className="w-full h-full"
      />
    </div>
  );
}

function PaymentButton({ link }: { link: Link }) {
  if (link.link_type !== 'contact' || !link.payment_type) return null;

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return '💝';
      case 'tip':
        return '💰';
      case 'payment':
        return '💳';
      default:
        return '💰';
    }
  };

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'donation':
        return 'from-pink-500 to-red-500';
      case 'tip':
        return 'from-yellow-500 to-orange-500';
      case 'payment':
        return 'from-blue-500 to-purple-500';
      default:
        return 'from-green-500 to-blue-500';
    }
  };

  const formatPaymentAmount = () => {
    if (link.payment_amount && link.payment_currency) {
      return formatPrice(link.payment_amount, link.payment_currency);
    }
    return null;
  };

  const amount = formatPaymentAmount();

  return (
    <div className={`w-full bg-gradient-to-r ${getPaymentColor(link.payment_type)} rounded-xl p-4 mb-4 shadow-lg`}>
      <div className="flex items-center gap-3 text-white">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-2xl">{getPaymentIcon(link.payment_type)}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold capitalize">{link.payment_type}</p>
          {amount && <p className="text-lg font-bold">{amount}</p>}
          <p className="text-sm text-white/80">{link.description || `Make a ${link.payment_type}`}</p>
        </div>
        <div className="text-white/60">
          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function ProductInfo({ link }: { link: Link }) {
  if (link.link_type !== 'product') return null;

  const availability = link.product_availability ? getAvailabilityDisplay(link.product_availability) : null;
  const price = link.product_price && link.product_currency ? 
    formatPrice(link.product_price, link.product_currency) : null;

  return (
    <div className="mt-2">
      {/* Product Image */}
      {link.thumbnail_url && (
        <div className="mb-3">
          <img 
            src={link.thumbnail_url}
            alt={`${link.title} product image`}
            className="w-full h-32 object-cover rounded-lg shadow-sm"
          />
        </div>
      )}
      
      {/* Price and Availability */}
      <div className="flex items-center gap-3">
        {price && (
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-green-600">{price}</span>
          </div>
        )}
        
        {availability && (
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${availability.color}20`,
              color: availability.color 
            }}
          >
            <span>{availability.icon}</span>
            <span>{availability.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LinkItem({ link, index, onLinkClick }: LinkItemProps) {
  const [isClicked, setIsClicked] = useState(false);
  const platform = detectPlatform(link.url);

  const handleClick = async () => {
    setIsClicked(true);
    
    // Track the click
    await trackLinkClick(link.id, {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    });
    
    // Call the callback
    onLinkClick(link);
    
    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => setIsClicked(false), 200);
  };

  const getLinkTypeIcon = (type: string) => {
    switch (type) {
      case 'social':
        return '🌐';
      case 'product':
        return '🛍️';
      case 'media':
        return '🎵';
      case 'contact':
        return getContactTypeIcon(link.contact_type || 'email');
      default:
        return '🔗';
    }
  };

  const getLinkTypeColor = (type: string) => {
    switch (type) {
      case 'social':
        return 'from-blue-400 to-blue-600';
      case 'product':
        return 'from-green-400 to-green-600';
      case 'media':
        return 'from-purple-400 to-purple-600';
      case 'contact':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Extract style options
  const styleOptions = link.style_options || {};
  const borderOptions = styleOptions.border || {};
  const animationOptions = styleOptions.animation || {};
  const gradientOptions = styleOptions.gradient || {};

  // Build dynamic styles
  const dynamicStyles: React.CSSProperties = {
    backgroundColor: link.button_color || 'rgba(255, 255, 255, 0.95)',
    color: link.text_color || '#1F2937',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  // Apply gradient if specified
  if (gradientOptions.start && gradientOptions.end) {
    const direction = gradientOptions.direction || 'to-r';
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
    dynamicStyles.background = `linear-gradient(${directionMap[direction] || 'to right'}, ${gradientOptions.start}, ${gradientOptions.end})`;
  }

  // Apply border styles
  if (borderOptions.width) {
    dynamicStyles.border = `${borderOptions.width}px ${borderOptions.style || 'solid'} ${borderOptions.color || '#E5E7EB'}`;
  }

  // Apply border radius
  if (borderOptions.radius) {
    dynamicStyles.borderRadius = `${borderOptions.radius}px`;
  } else {
    dynamicStyles.borderRadius = '16px';
  }

  // Determine which embed to show
  const showVideoEmbed = link.link_type === 'media' && platform?.embedSupported;
  const showSpotifyEmbed = link.url.includes('spotify.com') && (link.url.includes('/track/') || link.url.includes('/album/') || link.url.includes('/playlist/') || link.url.includes('/artist/'));
  const showAppleMusicEmbed = link.url.includes('music.apple.com');
  const showPodcastEmbed = (link.url.includes('spotify.com/episode/') || link.url.includes('spotify.com/show/') || link.url.includes('podcasts.apple.com'));
  const showCalendarEmbed = (link.url.includes('calendly.com') || link.url.includes('cal.com')) && link.link_type === 'contact';
  const showPaymentButton = link.link_type === 'contact' && link.payment_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full"
    >
      {/* Embeds */}
      {showVideoEmbed && <VideoEmbed link={link} />}
      {showSpotifyEmbed && <SpotifyEmbed link={link} />}
      {showAppleMusicEmbed && <AppleMusicEmbed link={link} />}
      {showPodcastEmbed && <PodcastEmbed link={link} />}
      {showCalendarEmbed && <CalendarBookingEmbed link={link} />}
      {showPaymentButton && <PaymentButton link={link} />}
      
      {/* Link Button */}
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative overflow-hidden p-4 cursor-pointer
          transform transition-all duration-300 ease-out
          hover:shadow-2xl
          ${isClicked ? 'scale-95' : ''}
        `}
        style={dynamicStyles}
      >
        {/* Background Gradient Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${getLinkTypeColor(link.link_type)} opacity-5`}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {link.icon_url ? (
              <img 
                src={link.icon_url} 
                alt={`${link.title} icon`}
                className="h-12 w-12 rounded-xl object-cover"
              />
            ) : link.icon_name ? (
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: link.icon_color || '#8B5CF6' }}
              >
                <Icon 
                  icon={link.icon_name} 
                  size={24}
                  color="white"
                />
              </div>
            ) : platform ? (
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: platform.color }}
              >
                <platform.icon size={24} color="white" />
              </div>
            ) : (
              <div className={`
                h-12 w-12 rounded-xl bg-gradient-to-r ${getLinkTypeColor(link.link_type)}
                flex items-center justify-center text-white text-xl
              `}>
                {getLinkTypeIcon(link.link_type)}
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-semibold truncate"
              style={{ color: link.text_color || '#1F2937' }}
            >
              {link.title}
            </h3>
            {link.description && (
              <p 
                className="text-sm mt-1 line-clamp-2 opacity-80"
                style={{ color: link.text_color || '#6B7280' }}
              >
                {link.description}
              </p>
            )}
            
            {/* Product Information */}
            <ProductInfo link={link} />
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: link.text_color ? `${link.text_color}20` : 'rgba(107, 114, 128, 0.1)' 
              }}
            >
              <ArrowTopRightOnSquareIcon 
                className="h-4 w-4" 
                style={{ color: link.text_color || '#6B7280' }}
              />
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </motion.div>
  );
}

export function PublicLinkPage({ linkPage, links }: PublicLinkPageProps) {
  const [mounted, setMounted] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShareSupported('share' in navigator);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: linkPage.title,
      text: linkPage.description || `Check out ${linkPage.title} on Lilylink`,
      url: window.location.href,
    };

    if (shareSupported) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleLinkClick = (link: Link) => {
    // Additional tracking or analytics can be added here
    console.log(`Link clicked: ${link.title}`);
  };

  const getBackgroundStyle = () => {
    switch (linkPage.background_type) {
      case 'solid':
        return {
          backgroundColor: linkPage.background_value || '#f8fafc',
        };
      case 'image':
        return {
          backgroundImage: `url(${linkPage.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      case 'video':
        // Video backgrounds would need additional implementation
        return {
          backgroundColor: '#f8fafc',
        };
      default: // gradient
        return {
          background: linkPage.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
    }
  };

  // Get links for top icons (social, media, portfolio platforms)
  const topIconLinks = links.filter(link => {
    const platform = detectPlatform(link.url);
    return platform && ['social', 'media', 'portfolio'].includes(platform.category);
  });
  
  // Show ALL links in the main list - top icons are just quick shortcuts
  const mainLinks = links;

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div 
      className="min-h-screen relative"
      style={getBackgroundStyle()}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 h-72 w-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-8 -left-8 h-96 w-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Avatar placeholder - you can add avatar functionality later */}
            <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-white" />
            </div>

            {/* Title and Description */}
            <h1 
              className="text-3xl font-bold text-white mb-4 drop-shadow-lg"
              style={{ fontFamily: linkPage.font_family }}
            >
              {linkPage.title}
            </h1>
            
            {linkPage.description && (
              <p className="text-white/90 text-lg mb-6 drop-shadow">
                {linkPage.description}
              </p>
            )}

            {/* Quick Access Icons */}
            {topIconLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center gap-4 mb-8"
              >
                {topIconLinks.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                  >
                    <SocialIcon link={link} size={48} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Share Button */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-200"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </motion.button>
          </motion.div>

          {/* Links */}
          <div className="space-y-4">
            <AnimatePresence>
              {mainLinks.map((link, index) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  index={index}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {links.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-white/80">
                Links will appear here when they're added.
              </p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16 pt-8 border-t border-white/20"
          >
            <a
              href="https://lilylink.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200 text-sm"
            >
              <HeartIconSolid className="h-4 w-4 text-pink-400" />
              Made with Lilylink
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 