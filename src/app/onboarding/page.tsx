import { requireAuth } from '@/lib/auth';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { Card } from '@/components/ui';

export default async function OnboardingPage() {
  const user = await requireAuth();

  console.log('🚀 Onboarding Debug:', {
    userId: user.id,
    email: user.email,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome to Lilylink! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Let&apos;s set up your profile to get started
          </p>
          <p className="text-gray-500">
            This will only take a minute, and you can always change these
            details later
          </p>
        </div>

        {/* Onboarding Form Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Create Your Profile
              </h2>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-8 bg-purple-500 rounded-full"></div>
                <div className="h-2 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-2 w-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <p className="text-gray-600">
              Choose a unique username and tell us a bit about yourself
            </p>
          </div>

          <OnboardingForm user={user} />
        </Card>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Unlimited Links
            </h3>
            <p className="text-sm text-gray-600">
              Add as many links as you want to your page
            </p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Beautiful Themes
            </h3>
            <p className="text-sm text-gray-600">
              Customize your page with vibrant themes
            </p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">
              Track clicks and engagement on your links
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
