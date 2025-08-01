// Comprehensive icon library for link types
export interface IconData {
  name: string;
  icon: string; // SVG string or icon identifier
  category: string;
  color?: string;
  bgColor?: string;
}

export const iconCategories = {
  social: 'Social Media',
  business: 'Business & Professional',
  ecommerce: 'E-commerce & Shopping',
  entertainment: 'Entertainment & Media',
  communication: 'Communication',
  creative: 'Creative & Design',
  technology: 'Technology & Development',
  lifestyle: 'Lifestyle & Personal',
  education: 'Education & Learning',
  finance: 'Finance & Payment',
  other: 'Other'
};

export const iconLibrary: IconData[] = [
  // Social Media
  {
    name: 'Instagram',
    icon: 'instagram',
    category: 'social',
    color: '#E4405F',
    bgColor: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
  },
  {
    name: 'TikTok',
    icon: 'tiktok',
    category: 'social',
    color: '#000000',
    bgColor: '#ff0050'
  },
  {
    name: 'Twitter/X',
    icon: 'twitter',
    category: 'social',
    color: '#1DA1F2',
    bgColor: '#1DA1F2'
  },
  {
    name: 'Facebook',
    icon: 'facebook',
    category: 'social',
    color: '#1877F2',
    bgColor: '#1877F2'
  },
  {
    name: 'YouTube',
    icon: 'youtube',
    category: 'social',
    color: '#FF0000',
    bgColor: '#FF0000'
  },
  {
    name: 'LinkedIn',
    icon: 'linkedin',
    category: 'social',
    color: '#0A66C2',
    bgColor: '#0A66C2'
  },
  {
    name: 'Snapchat',
    icon: 'snapchat',
    category: 'social',
    color: '#FFFC00',
    bgColor: '#FFFC00'
  },
  {
    name: 'Pinterest',
    icon: 'pinterest',
    category: 'social',
    color: '#BD081C',
    bgColor: '#BD081C'
  },
  {
    name: 'Discord',
    icon: 'discord',
    category: 'social',
    color: '#5865F2',
    bgColor: '#5865F2'
  },
  {
    name: 'Twitch',
    icon: 'twitch',
    category: 'social',
    color: '#9146FF',
    bgColor: '#9146FF'
  },
  {
    name: 'Reddit',
    icon: 'reddit',
    category: 'social',
    color: '#FF4500',
    bgColor: '#FF4500'
  },
  {
    name: 'Telegram',
    icon: 'telegram',
    category: 'social',
    color: '#0088CC',
    bgColor: '#0088CC'
  },

  // Business & Professional
  {
    name: 'Website',
    icon: 'globe',
    category: 'business',
    color: '#6366F1',
    bgColor: '#6366F1'
  },
  {
    name: 'Email',
    icon: 'email',
    category: 'business',
    color: '#4F46E5',
    bgColor: '#4F46E5'
  },
  {
    name: 'Phone',
    icon: 'phone',
    category: 'business',
    color: '#10B981',
    bgColor: '#10B981'
  },
  {
    name: 'Calendar',
    icon: 'calendar',
    category: 'business',
    color: '#3B82F6',
    bgColor: '#3B82F6'
  },
  {
    name: 'Portfolio',
    icon: 'briefcase',
    category: 'business',
    color: '#8B5CF6',
    bgColor: '#8B5CF6'
  },
  {
    name: 'Resume/CV',
    icon: 'document',
    category: 'business',
    color: '#6B7280',
    bgColor: '#6B7280'
  },

  // E-commerce & Shopping
  {
    name: 'Shop',
    icon: 'shopping-bag',
    category: 'ecommerce',
    color: '#F59E0B',
    bgColor: '#F59E0B'
  },
  {
    name: 'Amazon',
    icon: 'amazon',
    category: 'ecommerce',
    color: '#FF9900',
    bgColor: '#FF9900'
  },
  {
    name: 'Etsy',
    icon: 'etsy',
    category: 'ecommerce',
    color: '#F16521',
    bgColor: '#F16521'
  },
  {
    name: 'eBay',
    icon: 'ebay',
    category: 'ecommerce',
    color: '#E53238',
    bgColor: '#E53238'
  },
  {
    name: 'Shopify',
    icon: 'shopify',
    category: 'ecommerce',
    color: '#7AB55C',
    bgColor: '#7AB55C'
  },

  // Entertainment & Media
  {
    name: 'Spotify',
    icon: 'spotify',
    category: 'entertainment',
    color: '#1DB954',
    bgColor: '#1DB954'
  },
  {
    name: 'Apple Music',
    icon: 'apple-music',
    category: 'entertainment',
    color: '#FA243C',
    bgColor: '#FA243C'
  },
  {
    name: 'SoundCloud',
    icon: 'soundcloud',
    category: 'entertainment',
    color: '#FF5500',
    bgColor: '#FF5500'
  },
  {
    name: 'Podcast',
    icon: 'microphone',
    category: 'entertainment',
    color: '#8B5CF6',
    bgColor: '#8B5CF6'
  },
  {
    name: 'Netflix',
    icon: 'netflix',
    category: 'entertainment',
    color: '#E50914',
    bgColor: '#E50914'
  },

  // Communication
  {
    name: 'WhatsApp',
    icon: 'whatsapp',
    category: 'communication',
    color: '#25D366',
    bgColor: '#25D366'
  },
  {
    name: 'Messenger',
    icon: 'messenger',
    category: 'communication',
    color: '#00B2FF',
    bgColor: '#00B2FF'
  },
  {
    name: 'Slack',
    icon: 'slack',
    category: 'communication',
    color: '#4A154B',
    bgColor: '#4A154B'
  },
  {
    name: 'Zoom',
    icon: 'zoom',
    category: 'communication',
    color: '#2D8CFF',
    bgColor: '#2D8CFF'
  },

  // Creative & Design
  {
    name: 'Behance',
    icon: 'behance',
    category: 'creative',
    color: '#1769FF',
    bgColor: '#1769FF'
  },
  {
    name: 'Dribbble',
    icon: 'dribbble',
    category: 'creative',
    color: '#EA4C89',
    bgColor: '#EA4C89'
  },
  {
    name: 'DeviantArt',
    icon: 'deviantart',
    category: 'creative',
    color: '#05CC47',
    bgColor: '#05CC47'
  },
  {
    name: 'Figma',
    icon: 'figma',
    category: 'creative',
    color: '#F24E1E',
    bgColor: '#F24E1E'
  },

  // Technology & Development
  {
    name: 'GitHub',
    icon: 'github',
    category: 'technology',
    color: '#181717',
    bgColor: '#181717'
  },
  {
    name: 'GitLab',
    icon: 'gitlab',
    category: 'technology',
    color: '#FCA326',
    bgColor: '#FCA326'
  },
  {
    name: 'Stack Overflow',
    icon: 'stackoverflow',
    category: 'technology',
    color: '#F58025',
    bgColor: '#F58025'
  },
  {
    name: 'CodePen',
    icon: 'codepen',
    category: 'technology',
    color: '#000000',
    bgColor: '#000000'
  },

  // Finance & Payment
  {
    name: 'PayPal',
    icon: 'paypal',
    category: 'finance',
    color: '#00457C',
    bgColor: '#00457C'
  },
  {
    name: 'Venmo',
    icon: 'venmo',
    category: 'finance',
    color: '#3D95CE',
    bgColor: '#3D95CE'
  },
  {
    name: 'Cash App',
    icon: 'cashapp',
    category: 'finance',
    color: '#00D632',
    bgColor: '#00D632'
  },
  {
    name: 'Buy Me a Coffee',
    icon: 'coffee',
    category: 'finance',
    color: '#FFDD00',
    bgColor: '#FFDD00'
  },
  {
    name: 'Patreon',
    icon: 'patreon',
    category: 'finance',
    color: '#FF424D',
    bgColor: '#FF424D'
  },

  // Lifestyle & Personal
  {
    name: 'Blog',
    icon: 'document-text',
    category: 'lifestyle',
    color: '#6B7280',
    bgColor: '#6B7280'
  },
  {
    name: 'Medium',
    icon: 'medium',
    category: 'lifestyle',
    color: '#000000',
    bgColor: '#000000'
  },
  {
    name: 'Substack',
    icon: 'substack',
    category: 'lifestyle',
    color: '#FF6719',
    bgColor: '#FF6719'
  },
  {
    name: 'OnlyFans',
    icon: 'onlyfans',
    category: 'lifestyle',
    color: '#00AFF0',
    bgColor: '#00AFF0'
  },

  // Education & Learning
  {
    name: 'Coursera',
    icon: 'coursera',
    category: 'education',
    color: '#0056D3',
    bgColor: '#0056D3'
  },
  {
    name: 'Udemy',
    icon: 'udemy',
    category: 'education',
    color: '#A435F0',
    bgColor: '#A435F0'
  },
  {
    name: 'Khan Academy',
    icon: 'khanacademy',
    category: 'education',
    color: '#14BF96',
    bgColor: '#14BF96'
  }
];

