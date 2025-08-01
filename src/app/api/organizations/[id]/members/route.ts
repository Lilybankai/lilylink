import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schemas
const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
  permissions: z.record(z.any()).optional().default({})
});

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

// GET /api/organizations/[id]/members - List organization members
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

    // Get organization members
    const { data: members, error } = await supabase
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
          bio
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: members || [],
      success: true
    });

  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/members - Invite new member
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
    const validatedData = inviteMemberSchema.parse(body);

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id, is_active')
      .eq('organization_id', organizationId)
      .eq('profiles.email', validatedData.email)
      .single();

    if (existingMember) {
      const message = existingMember.is_active 
        ? 'User is already a member of this organization'
        : 'User was previously a member. Consider reactivating their membership.';
      
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from('organization_invites')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', validatedData.email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const { data: invite, error: inviteError } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: organizationId,
        email: validatedData.email,
        role: validatedData.role,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // TODO: Send invitation email
    // This would typically integrate with an email service like SendGrid, Resend, etc.
    
    return NextResponse.json({
      data: {
        ...invite,
        invite_url: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`
      },
      success: true,
      message: 'Invitation sent successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Members POST error:', error);
    
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