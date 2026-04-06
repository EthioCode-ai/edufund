// ── TRACE LANDING ─────────────────────────────────────────────────────────────
// Save to: app/trace/page.tsx

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Search, Lock } from 'lucide-react';

export default function TraceLanding() {
  const [code, setCode] = useState('');
  const router = useRouter();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) router.push(`/trace/${code.trim().toUpperCase()}`);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Trace Your Donation</h1>
        <p className="text-slate-500 mb-8">Enter your 8-character trace code to see exactly where your dollars went.</p>
        <form onSubmit={submit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <input
            type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3D4" maxLength={8}
            className="w-full px-4 py-4 text-center text-2xl font-black tracking-widest border-2 border-slate-200 focus:border-purple-400 rounded-xl outline-none mb-4 uppercase"
          />
          <button type="submit" disabled={code.length < 6}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
            <Search className="h-4 w-4" /> Trace Donation
          </button>
        </form>
        <Link href="/" className="text-purple-600 text-sm hover:underline mt-6 block">← Back to EduFund</Link>
      </div>
    </div>
  );
}