import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as z from 'zod';
const { ZodError } = z;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the page
    const { data: page, error: pageError } = await supabase
      .from('link_pages')
      .select('user_id')
      .eq('id', pageId)
      .single();

    if (pageError || page?.user_id !== user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { data: links, error } = await supabase
      .from('links')
      .select('*')
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: links });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📊 API Debug - Raw body:', JSON.stringify(body, null, 2));
    
    // Create the schema inline to avoid import issues
    const linkSchema = z.object({
      page_id: z.string().uuid('Invalid page ID'),
      title: z.string().min(1, 'Title is required').max(100, 'Title must be no more than 100 characters'),
      url: z.preprocess((v) => {
        if (typeof v === 'string' && v !== '' && !/^https?:\/\//.test(v) && !v.startsWith('mailto:') && !v.startsWith('tel:') && !v.startsWith('sms:') && !v.startsWith('whatsapp:') && !v.includes('wa.me') && !v.includes('t.me')) {
          return `https://${v}`;
        }
        return v;
      }, z.string().min(1, 'URL is required').refine((url) => {
        // For contact links, allow special URL formats
        if (url.startsWith('mailto:') || url.startsWith('tel:') || 
            url.startsWith('sms:') || url.startsWith('whatsapp:') ||
            url.includes('wa.me') || url.includes('t.me')) {
          return true;
        }
        // For regular links, require http/https
        return url.startsWith('http://') || url.startsWith('https://');
      }, {
        message: 'URL must be a valid web URL (http/https) or contact link'
      })),
      description: z.string().max(200, 'Description must be no more than 200 characters').optional().transform(val => val === '' ? undefined : val),
      icon_url: z.string().url('Must be a valid URL').optional().transform(val => val === '' ? undefined : val),
      icon_name: z.string().max(50, 'Icon name must be no more than 50 characters').optional().transform(val => val === '' ? undefined : val),
      icon_color: z.string().max(20, 'Icon color must be no more than 20 characters').optional().transform(val => val === '' ? undefined : val),
      button_color: z.string().max(20, 'Button color must be no more than 20 characters').optional().transform(val => val === '' ? undefined : val),
      text_color: z.string().max(20, 'Text color must be no more than 20 characters').optional().transform(val => val === '' ? undefined : val),
      thumbnail_url: z.string().url('Must be a valid URL').optional().transform(val => val === '' ? undefined : val),
      display_order: z.number().int().min(0, 'Display order must be 0 or greater').optional().default(0),
      link_type: z.enum(['standard', 'social', 'product', 'media', 'contact']).optional().default('standard'),
      style_options: z.record(z.string(), z.any()).optional().default({}),
      schedule_start: z.string().datetime().optional().transform(val => val === '' ? undefined : val),
      schedule_end: z.string().datetime().optional().transform(val => val === '' ? undefined : val),
      
      // Product Link Features
      product_price: z.number().min(0, 'Price must be 0 or greater').optional(),
      product_currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']).optional().default('USD'),
      product_availability: z.enum(['in_stock', 'out_of_stock', 'limited', 'pre_order', 'discontinued']).optional(),
      affiliate_id: z.string().max(100, 'Affiliate ID must be no more than 100 characters').optional().transform(val => val === '' ? undefined : val),
      commission_rate: z.number().min(0).max(100, 'Commission rate must be between 0 and 100').optional(),
      
      // Media Link Features
      media_platform: z.enum(['youtube', 'spotify', 'apple_music', 'tiktok', 'instagram', 'soundcloud', 'twitch', 'vimeo']).optional(),
      media_embed_id: z.string().max(100, 'Media embed ID must be no more than 100 characters').optional().transform(val => val === '' ? undefined : val),
      media_duration: z.number().int().min(0, 'Duration must be 0 or greater').optional(),
      auto_play: z.boolean().optional().default(false),
      
      // Contact/Action Features
      contact_type: z.enum(['email', 'phone', 'whatsapp', 'telegram', 'form', 'calendar', 'location']).optional(),
      phone_number: z.preprocess(v => v === '' ? undefined : v, z.string().max(20, 'Phone number must be no more than 20 characters').optional()),
      email_address: z.preprocess(v => v === '' ? undefined : v, z.string().email('Must be a valid email address').optional()),
      form_fields: z.record(z.string(), z.any()).optional(),
      calendar_link: z.string().url('Must be a valid URL').optional().transform(val => val === '' ? undefined : val),
      payment_amount: z.number().min(0, 'Payment amount must be 0 or greater').optional(),
      payment_currency: z.string().optional().default('USD'),
      payment_type: z.enum(['one_time', 'subscription', 'donation', 'tip', 'product_purchase']).optional(),
      
      // Social Media Features
      social_platform: z.enum(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'youtube', 'twitch', 'discord', 'github', 'behance', 'dribbble']).optional(),
      social_handle: z.string().max(50, 'Social handle must be no more than 50 characters').optional().transform(val => val === '' ? undefined : val),
      social_follower_count: z.number().int().min(0, 'Follower count must be 0 or greater').optional(),
      
      // Advanced Metadata
      metadata: z.record(z.string(), z.any()).optional().default({}),
      external_id: z.string().max(100, 'External ID must be no more than 100 characters').optional().transform(val => val === '' ? undefined : val),
    });

    // Inspect schema before validation
    console.log('📊 API Debug - linkSchema keys:', Object.keys(linkSchema));
    console.log('📊 API Debug - typeof linkSchema.safeParse:', typeof linkSchema.safeParse);

    // Use proper Zod validation with detailed error logging
    const validationResult = linkSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('📊 API Debug - Validation failed:', JSON.stringify(validationResult.error.issues, null, 2));
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.issues 
      }, { status: 400 });
    }
    
    const validatedData = validationResult.data;
    console.log('📊 API Debug - Validated data:', JSON.stringify(validatedData, null, 2));

    // Verify user owns the page
    const { data: page, error: pageError } = await supabase
      .from('link_pages')
      .select('user_id')
      .eq('id', validatedData.page_id)
      .single();

    if (pageError || page?.user_id !== user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Get the next display order
    const { data: lastLink } = await supabase
      .from('links')
      .select('display_order')
      .eq('page_id', validatedData.page_id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastLink?.display_order || 0) + 1;

    const insertData = {
      ...validatedData,
      display_order: nextOrder,
    };
    
    console.log('📊 API Debug - Insert data:', JSON.stringify(insertData, null, 2));

    const { data: link, error } = await supabase
      .from('links')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.log('📊 API Debug - Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('📊 API Debug - Success! Created link:', link);
    return NextResponse.json({ data: link });
  } catch (error) {
    console.log('📊 API Debug - Catch error:', error);
    console.log('📊 API Debug - Error type:', typeof error);
    console.log('📊 API Debug - Error name:', (error as any)?.name);
    console.log('📊 API Debug - Error message:', (error as any)?.message);
    
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 