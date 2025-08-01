import { ApiResponse } from './client';

// Check if analytics tracking is consented
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('analytics-consent') === 'accepted';
}

export interface AnalyticsData {
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

export interface TrackClickParams {
  linkId: string;
  pageId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface TrackViewParams {
  pageId: string;
  referrer?: string;
  sessionDuration?: number;
}

// Extract UTM parameters from URL
export function extractUTMParams(url?: string): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (!url) return {};
  
  try {
    const urlObj = new URL(url);
    return {
      utmSource: urlObj.searchParams.get('utm_source') || undefined,
      utmMedium: urlObj.searchParams.get('utm_medium') || undefined,
      utmCampaign: urlObj.searchParams.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

// Track link click
export async function trackLinkClick(params: TrackClickParams): Promise<ApiResponse<{ id: string }>> {
  // Check consent before tracking
  if (!hasAnalyticsConsent()) {
    return {
      success: false,
      error: 'Analytics tracking not consented',
    };
  }

  try {
    const response = await fetch('/api/analytics/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to track click',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error tracking click:', error);
    return {
      success: false,
      error: 'Network error while tracking click',
    };
  }
}

// Track page view
export async function trackPageView(params: TrackViewParams): Promise<ApiResponse<{ id: string }>> {
  // Check consent before tracking
  if (!hasAnalyticsConsent()) {
    return {
      success: false,
      error: 'Analytics tracking not consented',
    };
  }

  try {
    const response = await fetch('/api/analytics/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to track page view',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error tracking page view:', error);
    return {
      success: false,
      error: 'Network error while tracking page view',
    };
  }
}

// Get dashboard analytics
export async function getDashboardAnalytics(
  pageId?: string,
  dateRange: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<ApiResponse<AnalyticsData>> {
  try {
    const params = new URLSearchParams();
    if (pageId) params.set('pageId', pageId);
    params.set('dateRange', dateRange);

    const response = await fetch(`/api/analytics/dashboard?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch analytics',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      success: false,
      error: 'Network error while fetching analytics',
    };
  }
}

// Session tracking utilities
export class SessionTracker {
  private startTime: number;
  private pageId: string;
  private hasTrackedView: boolean = false;

  constructor(pageId: string) {
    this.pageId = pageId;
    this.startTime = Date.now();
    
    // Track initial page view
    this.trackInitialView();
    
    // Track page unload
    this.setupUnloadTracking();
  }

  private async trackInitialView() {
    if (this.hasTrackedView) return;
    
    // Check consent before tracking
    if (!hasAnalyticsConsent()) {
      return;
    }
    
    const referrer = document.referrer || undefined;
    await trackPageView({
      pageId: this.pageId,
      referrer,
    });
    
    this.hasTrackedView = true;
  }

  private setupUnloadTracking() {
    const trackSessionEnd = () => {
      // Check consent before tracking
      if (!hasAnalyticsConsent()) {
        return;
      }

      const sessionDuration = Math.round((Date.now() - this.startTime) / 1000);
      
      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          pageId: this.pageId,
          sessionDuration,
        });
        
        navigator.sendBeacon('/api/analytics/track-view', data);
      }
    };

    // Track on various unload events
    window.addEventListener('beforeunload', trackSessionEnd);
    window.addEventListener('pagehide', trackSessionEnd);
    
    // Also track on visibility change (mobile browsers)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackSessionEnd();
      }
    });
  }

  // Manual session duration tracking (for SPA navigation)
  getSessionDuration(): number {
    return Math.round((Date.now() - this.startTime) / 1000);
  }
}

// Hook for easy click tracking with UTM parameters
export function createClickHandler(linkId: string, pageId: string, targetUrl: string) {
  return async (event: React.MouseEvent) => {
    // Don't prevent default - let the link work normally
    // But track the click asynchronously
    
    const referrer = document.referrer || undefined;
    const utmParams = extractUTMParams(window.location.href);
    
    // Track click (fire and forget)
    trackLinkClick({
      linkId,
      pageId,
      referrer,
      ...utmParams,
    }).catch(error => {
      console.warn('Failed to track click:', error);
    });
  };
}