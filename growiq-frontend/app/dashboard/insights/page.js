'use client';

import { useState, useEffect } from 'react';
import { 
    Brain, AlertTriangle, TrendingUp, Lightbulb, 
    CheckCircle2, XCircle, ChevronRight, Zap, ArrowRight, Activity
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import Link from 'next/link';

const ICONS = {
    alert: <AlertTriangle className="w-5 h-5 text-red-400" />,
    opportunity: <Lightbulb className="w-5 h-5 text-amber-400" />,
    forecast: <TrendingUp className="w-5 h-5 text-blue-400" />,
    recommendation: <Brain className="w-5 h-5 text-violet-400" />,
};

const BORDERS = {
    alert: 'border-red-500/20 bg-red-500/[0.02]',
    opportunity: 'border-amber-500/20 bg-amber-500/[0.02]',
    forecast: 'border-blue-500/20 bg-blue-500/[0.02]',
    recommendation: 'border-violet-500/20 bg-violet-500/[0.02]',
};

export default function InsightsPage() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        fetchInsights();
    }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients?limit=50');
            if (data.success) {
                setClients(data.data.clients);
                // default select the first client if it exists, otherwise all
                if (data.data.clients.length > 0) {
                    setSelectedClient(data.data.clients[0].id);
                }
            }
        } catch {} 
    };

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const url = selectedClient ? `/insights?clientId=${selectedClient}` : '/insights';
            const { data } = await api.get(url);
            if (data.success) {
                setInsights(data.data);
            }
        } catch {} finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedClient) return alert('Select a specific client first to run the AI engine.');
        setGenerating(true);
        try {
            const { data } = await api.post(`/insights/${selectedClient}/generate`);
            if (data.success) {
                await fetchInsights();
            }
        } catch {} finally {
            setGenerating(false);
        }
    };

    const handleAction = async (id) => {
        try {
            await api.patch(`/insights/${id}/action`);
            setInsights(prev => prev.map(i => i.id === id ? { ...i, is_actioned: true } : i));
        } catch {}
    };

    const handleDismiss = async (id) => {
        try {
            await api.patch(`/insights/${id}/dismiss`);
            setInsights(prev => prev.filter(i => i.id !== id));
        } catch {}
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopBar 
                title="AI Insights Engine" 
                description="Actionable intelligence spanning your agency's connected campaigns." 
                actions={
                    <button 
                        onClick={handleGenerate} disabled={generating || !selectedClient}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                    >
                        {generating ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Scanning...</>
                        ) : (
                            <><Zap className="w-4 h-4" /> Run Engine</>
                        )}
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                
                {/* Filters */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-wrap gap-2">
                         <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex flex-wrap gap-1 text-sm">
                            <button 
                                onClick={() => setSelectedClient('')}
                                className={`px-4 py-1.5 rounded-lg transition-colors ${!selectedClient ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                            >
                                All Clients
                            </button>
                            {clients.map(c => (
                                <button 
                                    key={c.id} onClick={() => setSelectedClient(c.id)}
                                    className={`px-4 py-1.5 rounded-lg transition-colors ${selectedClient === c.id ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {c.business_name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : insights.length === 0 ? (
                    <div className="text-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                        <Brain className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Intelligence</h3>
                        <p className="text-gray-500 max-w-sm mx-auto text-sm">
                            The AI engine has not generated any recent insights for this selection. 
                            Click "Run Engine" to force a deep scan of active metrics.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {insights.map(insight => (
                            <div 
                                key={insight.id} 
                                className={`p-6 rounded-2xl border ${insight.is_actioned ? 'border-white/5 bg-white/[0.02] opacity-60 grayscale' : BORDERS[insight.type] || BORDERS.recommendation} transition-all relative overflow-hidden group`}
                            >
                                {/* Decorative gradient blob */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-3xl rounded-full pointer-events-none" />

                                <div className="flex gap-5 relative z-10">
                                    <div className="pt-1">
                                        {insight.is_actioned ? <CheckCircle2 className="w-5 h-5 text-gray-500" /> : ICONS[insight.type] || ICONS.recommendation}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${
                                                        insight.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        insight.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                        {insight.severity}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{insight.type}</span>
                                                    {!selectedClient && (
                                                        <>
                                                            <span className="text-gray-600 text-[10px]">•</span>
                                                            <Link href={`/dashboard/clients/${insight.client_id}`} className="text-xs text-violet-400 hover:underline">
                                                                {insight.client_name}
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                                <h3 className={`text-lg font-semibold ${insight.is_actioned ? 'text-gray-400' : 'text-white'}`}>
                                                    {insight.title}
                                                </h3>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1">
                                                {new Date(insight.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                                            {insight.description}
                                        </p>

                                        {/* Actionable Content based on data */}
                                        {insight.data?.campaignId && !insight.is_actioned && (
                                            <Link href={`/dashboard/campaigns/${insight.data.campaignId}`} 
                                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white hover:bg-white/5 transition-colors">
                                                <Activity className="w-4 h-4 text-violet-400" />
                                                Review Campaign
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        )}

                                        {!insight.is_actioned && (
                                            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDismiss(insight.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                                                    Dismiss
                                                </button>
                                                <button onClick={() => handleAction(insight.id)} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Mark Resolved
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
