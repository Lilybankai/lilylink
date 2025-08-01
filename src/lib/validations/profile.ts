import * as z from 'zod';

// Username validation with comprehensive rules
const username = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )
  .regex(
    /^[a-zA-Z0-9]/,
    'Username must start with a letter or number'
  )
  .regex(
    /[a-zA-Z0-9]$/,
    'Username must end with a letter or number'
  )
  .refine(
    (val) => !val.includes('__') && !val.includes('--'),
    'Username cannot contain consecutive underscores or hyphens'
  );

// URL validation
const url = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL is too long')
  .optional()
  .or(z.literal(''));

// Display name validation
const displayName = z
  .string()
  .min(1, 'Display name is required')
  .max(50, 'Display name cannot exceed 50 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_.]+$/,
    'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods'
  );

// Bio validation
const bio = z
  .string()
  .max(160, 'Bio cannot exceed 160 characters')
  .optional();

// Location validation
const location = z
  .string()
  .max(50, 'Location cannot exceed 50 characters')
  .optional();

// Custom domain validation
const customDomain = z
  .string()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
    'Please enter a valid domain name'
  )
  .optional()
  .or(z.literal(''));

// Theme preferences validation
const themePreferences = z.object({
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
  buttonStyle: z.enum(['rounded', 'square', 'pill']).optional(),
  layout: z.enum(['minimal', 'card', 'gradient']).optional(),
}).optional();

// Profile creation schema
export const createProfileSchema = z.object({
  username,
  displayName,
  bio,
  websiteUrl: url,
  location,
});

// Profile update schema (all fields optional except username)
export const updateProfileSchema = z.object({
  username: username.optional(),
  displayName: displayName.optional(),
  bio,
  websiteUrl: url,
  location,
  themePreferences,
});

// Username availability check schema
export const usernameCheckSchema = z.object({
  username,
});

// Avatar upload schema
export const avatarUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
});

// Custom domain setup schema
export const customDomainSchema = z.object({
  domain: customDomain.refine((val) => val !== '', 'Domain is required'),
});

// Account settings schema
export const accountSettingsSchema = z.object({
  analyticsEnabled: z.boolean(),
  isVerified: z.boolean().optional(),
  subscriptionTier: z.enum(['free', 'starter', 'pro', 'agency']).optional(),
});

// Privacy settings schema
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private']),
  showAnalytics: z.boolean(),
  allowIndexing: z.boolean(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
  weeklyReports: z.boolean(),
});

// Profile deletion confirmation schema
export const deleteProfileSchema = z.object({
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' }),
  }),
  password: z.string().min(1, 'Password is required for account deletion'),
});

// Types
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UsernameCheckInput = z.infer<typeof usernameCheckSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type CustomDomainInput = z.infer<typeof customDomainSchema>;
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type DeleteProfileInput = z.infer<typeof deleteProfileSchema>; 