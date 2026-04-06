'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap, Shield, Globe, Users, CheckCircle, ArrowRight,
  Loader2, Lock, Clock, Share2, Copy, ChevronDown,
  ChevronUp, AlertCircle, BookOpen, TrendingUp, ExternalLink
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://neuromart-backend-tu92.onrender.com';

function fmtUSD(v: any) { return `$${Number(v).toLocaleString()}`; }
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NEED_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  low:      'bg-green-100 text-green-700 border-green-200',
};

export default function CampaignPage() {
  const params = useParams();
  const slug   = params?.slug as string;

  const [data,      setData]      = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/edufund/campaigns/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load campaign'))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetch(`${API_BASE}/api/edufund/campaigns/${slug}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setData(d); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: data?.campaign?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">{error || 'Campaign not found'}</p>
        <Link href="/" className="text-purple-600 text-sm hover:underline mt-2 block">← Back to campaigns</Link>
      </div>
    </div>
  );

  const { campaign, students = [], recent_donors = [] } = data;
  const pct = Math.min(100, Math.round(parseFloat(campaign.funded_pct) || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">EduFund</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={share}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-purple-300 transition-colors">
              {copied ? <CheckCircle className="h-4 w-4 text-purple-500" /> : <Share2 className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <Link href={`/donate/${campaign.slug}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 transition-all">
              <GraduationCap className="h-4 w-4" /> Donate Now
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Campaign header */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
              <div className="h-56 relative">
                {campaign.cover_image_url ? (
                  <img src={campaign.cover_image_url} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-700 flex items-center justify-center">
                    <GraduationCap className="h-20 w-20 text-white/20" />
                  </div>
                )}
                {campaign.verified && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    <Shield className="h-3 w-3" /> Verified Institution
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2">{campaign.org_name}</p>
                <h1 className="text-2xl font-black text-slate-900 mb-2">{campaign.title}</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{campaign.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{campaign.city}, {campaign.country}</span>
                  {campaign.academic_year && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{campaign.academic_year}</span>}
                </div>

                {/* Progress */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-black text-slate-900 text-xl">{fmtUSD(campaign.raised_amount)}</span>
                    <span className="text-slate-400">of {fmtUSD(campaign.target_amount)}</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }} />
                    {[25, 50, 75].map(m => (
                      <div key={m} className="absolute top-0 h-full w-px bg-white/60" style={{ left: `${m}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{pct}% funded</span>
                    <span>{students.length} students · {students.filter((s: any) => s.status === 'completed').length} supported</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6">
              <h2 className="font-black text-slate-900 text-lg mb-5">Students by Priority</h2>
              <div className="space-y-4">
                {students.map((s: any) => {
                  const sPct = s.total_cost > 0 ? Math.min(100, Math.round((s.funded_amount / s.total_cost) * 100)) : 0;
                  const isExpanded = expanded === s.id;
                  return (
                    <div key={s.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-slate-800">{s.display_name}</span>
                              <span className="text-slate-400 text-xs">{s.gender}, {s.age}y</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${NEED_COLORS[s.financial_need] || NEED_COLORS.moderate}`}>
                                {s.financial_need} need
                              </span>
                            </div>
                            <p className="text-slate-500 text-sm">{s.program} · {s.grade_level}</p>
                            {s.institution && <p className="text-slate-400 text-xs mt-0.5">{s.institution}</p>}
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>{fmtUSD(s.funded_amount)} funded</span>
                                <span>{fmtUSD(s.total_cost)} needed</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                  style={{ width: `${sPct}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-black text-purple-600">{sPct}%</div>
                            <button onClick={() => setExpanded(isExpanded ? null : s.id)}
                              className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1 mt-1">
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && s.funding_items?.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Funding Breakdown</p>
                          {s.funding_items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                              <div className="flex-1">
                                <p className="text-sm text-slate-700 font-medium">{item.description}</p>
                                <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm font-bold text-slate-800">{fmtUSD(item.amount)}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  item.status === 'paid'             ? 'bg-green-100 text-green-700' :
                                  item.status === 'funded'           ? 'bg-purple-100 text-purple-700' :
                                  item.status === 'partially_funded' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-500'
                                }`}>{item.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No students added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Donate CTA */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white">
              <h3 className="font-black text-lg mb-2">Fund a student today</h3>
              <p className="text-purple-100 text-sm mb-6 leading-relaxed">Every dollar is traced to a specific student's tuition, books, or housing — verified on blockchain.</p>
              <Link href={`/donate/${campaign.slug}`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white text-purple-700 font-black rounded-2xl hover:bg-purple-50 transition-colors">
                <GraduationCap className="h-5 w-5" /> Donate Now
              </Link>
              <div className="flex items-center gap-2 mt-4 justify-center">
                <Lock className="h-3.5 w-3.5 text-purple-200" />
                <p className="text-xs text-purple-200">Blockchain-anchored on Polygon</p>
              </div>
            </div>

            {/* Blockchain badge */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="font-bold text-slate-800 text-sm">Blockchain Verified</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Every donation, fee statement, payment, and student outcome is anchored immutably on the Polygon blockchain.</p>
            </div>

            {/* Live donor feed */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">Recent Donors</h3>
              </div>
              {recent_donors.length === 0 ? (
                <div className="p-6 text-center">
                  <GraduationCap className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">Be the first to donate</p>
                  <Link href={`/donate/${campaign.slug}`}
                    className="text-purple-600 text-xs hover:underline mt-2 block">Donate now →</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recent_donors.map((d: any, i: number) => (
                    <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{d.display_name}</p>
                        <p className="text-xs text-slate-400">{timeAgo(d.created_at)}</p>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{fmtUSD(d.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trace widget */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Trace a Donation</h3>
              <Link href="/trace"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-purple-200 text-purple-600 text-sm font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                Enter trace code <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}