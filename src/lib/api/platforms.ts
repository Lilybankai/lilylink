import { supabase } from '@/lib/supabase/client';
import { SocialPlatform, MediaPlatform, PlatformDetectionResult } from '@/types';
import { detectPlatform } from '@/lib/utils/platformDetection';

/**
 * Fetches all active social platforms from the database
 */
export async function getSocialPlatforms(): Promise<SocialPlatform[]> {
  const { data, error } = await supabase
    .from('social_platforms')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching social platforms:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches all media platforms from the database
 */
export async function getMediaPlatforms(): Promise<MediaPlatform[]> {
  const { data, error } = await supabase
    .from('media_platforms')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching media platforms:', error);
    return [];
  }

  return data || [];
}

/**
 * Detects platform from URL using database data
 */
export async function detectPlatformWithData(url: string): Promise<PlatformDetectionResult> {
  try {
    const [socialPlatforms, mediaPlatforms] = await Promise.all([
      getSocialPlatforms(),
      getMediaPlatforms()
    ]);

    return detectPlatform(url, socialPlatforms, mediaPlatforms);
  } catch (error) {
    console.error('Error detecting platform:', error);
    // Fallback to built-in detection
    return detectPlatform(url);
  }
}

/**
 * Enhances link data with platform detection
 */
export async function enhanceLinkWithPlatformData(linkData: {
  url: string;
  title?: string;
  link_type?: string;
}) {
  const detection = await detectPlatformWithData(linkData.url);
  
  const enhanced = {
    ...linkData,
    link_type: detection.type,
    icon_name: detection.suggested_icon,
    button_color: detection.suggested_color,
  };

  // Add platform-specific enhancements
  switch (detection.type) {
    case 'social':
      return {
        ...enhanced,
        title: detection.suggested_title || linkData.title,
        social_platform: detection.platform,
        social_handle: detection.extracted_id,
        metadata: detection.metadata
      };

    case 'media':
      return {
        ...enhanced,
        title: detection.suggested_title || linkData.title,
        media_platform: detection.platform,
        media_embed_id: detection.extracted_id,
        auto_play: detection.platform_data?.supports_auto_play || false,
        metadata: detection.metadata
      };

    case 'product':
      return {
        ...enhanced,
        title: detection.suggested_title || linkData.title,
        metadata: detection.metadata
      };

    default:
      return enhanced;
  }
}

/**
 * Creates a link with automatic platform detection and enhancement
 */
