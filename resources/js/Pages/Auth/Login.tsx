import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@tihani.id',
        password: 'admin123',
        remember: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const handleQuickLogin = (role: 'admin' | 'direktur') => {
        if (role === 'admin') {
            setData({
                email: 'admin@tihani.id',
                password: 'admin123',
                remember: true,
            });
        } else {
            setData({
                email: 'direktur@tihani.id',
                password: 'direktur123',
                remember: true,
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Masuk ke Sistem" />

            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-500/25">
                    <Building2 className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    SIA SIPLah Terintegrasi
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                    CV Tihani Mafaza &bull; Bandung, Jawa Barat
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-400">
                    <span>Kerja Praktik & Tugas Akhir &bull; STMIK Mardira Indonesia</span>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errors.email && (
                            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                                {errors.email}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Email Pengguna
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="block w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="nama@tihani.id"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="block w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Ingat saya</span>
                            </label>
                            <span className="text-slate-400">Akses Terenkripsi</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-400 transition-all disabled:opacity-50"
                        >
                            <span>{processing ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>

                    {/* Quick Demo Acccount Switcher for Evaluator/Lecturer */}
                    <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-400 font-medium mb-3">
                            Pilihan Akses Demo (Kerja Praktik):
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('admin')}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white transition-all"
                            >
                                <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Admin (Iasha)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('direktur')}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white transition-all"
                            >
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Direktur CV</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2026 CV Tihani Mafaza &bull; Iasha Tsamrotul Fuadi (D3 Komputerisasi Akuntansi)
                </div>
            </div>
        </div>
    );
}
