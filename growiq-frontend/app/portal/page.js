'use client';

import { useState, useEffect } from 'react';
import { 
    Zap, BarChart3, FileText, CreditCard, 
    TrendingUp, ArrowRight, Download, 
    Calendar, CheckCircle2, Clock, Menu, X, 
    ChevronRight, LogOut, Bell
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function ClientPortal() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetchPortalData();
    }, []);

    const fetchPortalData = async () => {
        try {
            // In a real app, the client ID would come from the auth token
            // For demo, we fetch for the first client in the system
            const clientsRes = await api.get('/clients?limit=1');
            const clientId = clientsRes.data.data.clients[0]?.id;
            
            if (clientId) {
                const { data } = await api.get(`/portal/summary?clientId=${clientId}`);
                if (data.success) setData(data.data);
            }
        } catch (err) {
            console.error('Portal fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <Zap className="w-12 h-12 text-violet-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Portal Unavailable</h1>
            <p className="text-sm text-gray-500">We couldn't load your client profile. Please contact your account manager.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold tracking-tight">GrowIQ <span className="text-violet-500">Portal</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-black" />
                    </button>
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 -mr-2">
                        <Menu className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
                {/* Greeting */}
                <section>
                    <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-1">Welcome Back</p>
                    <h1 className="text-2xl font-bold tracking-tight">{data.client.business_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Here is your performance snapshot for the last 30 days.</p>
                </section>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 shadow-2xl">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Spend</p>
                        <p className="text-xl font-bold tracking-tight">₹{parseFloat(data.metrics.total_spend).toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1 text-emerald-400 text-[10px] font-bold">
                            <TrendingUp className="w-3 h-3" /> +8.4%
                        </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 shadow-2xl">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Avg ROAS</p>
                        <p className="text-xl font-bold tracking-tight">{parseFloat(data.metrics.avg_roas).toFixed(2)}x</p>
                        <div className="flex items-center gap-1 mt-1 text-emerald-400 text-[10px] font-bold">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </div>
                    </div>
                </div>

                {/* Pending Invoices */}
                {data.pendingInvoices.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="text-sm font-bold tracking-tight">Action Required</h2>
                            <Link href="#" className="text-[10px] font-bold text-violet-500 uppercase">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {data.pendingInvoices.map(inv => (
                                <div key={inv.id} className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{inv.invoice_number}</p>
                                            <p className="text-[10px] text-violet-400 font-medium">Due {formatDate(inv.due_date)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-white">₹{parseFloat(inv.total_amount).toLocaleString()}</p>
                                        <button className="text-[10px] font-bold text-violet-400 underline underline-offset-2">Pay Now</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Reports */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-bold tracking-tight">Recent Reports</h2>
                        <Link href="#" className="text-[10px] font-bold text-gray-500 uppercase">Archive</Link>
                    </div>
                    <div className="space-y-3">
                        {data.recentReports.map(rpt => (
                            <div key={rpt.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-white/5 text-gray-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white line-clamp-1">{rpt.title}</p>
                                        <p className="text-[10px] text-gray-500">{formatDate(rpt.created_at)}</p>
                                    </div>
                                </div>
                                <button className="p-2 rounded-full bg-white/5 text-gray-400 group-hover:bg-violet-500/10 group-hover:text-violet-400 transition-all">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SEO Snapshot */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-bold tracking-tight">Top Keywords</h2>
                        <div className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">Improving</div>
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        {data.topKeywords.map((kw, i) => (
                            <div key={i} className={`p-4 flex items-center justify-between ${i !== 0 ? 'border-t border-white/5' : ''}`}>
                                <p className="text-xs font-medium text-gray-300">{kw.keyword}</p>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 px-2 rounded-md font-bold text-[10px] ${
                                        kw.current_position <= 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-gray-500'
                                    }`}>
                                        #{kw.current_position}
                                    </div>
                                    {kw.previous_position > kw.current_position ? (
                                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                        <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 p-4 flex items-center justify-around z-40 pb-6">
                <button className="flex flex-col items-center gap-1 text-violet-500">
                    <Zap className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase">Metrics</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors">
                    <FileText className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase">Reports</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase">Billing</span>
                </button>
            </nav>

            {/* Side Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-white/10 p-6 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-end mb-8">
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-white/5 text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white">
                                    {data.client.business_name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{data.client.business_name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Client Portal</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                                    <Bell className="w-4 h-4" /> <span className="text-sm font-medium">Notifications</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4 rotate-180" /> <span className="text-sm font-medium italic">Support Chat</span>
                                </button>
                            </div>
                            <div className="pt-6 border-t border-white/5">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                                    <LogOut className="w-4 h-4" /> <span className="text-sm font-bold">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
