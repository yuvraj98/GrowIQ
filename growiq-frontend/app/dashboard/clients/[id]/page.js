'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Building2, Mail, Phone, Globe, Calendar, CreditCard,
    TrendingUp, BarChart3, FileText, Edit2, Trash2, Users, Shield,
    ExternalLink, Zap
} from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import TopBar from '@/components/layout/TopBar';

const PLATFORM_INFO = {
    meta:           { label: 'Meta Ads',          icon: '𝓜', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
    google_ads:     { label: 'Google Ads',         icon: 'G',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    ga4:            { label: 'Google Analytics 4', icon: '📊', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
    search_console: { label: 'Search Console',     icon: '🔍', color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
    instagram:      { label: 'Instagram',          icon: '📸', color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
};

const HEALTH_COLORS = (score) => {
    if (score >= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Healthy' };
    if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Needs Attention' };
    return { text: 'text-red-400', bg: 'bg-red-500', label: 'At Risk' };
};

const STATUS_STYLES = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    churned: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TABS = [
    { id: 'overview',      label: 'Overview',    icon: Building2 },
    { id: 'campaigns',     label: 'Campaigns',   icon: BarChart3 },
    { id: 'integrations',  label: 'Integrations',icon: Shield },
    { id: 'invoices',      label: 'Invoices',    icon: CreditCard, sprint: 11 },
    { id: 'reports',       label: 'Reports',     icon: FileText,   sprint: 12 },
];

export default function ClientDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [integrations, setIntegrations] = useState([]);
    const [intLoading, setIntLoading] = useState(false);
    const [connecting, setConnecting] = useState(null);

    const fetchIntegrations = async () => {
        setIntLoading(true);
        try {
            const { data } = await api.get(`/integrations/${id}`);
            if (data.success) setIntegrations(data.data);
        } catch {} finally { setIntLoading(false); }
    };

    const handleConnect = async (platform) => {
        setConnecting(platform);
        try {
            await api.post(`/integrations/${id}/connect`, {
                platform,
                access_token: `mock_${platform}_token_${Date.now()}`,
                account_id: `mock_account_${Math.floor(Math.random() * 900000 + 100000)}`,
            });
            await fetchIntegrations();
        } catch (err) { console.error('Connect failed:', err); }
        finally { setConnecting(null); }
    };

    const handleDisconnect = async (platform) => {
        if (!confirm(`Disconnect ${PLATFORM_INFO[platform]?.label}?`)) return;
        try {
            await api.delete(`/integrations/${id}/${platform}`);
            await fetchIntegrations();
        } catch (err) { console.error('Disconnect failed:', err); }
    };

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const { data } = await api.get(`/clients/${id}`);
                if (data.success) {
                    setClient(data.data);
                    setEditForm(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch client:', error);
                if (error.response?.status === 404) {
                    router.push('/dashboard/clients');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id, router]);

    // Load integrations when tab is switched to integrations
    useEffect(() => {
        if (activeTab === 'integrations' && client) fetchIntegrations();
    }, [activeTab, client]);

    const handleUpdate = async () => {
        try {
            const { data } = await api.put(`/clients/${id}`, {
                business_name: editForm.business_name,
                contact_name: editForm.contact_name,
                contact_email: editForm.contact_email,
                contact_phone: editForm.contact_phone,
                industry: editForm.industry,
                website: editForm.website,
                gst_number: editForm.gst_number,
                monthly_retainer: parseFloat(editForm.monthly_retainer) || 0,
                status: editForm.status,
                notes: editForm.notes,
            });
            if (data.success) {
                setClient(data.data);
                setEditing(false);
            }
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleArchive = async () => {
        if (!confirm('Are you sure you want to archive this client? This will mark them as churned.')) return;
        try {
            await api.delete(`/clients/${id}`);
            router.push('/dashboard/clients');
        } catch (error) {
            console.error('Archive failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">Client not found</p>
                    <Link href="/dashboard/clients" className="text-violet-400 text-sm mt-2 inline-block hover:underline">
                        ← Back to Clients
                    </Link>
                </div>
            </div>
        );
    }

    const health = HEALTH_COLORS(client.health_score);

    return (
        <main className="flex-1 flex flex-col">
            <TopBar
                backHref="/dashboard/clients"
                backLabel="Clients"
                title={client.business_name}
                actions={
                    <>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition-all"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            {editing ? 'Cancel' : 'Edit'}
                        </button>
                        {user?.role === 'owner' && (
                            <button
                                onClick={handleArchive}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Archive
                            </button>
                        )}
                    </>
                }
            />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Client Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span className={`text-sm px-3 py-1 rounded-full border capitalize ${STATUS_STYLES[client.status]}`}>
                            {client.status}
                        </span>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <p className="text-xs text-gray-500 mb-1">Health Score</p>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${health.text}`}>{client.health_score}</span>
                            <span className={`text-xs ${health.text}`}>{health.label}</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <p className="text-xs text-gray-500 mb-1">Monthly Retainer</p>
                        <span className="text-2xl font-bold text-white">
                            ₹{Number(client.monthly_retainer).toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <p className="text-xs text-gray-500 mb-1">Active Campaigns</p>
                        <span className="text-2xl font-bold text-white">{client.campaign_count || 0}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-white/5 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-violet-500 text-violet-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.sprint && <span className="text-[10px] text-gray-600 ml-1">S{tab.sprint}</span>}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                            <h3 className="text-sm font-medium text-gray-400 mb-4">Contact Information</h3>
                            {editing ? (
                                <div className="space-y-3">
                                    <input value={editForm.contact_name || ''} onChange={(e) => setEditForm({...editForm, contact_name: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Contact Name" />
                                    <input value={editForm.contact_email || ''} onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Email" />
                                    <input value={editForm.contact_phone || ''} onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Phone" />
                                    <input value={editForm.website || ''} onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Website" />
                                    <button onClick={handleUpdate}
                                        className="w-full py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-all">
                                        Save Changes
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300">{client.contact_name || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300">{client.contact_email || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300">{client.contact_phone || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        {client.website ? (
                                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline flex items-center gap-1">
                                                {client.website} <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-300">Not set</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Business Details */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                            <h3 className="text-sm font-medium text-gray-400 mb-4">Business Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Industry</span>
                                    <span className="text-gray-300">{client.industry || 'Not set'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Plan</span>
                                    <span className="text-white capitalize font-medium">{client.plan}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">GST Number</span>
                                    <span className="text-gray-300 font-mono text-xs">{client.gst_number || 'Not set'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Contract Period</span>
                                    <span className="text-gray-300">
                                        {client.contract_start ? new Date(client.contract_start).toLocaleDateString('en-IN') : '?'} — {client.contract_end ? new Date(client.contract_end).toLocaleDateString('en-IN') : '?'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Overdue Invoices</span>
                                    <span className={parseInt(client.overdue_invoices) > 0 ? 'text-red-400 font-medium' : 'text-emerald-400'}>
                                        {client.overdue_invoices || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {client.notes && (
                            <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                                <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{client.notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Campaigns tab */}
                {activeTab === 'campaigns' && (
                    <CampaignsTab clientId={id} clientName={client.business_name} />
                )}

                {/* Integrations tab */}
                {activeTab === 'integrations' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-white">Platform Integrations</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Connect ad platforms to track campaign metrics automatically.</p>
                            </div>
                            <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                                {integrations.filter(i => i.status === 'connected').length} of {Object.keys(PLATFORM_INFO).length} connected
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                                const integration = integrations.find(i => i.platform === key);
                                const isConnected = integration?.status === 'connected';
                                const isConnecting = connecting === key;
                                return (
                                    <div key={key} className={`rounded-2xl border p-5 transition-all ${
                                        isConnected ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'
                                    }`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${info.bg} border ${info.border} flex items-center justify-center text-lg`}>
                                                    {info.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{info.label}</p>
                                                    {integration?.account_id && (
                                                        <p className="text-[10px] text-gray-500 font-mono">{integration.account_id}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                                                isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : integration?.status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                            }`}>
                                                {isConnected ? 'Connected' : integration?.status || 'Not connected'}
                                            </span>
                                        </div>
                                        {integration?.last_synced_at && (
                                            <p className="text-[10px] text-gray-600 mb-3">
                                                Last synced: {new Date(integration.last_synced_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                        {isConnected ? (
                                            <button onClick={() => handleDisconnect(key)}
                                                className="w-full py-2 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition-all">
                                                Disconnect
                                            </button>
                                        ) : (
                                            <button onClick={() => handleConnect(key)} disabled={isConnecting}
                                                className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all">
                                                {isConnecting ? 'Connecting…' : 'Connect (Dev Mode)'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <p className="text-xs text-amber-400/70">🔧 <strong className="text-amber-400">Dev mode:</strong> Connecting stores a mock token. Real OAuth for Meta & Google Ads will be configured in production with your app credentials.</p>
                        </div>
                    </div>
                )}

                {/* Other future tabs */}
                {(activeTab === 'invoices' || activeTab === 'reports') && (
                    <div className="text-center py-20">
                        <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                            {TABS.find(t => t.id === activeTab)?.label} — Coming Soon
                        </h3>
                        <p className="text-sm text-gray-500">
                            This feature will be implemented in Sprint {TABS.find(t => t.id === activeTab)?.sprint}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

// ── CampaignsTab ──────────────────────────────────────────────
function CampaignsTab({ clientId, clientName }) {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/campaigns?clientId=${clientId}&limit=20`).then(({ data }) => {
            if (data.success) setCampaigns(data.data.campaigns);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [clientId]);

    const STATUS_STYLES = {
        active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        paused:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
        completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        draft:     'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    const PLAT = {
        meta:       { label: 'Meta',   icon: '𝓜', color: 'text-blue-400',    bg: 'bg-blue-500/10' },
        google_ads: { label: 'Google', icon: 'G',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    };

    if (loading) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>;

    if (!campaigns.length) return (
        <div className="text-center py-16">
            <BarChart3 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No campaigns for {clientName} yet.</p>
            <a href="/dashboard/campaigns" className="text-violet-400 text-xs mt-1 inline-block hover:underline">Go to Campaigns →</a>
        </div>
    );

    return (
        <div className="space-y-3">
            {campaigns.map(c => {
                const plat = PLAT[c.platform] || PLAT.meta;
                const roas = parseFloat(c.avg_roas || 0);
                return (
                    <a key={c.id} href={`/dashboard/campaigns/${c.id}`}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                        <div className={`w-9 h-9 rounded-lg ${plat.bg} flex items-center justify-center text-sm font-bold ${plat.color} shrink-0`}>
                            {plat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-violet-400 transition-colors">{c.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                                <span className="text-[10px] text-gray-500">{plat.label}</span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={`text-sm font-semibold ${roas >= 3 ? 'text-emerald-400' : roas >= 1.5 ? 'text-amber-400' : 'text-gray-400'}`}>{roas.toFixed(2)}x ROAS</p>
                            <p className="text-xs text-gray-500">₹{Number(c.total_spend || 0).toLocaleString('en-IN')} spend</p>
                        </div>
                    </a>
                );
            })}
        </div>
    );
}
