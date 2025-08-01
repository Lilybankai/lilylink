import { NextRequest, NextResponse } from 'next/server';
import { detectPlatformWithData } from '@/lib/api/platforms';
import * as z from 'zod';

const detectSchema = z.object({
  url: z.string().url('Must be a valid URL')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = detectSchema.parse(body);

    const detection = await detectPlatformWithData(url);

    return NextResponse.json({ 
      data: detection,
      success: true 
    });
  } catch (error) {
    console.error('Platform detection error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Invalid URL provided',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to detect platform' },
      { status: 500 }
    );
  }
} 