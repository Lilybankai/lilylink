-- Add icon_color column to links table
ALTER TABLE links 
ADD COLUMN icon_color TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN links.icon_color IS 'Icon color in hex format for link icons'; 