'use client';

import { useState, useEffect } from 'react';
import { 
    Calendar, Clock, Send, Plus, Instagram, Linkedin, 
    Facebook, Twitter, Image as ImageIcon, MoreHorizontal,
    TrendingUp, BarChart3, Trash2, CheckCircle2, AlertCircle,
    X, ArrowUpRight, ChevronRight, LayoutGrid, List
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import { formatDate } from '@/lib/utils';

const platformIcons = {
    instagram: <Instagram className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />
};

export default function SocialSchedulerPage() {
    const [posts, setPosts] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        clientId: '',
        platform: 'instagram',
        content: '',
        scheduledAt: '',
        mediaUrl: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients?limit=100');
            if (data.success) setClients(data.data.clients);
        } catch {}
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = selectedClient ? `/social?clientId=${selectedClient}` : '/social';
            const { data } = await api.get(url);
            if (data.success) setPosts(data.data);
        } catch (err) {
            console.error('Fetch posts failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/social', formData);
            if (data.success) {
                setShowCreateModal(false);
                setFormData({
                    clientId: '', platform: 'instagram', content: '',
                    scheduledAt: '', mediaUrl: ''
                });
                fetchPosts();
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to schedule post');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePublishNow = async (id) => {
        try {
            await api.patch(`/social/${id}/publish`);
            fetchPosts();
        } catch {}
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this post?')) return;
        try {
            await api.delete(`/social/${id}`);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch {}
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopBar 
                title="Social Content Hub" 
                description="Coordinate multi-platform social media campaigns and track organic engagement."
                actions={
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                    >
                        <Plus className="w-4 h-4" /> Schedule Content
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {/* Analytics Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Reach</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white tracking-tight">24.8K</span>
                            <span className="text-[10px] text-emerald-400 font-bold mb-1">+12%</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Engagement Rate</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white tracking-tight">4.2%</span>
                            <span className="text-[10px] text-emerald-400 font-bold mb-1">+0.8%</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Scheduled Posts</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-white tracking-tight">{posts.filter(p => p.status === 'scheduled').length}</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Platforms</p>
                        <div className="flex gap-2 mt-2">
                            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500"><Instagram className="w-4 h-4" /></div>
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><Linkedin className="w-4 h-4" /></div>
                            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500"><Twitter className="w-4 h-4" /></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                        <button 
                            onClick={() => setSelectedClient('')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedClient ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            All Posts
                        </button>
                        {clients.map(c => (
                            <button 
                                key={c.id} onClick={() => setSelectedClient(c.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedClient === c.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                {c.business_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
                        ))
                    ) : posts.length === 0 ? (
                        <div className="lg:col-span-3 text-center py-24 rounded-3xl border border-dashed border-white/10">
                            <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">No content scheduled yet.</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="group flex flex-col rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
                                {/* Post Body */}
                                <div className="p-5 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-xl bg-white/5 text-white">
                                                {platformIcons[post.platform]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{post.client_name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        post.status === 'published' ? 'bg-emerald-500' : 
                                                        post.status === 'scheduled' ? 'bg-amber-500' : 'bg-gray-500'
                                                    }`} />
                                                    <span className="text-[10px] text-gray-400 capitalize">{post.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                                        <p className="text-sm text-gray-300 leading-relaxed italic">"{post.content}"</p>
                                    </div>

                                    {post.status === 'published' && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                                                <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Likes</p>
                                                <p className="text-xs font-bold text-white">{post.likes || 0}</p>
                                            </div>
                                            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                                                <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Reach</p>
                                                <p className="text-xs font-bold text-white">{post.reach || 0}</p>
                                            </div>
                                            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                                                <p className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Engage</p>
                                                <p className="text-xs font-bold text-white">{post.engagement || 0}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Action */}
                                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {post.status === 'scheduled' ? <Clock className="w-3 h-3 text-amber-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            {post.status === 'scheduled' ? formatDate(post.scheduled_at) : `Published ${formatDate(post.published_at)}`}
                                        </span>
                                    </div>
                                    {post.status === 'scheduled' && (
                                        <button 
                                            onClick={() => handlePublishNow(post.id)}
                                            className="text-[10px] font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1"
                                        >
                                            Publish Now <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Schedule Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-[#0F0F15] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div>
                                <h2 className="text-lg font-bold text-white">Coordinate New Post</h2>
                                <p className="text-xs text-gray-500">Draft your message and set your publishing window.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreatePost} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Client</label>
                                    <select 
                                        required value={formData.clientId} 
                                        onChange={e => setFormData({...formData, clientId: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none transition-all"
                                    >
                                        <option value="">Select client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Platform</label>
                                    <div className="flex gap-2">
                                        {Object.keys(platformIcons).map(p => (
                                            <button 
                                                key={p} type="button"
                                                onClick={() => setFormData({...formData, platform: p})}
                                                className={`flex-1 p-3 rounded-2xl border transition-all flex items-center justify-center ${
                                                    formData.platform === p ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/5 text-gray-600 hover:text-gray-400'
                                                }`}
                                            >
                                                {platformIcons[p]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Content / Caption</label>
                                <textarea 
                                    required rows="4" placeholder="What's the message?"
                                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                                    className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Schedule At (Optional)</label>
                                <input 
                                    type="datetime-local" 
                                    value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                />
                                <p className="text-[10px] text-gray-600 ml-1">Leave empty to save as draft.</p>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" disabled={submitting || !formData.clientId}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Scheduling...' : <><Send className="w-4 h-4" /> Save Content</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
