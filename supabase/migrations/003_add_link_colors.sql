-- Add color customization fields to links table
ALTER TABLE links 
ADD COLUMN button_color TEXT DEFAULT NULL,
ADD COLUMN text_color TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN links.button_color IS 'Hex color code for the link button background';
COMMENT ON COLUMN links.text_color IS 'Hex color code for the link text color';

-- Update existing links with default colors if needed
-- This is optional - existing links will use theme defaults
-- UPDATE links SET 
--   button_color = '#8B5CF6',
--   text_color = '#FFFFFF' 
-- WHERE button_color IS NULL AND text_color IS NULL; 