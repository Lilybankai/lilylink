-- Create organizations system for multi-profile and agency features
-- This enables agencies to manage multiple client profiles

-- Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_tier TEXT DEFAULT 'agency',
    max_profiles INTEGER DEFAULT 10,
    custom_branding JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_org_slug CHECK (slug ~ '^[a-zA-Z0-9_-]+$' AND length(slug) >= 3 AND length(slug) <= 30),
    CONSTRAINT valid_org_subscription_tier CHECK (subscription_tier IN ('agency', 'enterprise')),
    CONSTRAINT valid_max_profiles CHECK (max_profiles > 0 AND max_profiles <= 1000)
);

-- Create organization_members table for team collaboration
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_member_role CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    CONSTRAINT unique_org_member UNIQUE(organization_id, user_id)
);

-- Create managed_profiles table to track which profiles are managed by organizations
CREATE TABLE managed_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES link_pages(id) ON DELETE CASCADE NOT NULL,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    access_level TEXT DEFAULT 'edit',
    client_name TEXT,
    client_email TEXT,
    client_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_access_level CHECK (access_level IN ('view', 'edit', 'admin')),
    CONSTRAINT unique_managed_profile UNIQUE(organization_id, profile_id)
);

-- Create organization_invites table for team invitations
CREATE TABLE organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_invite_role CHECK (role IN ('admin', 'member', 'viewer')),
    CONSTRAINT valid_email CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Organization owners can manage their organizations" ON organizations
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Organization members can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organizations.id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

-- RLS Policies for organization_members
CREATE POLICY "Organization owners can manage members" ON organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organizations 
            WHERE id = organization_members.organization_id 
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can manage members" ON organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN organizations o ON o.id = om.organization_id
            WHERE om.organization_id = organization_members.organization_id 
            AND om.user_id = auth.uid() 
            AND om.role IN ('owner', 'admin')
            AND om.is_active = true
        )
    );

CREATE POLICY "Members can view other members" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_members.organization_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

-- RLS Policies for managed_profiles
CREATE POLICY "Organization members can view managed profiles" ON managed_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = managed_profiles.organization_id 
            AND user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Organization admins can manage profiles" ON managed_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = managed_profiles.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- RLS Policies for organization_invites
CREATE POLICY "Organization admins can manage invites" ON organization_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_invites.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- Create indexes for performance
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_role ON organization_members(role);
CREATE INDEX idx_managed_profiles_org_id ON managed_profiles(organization_id);
CREATE INDEX idx_managed_profiles_profile_id ON managed_profiles(profile_id);
CREATE INDEX idx_managed_profiles_manager_id ON managed_profiles(manager_id);
CREATE INDEX idx_organization_invites_token ON organization_invites(token);
CREATE INDEX idx_organization_invites_email ON organization_invites(email);

-- Create updated_at triggers
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at 
    BEFORE UPDATE ON organization_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_profiles_updated_at 
    BEFORE UPDATE ON managed_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically add organization owner as a member
CREATE OR REPLACE FUNCTION add_organization_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', true, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add owner as member when organization is created
CREATE TRIGGER on_organization_created
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION add_organization_owner_as_member();

-- Function to generate invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to check organization profile limits
CREATE OR REPLACE FUNCTION check_organization_profile_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Get current count of managed profiles
    SELECT COUNT(*) INTO current_count
    FROM managed_profiles 
    WHERE organization_id = NEW.organization_id AND is_active = true;
    
    -- Get max allowed profiles for this organization
    SELECT max_profiles INTO max_allowed
    FROM organizations 
    WHERE id = NEW.organization_id;
    
    -- Check if adding this profile would exceed the limit
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Organization has reached its maximum profile limit of %', max_allowed;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce profile limits
CREATE TRIGGER enforce_organization_profile_limit
    BEFORE INSERT ON managed_profiles
    FOR EACH ROW EXECUTE FUNCTION check_organization_profile_limit();