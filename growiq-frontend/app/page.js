import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, FileText, Users, Zap, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 dark:border-white/5 bg-slate-50/90 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent tracking-tight">
              DMTrack
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Now Powered by Claude AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Your Digital Marketing
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track campaigns across Meta & Google, manage clients, generate AI-powered insights,
            and automate invoicing — replacing 6+ tools with one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 dark:hover:text-white transition-all shadow-sm"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '₹38K Cr', label: 'Digital Ad Market' },
            { value: '80K+', label: 'Agencies in India' },
            { value: '15-20h', label: 'Saved per Week' },
            { value: '5x', label: 'Faster Reporting' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Everything Your Agency Needs
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Replace Meta Ads Manager, Google Analytics, spreadsheets, and 3+ other tools with one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Campaign Tracker',
                desc: 'Auto-sync from Meta Ads, Google Ads & GA4. Real-time ROAS, CTR, CPC tracking with trend charts.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Brain,
                title: 'AI Insights Engine',
                desc: 'Claude AI analyzes campaigns daily. Get actionable recommendations, revenue forecasts & budget optimization.',
                color: 'from-violet-500 to-purple-500',
              },
              {
                icon: Users,
                title: 'Client CRM',
                desc: 'Client profiles, health scores, communication logs, task boards, and renewal alerts — all in one place.',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                icon: FileText,
                title: 'Auto Reports',
                desc: 'White-label PDF reports generated every week. AI-written performance narratives. Auto-email and WhatsApp delivery.',
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: Shield,
                title: 'Revenue & Invoicing',
                desc: 'GST-compliant invoices via Razorpay. Auto billing, payment tracking, overdue reminders, and MRR dashboards.',
                color: 'from-rose-500 to-pink-500',
              },
              {
                icon: Zap,
                title: 'SEO & Social',
                desc: 'Keyword tracking, backlink monitoring, social post scheduling, and AI-powered content ideas.',
                color: 'from-indigo-500 to-blue-500',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-3xl border border-gray-200/80 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-xl hover:border-violet-500/20 dark:hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg shadow-violet-500/20`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-gray-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-gray-500">Start small, scale as you grow. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '15,000',
                target: 'Local shops, clinics',
                features: ['1 ad platform', 'Basic AI insights', 'Monthly reports', 'Up to 3 clients'],
                popular: false,
              },
              {
                name: 'Growth',
                price: '35,000',
                target: 'Restaurants, coaches',
                features: ['3 ad platforms', 'Full AI analysis', 'Weekly reports + CRM', 'Up to 10 clients'],
                popular: true,
              },
              {
                name: 'Premium',
                price: '75,000',
                target: 'Chains, institutes',
                features: ['All platforms', 'Daily AI + forecasting', 'White-label reports', 'Unlimited clients'],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl border transition-all duration-300 hover:shadow-2xl ${plan.popular
                    ? 'border-violet-500/30 bg-white dark:bg-white/[0.02] shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/20'
                    : 'border-gray-200/80 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.target}</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">₹{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                      : 'border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-500">DMTrack · Version 1.0 · 2026</span>
          </div>
          <p className="text-sm text-gray-600">
            Built with Next.js, Express, PostgreSQL & Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
