'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, BarChart3, Users, FileText, DollarSign,
  Plus, X, Check, AlertCircle, Loader2, Building2,
  Receipt, CreditCard, Award, Heart, ChevronDown
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://neuromart-backend-tu92.onrender.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bc_token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

type ToastType = { id: number; message: string; type: 'success' | 'error' };
function Toast({ toasts, remove }: { toasts: ToastType[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border ${
          t.type === 'success' ? 'bg-purple-950 border-purple-700 text-purple-100' : 'bg-red-950 border-red-700 text-red-100'
        }`}>
          {t.type === 'success' ? <Check size={16} className="text-purple-400 shrink-0" /> : <AlertCircle size={16} className="text-red-400 shrink-0" />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  let counter = 0;
  const add = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++counter + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, toast: add, remove };
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls  = "bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 placeholder-slate-500 transition-colors w-full";
const selectCls = `${inputCls} cursor-pointer`;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }: any) {
  const colors: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-950 border-purple-900',
    indigo: 'text-indigo-400 bg-indigo-950 border-indigo-900',
    amber:  'text-amber-400 bg-amber-950 border-amber-900',
    rose:   'text-rose-400 bg-rose-950 border-rose-900',
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className={`inline-flex p-2 rounded-lg border mb-3 ${colors[color]}`}><Icon size={18} /></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

// ── REGISTRATION FORM ─────────────────────────────────────────────────────────
function RegistrationForm({ onSuccess, toast }: { onSuccess: (org: any) => void; toast: any }) {
  const [form, setForm] = useState({
    name: '', type: 'school', country: '', city: '', address: '',
    email: '', phone: '', tax_id: '', description: '', website: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.country || !form.city || !form.email) { toast('Please fill in all required fields.', 'error'); return; }
    setLoading(true);
    try {
      const data = await apiFetch('/api/edufund/organizations', { method: 'POST', body: JSON.stringify(form) });
      onSuccess(data.organization || data);
      toast('Registration submitted! Pending verification.');
    } catch (err: any) { toast(err.message || 'Registration failed.', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-950 border border-purple-800 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <GraduationCap size={12} /> EduFund · Institution Portal
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Register Your Institution</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Join the world's first blockchain-verified education fundraising platform.</p>
        </div>
        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Institution Name" required><input className={inputCls} value={form.name} onChange={set('name')} placeholder="Addis Ababa University" /></Field></div>
            <Field label="Type" required>
              <select className={selectCls} value={form.type} onChange={set('type')}>
                <option value="school">School</option>
                <option value="university">University</option>
                <option value="vocational">Vocational</option>
                <option value="ngo">NGO</option>
                <option value="foundation">Foundation</option>
              </select>
            </Field>
            <Field label="Country" required><input className={inputCls} value={form.country} onChange={set('country')} placeholder="Ethiopia" /></Field>
            <Field label="City" required><input className={inputCls} value={form.city} onChange={set('city')} placeholder="Addis Ababa" /></Field>
            <Field label="Address"><input className={inputCls} value={form.address} onChange={set('address')} placeholder="Sidist Kilo" /></Field>
            <Field label="Email" required><input type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="admin@university.edu.et" /></Field>
            <Field label="Phone"><input type="tel" className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+251 11 123 4567" /></Field>
            <Field label="Tax ID / Registration No."><input className={inputCls} value={form.tax_id} onChange={set('tax_id')} placeholder="INST-2024-001" /></Field>
            <Field label="Website"><input type="url" className={inputCls} value={form.website} onChange={set('website')} placeholder="https://university.edu.et" /></Field>
            <div className="col-span-2">
              <Field label="About Your Institution">
                <textarea className={`${inputCls} resize-none`} rows={4} value={form.description} onChange={set('description')}
                  placeholder="Tell donors about your institution, the students you serve, and the impact of their donations..." />
              </Field>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── PENDING SCREEN ─────────────────────────────────────────────────────────────
function PendingScreen({ org }: { org: any }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-amber-950 border-2 border-amber-700 flex items-center justify-center mx-auto mb-6">
          <Loader2 size={36} className="text-amber-400 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Verification Pending</h2>
        <p className="text-slate-400 mb-2"><span className="text-white font-medium">{org.name}</span> is under review.</p>
        <p className="text-slate-400 text-sm mb-6">We&apos;ll contact you at <span className="text-purple-400">{org.email}</span> once approved.</p>
        <p className="mt-6 text-xs text-slate-500">Questions? Email <a href="mailto:learn@neuromart.ai" className="text-purple-400 hover:underline">learn@neuromart.ai</a></p>
      </div>
    </div>
  );
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Tuition','Registration Fee','Textbooks','Housing','Transport','Meals','Uniform','Exam Fees','Equipment','Internet','Scholarship Gap','Other'];

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
type Tab = 'overview' | 'campaigns' | 'students' | 'financials';

function Dashboard({ org, toast }: { org: any; toast: any }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showItemsForm, setShowItemsForm] = useState<string | null>(null);
  const [subFinTab, setSubFinTab] = useState<'invoices' | 'payments' | 'outcomes'>('invoices');
  const [saving, setSaving] = useState(false);

  const [campaignForm, setCampaignForm] = useState({ title: '', description: '', target_amount: '', start_date: '', end_date: '', cover_image_url: '', academic_year: '' });
  const [studentForm, setStudentForm] = useState({ campaign_id: '', first_name: '', last_name_initial: '', gender: 'Female', age: '', grade_level: '', institution: '', program: '', financial_need: 'high', academic_merit: '', years_waiting: '' });
  const [items, setItems] = useState([{ category: 'Tuition', description: '', amount: '' }]);
  const [invoiceForm, setInvoiceForm] = useState({ student_id: '', funding_item_id: '', invoice_number: '', provider_name: '', amount: '', invoice_date: '', file_url: '' });
  const [paymentForm, setPaymentForm] = useState({ student_id: '', funding_item_id: '', invoice_id: '', amount: '', recipient_name: '', payment_method: 'Bank Transfer', payment_reference: '', payment_date: '', notes: '' });
  const [outcomeForm, setOutcomeForm] = useState({ student_id: '', outcome_type: 'enrolled', academic_year: '', gpa: '', completion_date: '', summary: '', thank_you_url: '', thank_you_message: '' });

  const loadStats = useCallback(async () => {
    try {
      const d = await apiFetch('/api/edufund/dashboard');
      setStats(d);
      setCampaigns(d.campaigns || []);
    } catch {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const loadStudents = async (campaignId: string) => {
    const c = campaigns.find(x => x.id === campaignId);
    if (!c) return;
    try {
      const d = await apiFetch(`/api/edufund/campaigns/${c.slug}`);
      setStudents(d.students || []);
    } catch {}
  };

  const cSet = (k: string) => (e: React.ChangeEvent<any>) => setCampaignForm(f => ({ ...f, [k]: e.target.value }));
  const sSet = (k: string) => (e: React.ChangeEvent<any>) => setStudentForm(f => ({ ...f, [k]: e.target.value }));
  const iSet = (k: string) => (e: React.ChangeEvent<any>) => setInvoiceForm(f => ({ ...f, [k]: e.target.value }));
  const pySet = (k: string) => (e: React.ChangeEvent<any>) => setPaymentForm(f => ({ ...f, [k]: e.target.value }));
  const oSet = (k: string) => (e: React.ChangeEvent<any>) => setOutcomeForm(f => ({ ...f, [k]: e.target.value }));

  async function submitCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.target_amount) { toast('Fill required fields.', 'error'); return; }
    setSaving(true);
    try {
      await apiFetch('/api/edufund/campaigns', { method: 'POST', body: JSON.stringify({ org_id: org.id, ...campaignForm, target_amount: parseFloat(campaignForm.target_amount) }) });
      toast('Campaign created!'); setShowCampaignForm(false); loadStats();
    } catch (err: any) { toast(err.message, 'error'); } finally { setSaving(false); }
  }

  async function submitStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!studentForm.campaign_id || !studentForm.first_name || !studentForm.grade_level) { toast('Fill required fields.', 'error'); return; }
    setSaving(true);
    try {
      const p = await apiFetch('/api/edufund/students', { method: 'POST', body: JSON.stringify({ ...studentForm, age: parseInt(studentForm.age), academic_merit: parseInt(studentForm.academic_merit || '0'), years_waiting: parseInt(studentForm.years_waiting || '0') }) });
      toast('Student added!'); setShowStudentForm(false); setShowItemsForm(p.id || p.student?.id);
      loadStudents(studentForm.campaign_id);
    } catch (err: any) { toast(err.message, 'error'); } finally { setSaving(false); }
  }

  async function submitItems(studentId: string) {
    const valid = items.filter(i => i.description && i.amount);
    if (!valid.length) { toast('Add at least one item.', 'error'); return; }
    setSaving(true);
    try {
      await apiFetch(`/api/edufund/students/${studentId}/items`, { method: 'POST', body: JSON.stringify({ items: valid.map(i => ({ ...i, amount: parseFloat(i.amount) })) }) });
      toast('Items saved!'); setShowItemsForm(null); setItems([{ category: 'Tuition', description: '', amount: '' }]);
    } catch (err: any) { toast(err.message, 'error'); } finally { setSaving(false); }
  }

  async function submitInvoice(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/edufund/invoices', { method: 'POST', body: JSON.stringify({ ...invoiceForm, amount: parseFloat(invoiceForm.amount) }) });
      toast('Invoice uploaded and anchored to blockchain!');
    } catch (err: any) { toast(err.message, 'error'); } finally { setSaving(false); }
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/edufund/transactions', { method: 'POST', body: JSON.stringify({ ...paymentForm, amount: parseFloat(paymentForm.amount) }) });
      toast('Payment recorded and anchored to blockchain!');
    } catch (err: any) { toast(err.message, 'error'); } finally { setSaving(false); }
  }

  async function submitOutcome(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/edufund/outcomes', { method: 'POST', body: JSON.stringify(outcomeForm) });
      toast('Outcome reported and anchored to blockchain!');
    } catch (err: any) { toast(err.message, 'error'); } finally { setSaving(false); }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview',   label: 'Overview',   icon: BarChart3   },
    { key: 'campaigns',  label: 'Campaigns',  icon: FileText    },
    { key: 'students',   label: 'Students',   icon: Users       },
    { key: 'financials', label: 'Financials', icon: DollarSign  },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{org.name}</div>
              <div className="text-slate-500 text-xs capitalize">{org.type} · {org.city}, {org.country}</div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 bg-teal-950 border border-teal-800 text-teal-300 text-xs px-2.5 py-1 rounded-full">
            <Check size={11} /> Verified
          </span>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pb-0">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={DollarSign} label="Total Raised"     value={`$${Number(stats?.total_raised || 0).toLocaleString()}`} color="purple" />
              <StatCard icon={BarChart3}  label="Active Campaigns" value={stats?.active_campaigns || 0}                           color="indigo" />
              <StatCard icon={Users}      label="Students"         value={stats?.total_students || 0} sub={`${stats?.students_supported || 0} supported`} color="amber" />
              <StatCard icon={Heart}      label="Donations"        value={stats?.total_donations || 0}                            color="rose" />
            </div>
            {stats?.recent_donations?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800"><h3 className="text-sm font-semibold text-white">Recent Donations</h3></div>
                <div className="divide-y divide-slate-800">
                  {stats.recent_donations.slice(0, 5).map((d: any) => (
                    <div key={d.amount + d.created_at} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{d.display_name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500">{new Date(d.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-purple-400">${Number(d.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAMPAIGNS */}
        {tab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowCampaignForm(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <Plus size={15} /> New Campaign
              </button>
            </div>
            {campaigns.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-12 text-center">
                <FileText size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No campaigns yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c: any) => {
                  const pct = c.target_amount > 0 ? Math.min(100, (c.raised_amount / c.target_amount) * 100) : 0;
                  return (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium text-sm truncate">{c.title}</h4>
                            {c.academic_year && <span className="text-xs text-slate-500">{c.academic_year}</span>}
                          </div>
                          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">${Number(c.raised_amount || 0).toLocaleString()} / ${Number(c.target_amount).toLocaleString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-white">{pct.toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {showCampaignForm && (
              <Modal title="New Campaign" onClose={() => setShowCampaignForm(false)}>
                <form onSubmit={submitCampaign} className="space-y-4">
                  <Field label="Title" required><input className={inputCls} value={campaignForm.title} onChange={cSet('title')} placeholder="2026 Scholarship Fund" /></Field>
                  <Field label="Description" required><textarea className={`${inputCls} resize-none`} rows={3} value={campaignForm.description} onChange={cSet('description')} placeholder="Describe the campaign..." /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Target Amount (USD)" required><input type="number" min="0" className={inputCls} value={campaignForm.target_amount} onChange={cSet('target_amount')} placeholder="50000" /></Field>
                    <Field label="Academic Year"><input className={inputCls} value={campaignForm.academic_year} onChange={cSet('academic_year')} placeholder="2025-2026" /></Field>
                    <Field label="Start Date"><input type="date" className={inputCls} value={campaignForm.start_date} onChange={cSet('start_date')} /></Field>
                    <Field label="End Date"><input type="date" className={inputCls} value={campaignForm.end_date} onChange={cSet('end_date')} /></Field>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowCampaignForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      {saving ? 'Creating...' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
              </Modal>
            )}
          </div>
        )}

        {/* STUDENTS */}
        {tab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Campaign</label>
                <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  value={selectedCampaign} onChange={e => { setSelectedCampaign(e.target.value); loadStudents(e.target.value); }}>
                  {campaigns.length === 0 && <option value="">No campaigns</option>}
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <button onClick={() => { setStudentForm(f => ({ ...f, campaign_id: selectedCampaign })); setShowStudentForm(true); }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors" disabled={!selectedCampaign}>
                <Plus size={15} /> Add Student
              </button>
            </div>
            {students.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-12 text-center">
                <Users size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No students in this campaign yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((s: any) => {
                  const pct = s.total_cost > 0 ? Math.min(100, (s.funded_amount / s.total_cost) * 100) : 0;
                  return (
                    <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-white font-medium text-sm">{s.display_name}</span>
                            <span className="text-slate-500 text-xs">{s.gender}, {s.age}y</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                              s.financial_need === 'critical' ? 'bg-red-950 text-red-300 border-red-800' :
                              s.financial_need === 'high'     ? 'bg-orange-950 text-orange-300 border-orange-800' :
                              'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>{s.financial_need} need</span>
                          </div>
                          <p className="text-slate-400 text-xs">{s.program} · {s.grade_level}</p>
                          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden w-40">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{pct.toFixed(0)}% funded</p>
                        </div>
                        <button onClick={() => setShowItemsForm(s.id)}
                          className="text-xs text-purple-400 hover:text-purple-300 border border-purple-800 hover:border-purple-700 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                          + Items
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showStudentForm && (
              <Modal title="Add Student" onClose={() => setShowStudentForm(false)}>
                <form onSubmit={submitStudent} className="space-y-4">
                  <Field label="Campaign" required>
                    <select className={selectCls} value={studentForm.campaign_id} onChange={sSet('campaign_id')}>
                      <option value="">Select campaign</option>
                      {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First Name" required><input className={inputCls} value={studentForm.first_name} onChange={sSet('first_name')} placeholder="Sara" /></Field>
                    <Field label="Last Name Initial" required><input className={inputCls} value={studentForm.last_name_initial} onChange={sSet('last_name_initial')} placeholder="W" maxLength={2} /></Field>
                    <Field label="Gender" required>
                      <select className={selectCls} value={studentForm.gender} onChange={sSet('gender')}>
                        {['Female','Male','Other','Undisclosed'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </Field>
                    <Field label="Age"><input type="number" min="5" max="60" className={inputCls} value={studentForm.age} onChange={sSet('age')} placeholder="20" /></Field>
                    <div className="col-span-2"><Field label="Grade Level / Year" required><input className={inputCls} value={studentForm.grade_level} onChange={sSet('grade_level')} placeholder="3rd Year University" /></Field></div>
                    <div className="col-span-2"><Field label="Institution"><input className={inputCls} value={studentForm.institution} onChange={sSet('institution')} placeholder="Addis Ababa University" /></Field></div>
                    <div className="col-span-2"><Field label="Program / Field of Study"><input className={inputCls} value={studentForm.program} onChange={sSet('program')} placeholder="Computer Science" /></Field></div>
                    <Field label="Financial Need" required>
                      <select className={selectCls} value={studentForm.financial_need} onChange={sSet('financial_need')}>
                        {['critical','high','moderate','low'].map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
                      </select>
                    </Field>
                    <Field label="Academic Merit (0-100)"><input type="number" min="0" max="100" className={inputCls} value={studentForm.academic_merit} onChange={sSet('academic_merit')} placeholder="85" /></Field>
                    <Field label="Years Waiting"><input type="number" min="0" className={inputCls} value={studentForm.years_waiting} onChange={sSet('years_waiting')} placeholder="1" /></Field>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowStudentForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                      {saving ? 'Saving...' : 'Add Student & Add Items →'}
                    </button>
                  </div>
                </form>
              </Modal>
            )}

            {showItemsForm && (
              <Modal title="Funding Items" onClose={() => { setShowItemsForm(null); setItems([{ category: 'Tuition', description: '', amount: '' }]); }}>
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Add itemized cost breakdown. Each item will be individually traceable to donors.</p>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <select className={selectCls} value={item.category} onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <input className={inputCls} value={item.description} onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} placeholder="e.g. Semester tuition" />
                        <input type="number" min="0" step="0.01" className={inputCls} value={item.amount} onChange={e => setItems(prev => prev.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} placeholder="USD" />
                      </div>
                      {items.length > 1 && <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))} className="mt-2 text-slate-500 hover:text-rose-400 transition-colors"><X size={16} /></button>}
                    </div>
                  ))}
                  <button onClick={() => setItems(prev => [...prev, { category: 'Tuition', description: '', amount: '' }])}
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    <Plus size={14} /> Add Another Item
                  </button>
                  <div className="flex gap-3 pt-2 border-t border-slate-800">
                    <button type="button" onClick={() => { setShowItemsForm(null); setItems([{ category: 'Tuition', description: '', amount: '' }]); }}
                      className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm transition-colors">Cancel</button>
                    <button onClick={() => submitItems(showItemsForm!)} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      {saving ? 'Saving...' : 'Save Items'}
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* FINANCIALS */}
        {tab === 'financials' && (
          <div className="space-y-6">
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg w-fit">
              {[{ key: 'invoices', label: 'Invoices', icon: Receipt }, { key: 'payments', label: 'Payments', icon: CreditCard }, { key: 'outcomes', label: 'Outcomes', icon: Award }].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setSubFinTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${subFinTab === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold shrink-0">Campaign</label>
              <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                onChange={e => loadStudents(e.target.value)}>
                <option value="">Select campaign</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {subFinTab === 'invoices' && (
              <form onSubmit={submitInvoice} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Receipt size={16} className="text-purple-400" /> Upload Fee Statement / Invoice</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Student" required>
                    <select className={selectCls} value={invoiceForm.student_id} onChange={iSet('student_id')}>
                      <option value="">Select student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                    </select>
                  </Field>
                  <Field label="Invoice Number"><input className={inputCls} value={invoiceForm.invoice_number} onChange={iSet('invoice_number')} placeholder="INV-2026-001" /></Field>
                  <Field label="Provider / Institution Name" required><input className={inputCls} value={invoiceForm.provider_name} onChange={iSet('provider_name')} placeholder="Addis Ababa University" /></Field>
                  <Field label="Amount (USD)" required><input type="number" min="0" step="0.01" className={inputCls} value={invoiceForm.amount} onChange={iSet('amount')} placeholder="5000" /></Field>
                  <Field label="Invoice Date"><input type="date" className={inputCls} value={invoiceForm.invoice_date} onChange={iSet('invoice_date')} /></Field>
                  <Field label="File URL"><input type="url" className={inputCls} value={invoiceForm.file_url} onChange={iSet('file_url')} placeholder="https://..." /></Field>
                </div>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : null} Upload & Anchor to Blockchain
                </button>
              </form>
            )}

            {subFinTab === 'payments' && (
              <form onSubmit={submitPayment} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><CreditCard size={16} className="text-indigo-400" /> Record Payment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Student" required>
                    <select className={selectCls} value={paymentForm.student_id} onChange={pySet('student_id')}>
                      <option value="">Select student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                    </select>
                  </Field>
                  <Field label="Amount Paid (USD)" required><input type="number" min="0" step="0.01" className={inputCls} value={paymentForm.amount} onChange={pySet('amount')} placeholder="5000" /></Field>
                  <Field label="Recipient Name" required><input className={inputCls} value={paymentForm.recipient_name} onChange={pySet('recipient_name')} placeholder="Addis Ababa University" /></Field>
                  <Field label="Payment Method">
                    <select className={selectCls} value={paymentForm.payment_method} onChange={pySet('payment_method')}>
                      {['Bank Transfer','Check','Cash','Other'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Payment Date" required><input type="date" className={inputCls} value={paymentForm.payment_date} onChange={pySet('payment_date')} /></Field>
                  <Field label="Notes"><input className={inputCls} value={paymentForm.notes} onChange={pySet('notes')} placeholder="Semester 1 payment" /></Field>
                </div>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Record & Anchor to Blockchain
                </button>
              </form>
            )}

            {subFinTab === 'outcomes' && (
              <form onSubmit={submitOutcome} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Award size={16} className="text-amber-400" /> Report Student Outcome</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Student" required>
                    <select className={selectCls} value={outcomeForm.student_id} onChange={oSet('student_id')}>
                      <option value="">Select student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
                    </select>
                  </Field>
                  <Field label="Outcome Type" required>
                    <select className={selectCls} value={outcomeForm.outcome_type} onChange={oSet('outcome_type')}>
                      {['enrolled','semester_completed','graduated','scholarship_renewed','dropped','ongoing'].map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ').charAt(0).toUpperCase() + t.replace('_', ' ').slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Academic Year"><input className={inputCls} value={outcomeForm.academic_year} onChange={oSet('academic_year')} placeholder="2025-2026" /></Field>
                  <Field label="GPA (optional)"><input type="number" min="0" max="4" step="0.01" className={inputCls} value={outcomeForm.gpa} onChange={oSet('gpa')} placeholder="3.85" /></Field>
                  <Field label="Completion Date"><input type="date" className={inputCls} value={outcomeForm.completion_date} onChange={oSet('completion_date')} /></Field>
                  <Field label="Thank You Video URL"><input type="url" className={inputCls} value={outcomeForm.thank_you_url} onChange={oSet('thank_you_url')} placeholder="https://..." /></Field>
                  <div className="col-span-2">
                    <Field label="Summary" required>
                      <textarea className={`${inputCls} resize-none`} rows={3} value={outcomeForm.summary} onChange={oSet('summary')}
                        placeholder="Student successfully completed first semester with distinction..." />
                    </Field>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />} Report Outcome & Anchor to Blockchain
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT PAGE ─────────────────────────────────────────────────────────────────
type PageState = 'loading' | 'unauthenticated' | 'unregistered' | 'pending' | 'dashboard';

export default function OrgPage() {
  const [state, setState] = useState<PageState>('loading');
  const [org,   setOrg]   = useState<any>(null);
  const { toasts, toast, remove } = useToast();

  useEffect(() => {
    const token = getToken();
    if (!token) { setState('unauthenticated'); return; }
    apiFetch('/api/edufund/organizations/my')
      .then(data => {
        const o = data.organization || data;
        setOrg(o);
        setState(o.verified ? 'dashboard' : 'pending');
      })
      .catch(() => setState('unregistered'));
  }, []);

  if (state === 'loading') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-purple-400" />
    </div>
  );

  if (state === 'unauthenticated') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <a href="/" className="text-purple-400 text-sm hover:underline block mb-8">← Back to EduFund</a>
        <div className="w-16 h-16 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-rose-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-slate-400 text-sm mb-6">You need to be logged in to access the institution dashboard.</p>
        <a href="/auth/login?redirect=/org"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
          Sign In
        </a>
      </div>
      <Toast toasts={toasts} remove={remove} />
    </div>
  );

  return (
    <>
      {state === 'unregistered' && <RegistrationForm onSuccess={newOrg => { setOrg(newOrg); setState('pending'); }} toast={toast} />}
      {state === 'pending'      && org && <PendingScreen org={org} />}
      {state === 'dashboard'    && org && <Dashboard org={org} toast={toast} />}
      <Toast toasts={toasts} remove={remove} />
    </>
  );
}