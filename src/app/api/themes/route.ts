import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const CreateUserThemeSchema = z.object({
  name: z.string().min(1).max(100),
  theme_id: z.string().uuid().optional(),
  custom_config: z.object({}).passthrough().optional(),
  is_default: z.boolean().optional()
});

const UpdateThemeConfigSchema = z.object({
  background: z.object({
    type: z.enum(['solid', 'gradient', 'image', 'video']),
    value: z.string(),
    overlay: z.object({
      enabled: z.boolean(),
      color: z.string(),
      opacity: z.number().min(0).max(1)
    }).optional(),
    position: z.string().optional(),
    size: z.string().optional(),
    repeat: z.string().optional()
  }).optional(),
  typography: z.object({
    fontFamily: z.string(),
    title: z.object({
      size: z.string(),
      weight: z.string(),
      color: z.string(),
      lineHeight: z.string().optional(),
      letterSpacing: z.string().optional()
    }),
    description: z.object({
      size: z.string(),
      weight: z.string().optional(),
      color: z.string(),
      lineHeight: z.string().optional()
    }),
    links: z.object({
      size: z.string(),
      weight: z.string().optional(),
      color: z.string()
    })
  }).optional(),
  links: z.object({
    backgroundColor: z.string(),
    textColor: z.string(),
    borderRadius: z.string(),
    borderWidth: z.string(),
    borderColor: z.string().optional(),
    hoverEffect: z.enum(['subtle', 'scale', 'border', 'glow', 'slide']),
    shadow: z.string().optional()
  }).optional(),
  layout: z.object({
    maxWidth: z.string(),
    spacing: z.enum(['compact', 'normal', 'relaxed']),
    alignment: z.enum(['left', 'center', 'right'])
  }).optional(),
  brand: z.object({
    logo: z.object({
      url: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      position: z.enum(['top', 'center', 'bottom'])
    }).optional(),
    favicon: z.object({
      url: z.string(),
      size: z.number()
    }).optional(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string(),
      text: z.string()
    }),
    colorPalettes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      colors: z.array(z.string())
    })),
    hideBranding: z.boolean().optional()
  }).optional(),
  customCSS: z.string().optional()
}).passthrough();

// GET /api/themes - Get all active predefined themes
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: themes, error } = await query;

    if (error) {
      console.error('Error fetching themes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch themes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: themes,
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/themes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/themes - Create a new user theme
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateUserThemeSchema.parse(body);

    // If this is set as default, unset other default themes
    if (validatedData.is_default) {
      await supabase
        .from('user_themes')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data: userTheme, error } = await supabase
      .from('user_themes')
      .insert({
        user_id: user.id,
        theme_id: validatedData.theme_id,
        name: validatedData.name,
        custom_config: validatedData.custom_config || {},
        is_default: validatedData.is_default || false
      })
      .select(`
        *,
        theme:themes(*)
      `)
      .single();

    if (error) {
      console.error('Error creating user theme:', error);
      return NextResponse.json(
        { error: 'Failed to create user theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: userTheme,
      success: true
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/themes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 