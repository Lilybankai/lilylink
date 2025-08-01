import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']).optional(),
  permissions: z.record(z.any()).optional(),
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

// GET /api/organizations/[id]/members/[memberId] - Get member details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const memberId = params.memberId;

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

    // Get member details
    const { data: member, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        user_id,
        role,
        permissions,
        is_active,
        invited_at,
        joined_at,
        created_at,
        updated_at,
        profiles!inner (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          location,
          website_url
        )
      `)
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: member,
      success: true
    });

  } catch (error) {
    console.error('Member GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id]/members/[memberId] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const memberId = params.memberId;

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
    const validatedData = updateMemberSchema.parse(body);

    // Get current member to check if it's the owner
    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent changing owner role or deactivating owner
    if (currentMember.role === 'owner') {
      if (validatedData.role && validatedData.role !== 'owner') {
        return NextResponse.json(
          { error: 'Cannot change owner role' },
          { status: 400 }
        );
      }
      if (validatedData.is_active === false) {
        return NextResponse.json(
          { error: 'Cannot deactivate organization owner' },
          { status: 400 }
        );
      }
    }

    // Update member
    const { data: member, error: updateError } = await supabase
      .from('organization_members')
      .update(validatedData)
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .select(`
        id,
        user_id,
        role,
        permissions,
        is_active,
        invited_at,
        joined_at,
        created_at,
        updated_at,
        profiles!inner (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating member:', updateError);
      return NextResponse.json(
        { error: 'Failed to update member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: member,
      success: true
    });

  } catch (error) {
    console.error('Member PUT error:', error);
    
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

// DELETE /api/organizations/[id]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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
    const memberId = params.memberId;

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

    // Get current member to check if it's the owner
    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Prevent removing owner
    if (currentMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove organization owner' },
        { status: 400 }
      );
    }

    // Soft delete member (set is_active to false)
    const { error: deleteError } = await supabase
      .from('organization_members')
      .update({ is_active: false })
      .eq('id', memberId)
      .eq('organization_id', organizationId);

    if (deleteError) {
      console.error('Error removing member:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Member DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}