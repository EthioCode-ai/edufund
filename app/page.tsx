'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Shield, Lock, CheckCircle, ArrowRight,
  Loader2, Eye, Zap, Play, Users, TrendingUp, BookOpen,
  Globe, Award, ChevronRight
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://neuromart-backend-tu92.onrender.com';

interface Campaign {
  id: string;
  title: string;
  description: string;
  slug: string;
  target_amount: string;
  raised_amount: string;
  funded_pct: string;
  status: string;
  org_name: string;
  city: string;
  country: string;
  verified: boolean;
  student_count: string;
  waiting_count: string;
  completed_count: string;
  cover_image_url: string | null;
  academic_year: string | null;
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const pct       = Math.min(100, Math.round(parseFloat(campaign.funded_pct) || 0));
  const raised    = parseFloat(campaign.raised_amount);
  const target    = parseFloat(campaign.target_amount);
  const waiting   = parseInt(campaign.waiting_count);
  const completed = parseInt(campaign.completed_count);

  return (
    <Link href={`/campaigns/${campaign.slug}`}
      className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="h-48 relative overflow-hidden">
        {campaign.cover_image_url ? (
          <img src={campaign.cover_image_url} alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-700 flex items-center justify-center">
            <GraduationCap className="h-16 w-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {campaign.verified && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 text-purple-700 text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-sm">
            <Shield className="h-3 w-3" /> Verified Institution
          </div>
        )}
        {campaign.academic_year && (
          <div className="absolute top-4 right-4 bg-purple-600/90 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full">
            {campaign.academic_year}
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-white/80" />
            <span className="text-white/90 text-xs font-medium">{campaign.city}, {campaign.country}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2.5 py-1">
            <span className="text-white text-xs font-bold">{pct}% funded</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2">{campaign.org_name}</p>
        <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">{campaign.title}</h3>
        <p className="text-slate-500 text-sm mb-5 leading-relaxed line-clamp-2 flex-grow">{campaign.description}</p>

        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-800">${raised.toLocaleString()}</span>
            <span className="text-slate-400 text-xs">of ${target.toLocaleString()}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{waiting} waiting</span>
            {completed > 0 && <span className="flex items-center gap-1 text-purple-600"><CheckCircle className="h-3.5 w-3.5" />{completed} supported</span>}
          </div>
          <span className="text-sm font-bold text-purple-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            Fund now <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function EduFundHome() {
  const [campaigns,      setCampaigns]      = useState<Campaign[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [platformStats,  setPlatformStats]  = useState({ total_raised: 0, students_supported: 0 });

  useEffect(() => {
    fetch(`${API_BASE}/api/edufund/campaigns`)
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`${API_BASE}/api/edufund/stats`)
      .then(r => r.json())
      .then(d => setPlatformStats(d.stats || {}))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-none">EduFund</p>
              <p className="text-[9px] text-slate-400 leading-none mt-0.5">by TrustFund AI · Neuromart</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#campaigns" className="hover:text-purple-600 transition-colors">Campaigns</Link>
            <Link href="/org" className="hover:text-purple-600 transition-colors">For Institutions</Link>
            <Link href="/trace" className="hover:text-purple-600 transition-colors">Trace Donation</Link>
          </nav>
          <Link href="/org"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 transition-all">
            <GraduationCap className="h-4 w-4" /> Start Campaign
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-full text-sm text-purple-200 mb-8">
            <Lock className="h-3.5 w-3.5" />
            Every dollar blockchain-anchored on Polygon
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none tracking-tight">
            Fund learning.<br />
            <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Trace every dollar.
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            The world's first transparent education fundraising platform. See exactly how your donation covers a student's tuition, textbooks, or housing — verified and immutable on the blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="#campaigns"
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-purple-50 transition-colors flex items-center gap-2 justify-center text-lg shadow-2xl">
              <GraduationCap className="h-5 w-5 text-purple-600" /> Browse Campaigns
            </Link>
            <Link href="/org"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-colors flex items-center gap-2 justify-center text-lg">
              Register Your Institution
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: `$${Number(platformStats.total_raised || 0).toLocaleString()}`, label: 'Total Raised' },
              { value: String(platformStats.students_supported || 0), label: 'Students Supported' },
              { value: '100%', label: 'Traceable' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">How EduFund works</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Four steps. Complete transparency. Your donation traced from wallet to student outcome.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: GraduationCap, color: 'from-purple-400 to-indigo-500',  title: 'You donate',         desc: 'Choose any campaign and contribute any amount. Your identity is protected.' },
              { step: '02', icon: Zap,           color: 'from-indigo-400 to-violet-500',  title: 'AI allocates',       desc: 'Our engine routes dollars to the highest-need student automatically.' },
              { step: '03', icon: Eye,           color: 'from-violet-400 to-purple-500',  title: 'Fees verified',      desc: 'Institution uploads fee statements. Every line item verified and anchored.' },
              { step: '04', icon: Award,         color: 'from-amber-400 to-orange-500',   title: 'Student thanks you', desc: 'After enrollment or graduation, the student sends you a personal thank you.' },
            ].map(({ step, icon: Icon, color, title, desc }) => (
              <div key={step} className="relative">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-5xl font-black text-slate-100 absolute top-0 right-0">{step}</p>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield,       color: 'bg-purple-50 text-purple-600',  title: 'Verified Institutions', sub: 'All schools manually vetted' },
              { icon: Lock,         color: 'bg-indigo-50 text-indigo-600',  title: 'Blockchain Proof',      sub: 'Every event on Polygon mainnet' },
              { icon: BookOpen,     color: 'bg-violet-50 text-violet-600',  title: 'Itemized Tracking',     sub: 'Tuition, books, housing traced' },
              { icon: Play,         color: 'bg-amber-50 text-amber-600',    title: 'Student Thank You',     sub: 'Video messages from students' },
            ].map(({ icon: Icon, color, title, sub }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we fund */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">What EduFund covers</h2>
            <p className="text-slate-500 text-lg">Every dollar traced to a specific educational expense</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎓', title: 'Tuition & Fees',        desc: 'University, college, vocational school tuition and registration fees' },
              { icon: '📚', title: 'Books & Materials',     desc: 'Textbooks, learning materials, lab equipment, devices' },
              { icon: '🏠', title: 'Housing & Transport',   desc: 'Student accommodation and daily commute costs' },
              { icon: '🍽️', title: 'Meals & Nutrition',     desc: 'Daily meals for students who cannot afford to eat' },
              { icon: '📝', title: 'Exam & Certification',  desc: 'Examination fees, professional certifications, licenses' },
              { icon: '🌍', title: 'Study Abroad',          desc: 'Exchange programs, international study opportunities' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all">
                <p className="text-3xl mb-4">{icon}</p>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section id="campaigns" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-purple-600 font-bold text-sm uppercase tracking-wider mb-2">Active Now</p>
              <h2 className="text-4xl font-black text-slate-900">Open Campaigns</h2>
              <p className="text-slate-500 mt-2">Verified institutions accepting donations right now</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Loading campaigns...</p>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="h-20 w-20 rounded-3xl bg-purple-50 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No campaigns yet</h3>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">Be the first institution to create a transparent education fundraising campaign</p>
              <Link href="/org"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-200">
                Register Your Institution <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* Student Thank You highlight */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
          <h2 className="text-4xl font-black mb-6">Hear from the students you helped</h2>
          <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            After enrollment or graduation, every student can send a personal voice or video thank you to their donors. Because education changes lives — and you deserve to know the life you changed.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { emoji: '🎙️', label: 'Voice message',  sub: 'Up to 2 minutes' },
              { emoji: '📹', label: 'Video message',   sub: 'Personal & heartfelt' },
              { emoji: '📧', label: 'Email delivery',  sub: 'Sent to all donors' },
            ].map(({ emoji, label, sub }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
                <p className="text-3xl mb-3">{emoji}</p>
                <p className="font-bold text-white">{label}</p>
                <p className="text-slate-400 text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Your institution. Their future.</h2>
          <p className="text-slate-500 text-lg mb-10">Register your school or university and start accepting transparent, traceable donations for your students today.</p>
          <Link href="/org"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl text-lg shadow-2xl shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-1 transition-all">
            Register Institution <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">EduFund</p>
                <p className="text-[10px] text-slate-500">by TrustFund AI · Neuromart</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="#campaigns" className="hover:text-white transition-colors">Campaigns</Link>
              <Link href="/org" className="hover:text-white transition-colors">Institutions</Link>
              <Link href="/trace" className="hover:text-white transition-colors">Trace Donation</Link>
              <a href="mailto:learn@neuromart.ai" className="hover:text-white transition-colors">learn@neuromart.ai</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© 2026 Neuromart AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://fund.neuromart.ai" className="hover:text-purple-400 transition-colors">HealFund</a>
              <span>·</span>
              <span className="text-purple-400">EduFund</span>
              <span>·</span>
              <span>TraceGive (soon)</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-purple-600" />
              <span className="text-purple-600">Blockchain verified on Polygon</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}