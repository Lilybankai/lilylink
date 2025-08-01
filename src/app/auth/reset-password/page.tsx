import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Card } from '@/components/ui';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Set New Password
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <ResetPasswordForm />
          
          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 