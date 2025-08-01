import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, underscores, and hyphens'),
  subscription_tier: z.enum(['agency', 'enterprise']).optional().default('agency'),
  max_profiles: z.number().min(1).max(1000).optional().default(10),
  custom_branding: z.record(z.any()).optional().default({}),
  settings: z.record(z.any()).optional().default({})
});

// GET /api/organizations - List user's organizations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get organizations where user is a member
    const { data: organizations, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        is_active,
        joined_at,
        organizations!inner (
          id,
          name,
          slug,
          owner_id,
          subscription_tier,
          max_profiles,
          custom_branding,
          settings,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('organizations.is_active', true);

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    // Transform the data to flatten the organization details
    const transformedOrganizations = organizations?.map(item => ({
      ...item.organizations,
      member_role: item.role,
      member_joined_at: item.joined_at
    })) || [];

    return NextResponse.json({
      data: transformedOrganizations,
      success: true
    });

  } catch (error) {
    console.error('Organizations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createOrganizationSchema.parse(body);

    // Check if slug is available
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization slug is already taken' },
        { status: 400 }
      );
    }

    // Create organization
    const { data: organization, error: createError } = await supabase
      .from('organizations')
      .insert({
        ...validatedData,
        owner_id: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating organization:', createError);
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: organization,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Organizations POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}