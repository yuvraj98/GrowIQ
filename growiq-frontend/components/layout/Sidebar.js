'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Zap, BarChart3, Users, Brain, FileText, CreditCard,
    Search, Settings, LogOut, Share2, Smartphone
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: BarChart3, label: 'Campaigns', href: '/dashboard/campaigns' },
    { icon: Brain, label: 'AI Insights', href: '/dashboard/insights' },
    { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
    { icon: CreditCard, label: 'Invoicing', href: '/dashboard/invoicing' },
    { icon: Search, label: 'SEO Tracker', href: '/dashboard/seo' },
    { icon: Share2, label: 'Social Hub', href: '/dashboard/social' },
    { icon: Smartphone, label: 'Client Portal', href: '/portal' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const isActive = (href) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-gray-950 flex flex-col fixed h-full z-50">
            {/* Logo */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-105 active:scale-95 transition-all duration-200">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">DMTrack</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group/nav ${active
                                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-semibold shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                            }`}
                        >
                            <item.icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500 group-hover/nav:text-gray-600 dark:group-hover/nav:text-gray-300'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-violet-500/20">
                        {getInitials(user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Guest'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
