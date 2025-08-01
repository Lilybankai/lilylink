-- Create link_pages table (users can have multiple link pages)
CREATE TABLE link_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE, -- One primary page per user
    theme_id UUID, -- Will reference themes table later
    custom_css TEXT,
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    favicon_url TEXT,
    background_type TEXT DEFAULT 'gradient', -- gradient, solid, image, video
    background_value TEXT, -- color/gradient/url
    font_family TEXT DEFAULT 'Inter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_background_type CHECK (background_type IN ('gradient', 'solid', 'image', 'video')),
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-zA-Z0-9_-]+$' AND length(slug) >= 3 AND length(slug) <= 30)
);

-- Create links table
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES link_pages(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    thumbnail_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    link_type TEXT DEFAULT 'standard', -- standard, social, product, media, contact
    style_options JSONB DEFAULT '{}',
    schedule_start TIMESTAMP WITH TIME ZONE,
    schedule_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_link_type CHECK (link_type IN ('standard', 'social', 'product', 'media', 'contact')),
    CONSTRAINT valid_url CHECK (url ~ '^https?://'),
    CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- Create analytics tables
CREATE TABLE link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES link_pages(id) ON DELETE CASCADE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES link_pages(id) ON DELETE CASCADE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    referrer TEXT,
    session_duration INTEGER,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_link_pages_user_id ON link_pages(user_id);
CREATE INDEX idx_link_pages_slug ON link_pages(slug);
CREATE INDEX idx_link_pages_is_active ON link_pages(is_active);
CREATE INDEX idx_links_page_id ON links(page_id);
CREATE INDEX idx_links_display_order ON links(page_id, display_order);
CREATE INDEX idx_links_is_active ON links(is_active);
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX idx_page_views_page_id ON page_views(page_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_link_pages_updated_at BEFORE UPDATE ON link_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE link_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Link Pages Policies
CREATE POLICY "Users can view their own link pages" ON link_pages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own link pages" ON link_pages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own link pages" ON link_pages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own link pages" ON link_pages
    FOR DELETE USING (auth.uid() = user_id);

-- Public can view active link pages
CREATE POLICY "Anyone can view active link pages" ON link_pages
    FOR SELECT USING (is_active = true);

-- Links Policies
CREATE POLICY "Users can view links from their pages" ON links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = links.page_id 
            AND link_pages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert links to their pages" ON links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = links.page_id 
            AND link_pages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update links from their pages" ON links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = links.page_id 
            AND link_pages.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete links from their pages" ON links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = links.page_id 
            AND link_pages.user_id = auth.uid()
        )
    );

-- Public can view active links from active pages
CREATE POLICY "Anyone can view active links from active pages" ON links
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = links.page_id 
            AND link_pages.is_active = true
        )
    );

-- Analytics Policies (Users can only see their own analytics)
CREATE POLICY "Users can view analytics from their pages" ON link_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = link_clicks.page_id 
            AND link_pages.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert link clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view page views from their pages" ON page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM link_pages 
            WHERE link_pages.id = page_views.page_id 
            AND link_pages.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

-- Function to ensure only one primary page per user
CREATE OR REPLACE FUNCTION ensure_single_primary_page()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a page as primary, unset all other primary pages for this user
    IF NEW.is_primary = true THEN
        UPDATE link_pages 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_page_trigger
    BEFORE INSERT OR UPDATE ON link_pages
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_page();

-- Function to automatically create a primary page for new users
CREATE OR REPLACE FUNCTION create_default_link_page()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO link_pages (user_id, slug, title, description, is_primary)
    VALUES (
        NEW.id,
        NEW.username,
        NEW.display_name || '''s Links',
        'Welcome to my link page!',
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_link_page_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_link_page(); 