export async function createEnhancedLink(linkData: {
  page_id: string;
  title: string;
  url: string;
  description?: string;
  display_order?: number;
}) {
  try {
    // Enhance the link data with platform detection
    const enhancedData = await enhanceLinkWithPlatformData(linkData);

    const { data, error } = await supabase
      .from('links')
      .insert([enhancedData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating enhanced link:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Bulk enhance existing links with platform detection
 */
export async function bulkEnhanceLinks(pageId: string) {
  try {
    // Get all links for the page
    const { data: links, error: fetchError } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageId);

    if (fetchError) {
      throw fetchError;
    }

    if (!links || links.length === 0) {
      return { success: true, enhanced: 0 };
    }

    let enhancedCount = 0;

    // Process links in batches to avoid rate limits
    for (const link of links) {
      try {
        const detection = await detectPlatformWithData(link.url);
        
        const updates: any = {};
        let needsUpdate = false;

        // Only update if we detected something and current data is incomplete
        if (detection.type !== 'standard') {
          if (!link.link_type || link.link_type === 'standard') {
            updates.link_type = detection.type;
            needsUpdate = true;
          }

          if (!link.icon_name && detection.suggested_icon) {
            updates.icon_name = detection.suggested_icon;
            needsUpdate = true;
          }

          if (!link.button_color && detection.suggested_color) {
            updates.button_color = detection.suggested_color;
            needsUpdate = true;
          }

          // Add platform-specific data
          switch (detection.type) {
            case 'social':
              if (!link.social_platform && detection.platform) {
                updates.social_platform = detection.platform;
                updates.social_handle = detection.extracted_id;
                needsUpdate = true;
              }
              break;

            case 'media':
              if (!link.media_platform && detection.platform) {
                updates.media_platform = detection.platform;
                updates.media_embed_id = detection.extracted_id;
                updates.auto_play = detection.platform_data?.supports_auto_play || false;
                needsUpdate = true;
              }
              break;
          }

          // Update metadata
          if (detection.metadata && Object.keys(detection.metadata).length > 0) {
            updates.metadata = { ...link.metadata, ...detection.metadata };
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('links')
            .update(updates)
            .eq('id', link.id);

          if (updateError) {
            console.error(`Error updating link ${link.id}:`, updateError);
          } else {
            enhancedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing link ${link.id}:`, error);
      }
    }

    return { success: true, enhanced: enhancedCount };
  } catch (error) {
    console.error('Error bulk enhancing links:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets platform-specific embed code for media links
 */
export function getEmbedCode(link: {
  media_platform?: string;
  media_embed_id?: string;
  url: string;
  auto_play?: boolean;
  title?: string;
}): string | null {
  if (!link.media_platform || !link.media_embed_id) {
    return null;
  }

  const autoplayParam = link.auto_play ? '1' : '0';

  switch (link.media_platform) {
    case 'youtube':
      return `<iframe 
        width="560" 
        height="315" 
        src="https://www.youtube.com/embed/${link.media_embed_id}?autoplay=${autoplayParam}" 
        title="${link.title || 'YouTube video'}"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;

    case 'spotify':
      const spotifyType = link.url.includes('/track/') ? 'track' : 
                         link.url.includes('/album/') ? 'album' : 
                         link.url.includes('/playlist/') ? 'playlist' : 'track';
      return `<iframe 
        src="https://open.spotify.com/embed/${spotifyType}/${link.media_embed_id}" 
        width="560" 
        height="315" 
        frameborder="0" 
        allowtransparency="true" 
        allow="encrypted-media">
      </iframe>`;

    case 'vimeo':
      return `<iframe 
        src="https://player.vimeo.com/video/${link.media_embed_id}?autoplay=${autoplayParam}" 
        width="560" 
        height="315" 
        frameborder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowfullscreen>
      </iframe>`;

    case 'soundcloud':
      return `<iframe 
        width="560" 
        height="166" 
        scrolling="no" 
        frameborder="no" 
        allow="autoplay" 
        src="https://w.soundcloud.com/player/?url=${encodeURIComponent(link.url)}&color=%23ff5500&auto_play=${link.auto_play}&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true">
      </iframe>`;

    default:
      return null;
  }
}

/**
 * Validates and formats contact information
 */
export function validateContactLink(contactType: string, value: string): { isValid: boolean; formattedValue?: string; error?: string } {
  switch (contactType) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      return { isValid: true, formattedValue: `mailto:${value}` };

    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return { isValid: false, error: 'Invalid phone number format' };
      }
      const cleanPhone = value.replace(/[^\d+]/g, '');
      return { isValid: true, formattedValue: `tel:${cleanPhone}` };

    case 'whatsapp':
      const whatsappRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!whatsappRegex.test(value)) {
        return { isValid: false, error: 'Invalid WhatsApp number format' };
      }
      const cleanWhatsApp = value.replace(/[^\d+]/g, '');
      return { isValid: true, formattedValue: `https://wa.me/${cleanWhatsApp}` };

    case 'telegram':
      const telegramRegex = /^@?[a-zA-Z0-9_]{5,32}$/;
      if (!telegramRegex.test(value)) {
        return { isValid: false, error: 'Invalid Telegram username format' };
      }
      const cleanTelegram = value.replace('@', '');
      return { isValid: true, formattedValue: `https://t.me/${cleanTelegram}` };

    default:
      return { isValid: true, formattedValue: value };
  }
} 