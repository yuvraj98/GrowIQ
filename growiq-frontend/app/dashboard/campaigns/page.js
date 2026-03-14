'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, TrendingUp, TrendingDown, Zap, RefreshCw,
    BarChart3, DollarSign, MousePointerClick, Eye, Target
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency } from '@/lib/utils';

const PLATFORM_META = {
    meta: {
        label: 'Meta Ads',
        icon: '𝓜',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    google_ads: {
        label: 'Google Ads',
        icon: 'G',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
};

const STATUS_STYLES = {
    active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paused:    'bg-amber-500/10  text-amber-400  border-amber-500/20',
    completed: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
    draft:     'bg-gray-500/10   text-gray-400   border-gray-500/20',
};

function MetricPill({ label, value, icon: Icon, color = 'text-gray-300' }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>{value}</span>
        </div>
    );
}

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(null);
    const [platform, setPlatform] = useState('');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
            if (platform) params.append('platform', platform);
            if (status) params.append('status', status);

            const { data } = await api.get(`/campaigns?${params}`);
            if (data.success) {
                setCampaigns(data.data.campaigns);
                setPagination(prev => ({ ...prev, ...data.data.pagination }));
            }
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, platform, status]);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    async function handleSync(campaignId) {
        setSyncing(campaignId);
        try {
            await api.post(`/campaigns/${campaignId}/sync`);
            await fetchCampaigns();
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncing(null);
        }
    }

    const filtered = search
        ? campaigns.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.client_name.toLowerCase().includes(search.toLowerCase()))
        : campaigns;

    return (
        <main className="flex-1 flex flex-col">
            <TopBar
                title="Campaigns"
                description="Track performance across Meta & Google Ads"
                actions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Add Campaign
                    </button>
                }
            />

            <div className="p-6 flex-1">
                {/* Summary Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: 'Total Spend (7d)',
                            value: formatCurrency(campaigns.reduce((a, c) => a + parseFloat(c.total_spend || 0), 0)),
                            color: 'from-violet-500 to-indigo-500',
                        },
                        {
                            label: 'Total Conversions (7d)',
                            value: campaigns.reduce((a, c) => a + parseInt(c.total_conversions || 0), 0).toLocaleString(),
                            color: 'from-emerald-500 to-teal-500',
                        },
                        {
                            label: 'Avg ROAS (7d)',
                            value: campaigns.length
                                ? (campaigns.reduce((a, c) => a + parseFloat(c.avg_roas || 0), 0) / campaigns.length).toFixed(2) + 'x'
                                : '0x',
                            color: 'from-amber-500 to-orange-500',
                        },
                        {
                            label: 'Active Campaigns',
                            value: campaigns.filter(c => c.status === 'active').length,
                            color: 'from-blue-500 to-cyan-500',
                        },
                    ].map(k => (
                        <div key={k.label} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
                            <span className={`text-xl font-bold bg-gradient-to-r ${k.color} bg-clip-text text-transparent`}>{k.value}</span>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search campaigns or clients..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        />
                    </div>
                    {['meta', 'google_ads'].map(p => (
                        <button key={p} onClick={() => setPlatform(prev => prev === p ? '' : p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${platform === p ? PLATFORM_META[p].bg + ' ' + PLATFORM_META[p].color + ' ' + PLATFORM_META[p].border : 'border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'}`}>
                            {PLATFORM_META[p].label}
                        </button>
                    ))}
                    {['active', 'paused'].map(s => (
                        <button key={s} onClick={() => setStatus(prev => prev === s ? '' : s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${status === s ? STATUS_STYLES[s] : 'border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'}`}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Campaign Table */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Add your first campaign or sync from Meta / Google Ads</p>
                        <button onClick={() => setShowAddModal(true)}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium">
                            <Plus className="w-4 h-4 inline mr-1" /> Add Campaign
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wide">
                            <span>Campaign</span>
                            <span>Spend (7d)</span>
                            <span>Impressions</span>
                            <span>Clicks</span>
                            <span>Conversions</span>
                            <span>ROAS</span>
                            <span></span>
                        </div>
                        {filtered.map((c, idx) => {
                            const plat = PLATFORM_META[c.platform] || PLATFORM_META.meta;
                            const roas = parseFloat(c.avg_roas || 0);
                            const roasColor = roas >= 3 ? 'text-emerald-400' : roas >= 1.5 ? 'text-amber-400' : 'text-red-400';
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => router.push(`/dashboard/campaigns/${c.id}`)}
                                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center hover:bg-white/[0.03] transition-all cursor-pointer group ${idx !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                                >
                                    {/* Name + meta */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg ${plat.bg} border ${plat.border} flex items-center justify-center text-sm font-bold ${plat.color} shrink-0`}>
                                            {plat.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate group-hover:text-violet-400 transition-colors">{c.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-500">{c.client_name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[c.status]}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-300 font-medium">{formatCurrency(parseFloat(c.total_spend || 0))}</span>
                                    <span className="text-sm text-gray-300">{parseInt(c.total_impressions || 0).toLocaleString()}</span>
                                    <span className="text-sm text-gray-300">{parseInt(c.total_clicks || 0).toLocaleString()}</span>
                                    <span className="text-sm text-gray-300">{parseInt(c.total_conversions || 0).toLocaleString()}</span>
                                    <span className={`text-sm font-semibold ${roasColor}`}>{roas.toFixed(2)}x</span>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleSync(c.id); }}
                                        className={`p-1.5 rounded-lg border border-white/5 text-gray-500 hover:text-violet-400 hover:border-violet-500/30 transition-all ${syncing === c.id ? 'animate-spin text-violet-400' : ''}`}
                                        title="Sync metrics"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-5">
                        <p className="text-xs text-gray-500">
                            {pagination.total} campaigns total
                        </p>
                        <div className="flex gap-2">
                            <button disabled={pagination.page <= 1}
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 disabled:opacity-30">
                                Previous
                            </button>
                            <button disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 disabled:opacity-30">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddCampaignModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={() => { setShowAddModal(false); fetchCampaigns(); }}
                />
            )}
        </main>
    );
}

// ─── Add Campaign Modal ───────────────────────────────────────
function AddCampaignModal({ onClose, onCreated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        client_id: '', platform: 'meta', name: '', objective: '',
        status: 'active', budget_daily: '', budget_total: '',
        start_date: '', end_date: '',
    });

    useEffect(() => {
        api.get('/clients?limit=100').then(({ data }) => {
            if (data.success) setClients(data.data.clients);
        }).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/campaigns', {
                ...form,
                budget_daily: parseFloat(form.budget_daily) || null,
                budget_total: parseFloat(form.budget_total) || null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
            });
            onCreated();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create campaign');
            setLoading(false);
        }
    };

    const inputCls = "w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm";
    const labelCls = "block text-xs text-gray-400 mb-1 font-medium";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold text-white mb-1">Add Campaign</h2>
                <p className="text-xs text-gray-500 mb-5">Create a campaign manually — sync metrics after adding</p>

                {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelCls}>Client *</label>
                        <select required value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
                            <option value="" className="bg-gray-900">Select client...</option>
                            {clients.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.business_name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Platform *</label>
                            <select required value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputCls}>
                                <option value="meta" className="bg-gray-900">Meta Ads</option>
                                <option value="google_ads" className="bg-gray-900">Google Ads</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                                <option value="active" className="bg-gray-900">Active</option>
                                <option value="paused" className="bg-gray-900">Paused</option>
                                <option value="draft" className="bg-gray-900">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Campaign Name *</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale — Meta" className={inputCls} />
                    </div>

                    <div>
                        <label className={labelCls}>Objective</label>
                        <input value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} placeholder="e.g. CONVERSIONS, REACH, LEAD_GEN" className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Daily Budget (₹)</label>
                            <input type="number" value={form.budget_daily} onChange={e => setForm({ ...form, budget_daily: e.target.value })} placeholder="2000" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Total Budget (₹)</label>
                            <input type="number" value={form.budget_total} onChange={e => setForm({ ...form, budget_total: e.target.value })} placeholder="60000" className={inputCls} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Start Date</label>
                            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>End Date</label>
                            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputCls} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium disabled:opacity-50 transition-all">
                            {loading ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