// Function to get icons by category
export function getIconsByCategory(category: string): IconData[] {
  return iconLibrary.filter(icon => icon.category === category);
}

// Function to search icons
export function searchIcons(query: string): IconData[] {
  const lowercaseQuery = query.toLowerCase();
  return iconLibrary.filter(icon => 
    icon.name.toLowerCase().includes(lowercaseQuery)
  );
}

// Function to get icon by name
export function getIconByName(name: string): IconData | undefined {
  return iconLibrary.find(icon => icon.name.toLowerCase() === name.toLowerCase());
}

// Function to detect platform from URL
export function detectPlatformFromUrl(url: string): IconData | null {
  const hostname = new URL(url).hostname.toLowerCase();
  
  const platformMappings: { [key: string]: string } = {
    'instagram.com': 'Instagram',
    'tiktok.com': 'TikTok',
    'twitter.com': 'Twitter/X',
    'x.com': 'Twitter/X',
    'facebook.com': 'Facebook',
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'linkedin.com': 'LinkedIn',
    'snapchat.com': 'Snapchat',
    'pinterest.com': 'Pinterest',
    'discord.gg': 'Discord',
    'discord.com': 'Discord',
    'twitch.tv': 'Twitch',
    'reddit.com': 'Reddit',
    't.me': 'Telegram',
    'telegram.me': 'Telegram',
    'spotify.com': 'Spotify',
    'music.apple.com': 'Apple Music',
    'soundcloud.com': 'SoundCloud',
    'whatsapp.com': 'WhatsApp',
    'wa.me': 'WhatsApp',
    'github.com': 'GitHub',
    'gitlab.com': 'GitLab',
    'behance.net': 'Behance',
    'dribbble.com': 'Dribbble',
    'figma.com': 'Figma',
    'paypal.com': 'PayPal',
    'paypal.me': 'PayPal',
    'venmo.com': 'Venmo',
    'cash.app': 'Cash App',
    'buymeacoffee.com': 'Buy Me a Coffee',
    'patreon.com': 'Patreon',
    'medium.com': 'Medium',
    'substack.com': 'Substack',
    'onlyfans.com': 'OnlyFans',
    'amazon.com': 'Amazon',
    'etsy.com': 'Etsy',
    'ebay.com': 'eBay',
    'shopify.com': 'Shopify'
  };

  for (const [domain, platform] of Object.entries(platformMappings)) {
    if (hostname.includes(domain)) {
      return getIconByName(platform) || null;
    }
  }

  return null;
} 