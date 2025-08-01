import { test, expect } from '@playwright/test';

test.describe('Organization Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Mock authentication - you may need to adjust this based on your auth setup
    await page.evaluate(() => {
      // Mock localStorage for authenticated user
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'testuser'
        }
      }));
    });
  });

  test('should display organizations page', async ({ page }) => {
    // Navigate to organizations page
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Check if the page loads correctly
    await expect(page.locator('h2')).toContainText('Organizations');
    await expect(page.locator('text=Manage your organizations and team collaboration')).toBeVisible();
  });

  test('should show create organization button', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Check for create organization button
    const createButton = page.locator('button:has-text("Create Organization")');
    await expect(createButton).toBeVisible();
  });

  test('should open create organization modal', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Click create organization button
    await page.click('button:has-text("Create Organization")');
    
    // Check if modal opens
    await expect(page.locator('text=Create New Organization')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter organization name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="organization-slug"]')).toBeVisible();
  });

  test('should validate organization form fields', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Open create modal
    await page.click('button:has-text("Create Organization")');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Organization")');
    
    // Check for validation errors
    await expect(page.locator('text=Organization name is required')).toBeVisible();
  });

  test('should auto-generate slug from organization name', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Open create modal
    await page.click('button:has-text("Create Organization")');
    
    // Type organization name
    await page.fill('input[placeholder="Enter organization name"]', 'Test Agency Inc');
    
    // Check if slug is auto-generated
    const slugInput = page.locator('input[placeholder="organization-slug"]');
    await expect(slugInput).toHaveValue('test-agency-inc');
  });

  test('should show slug availability check', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Open create modal
    await page.click('button:has-text("Create Organization")');
    
    // Type organization name to generate slug
    await page.fill('input[placeholder="Enter organization name"]', 'Unique Test Org');
    
    // Wait for slug availability check
    await page.waitForTimeout(1000);
    
    // Should show availability indicator (green check or red X)
    const availabilityIndicator = page.locator('.absolute.right-3 svg');
    await expect(availabilityIndicator).toBeVisible();
  });

  test('should handle organization creation flow', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Mock successful API response
    await page.route('**/api/organizations', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-org-id',
              name: 'Test Organization',
              slug: 'test-organization',
              owner_id: 'test-user-id',
              subscription_tier: 'agency',
              max_profiles: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
        });
      }
    });

    // Mock slug availability check
    await page.route('**/api/organizations/check-slug*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true })
      });
    });
    
    // Open create modal
    await page.click('button:has-text("Create Organization")');
    
    // Fill form
    await page.fill('input[placeholder="Enter organization name"]', 'Test Organization');
    await page.fill('input[type="number"]', '25'); // max_profiles
    
    // Submit form
    await page.click('button:has-text("Create Organization")');
    
    // Should show success and close modal
    await expect(page.locator('text=Create New Organization')).not.toBeVisible();
  });

  test('should display organization cards when organizations exist', async ({ page }) => {
    // Mock organizations API response
    await page.route('**/api/organizations', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'org-1',
                name: 'Test Agency',
                slug: 'test-agency',
                owner_id: 'test-user-id',
                subscription_tier: 'agency',
                max_profiles: 10,
                member_role: 'owner',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              {
                id: 'org-2',
                name: 'Client Corp',
                slug: 'client-corp',
                owner_id: 'other-user-id',
                subscription_tier: 'enterprise',
                max_profiles: 50,
                member_role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]
          })
        });
      }
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Check if organization cards are displayed
    await expect(page.locator('text=Test Agency')).toBeVisible();
    await expect(page.locator('text=@test-agency')).toBeVisible();
    await expect(page.locator('text=Client Corp')).toBeVisible();
    await expect(page.locator('text=@client-corp')).toBeVisible();
    
    // Check role badges
    await expect(page.locator('text=owner')).toBeVisible();
    await expect(page.locator('text=admin')).toBeVisible();
    
    // Check subscription tier badges
    await expect(page.locator('text=agency')).toBeVisible();
    await expect(page.locator('text=enterprise')).toBeVisible();
  });

  test('should navigate to organization dashboard when clicking organization card', async ({ page }) => {
    // Mock organizations list
    await page.route('**/api/organizations', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{
              id: 'org-1',
              name: 'Test Agency',
              slug: 'test-agency',
              owner_id: 'test-user-id',
              subscription_tier: 'agency',
              max_profiles: 10,
              member_role: 'owner',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]
          })
        });
      }
    });

    // Mock organization details
    await page.route('**/api/organizations/org-1', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'org-1',
              name: 'Test Agency',
              slug: 'test-agency',
              owner_id: 'test-user-id',
              subscription_tier: 'agency',
              max_profiles: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              organization_members: [
                {
                  id: 'member-1',
                  user_id: 'test-user-id',
                  role: 'owner',
                  is_active: true,
                  joined_at: new Date().toISOString(),
                  user: {
                    id: 'test-user-id',
                    username: 'testuser',
                    display_name: 'Test User'
                  }
                }
              ],
              managed_profiles: []
            }
          })
        });
      }
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Click on organization card
    await page.click('[data-testid="organization-card"]:has-text("Test Agency"), .group:has-text("Test Agency")');
    
    // Should show organization dashboard
    await expect(page.locator('h1:has-text("Test Agency")')).toBeVisible();
    await expect(page.locator('text=@test-agency')).toBeVisible();
    await expect(page.locator('text=Team Members')).toBeVisible();
    await expect(page.locator('text=Managed Profiles')).toBeVisible();
  });

  test('should display organization dashboard tabs', async ({ page }) => {
    // Mock organization details
    await page.route('**/api/organizations/org-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'org-1',
            name: 'Test Agency',
            slug: 'test-agency',
            owner_id: 'test-user-id',
            subscription_tier: 'agency',
            max_profiles: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_members: [],
            managed_profiles: []
          }
        })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Simulate selecting an organization (you may need to adjust this)
    await page.evaluate(() => {
      // Trigger organization selection programmatically
      window.dispatchEvent(new CustomEvent('selectOrganization', {
        detail: { id: 'org-1' }
      }));
    });

    // Check if tabs are visible
    await expect(page.locator('button:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button:has-text("Members")')).toBeVisible();
    await expect(page.locator('button:has-text("Managed Profiles")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();
  });

  test('should show invite member modal', async ({ page }) => {
    // Mock organization details
    await page.route('**/api/organizations/org-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'org-1',
            name: 'Test Agency',
            slug: 'test-agency',
            owner_id: 'test-user-id',
            subscription_tier: 'agency',
            max_profiles: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_members: [],
            managed_profiles: []
          }
        })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Navigate to organization dashboard (simulate)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('selectOrganization', {
        detail: { id: 'org-1' }
      }));
    });

    // Click invite member button
    await page.click('button:has-text("Invite Member")');
    
    // Check if invite modal opens
    await expect(page.locator('text=Invite Team Member')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // Role selector
  });

  test('should validate invite member form', async ({ page }) => {
    // Mock organization details
    await page.route('**/api/organizations/org-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'org-1',
            name: 'Test Agency',
            slug: 'test-agency',
            owner_id: 'test-user-id',
            subscription_tier: 'agency',
            max_profiles: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_members: [],
            managed_profiles: []
          }
        })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Navigate to organization dashboard
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('selectOrganization', {
        detail: { id: 'org-1' }
      }));
    });

    // Open invite modal
    await page.click('button:has-text("Invite Member")');
    
    // Try to submit without email
    await page.click('button:has-text("Send Invitation")');
    
    // Should show validation error
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should handle member invitation flow', async ({ page }) => {
    // Mock organization details
    await page.route('**/api/organizations/org-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'org-1',
            name: 'Test Agency',
            slug: 'test-agency',
            owner_id: 'test-user-id',
            subscription_tier: 'agency',
            max_profiles: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_members: [],
            managed_profiles: []
          }
        })
      });
    });

    // Mock invite API
    await page.route('**/api/organizations/org-1/members', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'invite-1',
              email: 'newmember@example.com',
              role: 'member',
              token: 'invite-token',
              invite_url: 'http://localhost:3000/invite/invite-token'
            },
            message: 'Invitation sent successfully'
          })
        });
      }
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Navigate to organization dashboard
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('selectOrganization', {
        detail: { id: 'org-1' }
      }));
    });

    // Open invite modal
    await page.click('button:has-text("Invite Member")');
    
    // Fill invite form
    await page.fill('input[type="email"]', 'newmember@example.com');
    await page.selectOption('select', 'member');
    
    // Submit invitation
    await page.click('button:has-text("Send Invitation")');
    
    // Should close modal and show success
    await expect(page.locator('text=Invite Team Member')).not.toBeVisible();
  });

  test('should display organization stats correctly', async ({ page }) => {
    // Mock organization with members and profiles
    await page.route('**/api/organizations/org-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'org-1',
            name: 'Test Agency',
            slug: 'test-agency',
            owner_id: 'test-user-id',
            subscription_tier: 'agency',
            max_profiles: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_members: [
              { id: '1', is_active: true, role: 'owner' },
              { id: '2', is_active: true, role: 'admin' },
              { id: '3', is_active: true, role: 'member' }
            ],
            managed_profiles: [
              { id: '1', is_active: true },
              { id: '2', is_active: true },
              { id: '3', is_active: false } // Inactive, shouldn't count
            ]
          }
        })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Navigate to organization dashboard
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('selectOrganization', {
        detail: { id: 'org-1' }
      }));
    });

    // Check stats cards
    await expect(page.locator('text=3').first()).toBeVisible(); // 3 team members
    await expect(page.locator('text=2/10')).toBeVisible(); // 2 active profiles out of 10 max
  });
});

