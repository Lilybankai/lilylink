-- Add advanced customization fields to links table
ALTER TABLE links 
ADD COLUMN gradient_start TEXT DEFAULT NULL,
ADD COLUMN gradient_end TEXT DEFAULT NULL,
ADD COLUMN gradient_direction TEXT DEFAULT NULL,
ADD COLUMN border_color TEXT DEFAULT NULL,
ADD COLUMN border_width INTEGER DEFAULT NULL,
ADD COLUMN border_style TEXT DEFAULT NULL,
ADD COLUMN border_radius INTEGER DEFAULT NULL,
ADD COLUMN animation_type TEXT DEFAULT 'none',
ADD COLUMN hover_effect TEXT DEFAULT 'none',
ADD COLUMN theme_id UUID DEFAULT NULL;

-- Add constraints for gradient direction
ALTER TABLE links ADD CONSTRAINT links_gradient_direction_check 
CHECK (gradient_direction IN ('to-r', 'to-l', 'to-t', 'to-b', 'to-br', 'to-bl', 'to-tr', 'to-tl'));

-- Add constraints for border style
ALTER TABLE links ADD CONSTRAINT links_border_style_check 
CHECK (border_style IN ('solid', 'dashed', 'dotted'));

-- Add constraints for animation type
ALTER TABLE links ADD CONSTRAINT links_animation_type_check 
CHECK (animation_type IN ('none', 'pulse', 'bounce', 'shake', 'glow', 'slide'));

-- Add constraints for hover effect
ALTER TABLE links ADD CONSTRAINT links_hover_effect_check 
CHECK (hover_effect IN ('none', 'lift', 'scale', 'glow', 'shadow', 'rotate'));

-- Create user_themes table for saving custom themes
CREATE TABLE user_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create brand_kits table for industry-specific presets
CREATE TABLE brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    industry TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    colors JSONB NOT NULL DEFAULT '{}',
    gradients JSONB NOT NULL DEFAULT '[]',
    typography JSONB NOT NULL DEFAULT '{}',
    animations JSONB NOT NULL DEFAULT '{}',
    preview_links JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add constraint for industry types
ALTER TABLE brand_kits ADD CONSTRAINT brand_kits_industry_check 
CHECK (industry IN ('tech', 'fashion', 'food', 'fitness', 'music', 'art', 'business', 'education', 'healthcare', 'other'));

-- Create indexes for performance
CREATE INDEX idx_links_theme_id ON links(theme_id);
CREATE INDEX idx_user_themes_user_id ON user_themes(user_id);
CREATE INDEX idx_user_themes_favorite ON user_themes(user_id, is_favorite);
CREATE INDEX idx_brand_kits_industry ON brand_kits(industry);
CREATE INDEX idx_brand_kits_premium ON brand_kits(is_premium);

-- Add comments for documentation
COMMENT ON COLUMN links.gradient_start IS 'Start color for gradient backgrounds';
COMMENT ON COLUMN links.gradient_end IS 'End color for gradient backgrounds';
COMMENT ON COLUMN links.gradient_direction IS 'Direction of gradient (to-r, to-l, etc.)';
COMMENT ON COLUMN links.border_color IS 'Border color in hex format';
COMMENT ON COLUMN links.border_width IS 'Border width in pixels';
COMMENT ON COLUMN links.border_style IS 'Border style (solid, dashed, dotted)';
COMMENT ON COLUMN links.border_radius IS 'Border radius in pixels';
COMMENT ON COLUMN links.animation_type IS 'Animation type for the link';
COMMENT ON COLUMN links.hover_effect IS 'Hover effect for the link';
COMMENT ON COLUMN links.theme_id IS 'Reference to user theme';

COMMENT ON TABLE user_themes IS 'User-created custom themes';
COMMENT ON TABLE brand_kits IS 'Industry-specific brand kit presets';

