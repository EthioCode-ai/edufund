'use client';

import { useState } from 'react';
import { Loader2, GraduationCap, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://neuromart-backend-tu92.onrender.com';

export default function RegisterPage() {
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);
  const [done,     setDone]     = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields required.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      localStorage.setItem('bc_token', data.token);
      setDone(true);
      setTimeout(() => { window.location.href = '/org'; }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  }

  if (done) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-teal-950 border-2 border-teal-700 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-teal-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Account created!</h2>
        <p className="text-slate-400 text-sm">Redirecting to your institution dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <span className="text-white text-xl font-bold">EduFund</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-slate-400 text-sm">Register to manage your institution on EduFund</p>
        </div>

        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-rose-950 border border-rose-800 text-rose-300 text-sm px-4 py-3 rounded-lg">
              <AlertCircle size={15} className="shrink-0" />{error}
            </div>
          )}
          {[
            { key: 'name',  label: 'Full Name', type: 'text',  placeholder: 'Dr. Abiy Selassie' },
            { key: 'email', label: 'Email',     type: 'email', placeholder: 'admin@school.edu'  },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
              <input type={type}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-colors"
                value={form[key as keyof typeof form]} onChange={set(key)} placeholder={placeholder} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-colors"
                value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <input type="password"
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-colors"
              value={form.confirm} onChange={set('confirm')} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <a href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">Sign in</a>
          </p>
        </form>
        <p className="text-center text-xs text-slate-600 mt-6">
          <a href="/" className="hover:text-slate-400 transition-colors">← Back to EduFund</a>
        </p>
      </div>
    </div>
  );
}