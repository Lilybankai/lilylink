'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PaintBrushIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '@/components/ui';

export default function ThemesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a short delay to show the message
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <PaintBrushIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Themes Moved!
            </h1>
            <p className="text-gray-600 mb-6">
              Theme customization is now integrated directly into your Link
              Pages. You can edit themes by clicking the &quot;Edit&quot; button
              on any link page.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRightIcon className="w-4 h-4" />
            </Button>

            <p className="text-sm text-gray-500">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
