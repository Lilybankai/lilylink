import * as z from 'zod';

// Link Page Validation Schemas
export const createLinkPageSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be no more than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores')
    .refine((slug) => !['admin', 'api', 'www', 'mail', 'ftp', 'blog', 'shop', 'store', 'help', 'support', 'about', 'contact', 'terms', 'privacy', 'dashboard', 'settings', 'profile', 'login', 'register', 'signup', 'signin', 'logout', 'auth', 'callback'].includes(slug.toLowerCase()), {
      message: 'This slug is reserved and cannot be used'
    }),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be no more than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be no more than 500 characters')
    .optional(),
  is_primary: z.boolean().optional().default(false),
  background_type: z
    .enum(['gradient', 'solid', 'image', 'video'])
    .optional()
    .default('gradient'),
  background_value: z
    .string()
    .optional(),
  font_family: z
    .string()
    .optional()
    .default('Inter'),
  seo_title: z
    .string()
    .max(60, 'SEO title must be no more than 60 characters')
    .optional(),
  seo_description: z
    .string()
    .max(160, 'SEO description must be no more than 160 characters')
    .optional(),
});

export const updateLinkPageSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be no more than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores')
    .refine((slug) => !['admin', 'api', 'www', 'mail', 'ftp', 'blog', 'shop', 'store', 'help', 'support', 'about', 'contact', 'terms', 'privacy', 'dashboard', 'settings', 'profile', 'login', 'register', 'signup', 'signin', 'logout', 'auth', 'callback'].includes(slug.toLowerCase()), {
      message: 'This slug is reserved and cannot be used'
    })
    .optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be no more than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be no more than 500 characters')
    .optional(),
  is_active: z.boolean().optional(),
  is_primary: z.boolean().optional(),
  custom_css: z
    .string()
    .max(10000, 'Custom CSS must be no more than 10,000 characters')
    .optional(),
  seo_title: z
    .string()
    .max(60, 'SEO title must be no more than 60 characters')
    .optional(),
  seo_description: z
    .string()
    .max(160, 'SEO description must be no more than 160 characters')
    .optional(),
  og_image_url: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  favicon_url: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  background_type: z
    .enum(['gradient', 'solid', 'image', 'video'])
    .optional(),
  background_value: z
    .string()
    .optional(),
  font_family: z
    .string()
    .optional(),
});

export const slugCheckSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be no more than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores'),
});