-- Insert default brand kits
INSERT INTO brand_kits (name, description, industry, colors, gradients, typography, animations, preview_links) VALUES
(
    'Tech Startup',
    'Modern, clean design perfect for technology companies and startups',
    'tech',
    '{"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#06B6D4", "text": "#FFFFFF", "background": "#F8FAFC"}',
    '[{"name": "Blue Ocean", "start": "#3B82F6", "end": "#06B6D4", "direction": "to-r"}, {"name": "Deep Tech", "start": "#1E40AF", "end": "#3730A3", "direction": "to-br"}]',
    '{"primary_font": "Inter", "secondary_font": "JetBrains Mono", "font_weights": [400, 500, 600, 700]}',
    '{"hover_effects": ["lift", "glow"], "entrance_animations": ["slide", "glow"]}',
    '[{"title": "Our Platform", "style": {"gradient": "blue-ocean", "hover": "lift"}}, {"title": "API Docs", "style": {"gradient": "deep-tech", "hover": "glow"}}]'
),
(
    'Fashion Brand',
    'Elegant and stylish design for fashion and lifestyle brands',
    'fashion',
    '{"primary": "#EC4899", "secondary": "#BE185D", "accent": "#F59E0B", "text": "#FFFFFF", "background": "#FDF2F8"}',
    '[{"name": "Rose Gold", "start": "#EC4899", "end": "#F59E0B", "direction": "to-r"}, {"name": "Deep Rose", "start": "#BE185D", "end": "#831843", "direction": "to-br"}]',
    '{"primary_font": "Poppins", "secondary_font": "Playfair Display", "font_weights": [300, 400, 500, 600, 700]}',
    '{"hover_effects": ["scale", "glow"], "entrance_animations": ["bounce", "glow"]}',
    '[{"title": "New Collection", "style": {"gradient": "rose-gold", "hover": "scale"}}, {"title": "Lookbook", "style": {"gradient": "deep-rose", "hover": "glow"}}]'
),
(
    'Food & Restaurant',
    'Warm, inviting colors perfect for restaurants and food businesses',
    'food',
    '{"primary": "#F59E0B", "secondary": "#D97706", "accent": "#EF4444", "text": "#FFFFFF", "background": "#FEF7ED"}',
    '[{"name": "Sunset Spice", "start": "#F59E0B", "end": "#EF4444", "direction": "to-r"}, {"name": "Golden Hour", "start": "#D97706", "end": "#B45309", "direction": "to-br"}]',
    '{"primary_font": "Nunito", "secondary_font": "Dancing Script", "font_weights": [400, 500, 600, 700, 800]}',
    '{"hover_effects": ["bounce", "shadow"], "entrance_animations": ["pulse", "bounce"]}',
    '[{"title": "View Menu", "style": {"gradient": "sunset-spice", "hover": "bounce"}}, {"title": "Order Now", "style": {"gradient": "golden-hour", "hover": "shadow"}}]'
),
(
    'Fitness & Health',
    'Energetic design for fitness, health, and wellness brands',
    'fitness',
    '{"primary": "#10B981", "secondary": "#059669", "accent": "#06B6D4", "text": "#FFFFFF", "background": "#F0FDF4"}',
    '[{"name": "Fresh Energy", "start": "#10B981", "end": "#06B6D4", "direction": "to-r"}, {"name": "Deep Forest", "start": "#059669", "end": "#047857", "direction": "to-br"}]',
    '{"primary_font": "Roboto", "secondary_font": "Oswald", "font_weights": [400, 500, 600, 700, 800]}',
    '{"hover_effects": ["pulse", "scale"], "entrance_animations": ["bounce", "pulse"]}',
    '[{"title": "Workout Plans", "style": {"gradient": "fresh-energy", "hover": "pulse"}}, {"title": "Join Now", "style": {"gradient": "deep-forest", "hover": "scale"}}]'
);

-- Update the themes table to support user-created themes
ALTER TABLE themes 
ADD COLUMN is_user_created BOOLEAN DEFAULT FALSE,
ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add index for user themes
CREATE INDEX idx_themes_user_created ON themes(user_id, is_user_created);

-- Add foreign key constraint for theme_id in links table
ALTER TABLE links 
ADD CONSTRAINT fk_links_theme_id 
FOREIGN KEY (theme_id) REFERENCES user_themes(id) ON DELETE SET NULL; 