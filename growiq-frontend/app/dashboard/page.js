'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';

// Mock KPI data for Sprint 1
const KPI_DATA = {
    totalRevenue: 435000,
    activeClients: 13,
    liveCampaigns: 42,
    avgRoas: 3.8,
    healthScore: 79,
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        activeClients: 0,
        liveCampaigns: 0,
        avgRoas: 0,
        healthScore: 0,
        recentInsights: []
    });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/dashboard/overview');
                if (data.success) {
                    setMetrics(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    return (
        <main className="flex-1 flex flex-col">
            <TopBar title="Dashboard" description="Welcome back! Here's your agency overview." />

            <div className="p-6 flex-1 overflow-y-auto">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Monthly Revenue', value: formatCurrency(metrics.totalRevenue), change: '+0%', color: 'from-violet-500 to-indigo-500' },
                        { label: 'Active Clients', value: metrics.activeClients, change: '+0', color: 'from-emerald-500 to-teal-500' },
                        { label: 'Live Campaigns', value: metrics.liveCampaigns, change: '+0', color: 'from-blue-500 to-cyan-500' },
                        { label: 'Avg ROAS', value: `${metrics.avgRoas}x`, change: '+0.0x', color: 'from-amber-500 to-orange-500' },
                    ].map((kpi) => (
                        <div
                            key={kpi.label}
                            className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer"
                        >
                            <p className="text-sm text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">{kpi.label}</p>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
                                <span className={`text-sm font-medium bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent drop-shadow-sm`}>
                                    {kpi.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Health Score + Recent Insights */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Health Score */}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.03] transition-colors">
                        <h3 className="text-sm font-medium text-gray-300 mb-4 tracking-tight">Agency Health Score</h3>
                        <div className="flex items-center justify-center">
                            <div className="relative w-40 h-40 drop-shadow-xl">
                                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                    <circle
                                        cx="60" cy="60" r="50" fill="none"
                                        stroke="url(#healthGradient)"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(metrics.healthScore / 100) * 314} 314`}
                                        className="transition-all duration-1000 ease-out drop-shadow-md"
                                    />
                                    <defs>
                                        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#818cf8" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-extrabold text-white tracking-tighter">{metrics.healthScore}</span>
                                    <span className="text-xs text-gray-500 font-medium">out of 100</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm font-medium text-emerald-400 mt-6 bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                            Good — Above average
                        </p>
                    </div>

                    {/* Recent AI Insights */}
                    <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-300 tracking-tight">Recent AI Insights</h3>
                            <span className="text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full border border-violet-500/20">
                                ✨ Powered by Claude AI
                            </span>
                        </div>
                        <div className="space-y-3">
                            {metrics.recentInsights && metrics.recentInsights.length > 0 ? (
                                metrics.recentInsights.map((insight) => (
                                    <div
                                        key={insight.id}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.04] transition-all cursor-pointer group"
                                        onClick={() => window.location.href = '/dashboard/insights'}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${insight.severity === 'critical' || insight.severity === 'high' ? 'bg-orange-500 shadow-orange-500/50' :
                                            insight.severity === 'medium' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{insight.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{insight.type} <span className="text-gray-600 px-1">•</span> {new Date(insight.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-center font-medium text-gray-500 py-4">No active insights. All campaigns are optimal.</p>
                            )}
                        </div>
                        <div className="mt-5 text-center">
                            <a href="/dashboard/insights" className="text-xs text-violet-400 hover:text-violet-300 font-medium">View All Insights →</a>
                        </div>
                    </div>
                </div>

                {/* Sprint Progress */}
                <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-5 tracking-tight flex items-center gap-2">
                        <span className="text-lg">🚀</span> Development Progress
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {Array.from({ length: 16 }, (_, i) => {
                            const isPast = i < 16;
                            const isCurrent = false; // All sprints complete
                            return (
                                <div
                                    key={i}
                                    className={`p-3 rounded-xl text-center flex flex-col items-center justify-center transition-all ${isPast
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5'
                                        : isCurrent
                                        ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300 shadow-md shadow-violet-500/20 scale-105 z-10'
                                        : 'bg-white/[0.02] border border-white/5 text-gray-600'
                                        }`}
                                >
                                    <div className={`text-xs font-bold ${isCurrent ? 'text-violet-200' : ''}`}>S{i + 1}</div>
                                    <div className="text-[10px] mt-1 font-medium">
                                        {isPast ? '✅' : isCurrent ? 'Active' : `Wk ${i + 1}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
