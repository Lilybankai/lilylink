import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { ThemeConfigSchema } from '@/lib/validations/theme';

// Using centralized theme validation schema

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/link-pages/[id]/theme - Get theme configuration for a link page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const resolvedParams = await params;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pageId = resolvedParams.id;

    // Get link page with theme configuration
    const { data: linkPage, error } = await supabase
      .from('link_pages')
      .select(`
        theme_config,
        background_config,
        typography_config,
        layout_config,
        brand_config,
        user_theme_id,
        user_theme:user_themes(
          custom_config,
          theme:themes(config)
        )
      `)
      .eq('id', pageId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching link page theme:', error);
      return NextResponse.json(
        { error: 'Link page not found' },
        { status: 404 }
      );
    }

    // Merge theme configurations in order of priority:
    // 1. Base theme config (lowest priority)
    // 2. User theme customizations 
    // 3. Page-specific theme config (highest priority)
    let mergedConfig: any = null;

    // Start with base theme if available
    if (linkPage.user_theme?.theme?.config) {
      mergedConfig = linkPage.user_theme.theme.config;
    }

    // Apply user theme customizations
    if (linkPage.user_theme?.custom_config) {
      mergedConfig = mergedConfig 
        ? { ...mergedConfig, ...linkPage.user_theme.custom_config }
        : linkPage.user_theme.custom_config;
    }

    // Apply page-specific configurations
    const pageConfigs = {
      ...(linkPage.theme_config || {}),
      ...(linkPage.background_config ? { background: linkPage.background_config } : {}),
      ...(linkPage.typography_config ? { typography: linkPage.typography_config } : {}),
      ...(linkPage.layout_config ? { layout: linkPage.layout_config } : {}),
      ...(linkPage.brand_config ? { brand: linkPage.brand_config } : {})
    };

    if (Object.keys(pageConfigs).length > 0) {
      mergedConfig = mergedConfig 
        ? { ...mergedConfig, ...pageConfigs }
        : pageConfigs;
    }

    return NextResponse.json({
      data: mergedConfig,
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/link-pages/[id]/theme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/link-pages/[id]/theme - Update theme configuration for a link page
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const resolvedParams = await params;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pageId = resolvedParams.id;
    const body = await request.json();
    
    console.log('Received theme config body:', JSON.stringify(body, null, 2));
    
    try {
      const validatedData = ThemeConfigSchema.parse(body);
      console.log('Theme config validation successful:', validatedData);
    } catch (validationError) {
      console.error('Theme config validation failed:', validationError);
      return NextResponse.json(
        { 
          error: 'Invalid theme configuration',
          details: validationError instanceof z.ZodError ? validationError.errors : validationError
        },
        { status: 400 }
      );
    }
    
    const validatedData = ThemeConfigSchema.parse(body);

    // Verify user owns this link page
    const { data: linkPage, error: pageError } = await supabase
      .from('link_pages')
      .select('id')
      .eq('id', pageId)
      .eq('user_id', user.id)
      .single();

    if (pageError || !linkPage) {
      return NextResponse.json(
        { error: 'Link page not found' },
        { status: 404 }
      );
    }

    // Update the link page with new theme configuration
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Store the complete theme config
    if (validatedData) {
      updateData.theme_config = validatedData;
    }

    // Also store individual configurations for easier querying
    if (validatedData.background) {
      updateData.background_config = validatedData.background;
      updateData.background_type = validatedData.background.type;
      updateData.background_value = validatedData.background.value;
    }
    if (validatedData.typography) {
      updateData.typography_config = validatedData.typography;
      updateData.font_family = validatedData.typography.fontFamily;
    }
    if (validatedData.layout) {
      updateData.layout_config = validatedData.layout;
    }
    if (validatedData.brand) {
      updateData.brand_config = validatedData.brand;
    }

    const { data: updatedPage, error: updateError } = await supabase
      .from('link_pages')
      .update(updateData)
      .eq('id', pageId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating link page theme:', updateError);
      return NextResponse.json(
        { error: 'Failed to update theme configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedPage,
      success: true
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid theme configuration', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/link-pages/[id]/theme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/link-pages/[id]/theme - Apply a user theme to a link page
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pageId = params.id;
    const body = await request.json();
    const { userThemeId } = body;

    if (!userThemeId) {
      return NextResponse.json(
        { error: 'User theme ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns both the link page and the user theme
    const [pageResult, themeResult] = await Promise.all([
      supabase
        .from('link_pages')
        .select('id')
        .eq('id', pageId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_themes')
        .select('id')
        .eq('id', userThemeId)
        .eq('user_id', user.id)
        .single()
    ]);

    if (pageResult.error || !pageResult.data) {
      return NextResponse.json(
        { error: 'Link page not found' },
        { status: 404 }
      );
    }

    if (themeResult.error || !themeResult.data) {
      return NextResponse.json(
        { error: 'User theme not found' },
        { status: 404 }
      );
    }

    // Apply the user theme to the link page
    const { data: updatedPage, error: updateError } = await supabase
      .from('link_pages')
      .update({
        user_theme_id: userThemeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', pageId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error applying user theme:', updateError);
      return NextResponse.json(
        { error: 'Failed to apply theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedPage,
      success: true
    });

  } catch (error) {
    console.error('Error in PATCH /api/link-pages/[id]/theme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 