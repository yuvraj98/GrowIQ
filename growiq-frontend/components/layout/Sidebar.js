'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Zap, BarChart3, Users, Brain, FileText, CreditCard,
    Search, Settings, LogOut
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
        <aside className="w-64 border-r border-white/5 bg-gray-950 flex flex-col fixed h-full z-50">
            {/* Logo */}
            <div className="p-4 border-b border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">GrowIQ</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${active
                                ? 'bg-violet-500/10 text-violet-400 font-medium shadow-sm shadow-violet-500/5'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                        >
                            <item.icon className={`w-4 h-4 ${active ? 'text-violet-400' : ''}`} />
                            <span>{item.label}</span>
                            {item.sprint && (
                                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-600">
                                    S{item.sprint}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-violet-500/20">
                        {getInitials(user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Guest'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 text-gray-600 hover:text-gray-400" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