test.describe('Organization Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/organizations', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Should show error message
    await expect(page.locator('text=Error loading organizations')).toBeVisible();
    await expect(page.locator('text=Internal server error')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should handle network errors', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/organizations', async (route) => {
      await route.abort('failed');
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Should show error state
    await expect(page.locator('text=Error loading organizations')).toBeVisible();
  });

  test('should show loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/organizations', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Should show loading skeleton
    await expect(page.locator('.animate-pulse')).toBeVisible();
  });
});

test.describe('Organization Permissions', () => {
  test('should show different UI based on user role', async ({ page }) => {
    // Mock organization where user is a viewer
    await page.route('**/api/organizations/org-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'org-1',
            name: 'Test Agency',
            slug: 'test-agency',
            owner_id: 'other-user-id', // Different owner
            subscription_tier: 'agency',
            max_profiles: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization_members: [
              {
                id: 'member-1',
                user_id: 'test-user-id',
                role: 'viewer', // User is just a viewer
                is_active: true
              }
            ],
            managed_profiles: []
          }
        })
      });
    });

    await page.goto('http://localhost:3000/dashboard/organizations');
    
    // Navigate to organization dashboard
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('selectOrganization', {
        detail: { id: 'org-1' }
      }));
    });

    // Viewer should not see invite button or settings tab
    await expect(page.locator('button:has-text("Invite Member")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Settings")')).not.toBeVisible();
  });
});