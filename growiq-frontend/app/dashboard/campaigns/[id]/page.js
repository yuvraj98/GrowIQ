'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    RefreshCw, Edit2, TrendingUp, TrendingDown,
    DollarSign, Eye, MousePointerClick, Target, Zap
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency } from '@/lib/utils';

const PLATFORM_STYLES = {
    meta:       { label: 'Meta Ads',    icon: '𝓜', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
    google_ads: { label: 'Google Ads',  icon: 'G',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const STATUS_STYLES = {
    active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paused:    'bg-amber-500/10  text-amber-400  border-amber-500/20',
    completed: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
    draft:     'bg-gray-500/10   text-gray-600 dark:text-gray-400   border-gray-500/20',
};

// ── Minimal sparkline SVG component ──────────────────────────
function Sparkline({ data, keyName, color = '#8b5cf6', height = 48 }) {
    if (!data || data.length < 2) return <div className="h-12 flex items-center justify-center text-xs text-gray-600">No data</div>;
    const values = data.map(d => parseFloat(d[keyName] || 0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 300; const h = height;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} stroke="none" />
        </svg>
    );
}

export default function CampaignDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [activeMetric, setActiveMetric] = useState('roas');
    const [editing, setEditing] = useState(false);
    const [editStatus, setEditStatus] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get(`/campaigns/${id}`);
                if (data.success) {
                    setCampaign(data.data);
                    setEditStatus(data.data.status);
                }
            } catch (err) {
                if (err.response?.status === 404) router.push('/dashboard/campaigns');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, router]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post(`/campaigns/${id}/sync`);
            const { data } = await api.get(`/campaigns/${id}`);
            if (data.success) setCampaign(data.data);
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncing(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const { data } = await api.put(`/campaigns/${id}`, { status: editStatus });
            if (data.success) { setCampaign(prev => ({ ...prev, ...data.data })); setEditing(false); }
        } catch (err) { console.error('Update failed:', err); }
    };

    if (loading) {
        return (
            <main className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </main>
        );
    }

    if (!campaign) return null;

    const plat = PLATFORM_STYLES[campaign.platform] || PLATFORM_STYLES.meta;
    const metrics = campaign.metrics || [];

    // 7-day totals
    const last7 = metrics.slice(-7);
    const total_spend       = last7.reduce((a, m) => a + parseFloat(m.spend || 0), 0);
    const total_impressions = last7.reduce((a, m) => a + parseInt(m.impressions || 0), 0);
    const total_clicks      = last7.reduce((a, m) => a + parseInt(m.clicks || 0), 0);
    const total_conversions = last7.reduce((a, m) => a + parseInt(m.conversions || 0), 0);
    const avg_roas          = last7.length ? last7.reduce((a, m) => a + parseFloat(m.roas || 0), 0) / last7.length : 0;
    const avg_ctr           = last7.length ? last7.reduce((a, m) => a + parseFloat(m.ctr || 0), 0) / last7.length : 0;

    const KPI = [
        { key: 'spend',        label: 'Spend (7d)',       value: formatCurrency(total_spend),               color: '#8b5cf6' },
        { key: 'impressions',  label: 'Impressions (7d)', value: total_impressions.toLocaleString(),        color: '#06b6d4' },
        { key: 'clicks',       label: 'Clicks (7d)',      value: total_clicks.toLocaleString(),             color: '#3b82f6' },
        { key: 'conversions',  label: 'Conversions (7d)', value: total_conversions.toLocaleString(),        color: '#10b981' },
        { key: 'roas',         label: 'Avg ROAS',         value: `${avg_roas.toFixed(2)}x`,                color: avg_roas >= 3 ? '#10b981' : avg_roas >= 1.5 ? '#f59e0b' : '#ef4444' },
        { key: 'ctr',          label: 'Avg CTR',          value: `${avg_ctr.toFixed(2)}%`,                 color: '#f59e0b' },
    ];

    return (
        <main className="flex-1 flex flex-col">
            <TopBar
                backHref="/dashboard/campaigns"
                backLabel="Campaigns"
                title={campaign.name}
                actions={
                    <>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:border-violet-500/30 hover:text-violet-400 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing…' : 'Sync'}
                        </button>
                        <button onClick={() => setEditing(!editing)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                            {editing ? 'Cancel' : 'Edit Status'}
                        </button>
                    </>
                }
            />

            <div className="p-6 max-w-7xl mx-auto w-full flex-1">
                {/* Campaign Identity */}
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl ${plat.bg} border ${plat.border} flex items-center justify-center text-xl font-bold ${plat.color}`}>
                        {plat.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${STATUS_STYLES[campaign.status]}`}>
                                {campaign.status}
                            </span>
                            <span className="text-xs text-gray-500">{plat.label}</span>
                            {campaign.objective && <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{campaign.objective}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Client: <span className="text-gray-700 dark:text-gray-300">{campaign.client_name}</span>
                            {campaign.budget_daily && <> · Budget: <span className="text-gray-700 dark:text-gray-300">{formatCurrency(campaign.budget_daily)}/day</span></>}
                        </p>
                    </div>

                    {editing && (
                        <div className="ml-auto flex items-center gap-2">
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                <option value="active"    className="bg-white dark:bg-gray-900">Active</option>
                                <option value="paused"    className="bg-white dark:bg-gray-900">Paused</option>
                                <option value="completed" className="bg-white dark:bg-gray-900">Completed</option>
                                <option value="draft"     className="bg-white dark:bg-gray-900">Draft</option>
                            </select>
                            <button onClick={handleStatusUpdate} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 active:scale-[0.97] transition-all shadow-lg shadow-violet-500/20">Save</button>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {KPI.map(k => (
                        <button
                            key={k.key}
                            onClick={() => setActiveMetric(k.key)}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 ${activeMetric === k.key ? 'border-violet-500/50 bg-violet-500/10 shadow-md shadow-violet-500/10' : 'border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:shadow-md hover:-translate-y-0.5'}`}
                        >
                            <p className="text-[11px] text-gray-500 mb-1">{k.label}</p>
                            <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
                        </button>
                    ))}
                </div>

                {/* Sparkline Chart */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{activeMetric.replace('_', ' ')} — Last {metrics.length} days</h3>
                        <div className="flex gap-2">
                            {['roas', 'spend', 'clicks', 'impressions', 'conversions', 'ctr'].map(m => (
                                <button key={m} onClick={() => setActiveMetric(m)}
                                    className={`text-xs px-2 py-1 rounded-lg transition-all capitalize ${activeMetric === m ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-gray-600 hover:text-gray-700 dark:text-gray-300'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    {metrics.length > 1 ? (
                        <>
                            <Sparkline data={metrics} keyName={activeMetric} color={KPI.find(k => k.key === activeMetric)?.color || '#8b5cf6'} height={80} />
                            <div className="flex justify-between text-[10px] text-gray-600 mt-2">
                                <span>{metrics[0]?.date}</span>
                                <span>{metrics[metrics.length - 1]?.date}</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-600 text-sm">
                            No metrics yet. Click <strong className="text-violet-400">Sync</strong> to generate data.
                        </div>
                    )}
                </div>

                {/* Daily Metrics Table */}
                {metrics.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-gray-200 dark:border-white/5">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Breakdown</h3>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2 border-b border-gray-200 dark:border-white/5 text-[10px] text-gray-500 uppercase tracking-wide">
                            <span>Date</span><span>Impressions</span><span>Clicks</span>
                            <span>Spend</span><span>Conversions</span><span>ROAS</span><span>CTR</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {[...metrics].reverse().map(m => {
                                const roas = parseFloat(m.roas || 0);
                                return (
                                    <div key={m.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/5 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs">{m.date}</span>
                                        <span className="text-gray-700 dark:text-gray-300">{parseInt(m.impressions).toLocaleString()}</span>
                                        <span className="text-gray-700 dark:text-gray-300">{parseInt(m.clicks).toLocaleString()}</span>
                                        <span className="text-gray-700 dark:text-gray-300">{formatCurrency(parseFloat(m.spend))}</span>
                                        <span className="text-gray-700 dark:text-gray-300">{m.conversions}</span>
                                        <span className={roas >= 3 ? 'text-emerald-400 font-semibold' : roas >= 1.5 ? 'text-amber-400' : 'text-red-400'}>{roas.toFixed(2)}x</span>
                                        <span className="text-gray-700 dark:text-gray-300">{parseFloat(m.ctr).toFixed(2)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
