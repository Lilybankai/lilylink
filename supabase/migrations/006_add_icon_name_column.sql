-- Add icon_name column to links table
ALTER TABLE links 
ADD COLUMN icon_name TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN links.icon_name IS 'Icon name identifier for link icons (e.g., "github", "twitter", "instagram")'; 