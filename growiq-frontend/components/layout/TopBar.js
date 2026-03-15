'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';

const ICONS = {
    info: <Info className="w-4 h-4 text-blue-500" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
};

export default function TopBar({ title, description, actions, backHref, backLabel }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications?limit=10');
            if (data.success) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch {}
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropRef.current && !dropRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        if (!unreadCount) return;
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch {}
    };

    const handleNotificationClick = async (notification) => {
        setOpen(false);
        if (!notification.is_read) {
            try {
                await api.put(`/notifications/${notification.id}/read`);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch {}
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <header className="h-16 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {backHref && (
                    <Link href={backHref} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 px-2 py-1.5 rounded-lg -ml-2">
                        <ArrowLeft className="w-4 h-4" />
                        {backLabel && <span className="text-sm font-medium">{backLabel}</span>}
                    </Link>
                )}
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h1>
                    {description && <p className="text-xs text-gray-500">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {actions}

                <ThemeToggle />

                {/* Notification Dropdown Container */}
                <div className="relative" ref={dropRef}>
                    <button 
                        onClick={() => setOpen(!open)}
                        className={`relative p-2 rounded-xl border transition-all active:scale-95 ${open 
                            ? 'bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white' 
                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/30 ring-2 ring-white dark:ring-gray-950">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden animate-fade-in-up">
                            <div className="p-3.5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/80 dark:bg-white/[0.02]">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No new notifications
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                                        {notifications.map(n => (
                                            <div 
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer flex gap-3 ${!n.is_read ? 'bg-violet-50 dark:bg-violet-500/[0.05]' : ''}`}
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {ICONS[n.type] || ICONS.info}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`text-sm font-medium truncate ${n.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{n.title}</h4>
                                                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-1.5 shadow-sm shadow-violet-500/50" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                        {new Date(n.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {notifications.length > 0 && (
                                <div className="p-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-gray-950/50">
                                    <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="block w-full text-center py-2 text-xs text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                                        Configure Alert Settings
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
