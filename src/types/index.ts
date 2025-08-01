// Database types
export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
  location?: string;
  is_verified: boolean;
  subscription_tier: 'free' | 'starter' | 'pro' | 'agency';
  custom_domain?: string;
  theme_preferences: Record<string, any>;
  analytics_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Block-based layout system
export interface PageBlock {
  id: string;
  type: 'header' | 'profile' | 'links' | 'text' | 'spacer' | 'social' | 'footer';
  enabled: boolean;
  order: number;
  config: any; // Block-specific configuration
}

export interface HeaderBlockConfig {
  type: 'image' | 'video' | 'gradient' | 'none';
  media?: {
    url: string;
    position: string;
    size: string;
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
  };
  gradient?: {
    value: string;
  };
  height: 'small' | 'medium' | 'large' | 'full';
  content?: {
    showTitle: boolean;
    showDescription: boolean;
    titlePosition: 'top' | 'center' | 'bottom';
    textColor: string;
    textShadow: boolean;
  };
}

export interface LinkStyleConfig {
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  borderWidth: string;
  borderColor?: string;
  hoverEffect: 'subtle' | 'scale' | 'border' | 'glow' | 'slide' | 'lift' | 'gradient';
  shadow?: string;
  gradient?: {
    enabled: boolean;
    colors: string[];
    direction: string;
  };
  animation?: {
    type: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow';
    duration: number;
  };
  spacing: {
    padding: string;
    margin: string;
  };
  typography: {
    size: string;
    weight: string;
    letterSpacing?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
  icon: {
    show: boolean;
    position: 'left' | 'right' | 'top';
    size: string;
    color?: string;
  };
}

// Theme System Types
export interface ThemeConfig {
  // Layout system
  layout?: {
    type: 'classic' | 'blocks';
    maxWidth: string;
    spacing: 'compact' | 'normal' | 'relaxed';
    alignment: 'left' | 'center' | 'right';
    blocks?: PageBlock[];
  };
  
  // Page background (behind all blocks)
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    value: string;
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
    position?: string;
    size?: string;
    repeat?: string;
  };
  
  // Typography settings
  typography?: {
    fontFamily: string;
    title: {
      size: string;
      weight: string;
      color: string;
      lineHeight?: string;
      letterSpacing?: string;
    };
    description: {
      size: string;
      weight?: string;
      color: string;
      lineHeight?: string;
    };
    links: {
      size: string;
      weight?: string;
      color: string;
    };
  };
  
  // Link styling (consolidated from AdvancedLinkForm)
  links?: LinkStyleConfig;
  
  // Header block configuration
  header?: HeaderBlockConfig;
  
  // Brand assets
  brand?: {
    logo?: {
      url: string;
      width?: number;
      height?: number;
      position: 'top' | 'center' | 'bottom';
    };
    favicon?: {
      url: string;
      size: number;
    };
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    colorPalettes?: Array<{
      id: string;
      name: string;
      colors: string[];
    }>;
    hideBranding?: boolean;
  };
  
  // Advanced customization
  customCSS?: string;
  animations?: {
    enabled: boolean;
    pageTransition: string;
    linkHover: string;
    scrollEffects: boolean;
  };
}

export interface Theme {
  id: string;
  name: string;
  display_name: string;
  category: 'minimal' | 'vibrant' | 'professional' | 'creative';
  description?: string;
  preview_image_url?: string;
  is_premium: boolean;
  is_active: boolean;
  config: ThemeConfig;
  created_at: string;
  updated_at: string;
}

export interface UserTheme {
  id: string;
  user_id: string;
  theme_id?: string;
  name: string;
  is_default: boolean;
  custom_config: Partial<ThemeConfig>;
  created_at: string;
  updated_at: string;
  theme?: Theme; // Populated when joined
}

// Link Page Types
export interface LinkPage {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  is_active: boolean;
  is_primary: boolean;
  theme_id: string | null;
  user_theme_id: string | null;
  custom_css: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
  background_type: 'gradient' | 'solid' | 'image' | 'video';
  background_value: string | null;
  font_family: string;
  
  // New theme configuration fields
  theme_config: Partial<ThemeConfig>;
  background_config: Record<string, any>;
  typography_config: Record<string, any>;
  layout_config: Record<string, any>;
  brand_config: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface CreateLinkPageInput {
  slug: string;
  title: string;
  description?: string;
  is_primary?: boolean;
  user_theme_id?: string;
  theme_config?: Partial<ThemeConfig>;
}

export interface UpdateLinkPageInput {
  slug?: string;
  title?: string;
  description?: string;
  is_active?: boolean;
  is_primary?: boolean;
  user_theme_id?: string;
  custom_css?: string;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  favicon_url?: string;
  background_type?: 'gradient' | 'solid' | 'image' | 'video';
  background_value?: string;
  font_family?: string;
  theme_config?: Partial<ThemeConfig>;
  background_config?: Record<string, any>;
  typography_config?: Record<string, any>;
  layout_config?: Record<string, any>;
  brand_config?: Record<string, any>;
}

// Link Types
export interface Link {
  id: string;
  page_id: string;
  title: string;
  url: string;
  description: string | null;
  icon_url: string | null;
  icon_name: string | null;
  icon_color: string | null;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
  click_count: number;
  link_type: 'standard' | 'social' | 'product' | 'media' | 'contact';
  style_options: Record<string, any>;
  schedule_start: string | null;
  schedule_end: string | null;
  