// Link Validation Schemas
export const createLinkSchema = z.object({
  page_id: z
    .string()
    .uuid('Invalid page ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be no more than 100 characters'),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine((url) => {
      // For contact links, allow special URL formats
      if (url.startsWith('mailto:') || url.startsWith('tel:') || 
          url.startsWith('sms:') || url.startsWith('whatsapp:') ||
          url.includes('wa.me') || url.includes('t.me')) {
        return true;
      }
      // For regular links, require http/https
      return url.startsWith('http://') || url.startsWith('https://');
    }, {
      message: 'URL must be a valid web URL (http/https) or contact link'
    }),
  description: z
    .string()
    .max(200, 'Description must be no more than 200 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  icon_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .transform(val => val === '' ? undefined : val),
  icon_name: z
    .string()
    .max(50, 'Icon name must be no more than 50 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  icon_color: z
    .string()
    .max(20, 'Icon color must be no more than 20 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  button_color: z
    .string()
    .max(20, 'Button color must be no more than 20 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  text_color: z
    .string()
    .max(20, 'Text color must be no more than 20 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  thumbnail_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .transform(val => val === '' ? undefined : val),
  display_order: z
    .number()
    .int()
    .min(0, 'Display order must be 0 or greater')
    .optional()
    .default(0),
  link_type: z
    .enum(['standard', 'social', 'product', 'media', 'contact'])
    .optional()
    .default('standard'),
  style_options: z
    .record(z.any())
    .optional()
    .default({}),
  schedule_start: z
    .string()
    .datetime()
    .optional()
    .transform(val => val === '' ? undefined : val),
  schedule_end: z
    .string()
    .datetime()
    .optional()
    .transform(val => val === '' ? undefined : val),
  
  // Product Link Features
  product_price: z
    .number()
    .min(0, 'Price must be 0 or greater')
    .optional(),
  product_currency: z
    .enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'])
    .optional()
    .default('USD'),
  product_availability: z
    .enum(['in_stock', 'out_of_stock', 'limited', 'pre_order', 'discontinued'])
    .optional(),
  affiliate_id: z
    .string()
    .max(100, 'Affiliate ID must be no more than 100 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  commission_rate: z
    .number()
    .min(0)
    .max(100, 'Commission rate must be between 0 and 100')
    .optional(),
  
  // Media Link Features
  media_platform: z
    .enum(['youtube', 'spotify', 'apple_music', 'tiktok', 'instagram', 'soundcloud', 'twitch', 'vimeo'])
    .optional(),
  media_embed_id: z
    .string()
    .max(100, 'Media embed ID must be no more than 100 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  media_duration: z
    .number()
    .int()
    .min(0, 'Duration must be 0 or greater')
    .optional(),
  auto_play: z
    .boolean()
    .optional()
    .default(false),
  
  // Contact/Action Features
  contact_type: z
    .enum(['email', 'phone', 'whatsapp', 'telegram', 'form', 'calendar', 'location'])
    .optional(),
  phone_number: z
    .string()
    .max(20, 'Phone number must be no more than 20 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  email_address: z
    .string()
    .email('Must be a valid email address')
    .optional()
    .transform(val => val === '' ? undefined : val),
  form_fields: z
    .record(z.any())
    .optional(),
  calendar_link: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .transform(val => val === '' ? undefined : val),
  payment_amount: z
    .number()
    .min(0, 'Payment amount must be 0 or greater')
    .optional(),
  payment_currency: z
    .string()
    .optional()
    .default('USD'),
  payment_type: z
    .enum(['one_time', 'subscription', 'donation', 'tip', 'product_purchase'])
    .optional(),
  
  // Social Media Features
  social_platform: z
    .enum(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'youtube', 'twitch', 'discord', 'github', 'behance', 'dribbble'])
    .optional(),
  social_handle: z
    .string()
    .max(50, 'Social handle must be no more than 50 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
  social_follower_count: z
    .number()
    .int()
    .min(0, 'Follower count must be 0 or greater')
    .optional(),
  
  // Advanced Metadata
  metadata: z
    .record(z.any())
    .optional()
    .default({}),
  external_id: z
    .string()
    .max(100, 'External ID must be no more than 100 characters')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

export const updateLinkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be no more than 100 characters')
    .optional(),
  url: z
    .string()
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL must start with http:// or https://'
    })
    .optional(),
  description: z
    .string()
    .max(200, 'Description must be no more than 200 characters')
    .optional(),
  icon_url: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  icon_name: z
    .string()
    .max(50, 'Icon name must be no more than 50 characters')
    .optional(),
  icon_color: z
    .string()
    .max(20, 'Icon color must be no more than 20 characters')
    .optional(),
  button_color: z
    .string()
    .max(20, 'Button color must be no more than 20 characters')
    .optional(),
  text_color: z
    .string()
    .max(20, 'Text color must be no more than 20 characters')
    .optional(),
  thumbnail_url: z
    .string()
    .url('Must be a valid URL')
    .optional(),
  display_order: z
    .number()
    .int()
    .min(0, 'Display order must be 0 or greater')
    .optional(),
  is_active: z.boolean().optional(),
  link_type: z
    .enum(['standard', 'social', 'product', 'media', 'contact'])
    .optional(),
  style_options: z
    .record(z.any())
    .optional(),
  schedule_start: z
    .string()
    .datetime()
    .optional(),
  schedule_end: z
    .string()
    .datetime()
    .optional(),
});

export const reorderLinksSchema = z.object({
  page_id: z
    .string()
    .uuid('Invalid page ID'),
  link_orders: z
    .array(
      z.object({
        id: z.string().uuid('Invalid link ID'),
        display_order: z.number().int().min(0, 'Display order must be 0 or greater'),
      })
    )
    .min(1, 'At least one link order is required'),
});

// Bulk Operations
export const bulkLinkOperationSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'reorder']),
  links: z.array(z.any()).min(1, 'At least one link is required'),
});

export const importLinksSchema = z.object({
  page_id: z
    .string()
    .uuid('Invalid page ID'),
  links: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, 'Title is required')
          .max(100, 'Title must be no more than 100 characters'),
        url: z
          .string()
          .url('Must be a valid URL')
          .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
            message: 'URL must start with http:// or https://'
          }),
        description: z
          .string()
          .max(200, 'Description must be no more than 200 characters')
          .optional(),
        link_type: z
          .string()
          .optional(),
      })
    )
    .min(1, 'At least one link is required')
    .max(50, 'Cannot import more than 50 links at once'),
  replace_existing: z.boolean().optional().default(false),
});

// Analytics Validation
export const trackClickSchema = z.object({
  link_id: z
    .string()
    .uuid('Invalid link ID'),
  user_agent: z.string().optional(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export const trackPageViewSchema = z.object({
  page_id: z
    .string()
    .uuid('Invalid page ID'),
  user_agent: z.string().optional(),
  referrer: z.string().optional(),
  session_duration: z.number().int().min(0).optional(),
});

// Social Platform Detection
export const detectSocialPlatformSchema = z.object({
  url: z
    .string()
    .url('Must be a valid URL'),
});

// Link Validation
export const validateLinkSchema = z.object({
  url: z
    .string()
    .url('Must be a valid URL'),
  check_reachability: z.boolean().optional().default(true),
});

// Type exports for use in components
export type CreateLinkPageInput = z.infer<typeof createLinkPageSchema>;
export type UpdateLinkPageInput = z.infer<typeof updateLinkPageSchema>;
export type SlugCheckInput = z.infer<typeof slugCheckSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;
export type BulkLinkOperationInput = z.infer<typeof bulkLinkOperationSchema>;
export type ImportLinksInput = z.infer<typeof importLinksSchema>;
export type TrackClickInput = z.infer<typeof trackClickSchema>;
export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>;
export type DetectSocialPlatformInput = z.infer<typeof detectSocialPlatformSchema>;
export type ValidateLinkInput = z.infer<typeof validateLinkSchema>; 