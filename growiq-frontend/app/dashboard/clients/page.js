'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Users, Plus, Search, Building2, Globe, Mail, Phone, TrendingUp
} from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import TopBar from '@/components/layout/TopBar';

const STATUS_STYLES = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    churned: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const HEALTH_COLORS = (score) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
};

export default function ClientsPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
            });
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);

            const { data } = await api.get(`/clients?${params.toString()}`);
            if (data.success) {
                setClients(data.data.clients);
                setPagination(prev => ({ ...prev, ...data.data.pagination }));
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
            // If no clients exist yet, try to seed
            if (error.response?.status !== 401) {
                try {
                    await api.post('/dev/seed');
                    // Retry fetch
                    const { data } = await api.get(`/clients?page=1&limit=10`);
                    if (data.success) {
                        setClients(data.data.clients);
                        setPagination(prev => ({ ...prev, ...data.data.pagination }));
                    }
                } catch (seedError) {
                    console.error('Seed also failed:', seedError);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [pagination.page, search, statusFilter]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(prev => prev === status ? '' : status);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <main className="flex-1 flex flex-col">
            <TopBar
                title="Clients"
                description="Manage your agency's client portfolio"
                actions={
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                }
            />

                <div className="p-6">
                    {/* Search & Filters */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['active', 'paused', 'churned'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                                        statusFilter === status
                                            ? STATUS_STYLES[status]
                                            : 'border-gray-200 dark:border-white/5 text-gray-500 hover:border-gray-200 dark:hover:border-white/10 hover:text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Client Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5 animate-pulse">
                                    <div className="h-5 w-40 bg-white/10 rounded mb-3" />
                                    <div className="h-4 w-32 bg-white/5 rounded mb-5" />
                                    <div className="h-20 bg-white/5 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="text-center py-20">
                            <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No clients yet</h3>
                            <p className="text-sm text-gray-500 mb-6">Add your first client to get started</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all"
                            >
                                <Plus className="w-4 h-4 inline mr-1" /> Add Client
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                        className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-500/20 dark:hover:border-white/10 transition-all duration-200 cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-slate-900 dark:text-white font-medium group-hover:text-violet-400 transition-colors">
                                                    {client.business_name}
                                                </h3>
                                                <p className="text-xs text-gray-500">{client.industry || 'No industry set'}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[client.status]}`}>
                                                {client.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {client.contact_name && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <Users className="w-3 h-3" />
                                                    <span>{client.contact_name}</span>
                                                </div>
                                            )}
                                            {client.contact_email && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{client.contact_email}</span>
                                                </div>
                                            )}
                                            {client.website && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <Globe className="w-3 h-3" />
                                                    <span className="truncate">{client.website}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className={`w-3.5 h-3.5 ${HEALTH_COLORS(client.health_score)}`} />
                                                <span className={`text-sm font-semibold ${HEALTH_COLORS(client.health_score)}`}>
                                                    {client.health_score}
                                                </span>
                                                <span className="text-[10px] text-gray-600">health</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ₹{Number(client.monthly_retainer).toLocaleString('en-IN')}/mo
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-xs text-gray-500">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} – {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={pagination.page <= 1}
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            disabled={pagination.page >= pagination.totalPages}
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            {/* Add Client Modal */}
            {showAddModal && (
                <AddClientModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={() => {
                        setShowAddModal(false);
                        fetchClients();
                    }}
                />
            )}
        </main>
    );
}

function AddClientModal({ onClose, onCreated }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        business_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        industry: '',
        website: '',
        gst_number: '',
        plan: 'starter',
        monthly_retainer: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...form,
                monthly_retainer: parseFloat(form.monthly_retainer) || 0,
            };
            await api.post('/clients', payload);
            onCreated();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create client');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-fade-in-up">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Add New Client</h2>
                <p className="text-sm text-gray-500 mb-5">Enter client details below</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Business Name *</label>
                        <input
                            required
                            value={form.business_name}
                            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                            placeholder="Client's business name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                            <input
                                value={form.contact_name}
                                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="Contact person"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input
                                value={form.contact_phone}
                                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="+91 XXXXX"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.contact_email}
                                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="email@client.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                            <input
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="e.g. Food & Beverage"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Website</label>
                            <input
                                value={form.website}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="https://client.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Monthly Retainer (₹)</label>
                            <input
                                type="number"
                                value={form.monthly_retainer}
                                onChange={(e) => setForm({ ...form, monthly_retainer: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="35000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">GST Number</label>
                            <input
                                value={form.gst_number}
                                onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                placeholder="27AAACF0123A1Z5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                            <select
                                value={form.plan}
                                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                            >
                                <option value="starter" className="bg-white dark:bg-gray-900">Starter</option>
                                <option value="growth" className="bg-white dark:bg-gray-900">Growth</option>
                                <option value="premium" className="bg-white dark:bg-gray-900">Premium</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Creating...' : 'Create Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
