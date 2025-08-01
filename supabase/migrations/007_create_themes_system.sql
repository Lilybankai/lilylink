-- Create themes table for predefined theme templates
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL, -- minimal, vibrant, professional, creative
    description TEXT,
    preview_image_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB NOT NULL, -- Complete theme configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_theme_category CHECK (category IN ('minimal', 'vibrant', 'professional', 'creative'))
);

-- Create user_themes table for user customizations
CREATE TABLE user_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    name TEXT NOT NULL, -- User-defined name for their custom theme
    is_default BOOLEAN DEFAULT FALSE, -- Default theme for new link pages
    custom_config JSONB DEFAULT '{}', -- User's customizations on top of base theme
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add theme customization columns to link_pages
ALTER TABLE link_pages ADD COLUMN user_theme_id UUID REFERENCES user_themes(id) ON DELETE SET NULL;

-- Add comprehensive theme customization columns
ALTER TABLE link_pages ADD COLUMN theme_config JSONB DEFAULT '{}';

-- Update the existing background columns to be more comprehensive
ALTER TABLE link_pages ADD COLUMN background_config JSONB DEFAULT '{}';
ALTER TABLE link_pages ADD COLUMN typography_config JSONB DEFAULT '{}';
ALTER TABLE link_pages ADD COLUMN layout_config JSONB DEFAULT '{}';
ALTER TABLE link_pages ADD COLUMN brand_config JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX idx_themes_category ON themes(category);
CREATE INDEX idx_themes_is_active ON themes(is_active);
CREATE INDEX idx_user_themes_user_id ON user_themes(user_id);
CREATE INDEX idx_user_themes_is_default ON user_themes(user_id, is_default);
CREATE INDEX idx_link_pages_user_theme_id ON link_pages(user_theme_id);

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;

-- Themes policies (public read for active themes)
CREATE POLICY "Anyone can view active themes" ON themes
    FOR SELECT USING (is_active = true);

-- User themes policies
CREATE POLICY "Users can view their own themes" ON user_themes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own themes" ON user_themes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes" ON user_themes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes" ON user_themes
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_themes_updated_at 
    BEFORE UPDATE ON themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_themes_updated_at 
    BEFORE UPDATE ON user_themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default theme per user
CREATE OR REPLACE FUNCTION ensure_single_default_theme()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a theme as default, unset all other default themes for this user
    IF NEW.is_default = true THEN
        UPDATE user_themes 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_theme_trigger
    BEFORE INSERT OR UPDATE ON user_themes
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_theme();

-- Insert default themes
INSERT INTO themes (name, display_name, category, description, config) VALUES
-- Minimal Theme
('minimal-clean', 'Minimal Clean', 'minimal', 'Clean and simple design with plenty of white space', '{
    "background": {
        "type": "solid",
        "value": "#ffffff"
    },
    "typography": {
        "fontFamily": "Inter",
        "titleSize": "2xl",
        "titleWeight": "700",
        "titleColor": "#1f2937",
        "descriptionSize": "base",
        "descriptionColor": "#6b7280"
    },
    "links": {
        "backgroundColor": "#f9fafb",
        "textColor": "#1f2937",
        "borderRadius": "12px",
        "borderWidth": "1px",
        "borderColor": "#e5e7eb",
        "hoverEffect": "subtle"
    },
    "layout": {
        "maxWidth": "400px",
        "spacing": "normal",
        "alignment": "center"
    }
}'),

-- Vibrant Theme
('vibrant-gradient', 'Vibrant Gradient', 'vibrant', 'Bold gradients and vibrant colors for maximum impact', '{
    "background": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    "typography": {
        "fontFamily": "Poppins",
        "titleSize": "3xl",
        "titleWeight": "800",
        "titleColor": "#ffffff",
        "descriptionSize": "lg",
        "descriptionColor": "#ffffff"
    },
    "links": {
        "backgroundColor": "rgba(255, 255, 255, 0.95)",
        "textColor": "#1f2937",
        "borderRadius": "16px",
        "borderWidth": "0px",
        "hoverEffect": "scale",
        "shadow": "lg"
    },
    "layout": {
        "maxWidth": "420px",
        "spacing": "relaxed",
        "alignment": "center"
    }
}'),

-- Professional Theme
('professional-corporate', 'Professional Corporate', 'professional', 'Clean and trustworthy design for business use', '{
    "background": {
        "type": "solid",
        "value": "#f8fafc"
    },
    "typography": {
        "fontFamily": "Inter",
        "titleSize": "2xl",
        "titleWeight": "600",
        "titleColor": "#1e293b",
        "descriptionSize": "base",
        "descriptionColor": "#475569"
    },
    "links": {
        "backgroundColor": "#ffffff",
        "textColor": "#1e293b",
        "borderRadius": "8px",
        "borderWidth": "1px",
        "borderColor": "#cbd5e1",
        "hoverEffect": "border",
        "shadow": "sm"
    },
    "layout": {
        "maxWidth": "480px",
        "spacing": "normal",
        "alignment": "center"
    }
}'),

-- Creative Theme
('creative-artistic', 'Creative Artistic', 'creative', 'Unique and artistic design for creative professionals', '{
    "background": {
        "type": "gradient",
        "value": "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)"
    },
    "typography": {
        "fontFamily": "Poppins",
        "titleSize": "3xl",
        "titleWeight": "700",
        "titleColor": "#ffffff",
        "descriptionSize": "lg",
        "descriptionColor": "#ffffff"
    },
    "links": {
        "backgroundColor": "rgba(255, 255, 255, 0.9)",
        "textColor": "#2d3748",
        "borderRadius": "20px",
        "borderWidth": "0px",
        "hoverEffect": "glow",
        "shadow": "xl"
    },
    "layout": {
        "maxWidth": "400px",
        "spacing": "relaxed",
        "alignment": "center"
    }
}') 