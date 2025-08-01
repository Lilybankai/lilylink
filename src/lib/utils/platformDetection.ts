import { 
  FaInstagram, 
  FaTwitter, 
  FaFacebook, 
  FaYoutube, 
  FaTiktok, 
  FaLinkedin, 
  FaSpotify, 
  FaDiscord, 
  FaTwitch, 
  FaSnapchat,
  FaPinterest,
  FaTelegram,
  FaWhatsapp,
  FaGithub,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaReddit,
  FaTumblr,
  FaVimeo,
  FaSoundcloud,
  FaPatreon,
  FaOnlyfans
} from 'react-icons/fa';
import { SiOnlyfans, SiLinktree, SiCashapp, SiVenmo, SiPaypal } from 'react-icons/si';

export interface PlatformInfo {
  name: string;
  icon: any;
  color: string;
  category: 'social' | 'media' | 'payment' | 'portfolio' | 'other';
  embedSupported?: boolean;
}

export const platformMap: Record<string, PlatformInfo> = {
  // Social Media
  instagram: {
    name: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    category: 'social'
  },
  twitter: {
    name: 'Twitter',
    icon: FaTwitter,
    color: '#1DA1F2',
    category: 'social'
  },
  'x.com': {
    name: 'X (Twitter)',
    icon: FaTwitter,
    color: '#000000',
    category: 'social'
  },
  facebook: {
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    category: 'social'
  },
  tiktok: {
    name: 'TikTok',
    icon: FaTiktok,
    color: '#000000',
    category: 'social'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: '#0A66C2',
    category: 'social'
  },
  discord: {
    name: 'Discord',
    icon: FaDiscord,
    color: '#5865F2',
    category: 'social'
  },
  snapchat: {
    name: 'Snapchat',
    icon: FaSnapchat,
    color: '#FFFC00',
    category: 'social'
  },
  pinterest: {
    name: 'Pinterest',
    icon: FaPinterest,
    color: '#BD081C',
    category: 'social'
  },
  telegram: {
    name: 'Telegram',
    icon: FaTelegram,
    color: '#0088CC',
    category: 'social'
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    category: 'social'
  },
  reddit: {
    name: 'Reddit',
    icon: FaReddit,
    color: '#FF4500',
    category: 'social'
  },
  tumblr: {
    name: 'Tumblr',
    icon: FaTumblr,
    color: '#00CF35',
    category: 'social'
  },

  // Media Platforms
  youtube: {
    name: 'YouTube',
    icon: FaYoutube,
    color: '#FF0000',
    category: 'media',
    embedSupported: true
  },
  spotify: {
    name: 'Spotify',
    icon: FaSpotify,
    color: '#1DB954',
    category: 'media',
    embedSupported: true
  },
  twitch: {
    name: 'Twitch',
    icon: FaTwitch,
    color: '#9146FF',
    category: 'media',
    embedSupported: true
  },
  vimeo: {
    name: 'Vimeo',
    icon: FaVimeo,
    color: '#1AB7EA',
    category: 'media',
    embedSupported: true
  },
  soundcloud: {
    name: 'SoundCloud',
    icon: FaSoundcloud,
    color: '#FF5500',
    category: 'media',
    embedSupported: true
  },

  // Portfolio & Professional
  github: {
    name: 'GitHub',
    icon: FaGithub,
    color: '#181717',
    category: 'portfolio'
  },
  dribbble: {
    name: 'Dribbble',
    icon: FaDribbble,
    color: '#EA4C89',
    category: 'portfolio'
  },
  behance: {
    name: 'Behance',
    icon: FaBehance,
    color: '#1769FF',
    category: 'portfolio'
  },
  medium: {
    name: 'Medium',
    icon: FaMedium,
    color: '#000000',
    category: 'portfolio'
  },

  // Payment & Support
  patreon: {
    name: 'Patreon',
    icon: FaPatreon,
    color: '#FF424D',
    category: 'payment'
  },
  onlyfans: {
    name: 'OnlyFans',
    icon: SiOnlyfans,
    color: '#00AFF0',
    category: 'payment'
  },
  cashapp: {
    name: 'Cash App',
    icon: SiCashapp,
    color: '#00D632',
    category: 'payment'
  },
  venmo: {
    name: 'Venmo',
    icon: SiVenmo,
    color: '#3D95CE',
    category: 'payment'
  },
  paypal: {
    name: 'PayPal',
    icon: SiPaypal,
    color: '#00457C',
    category: 'payment'
  },

  // Other
  linktree: {
    name: 'Linktree',
    icon: SiLinktree,
    color: '#39E09B',
    category: 'other'
  }
};

