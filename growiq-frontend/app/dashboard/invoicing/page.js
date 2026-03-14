'use client';

import { useState, useEffect } from 'react';
import { 
    CreditCard, Plus, Search, Filter, Download, 
    CheckCircle2, Clock, AlertCircle, MoreVertical,
    Building2, Mail, Calendar, FileText, X
} from 'lucide-react';
import api from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const STATUS_STLYES = {
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function InvoicingPage() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Invoice Form
    const [formData, setFormData] = useState({
        clientId: '',
        amount: '',
        notes: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInvoices();
        fetchClients();
    }, [filter]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/invoices' : `/invoices?status=${filter}`;
            const { data } = await api.get(url);
            if (data.success) setInvoices(data.data);
        } catch (err) {
            console.error('Fetch invoices failed:', err);
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

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/invoices', formData);
            if (data.success) {
                setShowCreateModal(false);
                setFormData({ clientId: '', amount: '', notes: '', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
                fetchInvoices();
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to create invoice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkPaid = async (id) => {
        if (!confirm('Are you sure you want to mark this invoice as paid manually?')) return;
        try {
            await api.patch(`/invoices/${id}/pay`, { method: 'manual' });
            fetchInvoices();
        } catch {}
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <TopBar 
                title="Invoicing & Billing" 
                description="Manage client retainers, taxes, and track payment statuses." 
                actions={
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create Invoice
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto p-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-5 h-5 text-amber-400" />
                            <span className="text-sm text-gray-400">Total Outstanding</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + parseFloat(i.total_amount), 0))}
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm text-gray-400">Total Collected</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.total_amount), 0))}
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-sm text-gray-400">Overdue Invoices</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {invoices.filter(i => i.status === 'overdue').length}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                        {['all', 'pending', 'paid', 'overdue'].map(s => (
                            <button 
                                key={s} onClick={() => setFilter(s)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            placeholder="Search invoice or client..." 
                            className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-64"
                        />
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-6 h-12 bg-white/5"></td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-sm text-gray-500">
                                        No invoices found for this criteria.
                                    </td>
                                </tr>
                            ) : invoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{invoice.invoice_number}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{formatDate(invoice.created_at)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/clients/${invoice.client_id}`} className="text-sm text-gray-300 hover:text-white hover:underline transition-colors">
                                            {invoice.client_name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {formatDate(invoice.due_date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-white">{formatCurrency(invoice.total_amount)}</p>
                                        <p className="text-[10px] text-gray-500">Incl. 18% GST</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${STATUS_STLYES[invoice.status]}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {invoice.status !== 'paid' && (
                                                <button 
                                                    onClick={() => handleMarkPaid(invoice.id)}
                                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                    title="Mark as Paid"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">New Manual Invoice</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Select Client</label>
                                <select 
                                    required value={formData.clientId} 
                                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="">Choose a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Base Amount (₹)</label>
                                <input 
                                    required type="number" placeholder="e.g. 50000"
                                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Due Date</label>
                                <input 
                                    type="date" 
                                    value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase">Notes (Optional)</label>
                                <textarea 
                                    placeholder="Brief description of services..."
                                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
                                />
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                    type="submit" disabled={submitting}
                                    className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Generating...' : 'Create & Send Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
