'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Check } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const PLANS = [
    { id: 'free', name: 'Starter', price: '₹15,000/mo', features: ['1 platform', 'Basic AI', '3 clients'] },
    { id: 'pro', name: 'Growth', price: '₹35,000/mo', features: ['3 platforms', 'Full AI', '10 clients'] },
    { id: 'enterprise', name: 'Premium', price: '₹75,000/mo', features: ['All platforms', 'Daily AI', 'Unlimited'] },
];

import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        agencyName: '',
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload = {
                agency: {
                    name: formData.agencyName,
                    plan: selectedPlan
                },
                user: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }
            };

            const { data } = await api.post('/auth/register', payload);
            
            if (data.success) {
                const { user, tokens } = data.data;
                login(user, tokens.accessToken, tokens.refreshToken);
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-950 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            GrowIQ
                        </span>
                    </Link>
                    <p className="text-gray-500 mt-3">Create your agency account</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
                    {/* Plan Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {PLANS.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`p-3 rounded-xl border text-center transition-all ${selectedPlan === plan.id
                                        ? 'border-violet-500/50 bg-violet-500/10'
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                    }`}
                            >
                                <div className="text-sm font-semibold text-white">{plan.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{plan.price}</div>
                                {selectedPlan === plan.id && (
                                    <Check className="w-4 h-4 text-violet-400 mx-auto mt-1" />
                                )}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="agencyName" className="block text-sm font-medium text-gray-300 mb-1.5">Agency Name</label>
                            <input
                                id="agencyName"
                                required
                                value={formData.agencyName}
                                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                placeholder="Your Agency Name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">Your Name</label>
                                <input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                    placeholder="+91 XXXXX"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                id="reg-email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                placeholder="you@agency.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all pr-10"
                                    placeholder="Min 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account & Start Free Trial'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