export function detectPlatform(url: string): PlatformInfo | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url.toLowerCase());
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Direct hostname matches
    for (const [key, platform] of Object.entries(platformMap)) {
      if (hostname.includes(key) || hostname === `${key}.com`) {
        return platform;
      }
    }

    // Special cases
    if (hostname.includes('youtu.be') || hostname.includes('youtube.com')) {
      return platformMap.youtube;
    }
    
    if (hostname.includes('t.co') || hostname.includes('twitter.com')) {
      return platformMap.twitter;
    }

    if (hostname.includes('ig.me') || hostname.includes('instagram.com')) {
      return platformMap.instagram;
    }

    if (hostname.includes('fb.me') || hostname.includes('facebook.com')) {
      return platformMap.facebook;
    }

    if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) {
      return platformMap.whatsapp;
    }

    if (hostname.includes('t.me') || hostname.includes('telegram.org')) {
      return platformMap.telegram;
    }

    return null;
  } catch (error) {
    console.error('Error detecting platform:', error);
    return null;
  }
}

export function extractVideoId(url: string, platform: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'youtube':
        // Handle various YouTube URL formats
        if (urlObj.hostname.includes('youtu.be')) {
          return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
          return urlObj.searchParams.get('v');
        }
        break;
        
      case 'vimeo':
        // Extract Vimeo video ID from path
        const vimeoMatch = urlObj.pathname.match(/\/(\d+)/);
        return vimeoMatch ? vimeoMatch[1] : null;
        
      case 'twitch':
        // Handle Twitch video/clip URLs
        const twitchMatch = urlObj.pathname.match(/\/(videos|clip)\/(\w+)/);
        return twitchMatch ? twitchMatch[2] : null;
        
      default:
        return null;
    }
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
  
  return null;
}

export function getEmbedUrl(url: string, platform: string, videoId: string): string | null {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
      
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}?autoplay=0`;
      
    case 'spotify':
      // Handle Spotify track/playlist/album URLs
      const spotifyMatch = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
      if (spotifyMatch) {
        return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
      }
      break;
      
    case 'soundcloud':
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false`;
      
    default:
      return null;
  }
  
  return null;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

export function getAvailabilityDisplay(availability: string): { text: string; color: string; icon: string } {
  switch (availability) {
    case 'in_stock':
      return { text: 'In Stock', color: '#10B981', icon: '✅' };
    case 'out_of_stock':
      return { text: 'Out of Stock', color: '#EF4444', icon: '❌' };
    case 'limited':
      return { text: 'Limited Stock', color: '#F59E0B', icon: '⚠️' };
    case 'pre_order':
      return { text: 'Pre-order', color: '#8B5CF6', icon: '📅' };
    case 'discontinued':
      return { text: 'Discontinued', color: '#6B7280', icon: '🚫' };
    default:
      return { text: 'Available', color: '#6B7280', icon: '📦' };
  }
}

export function getSocialLinks(links: any[]): any[] {
  return links.filter(link => {
    const platform = detectPlatform(link.url);
    return platform && platform.category === 'social';
  });
}

export function getContactTypeIcon(contactType: string): string {
  switch (contactType) {
    case 'email':
      return '📧';
    case 'phone':
      return '📞';
    case 'whatsapp':
      return '💬';
    case 'telegram':
      return '✈️';
    case 'form':
      return '📝';
    case 'calendar':
      return '📅';
    case 'location':
      return '📍';
    default:
      return '📞';
  }
} 