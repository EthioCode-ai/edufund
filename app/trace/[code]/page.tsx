'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap, Shield, Lock, CheckCircle, Loader2,
  AlertCircle, ArrowRight, ExternalLink, DollarSign,
  BookOpen, FileText, Award
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://neuromart-backend-tu92.onrender.com';

function fmtUSD(v: any) { return `$${Number(v).toLocaleString()}`; }
function fmtDate(d: any) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TracePage() {
  const params    = useParams();
  const code      = params?.code as string;
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/edufund/trace/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load trace'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">{error || 'Trace code not found'}</p>
        <Link href="/trace" className="text-purple-600 text-sm hover:underline mt-2 block">Try another code</Link>
      </div>
    </div>
  );

  const { donation, allocations = [] } = data;
  const byStudent: Record<string, any[]> = {};
  for (const a of allocations) {
    if (!byStudent[a.student_name]) byStudent[a.student_name] = [];
    byStudent[a.student_name].push(a);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-700 text-sm">EduFund</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Donation summary */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Donation from</p>
              <p className="text-xl font-black text-slate-900">{donation.donor_name}</p>
              <p className="text-slate-500 text-sm">{donation.campaign_title} · {donation.org_name}</p>
              <p className="text-slate-400 text-xs mt-1">{fmtDate(donation.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-purple-600">{fmtUSD(donation.amount)}</p>
              {donation.blockchain_tx && (
                <a href={`https://polygonscan.com/tx/${donation.blockchain_tx}`} target="_blank" rel="noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 justify-end mt-1">
                  <Lock className="h-3 w-3" /> Blockchain verified <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Dollar trace by student */}
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Dollar Trace Chain</h2>
        {Object.entries(byStudent).map(([studentName, items]) => (
          <div key={studentName} className="bg-white border border-slate-100 rounded-2xl mb-4 overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-slate-50">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{studentName}</p>
                <p className="text-slate-400 text-xs">{items[0]?.program || items[0]?.grade_level}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-black text-purple-600">{fmtUSD(items.reduce((s: number, i: any) => s + Number(i.amount), 0))}</p>
                <p className="text-xs text-slate-400">your contribution</p>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {items.map((item: any, i: number) => (
                <div key={i} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.item_status === 'paid'             ? 'bg-green-50' :
                        item.item_status === 'funded'           ? 'bg-purple-50' :
                        item.item_status === 'partially_funded' ? 'bg-amber-50' : 'bg-slate-50'
                      }`}>
                        <BookOpen className={`h-4 w-4 ${
                          item.item_status === 'paid'             ? 'text-green-500' :
                          item.item_status === 'funded'           ? 'text-purple-500' :
                          item.item_status === 'partially_funded' ? 'text-amber-500' : 'text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{item.item_description}</p>
                        <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-800">{fmtUSD(item.amount)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.item_status === 'paid'             ? 'bg-green-100 text-green-700' :
                        item.item_status === 'funded'           ? 'bg-purple-100 text-purple-700' :
                        item.item_status === 'partially_funded' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{item.item_status?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Invoice */}
                  {item.invoice_number && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-2 flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">Invoice #{item.invoice_number} · {item.provider_name}</p>
                        {item.paid_date && <p className="text-xs text-slate-400">Paid {fmtDate(item.paid_date)}</p>}
                      </div>
                      {item.invoice_blockchain_tx && (
                        <a href={`https://polygonscan.com/tx/${item.invoice_blockchain_tx}`} target="_blank" rel="noreferrer"
                          className="text-indigo-500 hover:text-indigo-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Payment */}
                  {item.payment_date && (
                    <div className="bg-green-50 rounded-xl p-3 mb-2 flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-green-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-green-700">Paid to {item.recipient_name} · {fmtDate(item.payment_date)}</p>
                      </div>
                      {item.payment_blockchain_tx && (
                        <a href={`https://polygonscan.com/tx/${item.payment_blockchain_tx}`} target="_blank" rel="noreferrer"
                          className="text-indigo-500 hover:text-indigo-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Outcome */}
                  {item.outcome_type && (
                    <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3">
                      <Award className="h-4 w-4 text-purple-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-purple-700 capitalize font-medium">{item.outcome_type.replace('_', ' ')}</p>
                        {item.outcome_summary && <p className="text-xs text-purple-500 mt-0.5">{item.outcome_summary}</p>}
                        {item.gpa && <p className="text-xs text-purple-500">GPA: {item.gpa}</p>}
                      </div>
                      {item.outcome_blockchain_tx && (
                        <a href={`https://polygonscan.com/tx/${item.outcome_blockchain_tx}`} target="_blank" rel="noreferrer"
                          className="text-indigo-500 hover:text-indigo-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Blockchain summary */}
        <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-indigo-300" />
            <h3 className="font-bold text-white">Blockchain Verification</h3>
          </div>
          <p className="text-indigo-300 text-sm mb-4">Every event in this trace chain has been cryptographically anchored to the Polygon blockchain.</p>
          {donation.blockchain_tx && (
            <a href={`https://polygonscan.com/tx/${donation.blockchain_tx}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-200 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
              View donation on Polygonscan
            </a>
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors">
            <GraduationCap className="h-4 w-4" /> Make another donation
          </Link>
        </div>
      </div>
    </div>
  );
}