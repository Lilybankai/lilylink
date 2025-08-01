import { requireAuthWithProfile } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default async function DashboardPage() {
  const { user, profile } = await requireAuthWithProfile();

  console.log('📊 Dashboard Debug:', {
    userId: user.id,
    username: profile?.username,
    subscriptionTier: profile?.subscription_tier,
    timestamp: new Date().toISOString()
  });

  return <DashboardLayout user={user} profile={profile} />;
} 