'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  LinkIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  EyeIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge } from '@/components/ui';
import { LinkPageManager } from './LinkPageManager';
import { LinkManager } from './LinkManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { OrganizationList } from '../organizations/OrganizationList';
import { OrganizationDashboard } from '../organizations/OrganizationDashboard';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Profile, LinkPage } from '@/types';

interface DashboardLayoutProps {
  user: User;
  profile: Profile;
}

type TabType = 'overview' | 'pages' | 'links' | 'analytics' | 'organizations' | 'settings';

export function DashboardLayout({ user, profile }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pages');
  const [selectedPage, setSelectedPage] = useState<LinkPage | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Overview',
      id: 'overview' as TabType,
      icon: HomeIcon,
      description: 'Dashboard overview and quick stats'
    },
    {
      name: 'Link Pages',
      id: 'pages' as TabType,
      icon: LinkIcon,
      description: 'Manage your link pages'
    },
    {
      name: 'Links',
      id: 'links' as TabType,
      icon: LinkIcon,
      description: 'Manage individual links'
    },
    {
      name: 'Analytics',
      id: 'analytics' as TabType,
      icon: ChartBarIcon,
      description: 'View performance metrics'
    },
    {
      name: 'Organizations',
      id: 'organizations' as TabType,
      icon: BuildingOfficeIcon,
      description: 'Manage organizations and teams'
    },
    {
      name: 'Settings',
      id: 'settings' as TabType,
      icon: Cog6ToothIcon,
      description: 'Account and profile settings'
    },
  ];

  const handlePageSelect = (page: LinkPage) => {
    setSelectedPage(page);
    setActiveTab('links');
  };

  const handleOrganizationSelect = (organization: any) => {
    setSelectedOrganization(organization);
  };

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent profile={profile} />;
      case 'pages':
        return (
          <LinkPageManager 
            onSelectPage={handlePageSelect}
            selectedPageId={selectedPage?.id}
          />
        );
      case 'links':
        return <LinkManager selectedPage={selectedPage} />;
      case 'analytics':
        return <AnalyticsDashboard selectedPage={selectedPage} />;
      case 'organizations':
        return selectedOrganization ? (
          <OrganizationDashboard 
            organizationId={selectedOrganization.id}
            onBack={handleBackToOrganizations}
          />
        ) : (
          <OrganizationList onSelectOrganization={handleOrganizationSelect} />
        );
      case 'settings':
        return <SettingsContent />;
      default:
        return <OverviewContent profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col bg-white/80 backdrop-blur-sm border-r border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Lilylink
              </h1>
              <p className="text-sm text-gray-600">Dashboard</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {profile?.display_name || profile?.username}
                </p>
                <p className="text-sm text-gray-500 truncate">@{profile?.username}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Badge variant={profile?.subscription_tier === 'free' ? 'secondary' : 'success'}>
                {profile?.subscription_tier?.charAt(0).toUpperCase() + profile?.subscription_tier?.slice(1)} Plan
              </Badge>
            </div>

            <Link href={`/${profile?.username}`} className="block mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <EyeIcon className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Lilylink. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navigation.find(item => item.id === activeTab)?.name}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content */}
        <main className="p-4 lg:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// Overview Content Component
function OverviewContent({ profile }: { profile: Profile }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard?dateRange=7d');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.display_name || profile?.username}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your links this week.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Links</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : (analytics?.totalLinks || 0).toLocaleString()}
              </p>
            </div>
            <LinkIcon className="h-8 w-8 text-purple-200" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Total Clicks</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : (analytics?.totalClicks || 0).toLocaleString()}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-pink-200" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Page Views</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : (analytics?.totalViews || 0).toLocaleString()}
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-blue-200" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">CTR</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : `${(analytics?.clickThroughRate || 0).toFixed(1)}%`}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-200" />
          </div>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🚀 Getting Started
        </h2>
        <p className="text-gray-600 mb-6">
          Welcome to Lilylink! Follow these steps to set up your first link page.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Create your first link page</p>
              <p className="text-sm text-gray-600">Set up a page to organize your links</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Add your links</p>
              <p className="text-sm text-gray-600">Add social media, websites, and other important links</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Share your page</p>
              <p className="text-sm text-gray-600">Share your beautiful link page with the world</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}



// Settings Content Component
function SettingsContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card className="p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Settings Coming Soon
          </h3>
          <p className="text-gray-600">
            Advanced settings and customization options will be available soon.
          </p>
        </div>
      </Card>
    </div>
  );
} 