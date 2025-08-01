import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for click tracking
const trackClickSchema = z.object({
  linkId: z.string().uuid(),
  pageId: z.string().uuid(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// Get client IP address from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return '127.0.0.1'; // Fallback for development
}

// Get geographic data from IP address
async function getGeoData(ip: string): Promise<{ country?: string; city?: string }> {
  try {
    // Skip geolocation for localhost/development
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Unknown', city: 'Unknown' };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      headers: {
        'User-Agent': 'Lilylink Analytics/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Geolocation service failed');
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown'
      };
    }
    
    return { country: 'Unknown', city: 'Unknown' };
  } catch (error) {
    console.error('Error getting geo data:', error);
    return { country: 'Unknown', city: 'Unknown' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = trackClickSchema.parse(body);
    
    // Get client information
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Get geographic data
    const geoData = await getGeoData(ip);
    
    // Insert click tracking data
    const { data, error } = await supabase
      .from('link_clicks')
      .insert({
        link_id: validatedData.linkId,
        page_id: validatedData.pageId,
        user_agent: userAgent,
        ip_address: ip,
        country: geoData.country,
        city: geoData.city,
        referrer: validatedData.referrer,
        utm_source: validatedData.utmSource,
        utm_medium: validatedData.utmMedium,
        utm_campaign: validatedData.utmCampaign,
        clicked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking click:', error);
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      );
    }

    // Update link click count
    await supabase
      .from('links')
      .update({ 
        click_count: supabase.sql`click_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.linkId);

    return NextResponse.json({ 
      success: true, 
      data: { id: data.id } 
    });
    
  } catch (error) {
    console.error('Click tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}