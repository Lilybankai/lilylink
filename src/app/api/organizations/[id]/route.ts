import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  max_profiles: z.number().min(1).max(1000).optional(),
  custom_branding: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().optional()
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

// GET /api/organizations/[id] - Get organization details
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

    // Get organization with members and managed profiles
    const { data: organization, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members (
          id,
          user_id,
          role,
          permissions,
          is_active,
          invited_at,
          joined_at
        ),
        managed_profiles (
          id,
          profile_id,
          manager_id,
          access_level,
          client_name,
          client_email,
          client_notes,
          is_active,
          created_at
        )
      `)
      .eq('id', organizationId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: organization,
      success: true
    });

  } catch (error) {
    console.error('Organization GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
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
    const validatedData = updateOrganizationSchema.parse(body);

    // Check slug availability if slug is being updated
    if (validatedData.slug) {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', organizationId)
        .single();

      if (existingOrg) {
        return NextResponse.json(
          { error: 'Organization slug is already taken' },
          { status: 400 }
        );
      }
    }

    // Update organization
    const { data: organization, error: updateError } = await supabase
      .from('organizations')
      .update(validatedData)
      .eq('id', organizationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating organization:', updateError);
      return NextResponse.json(
        { error: 'Failed to update organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: organization,
      success: true
    });

  } catch (error) {
    console.error('Organization PUT error:', error);
    
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

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
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

    // Check if user is the owner
    const hasPermission = await checkOrganizationPermission(
      supabase,
      user.id,
      organizationId,
      ['owner']
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only organization owners can delete organizations' },
        { status: 403 }
      );
    }

    // Soft delete organization (set is_active to false)
    const { error: deleteError } = await supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', organizationId);

    if (deleteError) {
      console.error('Error deleting organization:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully'
    });

  } catch (error) {
    console.error('Organization DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}