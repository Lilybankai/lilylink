import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const addManagedProfileSchema = z.object({
  profile_id: z.string().uuid('Invalid profile ID'),
  manager_id: z.string().uuid('Invalid manager ID').optional(),
  access_level: z.enum(['view', 'edit', 'admin']),
  client_name: z.string().optional(),
  client_email: z.string().email().optional(),
  client_notes: z.string().optional()
});

// Helper function to check if user has permission
async function checkOrganizationPermission(
  supabase: any,
  userId: string,
  organizationId: string,
  requiredRoles: string[] = ['owner', 'admin']
) {
  const { data: member } = await supabase
    .from('organization_members')
    .select('role, is_active')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return member && requiredRoles.includes(member.role);
}

// GET /api/organizations/[id]/managed-profiles - List managed profiles
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const organizationId = params.id;

    // Check if user has access to this organization
    const hasAccess = await checkOrganizationPermission(
      supabase,
      user.id,
      organizationId,
      ['owner', 'admin', 'member', 'viewer']
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get managed profiles
    const { data: managedProfiles, error } = await supabase
      .from('managed_profiles')
      .select(`
        id,
        profile_id,
        manager_id,
        access_level,
        client_name,
        client_email,
        client_notes,
        is_active,
        created_at,
        updated_at,
        link_pages!inner (
          id,
          slug,
          title,
          description,
          is_active,
          created_at,
          updated_at
        ),
        manager:profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching managed profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch managed profiles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: managedProfiles || [],
      success: true
    });

  } catch (error) {
    console.error('Managed profiles GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/managed-profiles - Add managed profile
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const organizationId = params.id;

    // Check if user has admin permission
    const hasPermission = await checkOrganizationPermission(
      supabase,
      user.id,
      organizationId,
      ['owner', 'admin']
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = addManagedProfileSchema.parse(body);

    // Check if profile exists and is not already managed by this organization
    const { data: existingProfile } = await supabase
      .from('link_pages')
      .select('id, title, user_id')
      .eq('id', validatedData.profile_id)
      .single();

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if profile is already managed by this organization
    const { data: existingManaged } = await supabase
      .from('managed_profiles')
      .select('id, is_active')
      .eq('organization_id', organizationId)
      .eq('profile_id', validatedData.profile_id)
      .single();

    if (existingManaged) {
      const message = existingManaged.is_active 
        ? 'Profile is already managed by this organization'
        : 'Profile was previously managed. Consider reactivating it.';
      
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    // Verify manager exists if specified
    if (validatedData.manager_id) {
      const { data: manager } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', validatedData.manager_id)
        .eq('is_active', true)
        .single();

      if (!manager) {
        return NextResponse.json(
          { error: 'Specified manager is not a member of this organization' },
          { status: 400 }
        );
      }
    }

    // Check organization profile limit
    const { data: organization } = await supabase
      .from('organizations')
      .select('max_profiles')
      .eq('id', organizationId)
      .single();

    const { count: currentCount } = await supabase
      .from('managed_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (organization && currentCount !== null && currentCount >= organization.max_profiles) {
      return NextResponse.json(
        { error: `Organization has reached its maximum profile limit of ${organization.max_profiles}` },
        { status: 400 }
      );
    }

    // Add managed profile
    const { data: managedProfile, error: createError } = await supabase
      .from('managed_profiles')
      .insert({
        ...validatedData,
        organization_id: organizationId
      })
      .select(`
        id,
        profile_id,
        manager_id,
        access_level,
        client_name,
        client_email,
        client_notes,
        is_active,
        created_at,
        updated_at,
        link_pages!inner (
          id,
          slug,
          title,
          description,
          is_active
        ),
        manager:profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (createError) {
      console.error('Error adding managed profile:', createError);
      return NextResponse.json(
        { error: 'Failed to add managed profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: managedProfile,
      success: true,
      message: 'Profile added to organization successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Managed profiles POST error:', error);
    
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