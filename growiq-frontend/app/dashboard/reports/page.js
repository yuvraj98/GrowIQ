'use client';

import { useState, useEffect } from 'react';
import { 
    FileText, Download, Trash2, Calendar, 
    ChevronRight, Brain, Filter, Plus, X, Activity,
    TrendingUp, ArrowUpRight, Clock
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Report Form
    const [formData, setFormData] = useState({
        clientId: '',
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0]
    });
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [selectedClient]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const url = selectedClient ? `/reports?clientId=${selectedClient}` : '/reports';
            const { data } = await api.get(url);
            if (data.success) setReports(data.data);
        } catch (err) {
            console.error('Fetch reports failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients?limit=100');
            if (data.success) setClients(data.data.clients);
        } catch {}
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const { data } = await api.post(`/reports/${formData.clientId}/generate`, {
                periodStart: formData.periodStart,
                periodEnd: formData.periodEnd
            });
            if (data.success) {
                setShowCreateModal(false);
                fetchReports();
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteReport = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        try {
            await api.delete(`/reports/${id}`);
            setReports(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to delete report');
        }
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopBar 
                title="Performance Reports" 
                description="View and generate deep-dive AI summaries of client campaign performance." 
                actions={
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                    >
                        <Plus className="w-4 h-4" /> Generate Report
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Generated', value: reports.length, icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Sent to Clients', value: reports.filter(r => r.status === 'sent').length, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Pending Review', value: reports.filter(r => r.status === 'generated').length, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Avg Insights/Rpt', value: '4.2', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex overflow-x-auto gap-2 p-1 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 w-full md:w-fit scrollbar-hide">
                        <button 
                            onClick={() => setSelectedClient('')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${!selectedClient ? 'bg-white/10 text-slate-900 dark:text-white' : 'text-gray-500 hover:text-slate-900 dark:text-white'}`}
                        >
                            All Clients
                        </button>
                        {clients.map(c => (
                            <button 
                                key={c.id} onClick={() => setSelectedClient(c.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedClient === c.id ? 'bg-white/10 text-slate-900 dark:text-white' : 'text-gray-500 hover:text-slate-900 dark:text-white'}`}
                            >
                                {c.business_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] animate-pulse" />
                        ))
                    ) : reports.length === 0 ? (
                        <div className="lg:col-span-2 text-center py-24 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 bg-white/[0.01]">
                            <FileText className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No reports found</h3>
                            <p className="text-sm text-gray-500">Generate your first performance report to get started.</p>
                        </div>
                    ) : reports.map(report => (
                        <div key={report.id} className="group p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-violet-500/30 hover:shadow-xl dark:hover:bg-white/[0.04] transition-all relative overflow-hidden">
                            {/* Status indicator */}
                            <div className={`absolute top-0 right-0 h-1 w-24 ${report.status === 'sent' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-violet-500 shadow-sm shadow-violet-500/50'}`} />
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/5 text-gray-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{report.title}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{report.client_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 rounded-lg text-gray-500 hover:text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteReport(report.id)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="p-4 rounded-xl bg-violet-500/[0.03] border border-violet-500/10">
                                    <div className="flex items-center gap-1.5 text-violet-400 mb-1.5">
                                        <Brain className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Analysis Preview</span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic line-clamp-2">
                                        "{report.ai_summary}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                        <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${
                                        report.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {report.status}
                                    </span>
                                </div>
                                <button className="flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-white hover:text-violet-400 transition-colors">
                                    View Full Report <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Report Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/70 backdrop-blur-md">
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Manual Performance Report</h2>
                                <p className="text-xs text-gray-500">Aggregate metrics and generate AI commentary.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 hover:text-slate-900 dark:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleGenerateReport} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Client</label>
                                <select 
                                    required value={formData.clientId} 
                                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                                >
                                    <option value="">Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.periodStart} onChange={e => setFormData({...formData, periodStart: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">End Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.periodEnd} onChange={e => setFormData({...formData, periodEnd: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                <Brain className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-600/80 dark:text-amber-400/60 leading-relaxed">
                                    The automated reporting engine will fetch all connected campaign metrics for this period and use the defined prompt patterns to generate a summary.
                                </p>
                            </div>
                            
                            <div className="pt-2">
                                <button 
                                    type="submit" disabled={generating || !formData.clientId}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {generating ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Metrics...</>
                                    ) : (
                                        <><ArrowUpRight className="w-4 h-4" /> Generate AI Report</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
