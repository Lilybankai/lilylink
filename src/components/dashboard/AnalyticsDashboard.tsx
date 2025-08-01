'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { Card, Button } from '@/components/ui';
import { getDashboardAnalytics, type AnalyticsData } from '@/lib/api/analytics';
import type { LinkPage } from '@/types';

interface AnalyticsDashboardProps {
  selectedPage?: LinkPage | null;
}

type DateRange = '7d' | '30d' | '90d' | 'all';

export function AnalyticsDashboard({ selectedPage }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPage?.id, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDashboardAnalytics(selectedPage?.id, dateRange);

      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Network error while loading analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeOptions = [
    { value: '7d' as DateRange, label: 'Last 7 days' },
    { value: '30d' as DateRange, label: 'Last 30 days' },
    { value: '90d' as DateRange, label: 'Last 90 days' },
    { value: 'all' as DateRange, label: 'All time' },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Loading your analytics data...</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Track your link performance and audience engagement.
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadAnalytics} variant="primary">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Track your link performance and audience engagement.
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Analytics Data
            </h3>
            <p className="text-gray-600">
              Start sharing your links to see analytics data here.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            {selectedPage
              ? `Analytics for "${selectedPage.title}"`
              : 'Track your link performance and audience engagement'}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {dateRangeOptions.map(option => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Links</p>
              <p className="text-3xl font-bold">
                {analytics.totalLinks.toLocaleString()}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-200" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Total Clicks</p>
              <p className="text-3xl font-bold">
                {analytics.totalClicks.toLocaleString()}
              </p>
            </div>
            <CursorArrowRaysIcon className="h-8 w-8 text-pink-200" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Page Views</p>
              <p className="text-3xl font-bold">
                {analytics.totalViews.toLocaleString()}
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-blue-200" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Click Through Rate</p>
              <p className="text-3xl font-bold">
                {analytics.clickThroughRate.toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-200" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Activity
          </h3>
          <div className="space-y-4">
            {analytics.dailyStats.slice(-7).map((stat, index) => (
              <div
                key={stat.date}
                className="flex items-center justify-between"
              >
                <div className="text-sm text-gray-600">
                  {new Date(stat.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {stat.views} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {stat.clicks} clicks
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Countries */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {analytics.topCountries.slice(0, 5).map((country, index) => (
              <div
                key={country.country}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{country.country}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {country.views + country.clicks} total
                </div>
              </div>
            ))}
            {analytics.topCountries.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No geographic data available yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Device and Browser Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DevicePhoneMobileIcon className="h-5 w-5" />
            Device Breakdown
          </h3>
          <div className="space-y-3">
            {analytics.deviceBreakdown.map(device => (
              <div
                key={device.device}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {device.device === 'Mobile' ? (
                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">{device.device}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {device.views + device.clicks} total
                </div>
              </div>
            ))}
            {analytics.deviceBreakdown.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No device data available yet
              </p>
            )}
          </div>
        </Card>

        {/* Top Referrers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Referrers
          </h3>
          <div className="space-y-3">
            {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
              <div
                key={referrer.referrer}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {referrer.referrer === 'Direct'
                      ? 'Direct'
                      : (() => {
                          try {
                            return new URL(referrer.referrer).hostname;
                          } catch {
                            return referrer.referrer;
                          }
                        })()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {referrer.views + referrer.clicks} total
                </div>
              </div>
            ))}
            {analytics.topReferrers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No referrer data available yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
