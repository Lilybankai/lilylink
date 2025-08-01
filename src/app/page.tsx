'use client';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ChartBarIcon,
  PaintBrushIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Lilylink
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
              Create stunning, customizable link-in-bio pages with advanced
              analytics, AI features, and multi-profile management. The vibrant
              alternative to Linktree.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button size="lg" className="text-lg px-8 py-4">
              Get Started Free
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              View Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 text-sm text-gray-500"
          >
            No credit card required • Free forever plan available
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-display">
              Everything you need to stand out
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Powerful features that help you create beautiful, effective link
              pages that convert.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-4"
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <SparklesIcon className="h-8 w-8 text-purple-600 mb-4" />
                  <CardTitle className="text-purple-900">AI-Powered</CardTitle>
                  <CardDescription>
                    Smart suggestions for content, colors, and optimization
                    powered by advanced AI.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                <CardHeader>
                  <ChartBarIcon className="h-8 w-8 text-pink-600 mb-4" />
                  <CardTitle className="text-pink-900">
                    Advanced Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed insights into clicks, views, and user behavior with
                    beautiful charts.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <PaintBrushIcon className="h-8 w-8 text-blue-600 mb-4" />
                  <CardTitle className="text-blue-900">
                    Vibrant Design
                  </CardTitle>
                  <CardDescription>
                    Stunning themes and complete customization options that make
                    you stand out.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader>
                  <CogIcon className="h-8 w-8 text-emerald-600 mb-4" />
                  <CardTitle className="text-emerald-900">
                    Multi-Profile
                  </CardTitle>
                  <CardDescription>
                    Manage multiple profiles and pages from one account. Perfect
                    for agencies.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
              Ready to create your stunning link page?
            </h2>
            <p className="mt-6 text-lg leading-8 text-purple-100">
              Join thousands of creators, businesses, and agencies who trust
              Lilylink to showcase their content.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/90 border-white/20 text-gray-900 placeholder:text-gray-500"
              />
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
            </div>

            <div className="mt-6 text-sm text-purple-100">
              Start free, upgrade anytime. No hidden fees.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white font-display bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Lilylink
            </h3>
            <p className="mt-2 text-gray-400">
              The beautiful alternative to Linktree
            </p>
            <div className="mt-8 text-sm text-gray-500">
              © 2024 Lilylink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
