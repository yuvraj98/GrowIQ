'use client';

import { useState, useEffect } from 'react';
import { 
    Search, Plus, TrendingUp, TrendingDown, Minus, 
    Link as LinkIcon, Trash2, Hash, Globe, Filter,
    Activity, ChevronRight, X, LayoutGrid, List
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';

export default function SEOTrackerPage() {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ keyword: '', url: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            fetchKeywords();
        } else {
            setKeywords([]);
        }
    }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients?limit=100');
            if (data.success) {
                setClients(data.data.clients);
                if (data.data.clients.length > 0) setSelectedClient(data.data.clients[0].id);
            }
        } catch {}
    };

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/seo/${selectedClient}`);
            if (data.success) setKeywords(data.data);
        } catch (err) {
            console.error('Fetch SEO failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddKeyword = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post(`/seo/${selectedClient}`, formData);
            if (data.success) {
                setShowAddModal(false);
                setFormData({ keyword: '', url: '' });
                fetchKeywords();
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to add keyword');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Stop tracking this keyword?')) return;
        try {
            await api.delete(`/seo/keyword/${id}`);
            setKeywords(prev => prev.filter(k => k.id !== id));
        } catch {}
    };

    // Helper to render position change
    const renderChange = (current, prev) => {
        if (!prev || current === prev) return <span className="text-gray-500 flex items-center gap-1"><Minus className="w-3 h-3" /> 0</span>;
        const diff = prev - current; // Lower is better in ranking
        if (diff > 0) return <span className="text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{diff}</span>;
        return <span className="text-red-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> {diff}</span>;
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopBar 
                title="SEO Performance Tracker" 
                description="Monitor keyword rankings, search volume, and organic growth across clients."
                actions={
                    <div className="flex items-center gap-3">
                        <select 
                            value={selectedClient} 
                            onChange={e => setSelectedClient(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                        </select>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.97] transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Keyword
                        </button>
                    </div>
                }
            />

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {/* Core Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Keywords', value: keywords.length, icon: Hash, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Top 3 Rankings', value: keywords.filter(k => k.current_position <= 3).length, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Top 10 Rankings', value: keywords.filter(k => k.current_position <= 10).length, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Visibility Score', value: '64%', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Keyword List */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Keyword / URL</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-center">Rank</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-center">Change</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-center">Volume</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-center">Difficulty</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8 bg-white/5"></td>
                                    </tr>
                                ))
                            ) : keywords.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-sm text-gray-500">
                                        No keywords tracked for this client yet.
                                    </td>
                                </tr>
                            ) : keywords.map(kw => (
                                <tr key={kw.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{kw.keyword}</p>
                                            <div className="flex items-center gap-1.5 mt-1 text-gray-600 group-hover:text-gray-600 dark:text-gray-400 transition-colors">
                                                <LinkIcon className="w-3 h-3" />
                                                <span className="text-[10px] truncate max-w-[200px]">{kw.url || 'No URL specified'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${
                                            kw.current_position <= 3 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                                            kw.current_position <= 10 ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' :
                                            'bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                                        }`}>
                                            {kw.current_position || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs font-medium">
                                        {renderChange(kw.current_position, kw.previous_position)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-400">
                                        {kw.search_volume?.toLocaleString() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                                <div className={`h-full rounded-full ${kw.difficulty > 50 ? 'bg-red-500' : kw.difficulty > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${kw.difficulty}%` }} />
                                            </div>
                                            <span className="text-[10px] text-gray-500">{kw.difficulty}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(kw.id)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Keyword Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/70 backdrop-blur-md">
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Add Search Term</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-slate-900 dark:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddKeyword} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Focus Keyword</label>
                                <input 
                                    required autoFocus placeholder="e.g. digital marketing services"
                                    value={formData.keyword} onChange={e => setFormData({...formData, keyword: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Landing URL (Optional)</label>
                                <input 
                                    placeholder="https://client.com/services"
                                    value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                />
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit" disabled={submitting}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Connecting...' : 'Start Tracking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
