import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for dashboard analytics
const dashboardAnalyticsSchema = z.object({
  pageId: z.string().uuid().optional(),
  dateRange: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
  userId: z.string().uuid().optional(),
});

interface AnalyticsSummary {
  totalLinks: number;
  totalClicks: number;
  totalViews: number;
  clickThroughRate: number;
  topCountries: Array<{ country: string; clicks: number; views: number }>;
  topReferrers: Array<{ referrer: string; clicks: number; views: number }>;
  dailyStats: Array<{ date: string; clicks: number; views: number }>;
  deviceBreakdown: Array<{ device: string; clicks: number; views: number }>;
  browserBreakdown: Array<{ browser: string; clicks: number; views: number }>;
}

// Parse user agent to extract device and browser information
function parseUserAgent(userAgent: string): { device: string; browser: string } {
  const ua = userAgent.toLowerCase();
  
  // Device detection
  let device = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }
  
  // Browser detection
  let browser = 'Other';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
  }
  
  return { device, browser };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const dateRange = searchParams.get('dateRange') || '30d';
    
    const validatedParams = dashboardAnalyticsSchema.parse({
      pageId: pageId || undefined,
      dateRange,
      userId: user.id,
    });
    
    // Calculate date filter
    let dateFilter = '';
    const now = new Date();
    switch (validatedParams.dateRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'all':
      default:
        dateFilter = '1970-01-01T00:00:00.000Z';
        break;
    }
    
    // Build base query conditions
    let pageFilter = '';
    if (validatedParams.pageId) {
      pageFilter = `AND lp.id = '${validatedParams.pageId}'`;
    }
    
    // Get total links for user's pages
    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('id, page_id, link_pages!inner(user_id)')
      .eq('link_pages.user_id', user.id)
      .eq('is_active', true);
      
    if (linksError) {
      console.error('Error fetching links:', linksError);
      return NextResponse.json(
        { error: 'Failed to fetch links data' },
        { status: 500 }
      );
    }
    
    const totalLinks = linksData?.length || 0;
    const userPageIds = [...new Set(linksData?.map(link => link.page_id) || [])];
    
    if (userPageIds.length === 0) {
      // No pages yet, return empty analytics
      const emptyAnalytics: AnalyticsSummary = {
        totalLinks: 0,
        totalClicks: 0,
        totalViews: 0,
        clickThroughRate: 0,
        topCountries: [],
        topReferrers: [],
        dailyStats: [],
        deviceBreakdown: [],
        browserBreakdown: [],
      };
      
      return NextResponse.json({
        success: true,
        data: emptyAnalytics
      });
    }
    
    // Get clicks data
    let clicksQuery = supabase
      .from('link_clicks')
      .select('*')
      .in('page_id', userPageIds)
      .gte('clicked_at', dateFilter);
      
    if (validatedParams.pageId) {
      clicksQuery = clicksQuery.eq('page_id', validatedParams.pageId);
    }
    
    const { data: clicksData, error: clicksError } = await clicksQuery;
    
    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
      return NextResponse.json(
        { error: 'Failed to fetch clicks data' },
        { status: 500 }
      );
    }
    
    // Get views data
    let viewsQuery = supabase
      .from('page_views')
      .select('*')
      .in('page_id', userPageIds)
      .gte('viewed_at', dateFilter);
      
    if (validatedParams.pageId) {
      viewsQuery = viewsQuery.eq('page_id', validatedParams.pageId);
    }
    
    const { data: viewsData, error: viewsError } = await viewsQuery;
    
    if (viewsError) {
      console.error('Error fetching views:', viewsError);
      return NextResponse.json(
        { error: 'Failed to fetch views data' },
        { status: 500 }
      );
    }
    
    // Process analytics data
    const totalClicks = clicksData?.length || 0;
    const totalViews = viewsData?.length || 0;
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    // Top countries
    const countryStats = new Map<string, { clicks: number; views: number }>();
    clicksData?.forEach(click => {
      const country = click.country || 'Unknown';
      const existing = countryStats.get(country) || { clicks: 0, views: 0 };
      countryStats.set(country, { ...existing, clicks: existing.clicks + 1 });
    });
    viewsData?.forEach(view => {
      const country = view.country || 'Unknown';
      const existing = countryStats.get(country) || { clicks: 0, views: 0 };
      countryStats.set(country, { ...existing, views: existing.views + 1 });
    });
    
    const topCountries = Array.from(countryStats.entries())
      .map(([country, stats]) => ({ country, ...stats }))
      .sort((a, b) => (b.clicks + b.views) - (a.clicks + a.views))
      .slice(0, 10);
    
    // Top referrers
    const referrerStats = new Map<string, { clicks: number; views: number }>();
    clicksData?.forEach(click => {
      const referrer = click.referrer || 'Direct';
      const existing = referrerStats.get(referrer) || { clicks: 0, views: 0 };
      referrerStats.set(referrer, { ...existing, clicks: existing.clicks + 1 });
    });
    viewsData?.forEach(view => {
      const referrer = view.referrer || 'Direct';
      const existing = referrerStats.get(referrer) || { clicks: 0, views: 0 };
      referrerStats.set(referrer, { ...existing, views: existing.views + 1 });
    });
    
    const topReferrers = Array.from(referrerStats.entries())
      .map(([referrer, stats]) => ({ referrer, ...stats }))
      .sort((a, b) => (b.clicks + b.views) - (a.clicks + a.views))
      .slice(0, 10);
    
    // Daily stats for the last 30 days
    const dailyStats = new Map<string, { clicks: number; views: number }>();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    // Initialize all days with 0
    last30Days.forEach(date => {
      dailyStats.set(date, { clicks: 0, views: 0 });
    });
    
    // Add actual data
    clicksData?.forEach(click => {
      const date = new Date(click.clicked_at).toISOString().split('T')[0];
      if (dailyStats.has(date)) {
        const existing = dailyStats.get(date)!;
        dailyStats.set(date, { ...existing, clicks: existing.clicks + 1 });
      }
    });
    viewsData?.forEach(view => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      if (dailyStats.has(date)) {
        const existing = dailyStats.get(date)!;
        dailyStats.set(date, { ...existing, views: existing.views + 1 });
      }
    });
    
    const dailyStatsArray = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }));
    
    // Device and browser breakdown
    const deviceStats = new Map<string, { clicks: number; views: number }>();
    const browserStats = new Map<string, { clicks: number; views: number }>();
    
    clicksData?.forEach(click => {
      const { device, browser } = parseUserAgent(click.user_agent || '');
      
      const existingDevice = deviceStats.get(device) || { clicks: 0, views: 0 };
      deviceStats.set(device, { ...existingDevice, clicks: existingDevice.clicks + 1 });
      
      const existingBrowser = browserStats.get(browser) || { clicks: 0, views: 0 };
      browserStats.set(browser, { ...existingBrowser, clicks: existingBrowser.clicks + 1 });
    });
    
    viewsData?.forEach(view => {
      const { device, browser } = parseUserAgent(view.user_agent || '');
      
      const existingDevice = deviceStats.get(device) || { clicks: 0, views: 0 };
      deviceStats.set(device, { ...existingDevice, views: existingDevice.views + 1 });
      
      const existingBrowser = browserStats.get(browser) || { clicks: 0, views: 0 };
      browserStats.set(browser, { ...existingBrowser, views: existingBrowser.views + 1 });
    });
    
    const deviceBreakdown = Array.from(deviceStats.entries())
      .map(([device, stats]) => ({ device, ...stats }));
    
    const browserBreakdown = Array.from(browserStats.entries())
      .map(([browser, stats]) => ({ browser, ...stats }));
    
    const analytics: AnalyticsSummary = {
      totalLinks,
      totalClicks,
      totalViews,
      clickThroughRate: Math.round(clickThroughRate * 100) / 100,
      topCountries,
      topReferrers,
      dailyStats: dailyStatsArray,
      deviceBreakdown,
      browserBreakdown,
    };
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}