'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import api from '@/lib/api';

const ICONS = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
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
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
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
        <header className="h-16 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {backHref && (
                    <Link href={backHref} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {backLabel && <span className="text-sm font-medium">{backLabel}</span>}
                    </Link>
                )}
                <div>
                    <h1 className="text-lg font-semibold text-white">{title}</h1>
                    {description && <p className="text-xs text-gray-500">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {actions}

                {/* Notification Dropdown Container */}
                <div className="relative" ref={dropRef}>
                    <button 
                        onClick={() => setOpen(!open)}
                        className={`relative p-2 rounded-lg transition-colors group ${open ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                        <Bell className={`w-5 h-5 transition-colors ${open ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 border-2 border-gray-950 text-[9px] text-white flex items-center justify-center font-bold shadow-sm shadow-red-500/50">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {open && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs text-violet-400 hover:text-violet-300 font-medium">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        No new notifications
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map(n => (
                                            <div 
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-3 hover:bg-white/5 cursor-pointer transition-colors flex gap-3 ${!n.is_read ? 'bg-violet-500/[0.03]' : ''}`}
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {ICONS[n.type] || ICONS.info}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`text-sm font-medium truncate ${n.is_read ? 'text-gray-300' : 'text-white'}`}>{n.title}</h4>
                                                        {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5 shadow-sm shadow-violet-500/50" />}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-gray-600 mt-2 font-medium">
                                                        {new Date(n.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {notifications.length > 0 && (
                                <div className="p-2 border-t border-white/5 bg-gray-950/50">
                                    <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="block w-full text-center py-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                                        Configure Alerts Settings
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