  // Link styling
  button_color: string | null;
  text_color: string | null;
  
  // Product fields
  product_price: number | null;
  product_currency: string | null;
  product_availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued' | null;
  
  // Contact fields
  contact_type: 'email' | 'phone' | 'whatsapp' | 'calendar' | null;
  contact_value: string | null;
  
  // Payment fields
  payment_type: 'payment' | 'donation' | 'tip' | null;
  payment_amount: number | null;
  payment_currency: string | null;
  
  created_at: string;
  updated_at: string;
}

// Theme Customization Types
export interface BackgroundCustomization {
  type: 'solid' | 'gradient' | 'image' | 'video';
  solid?: {
    color: string;
  };
  gradient?: {
    type: 'linear' | 'radial';
    direction?: string;
    stops: Array<{
      color: string;
      position: number;
    }>;
  };
  image?: {
    url: string;
    position: string;
    size: string;
    repeat: string;
    overlay?: {
      color: string;
      opacity: number;
    };
  };
  video?: {
    url: string;
    overlay?: {
      color: string;
      opacity: number;
    };
  };
}

export interface TypographyCustomization {
  fontFamily: string;
  title: {
    size: string;
    weight: string;
    color: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  description: {
    size: string;
    weight?: string;
    color: string;
    lineHeight?: string;
  };
  links: {
    size: string;
    weight?: string;
    color: string;
  };
}

export interface LayoutCustomization {
  maxWidth: string;
  spacing: 'compact' | 'normal' | 'relaxed';
  alignment: 'left' | 'center' | 'right';
  padding: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
}

export interface LinkStyleCustomization {
  backgroundColor: string;
  textColor: string;
  border: {
    width: string;
    style: string;
    color: string;
    radius: string;
  };
  shadow: string;
  hoverEffect: 'none' | 'scale' | 'lift' | 'glow' | 'slide';
  animation?: {
    type: string;
    duration: string;
    easing: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error: string | null;
  success: boolean;
}

// Analytics Types
export interface LinkClick {
  id: string;
  link_id: string;
  page_id: string;
  user_agent: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  clicked_at: string;
}

export interface PageView {
  id: string;
  page_id: string;
  user_agent: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  session_duration: number | null;
  viewed_at: string;
}

export interface AnalyticsData {
  totalLinks: number;
  totalClicks: number;
  totalViews: number;
  clickThroughRate: number;
  topLinks: Array<{
    id: string;
    title: string;
    clicks: number;
    url: string;
  }>;
  recentActivity: Array<{
    type: 'click' | 'view';
    timestamp: string;
    linkTitle?: string;
  }>;
}

// Combined Types
export interface LinkPageWithLinks extends LinkPage {
  links: Link[];
  analytics?: AnalyticsData;
}

export interface ProfileWithPages extends Profile {
  link_pages: LinkPage[];
  primary_page?: LinkPage;
}

// Platform Detection Types
export interface SocialPlatform {
  id: string;
  name: string;
  display_name: string;
  domain: string;
  url_pattern: string;
  icon_name: string;
  brand_color: string;
  is_active: boolean;
  created_at: string;
}

export interface MediaPlatform {
  id: string;
  name: string;
  display_name: string;
  domain: string;
  embed_pattern: string;
  api_endpoint: string | null;
  requires_api_key: boolean;
  supports_auto_play: boolean;
  max_duration_seconds: number | null;
  created_at: string;
}

export interface PlatformDetectionResult {
  type: 'social' | 'media' | 'product' | 'standard';
  platform?: string;
  platform_data?: SocialPlatform | MediaPlatform;
  extracted_id?: string;
  suggested_title?: string;
  suggested_icon?: string;
  suggested_color?: string;
  metadata?: Record<string, any>;
}

// Link Validation
export interface LinkValidation {
  is_valid: boolean;
  is_reachable: boolean;
  title?: string;
  description?: string;
  image?: string;
  error?: string;
}

// Bulk Operations
export interface BulkLinkOperation {
  action: 'create' | 'update' | 'delete' | 'reorder';
  links: Array<CreateLinkInput | UpdateLinkInput | { id: string }>;
}

export interface ImportLinksInput {
  page_id: string;
  links: Array<{
    title: string;
    url: string;
    description?: string;
    link_type?: string;
  }>;
  replace_existing?: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  displayName?: string;
}

export interface ProfileForm {
  username: string;
  display_name?: string;
  bio?: string;
  website_url?: string;
  location?: string;
}

export interface LinkForm {
  title: string;
  url: string;
  description?: string;
  link_type: Link['link_type'];
  is_active: boolean;
}

// Organization & Agency Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  subscription_tier: 'agency' | 'enterprise';
  max_profiles: number;
  custom_branding: Record<string, any>;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Record<string, any>;
  is_active: boolean;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  // Populated when joined with user data
  user?: Profile;
}

export interface ManagedProfile {
  id: string;
  organization_id: string;
  profile_id: string;
  manager_id?: string;
  access_level: 'view' | 'edit' | 'admin';
  client_name?: string;
  client_email?: string;
  client_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Populated when joined
  profile?: LinkPage;
  manager?: Profile;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  // Populated when joined
  inviter?: Profile;
  organization?: Organization;
}

// Organization with related data
export interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[];
  managed_profiles: ManagedProfile[];
  owner: Profile;
}

// Form types for organizations
export interface CreateOrganizationInput {
  name: string;
  slug: string;
  subscription_tier?: 'agency' | 'enterprise';
  max_profiles?: number;
  custom_branding?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  max_profiles?: number;
  custom_branding?: Record<string, any>;
  settings?: Record<string, any>;
  is_active?: boolean;
}

export interface InviteMemberInput {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  permissions?: Record<string, any>;
}

export interface UpdateMemberInput {
  role?: 'admin' | 'member' | 'viewer';
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface AddManagedProfileInput {
  profile_id: string;
  manager_id?: string;
  access_level: 'view' | 'edit' | 'admin';
  client_name?: string;
  client_email?: string;
  client_notes?: string;
}

export interface UpdateManagedProfileInput {
  manager_id?: string;
  access_level?: 'view' | 'edit' | 'admin';
  client_name?: string;
  client_email?: string;
  client_notes?: string;
  is_active?: boolean;
}

// Permission system types
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Permission[];
}

// White-label branding types
export interface WhiteLabelBranding {
  logo?: {
    url: string;
    width?: number;
    height?: number;
  };
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography?: {
    fontFamily: string;
    headingFont?: string;
  };
  customCSS?: string;
  hidePoweredBy: boolean;
  customDomain?: string;
  emailTemplates?: {
    header?: string;
    footer?: string;
    brandingText?: string;
  };
}

export interface ManagedProfile {
  id: string;
  organization_id: string;
  profile_id: string;
  manager_id?: string;
  access_level: 'view' | 'edit' | 'admin';
  client_name?: string;
  client_email?: string;
  client_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Populated relations
  organization?: Organization;
  profile?: LinkPage;
  manager?: Profile;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  
  // Populated relations
  organization?: Organization;
  invited_by_user?: Profile;
}

// Organization Form Types
export interface CreateOrganizationInput {
  name: string;
  slug: string;
  subscription_tier?: 'agency' | 'enterprise';
  max_profiles?: number;
  custom_branding?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  max_profiles?: number;
  custom_branding?: Record<string, any>;
  settings?: Record<string, any>;
  is_active?: boolean;
}

export interface InviteMemberInput {
  organization_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface UpdateMemberInput {
  role?: 'admin' | 'member' | 'viewer';
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface CreateManagedProfileInput {
  organization_id: string;
  profile_id: string;
  manager_id?: string;
  access_level?: 'view' | 'edit' | 'admin';
  client_name?: string;
  client_email?: string;
  client_notes?: string;
}

export interface UpdateManagedProfileInput {
  manager_id?: string;
  access_level?: 'view' | 'edit' | 'admin';
  client_name?: string;
  client_email?: string;
  client_notes?: string;
  is_active?: boolean;
}

// Extended types with organization context
export interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[];
  managed_profiles: ManagedProfile[];
  member_count: number;
  profile_count: number;
}

export interface ProfileWithOrganization extends Profile {
  organizations: OrganizationMember[];
  managed_by: ManagedProfile[];
}

// Permission checking
export interface OrganizationPermissions {
  canManageMembers: boolean;
  canManageProfiles: boolean;
  canViewAnalytics: boolean;
  canEditSettings: boolean;
  canDeleteOrganization: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canEditBranding: boolean;
}

// Agency Dashboard Types
export interface AgencyDashboardData {
  organization: OrganizationWithMembers;
  totalProfiles: number;
  totalClicks: number;
  totalViews: number;
  recentActivity: Array<{
    type: 'profile_created' | 'member_joined' | 'link_clicked' | 'profile_viewed';
    timestamp: string;
    profile_name?: string;
    member_name?: string;
    link_title?: string;
  }>;
  topPerformingProfiles: Array<{
    id: string;
    title: string;
    slug: string;
    clicks: number;
    views: number;
    ctr: number;
  }>;
  memberActivity: Array<{
    member: OrganizationMember;
    last_active: string;
    profiles_managed: number;
  }>;
}

// White-label branding
export interface WhiteLabelConfig {
  logo?: {
    url: string;
    width?: number;
    height?: number;
  };
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography?: {
    fontFamily: string;
    headingFont?: string;
  };
  branding?: {
    hideFooter: boolean;
    customFooterText?: string;
    customLoginPage?: boolean;
    customEmailTemplates?: boolean;
  };
  domain?: {
    custom: string;
    subdomain?: string;
  };
} 