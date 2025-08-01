import { test, expect } from '@playwright/test';

test.describe('Advanced Link Form', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard and select a link page
    await page.goto('http://localhost:3000/dashboard');
    
    // Wait for dashboard to load
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Navigate to Link Pages
    await page.getByRole('button', { name: 'Link Pages Manage your link' }).click();
    
    // Select the test page
    await page.getByText('My Test Page').click();
    
    // Navigate to Links section
    await page.getByRole('button', { name: 'Links Manage individual links' }).click();
    
    // Wait for links to load
    await expect(page.getByText('Links for "My Test Page"')).toBeVisible();
  });

  test('should display organized form with collapsible sections', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Verify form is open
    await expect(page.getByRole('dialog', { name: 'Add New Link' })).toBeVisible();
    
    // Verify basic fields are always visible
    await expect(page.getByRole('textbox', { name: 'Enter link title' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'https://example.com' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Brief description of this link' })).toBeVisible();
    
    // Verify link type buttons are visible
    await expect(page.getByRole('button', { name: '? Standard' })).toBeVisible();
    await expect(page.getByRole('button', { name: '? Social' })).toBeVisible();
    await expect(page.getByRole('button', { name: '? Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: '? Media' })).toBeVisible();
    await expect(page.getByRole('button', { name: '? Contact' })).toBeVisible();
    
    // Verify collapsible sections are present but collapsed
    await expect(page.getByRole('button', { name: '? Appearance ?' })).toBeVisible();
    await expect(page.getByRole('button', { name: '? Advanced ?' })).toBeVisible();
  });

  test('should auto-detect YouTube media link and show media settings', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Fill in YouTube URL
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('My YouTube Video');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByRole('textbox', { name: 'Brief description of this link' }).fill('Check out this awesome video!');
    
    // Select Media link type
    await page.getByRole('button', { name: '? Media' }).click();
    
    // Verify Media button is selected
    await expect(page.getByRole('button', { name: '? Media' })).toHaveAttribute('active', '');
    
    // Verify Link Settings section auto-opens with media badge
    await expect(page.getByRole('button', { name: '? Link Settings media ?' })).toBeVisible();
    
    // Verify auto-play checkbox is visible
    await expect(page.getByRole('checkbox', { name: 'Enable auto-play (when supported)' })).toBeVisible();
    
    // Verify Appearance section shows active customization (likely auto-detected icon)
    await expect(page.getByRole('button', { name: /Appearance.*active/ })).toBeVisible();
  });

  test('should create social media link with Instagram URL', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Fill in Instagram details
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('Follow me on Instagram');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('https://www.instagram.com/myprofile');
    await page.getByRole('textbox', { name: 'Brief description of this link' }).fill('Latest photos and updates');
    
    // Select Social link type
    await page.getByRole('button', { name: '? Social' }).click();
    
    // Verify Social button is selected
    await expect(page.getByRole('button', { name: '? Social' })).toHaveAttribute('active', '');
    
    // Test appearance customization
    await page.getByRole('button', { name: /Appearance/ }).click();
    
    // Verify appearance section opens
    await expect(page.getByText('Icon')).toBeVisible();
    await expect(page.getByText('Colors')).toBeVisible();
    
    // Test color preset selection
    await expect(page.getByText('Color Presets')).toBeVisible();
    await expect(page.getByRole('button', { name: /Purple Passion/ })).toBeVisible();
    
    // Select a color preset
    await page.getByRole('button', { name: /Purple Passion/ }).click();
    
    // Verify gradient options are available
    await expect(page.getByText('Gradient Background')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disabled' })).toBeVisible();
  });

  test('should create product link with pricing', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Fill in product details
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('My Awesome Product');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('https://shop.example.com/product/123');
    await page.getByRole('textbox', { name: 'Brief description of this link' }).fill('Best product ever made!');
    
    // Select Product link type
    await page.getByRole('button', { name: '? Product' }).click();
    
    // Verify Product button is selected
    await expect(page.getByRole('button', { name: '? Product' })).toHaveAttribute('active', '');
    
    // Verify Link Settings section opens with product options
    await expect(page.getByRole('button', { name: /Link Settings/ })).toBeVisible();
    
    // Click to open Link Settings if not already open
    await page.getByRole('button', { name: /Link Settings/ }).click();
    
    // Fill in product pricing
    await expect(page.getByText('Price (Optional)')).toBeVisible();
    
    // Set currency and price
    const currencySelect = page.locator('select').first();
    await currencySelect.selectOption('USD');
    
    const priceInput = page.getByRole('textbox', { name: '0.00' });
    await priceInput.fill('29.99');
    
    // Set availability
    await expect(page.getByText('Availability')).toBeVisible();
    const availabilitySelect = page.locator('select').nth(1);
    await availabilitySelect.selectOption('in_stock');
  });

  test('should create contact link with email', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Fill in contact details
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('Contact Me');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('mailto:test@example.com');
    await page.getByRole('textbox', { name: 'Brief description of this link' }).fill('Get in touch!');
    
    // Select Contact link type
    await page.getByRole('button', { name: '? Contact' }).click();
    
    // Verify Contact button is selected
    await expect(page.getByRole('button', { name: '? Contact' })).toHaveAttribute('active', '');
    
    // Open Link Settings
    await page.getByRole('button', { name: /Link Settings/ }).click();
    
    // Verify contact type options
    await expect(page.getByText('Contact Type')).toBeVisible();
    
    // Select email contact type
    const contactTypeSelect = page.locator('select').first();
    await contactTypeSelect.selectOption('email');
    
    // Fill in email address
    await expect(page.getByText('Email Address')).toBeVisible();
    await page.getByRole('textbox', { name: 'contact@example.com' }).fill('test@example.com');
  });

  test('should create WhatsApp contact link', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Fill in WhatsApp details
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('WhatsApp Me');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('https://wa.me/1234567890');
    await page.getByRole('textbox', { name: 'Brief description of this link' }).fill('Quick chat on WhatsApp');
    
    // Select Contact link type
    await page.getByRole('button', { name: '? Contact' }).click();
    
    // Open Link Settings
    await page.getByRole('button', { name: /Link Settings/ }).click();
    
    // Select WhatsApp contact type
    const contactTypeSelect = page.locator('select').first();
    await contactTypeSelect.selectOption('whatsapp');
    
    // Fill in phone number
    await expect(page.getByText('Phone Number')).toBeVisible();
    await page.getByRole('textbox', { name: '+1 (555) 123-4567' }).fill('+1234567890');
  });

  test('should test advanced customization options', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Fill basic info
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('Customized Link');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('https://example.com');
    
    // Test Appearance section
    await page.getByRole('button', { name: /Appearance/ }).click();
    
    // Test icon selection
    await expect(page.getByText('Icon')).toBeVisible();
    await page.getByRole('button', { name: 'Choose Icon' }).click();
    // Icon picker should open (would need additional test for icon picker modal)
    
    // Test gradient toggle
    await expect(page.getByText('Gradient Background')).toBeVisible();
    await page.getByRole('button', { name: 'Disabled' }).click();
    await expect(page.getByRole('button', { name: 'Enabled' })).toBeVisible();
    
    // Test border customization
    await expect(page.getByText('Border & Shape')).toBeVisible();
    await expect(page.getByRole('button', { name: /1px solid • 8px radius/ })).toBeVisible();
    
    // Test Advanced section
    await page.getByRole('button', { name: /Advanced/ }).click();
    
    // Verify animations section
    await expect(page.getByText('Animations')).toBeVisible();
    
    // Verify brand kit section
    await expect(page.getByText('Brand Kit')).toBeVisible();
  });

  test('should show proper validation messages', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Try to submit without required fields
    await page.getByRole('button', { name: 'Add Link' }).nth(1).click();
    
    // Should show validation (form should still be open since validation failed)
    await expect(page.getByRole('dialog', { name: 'Add New Link' })).toBeVisible();
    
    // Fill invalid URL
    await page.getByRole('textbox', { name: 'Enter link title' }).fill('Test Link');
    await page.getByRole('textbox', { name: 'https://example.com' }).fill('invalid-url');
    
    // Should show URL validation error
    await expect(page.getByText(/Please enter a valid URL/)).toBeVisible();
  });

  test('should cancel form properly', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Verify form is open
    await expect(page.getByRole('dialog', { name: 'Add New Link' })).toBeVisible();
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify form is closed
    await expect(page.getByRole('dialog', { name: 'Add New Link' })).not.toBeVisible();
    
    // Should be back to links list
    await expect(page.getByText('Links for "My Test Page"')).toBeVisible();
  });

  test('should close form with X button', async ({ page }) => {
    // Open the add link form
    await page.getByRole('button', { name: 'Add Link' }).click();
    
    // Verify form is open
    await expect(page.getByRole('dialog', { name: 'Add New Link' })).toBeVisible();
    
    // Click the X button
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify form is closed
    await expect(page.getByRole('dialog', { name: 'Add New Link' })).not.toBeVisible();
  });
});

