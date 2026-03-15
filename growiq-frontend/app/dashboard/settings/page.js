'use client';

import { useState, useEffect } from 'react';
import {
    Settings, Shield, Bell, Users, Palette, CreditCard,
    ChevronRight, CheckCircle2, AlertCircle, XCircle,
    Building2, Mail, Phone, Globe, Save, Edit2
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import useAuthStore from '@/store/authStore';
import { getInitials } from '@/lib/utils';

const PLATFORM_INFO = {
    meta:           { label: 'Meta Ads',          icon: '𝓜', color: 'text-blue-400',    bg: 'bg-blue-500/10',    desc: 'Facebook & Instagram advertising' },
    google_ads:     { label: 'Google Ads',         icon: 'G',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Search, Display & Shopping ads' },
    ga4:            { label: 'Google Analytics 4', icon: '📊', color: 'text-orange-400',  bg: 'bg-orange-500/10',  desc: 'Website analytics & conversions' },
    search_console: { label: 'Search Console',     icon: '🔍', color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  desc: 'SEO performance & indexing' },
    instagram:      { label: 'Instagram Insights', icon: '📸', color: 'text-pink-400',    bg: 'bg-pink-500/10',    desc: 'Organic reach & engagement' },
};

const TABS = [
    { id: 'profile',  label: 'Agency Profile',  icon: Building2 },
    { id: 'team',     label: 'Team Members',     icon: Users },
    { id: 'integrations', label: 'Platform Guide', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [clients, setClients] = useState([]);
    const [clientIntegrations, setClientIntegrations] = useState({});
    const [loadingIntegrations, setLoadingIntegrations] = useState(false);
    const [agencyForm, setAgencyForm] = useState({ name: '', email: '', phone: '', website: '' });
    const [editingAgency, setEditingAgency] = useState(false);

    // Team management state
    const [teamMembers, setTeamMembers] = useState([]);
    const [inviting, setInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'manager' });
    const [loadingTeam, setLoadingTeam] = useState(false);

    useEffect(() => {
        if (activeTab === 'integrations') fetchAllIntegrations();
        if (activeTab === 'team') fetchTeamMembers();
    }, [activeTab]);

    useEffect(() => {
        // Pre-fill agency form with user data
        setAgencyForm(prev => ({ ...prev, name: user?.agency?.name || 'My Agency', email: user?.email || '' }));
    }, [user]);

    const fetchAllIntegrations = async () => {
        setLoadingIntegrations(true);
        try {
            const { data: clientData } = await api.get('/clients?limit=50');
            if (clientData.success) {
                setClients(clientData.data.clients);
                // Load integrations for all clients in parallel
                const integrationMap = {};
                await Promise.all(clientData.data.clients.map(async (c) => {
                    try {
                        const { data } = await api.get(`/integrations/${c.id}`);
                        if (data.success) integrationMap[c.id] = data.data;
                    } catch {}
                }));
                setClientIntegrations(integrationMap);
            }
        } finally {
            setLoadingIntegrations(false);
        }
    };

    const fetchTeamMembers = async () => {
        setLoadingTeam(true);
        try {
            const { data } = await api.get('/team');
            if (data.success) setTeamMembers(data.data);
        } catch {} finally { setLoadingTeam(false); }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await api.post('/team/invite', inviteForm);
            setInviting(false);
            setInviteForm({ name: '', email: '', role: 'manager' });
            fetchTeamMembers();
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Error inviting member');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.patch(`/team/${id}/role`, { role: newRole });
            fetchTeamMembers();
        } catch {}
    };

    const handleDeleteMember = async (id) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            await api.delete(`/team/${id}`);
            fetchTeamMembers();
        } catch (err) { alert(err.response?.data?.error?.message || 'Error removing member'); }
    };

    const connectedCount = Object.values(clientIntegrations).flat().filter(i => i.status === 'connected').length;

    return (
        <main className="flex-1 flex flex-col">
            <TopBar title="Settings" description="Manage your agency account and preferences" />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-56 border-r border-gray-200 dark:border-white/5 p-4 flex flex-col gap-1 shrink-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full text-left ${activeTab === tab.id
                                ? 'bg-violet-500/10 text-violet-400 font-medium'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto">

                    {/* Agency Profile */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Agency Profile</h2>
                                <p className="text-sm text-gray-500">This info appears on reports and invoices.</p>
                            </div>

                            {/* Avatar */}
                            <div className="flex items-center gap-5 p-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/20">
                                    {getInitials(user?.name)}
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-medium">{user?.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{user?.role} · {user?.email}</p>
                                </div>
                            </div>

                            {/* Agency Form */}
                            <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Agency Details</h3>
                                    <button onClick={() => setEditingAgency(!editingAgency)}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors">
                                        <Edit2 className="w-3 h-3" />
                                        {editingAgency ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                {[
                                    { key: 'name',    label: 'Agency Name',   placeholder: 'Your Agency Name', icon: Building2 },
                                    { key: 'email',   label: 'Business Email', placeholder: 'hello@agency.com', icon: Mail },
                                    { key: 'phone',   label: 'Phone',          placeholder: '+91 XXXXX XXXXX', icon: Phone },
                                    { key: 'website', label: 'Website',        placeholder: 'https://agency.com', icon: Globe },
                                ].map(f => (
                                    <div key={f.key} className="flex items-center gap-3">
                                        <f.icon className="w-4 h-4 text-gray-500 shrink-0" />
                                        {editingAgency ? (
                                            <input value={agencyForm[f.key]} onChange={e => setAgencyForm({ ...agencyForm, [f.key]: e.target.value })}
                                                placeholder={f.placeholder}
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                        ) : (
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-600">{f.label}</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{agencyForm[f.key] || <span className="text-gray-600 italic">Not set</span>}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {editingAgency && (
                                    <button onClick={() => setEditingAgency(false)}
                                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Platform Integrations Guide */}
                    {activeTab === 'integrations' && (
                        <div className="max-w-3xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Platform Integration Guide</h2>
                                    <p className="text-sm text-gray-500">View connection status across all clients. Connect platforms per-client from their detail page.</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
                                    {connectedCount} connected
                                </div>
                            </div>

                            {/* Platform cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                                    const allConnectedForPlatform = Object.entries(clientIntegrations).map(([cId, integrations]) => {
                                        const match = integrations.find(i => i.platform === key);
                                        const cName = clients.find(c => c.id === cId)?.business_name;
                                        return { clientName: cName, status: match?.status || 'disconnected', account_id: match?.account_id };
                                    });
                                    const connectedForThis = allConnectedForPlatform.filter(i => i.status === 'connected').length;

                                    return (
                                        <div key={key} className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-xl ${info.bg} flex items-center justify-center text-lg`}>
                                                    {info.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{info.label}</p>
                                                    <p className="text-xs text-gray-500">{info.desc}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                {loadingIntegrations ? (
                                                    <div className="h-4 bg-white/5 rounded animate-pulse" />
                                                ) : allConnectedForPlatform.length === 0 ? (
                                                    <p className="text-xs text-gray-600 italic">No clients yet</p>
                                                ) : (
                                                    allConnectedForPlatform.map(({ clientName, status }) => (
                                                        <div key={clientName} className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{clientName}</span>
                                                            {status === 'connected'
                                                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                                : status === 'error'
                                                                    ? <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                                    : <XCircle className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5 text-xs text-gray-500">
                                                {connectedForThis} of {clients.length} clients connected
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Dev notice */}
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <p className="text-xs text-amber-400 font-medium mb-1">🔧 Development Mode</p>
                                <p className="text-xs text-amber-400/70">
                                    Real OAuth flows for Meta & Google Ads require app review (4–6 weeks). In dev mode, platforms can be connected from each client's detail page using any placeholder token. The mock sync engine generates realistic metrics in the meantime.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Team Members */}
                    {activeTab === 'team' && (
                        <div className="max-w-2xl space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Team Members</h2>
                                    <p className="text-sm text-gray-500">Manage who has access to your agency's client data.</p>
                                </div>
                                {user?.role === 'owner' && (
                                    <button onClick={() => setInviting(!inviting)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all">
                                        {inviting ? 'Cancel' : '+ Invite Member'}
                                    </button>
                                )}
                            </div>
                            
                            {inviting && (
                                <form onSubmit={handleInvite} className="p-5 rounded-2xl border border-violet-500/30 bg-violet-500/5 space-y-4">
                                    <h3 className="text-sm font-medium text-violet-300">Invite New User</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Full Name" value={inviteForm.name} onChange={e => setInviteForm({...inviteForm, name: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                        <input required type="email" placeholder="Email Address" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})} className="flex-1 px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                            <option value="manager">Manager (Full Access)</option>
                                            <option value="finance">Finance (Invoicing & Billing)</option>
                                            <option value="viewer">Viewer (Read Only)</option>
                                        </select>
                                        <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-500 hover:to-indigo-500 active:scale-[0.97] transition-all shadow-lg shadow-violet-500/20">
                                            Send Invite
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden">
                                {loadingTeam ? (
                                    <div className="p-10 text-center"><div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" /></div>
                                ) : teamMembers.map((member, index) => (
                                    <div key={member.id} className={`flex items-center justify-between p-4 ${index !== teamMembers.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                                                {getInitials(member.name)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                    {member.name} {user?.id === member.id && <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">You</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            {user?.role === 'owner' && user?.id !== member.id ? (
                                                <select 
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className="px-3 py-1.5 rounded bg-transparent border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-xs hover:border-white/30 transition-colors focus:outline-none focus:border-violet-500"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="finance">Finance</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <span className={`text-xs px-2 py-1 rounded-full border capitalize font-medium ${
                                                    member.role === 'owner' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                                    member.role === 'manager' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                    'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                                                }`}>{member.role}</span>
                                            )}

                                            {user?.role === 'owner' && user?.id !== member.id && (
                                                <button onClick={() => handleDeleteMember(member.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Remove Member">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Notification Preferences</h2>
                                <p className="text-sm text-gray-500">Control when and how you receive alerts. Full config in Sprint 10.</p>
                            </div>
                            <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] space-y-4">
                                {[
                                    { label: 'Campaign ROAS drops below threshold', sublabel: 'AI monitors every 6 hours', enabled: true },
                                    { label: 'Invoice overdue alert', sublabel: 'Daily at 9:00 AM', enabled: true },
                                    { label: 'New AI insight available', sublabel: 'Immediate', enabled: false },
                                    { label: 'Client health score drops', sublabel: 'Weekly digest', enabled: true },
                                    { label: 'Platform API token expiry', sublabel: '7 days before expiry', enabled: true },
                                ].map((n, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{n.label}</p>
                                            <p className="text-xs text-gray-600">{n.sublabel}</p>
                                        </div>
                                        <button
                                            className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${n.enabled ? 'bg-violet-600' : 'bg-gray-200 dark:bg-white/10'}`}
                                        >
                                            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${n.enabled ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
