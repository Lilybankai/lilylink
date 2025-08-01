import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for page view tracking
const trackViewSchema = z.object({
  pageId: z.string().uuid(),
  referrer: z.string().optional(),
  sessionDuration: z.number().optional(),
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
    const validatedData = trackViewSchema.parse(body);
    
    // Get client information
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Get geographic data
    const geoData = await getGeoData(ip);
    
    // Insert page view tracking data
    const { data, error } = await supabase
      .from('page_views')
      .insert({
        page_id: validatedData.pageId,
        user_agent: userAgent,
        ip_address: ip,
        country: geoData.country,
        city: geoData.city,
        referrer: validatedData.referrer,
        session_duration: validatedData.sessionDuration,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking page view:', error);
      return NextResponse.json(
        { error: 'Failed to track page view' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: data.id } 
    });
    
  } catch (error) {
    console.error('Page view tracking error:', error);
    
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