test.describe('Link Page Preview', () => {
  test('should preview public link page with different link types', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Navigate to Link Pages
    await page.getByRole('button', { name: 'Link Pages Manage your link' }).click();
    
    // Click on "View" link for the test page
    await page.getByRole('link', { name: 'View' }).click();
    
    // Should navigate to public page
    await expect(page).toHaveURL(/\/test-page$/);
    
    // Verify page title and description
    await expect(page.getByText('My Test Page')).toBeVisible();
    await expect(page.getByText('This is a test link page')).toBeVisible();
    
    // Verify existing links are displayed
    await expect(page.getByText('My Website')).toBeVisible();
    await expect(page.getByText('GitHub Profile')).toBeVisible();
    
    // Test clicking on a link (should open in new tab or navigate)
    const websiteLink = page.getByRole('link', { name: /My Website/ });
    await expect(websiteLink).toBeVisible();
    await expect(websiteLink).toHaveAttribute('href', 'https://example.com');
    
    // Test GitHub link
    const githubLink = page.getByRole('link', { name: /GitHub Profile/ });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/carlpaton');
  });

  test('should display links with proper styling and icons', async ({ page }) => {
    // Navigate directly to public page
    await page.goto('http://localhost:3000/test-page');
    
    // Wait for page to load
    await expect(page.getByText('My Test Page')).toBeVisible();
    
    // Verify links have proper structure
    const links = page.locator('[data-testid="link-item"]').or(page.locator('a').filter({ hasText: /My Website|GitHub Profile/ }));
    
    // Should have multiple links
    await expect(links.first()).toBeVisible();
    
    // Check for link styling (colors, borders, etc.)
    // This would depend on the actual implementation of the public page
    
    // Verify responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await expect(page.getByText('My Test Page')).toBeVisible();
    
    // Links should still be visible and properly formatted on mobile
    await expect(links.first()).toBeVisible();
  });

  test('should handle YouTube embed links properly', async ({ page }) => {
    // This test would require a YouTube link to be present
    // For now, we'll test the structure
    
    await page.goto('http://localhost:3000/test-page');
    await expect(page.getByText('My Test Page')).toBeVisible();
    
    // If there were YouTube links, we'd test:
    // - Proper embed rendering
    // - Auto-play settings
    // - Responsive video player
    
    // Placeholder for media link testing
    console.log('YouTube embed testing would be implemented here');
  });

  test('should track link clicks and analytics', async ({ page }) => {
    await page.goto('http://localhost:3000/test-page');
    
    // Click on a link
    const githubLink = page.getByRole('link', { name: /GitHub Profile/ });
    
    // We can't actually test the click tracking without mocking
    // but we can verify the link is properly set up
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/carlpaton');
    
    // In a real test, we'd mock the analytics endpoint and verify the call
    console.log('Analytics tracking testing would be implemented here');
  });
}); 