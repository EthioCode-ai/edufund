'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GraduationCap, Shield, Lock, CheckCircle, Loader2,
  AlertCircle, ArrowRight, ArrowLeft, Bell, Eye, EyeOff, Copy
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://neuromart-backend-tu92.onrender.com';

function fmtUSD(v: any) { return `$${Number(v).toLocaleString()}`; }
const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];
type Step = 'amount' | 'identity' | 'confirm' | 'success';

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'AU', name: 'Australia' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'TR', name: 'Turkey' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' }, { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' }, { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' }, { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' }, { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' }, { code: 'EG', name: 'Egypt' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' }, { code: 'NZ', name: 'New Zealand' },
  { code: 'NL', name: 'Netherlands' }, { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' }, { code: 'CH', name: 'Switzerland' },
  { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' },
  { code: 'OTHER', name: 'Other' },
];

type StateEntry = { code: string; name: string; autoCity?: string };
const STATES: Record<string, StateEntry[]> = {
  US: [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.', autoCity: 'Washington' },
  ],
  ET: [
    { code: 'AA', name: 'Addis Ababa', autoCity: 'Addis Ababa' },
    { code: 'DD', name: 'Dire Dawa',   autoCity: 'Dire Dawa' },
    { code: 'OR', name: 'Oromia' }, { code: 'AM', name: 'Amhara' },
    { code: 'TI', name: 'Tigray', autoCity: 'Mekelle' },
    { code: 'SO', name: 'Somali' }, { code: 'SN', name: 'SNNPR' },
  ],
  AE: [
    { code: 'DU', name: 'Dubai',     autoCity: 'Dubai' },
    { code: 'AZ', name: 'Abu Dhabi', autoCity: 'Abu Dhabi' },
    { code: 'SH', name: 'Sharjah',   autoCity: 'Sharjah' },
  ],
};

async function lookupZip(countryCode: string, zip: string): Promise<string> {
  if (!zip || zip.length < 3 || !countryCode || countryCode === 'OTHER') return '';
  try {
    const res = await fetch(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${encodeURIComponent(zip)}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.places?.[0]?.['place name'] || '';
  } catch { return ''; }
}

const inputCls  = "w-full px-4 py-3 border-2 border-slate-200 focus:border-purple-400 rounded-xl outline-none text-sm transition-colors bg-white";
const selectCls = `${inputCls} cursor-pointer appearance-none pr-8`;

export default function DonatePage() {
  const params = useParams();
  const slug   = params?.slug as string;

  const [campaign,   setCampaign]   = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState<Step>('amount');
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<any>(null);
  const [copied,     setCopied]     = useState(false);

  const [amount,       setAmount]       = useState('');
  const [customAmount, setCustomAmount] = useState(false);
  const [fullName,      setFullName]      = useState('');
  const [email,         setEmail]         = useState('');
  const [phone,         setPhone]         = useState('');
  const [countryCode,   setCountryCode]   = useState('');
  const [stateCode,     setStateCode]     = useState('');
  const [city,          setCity]          = useState('');
  const [zip,           setZip]           = useState('');
  const [zipLooking,    setZipLooking]    = useState(false);
  const [isAnonymous,   setIsAnonymous]   = useState(false);
  const [notifyTrace,   setNotifyTrace]   = useState(true);
  const [notifyOutcome, setNotifyOutcome] = useState(true);
  const [message,       setMessage]       = useState('');

  const states     = STATES[countryCode] || [];
  const hasStates  = states.length > 0;
  const countryName = COUNTRIES.find(c => c.code === countryCode)?.name || '';
  const stateName   = states.find(s => s.code === stateCode)?.name || '';

  useEffect(() => {
    fetch(`${API_BASE}/api/edufund/campaigns/${slug}`)
      .then(r => r.json())
      .then(d => setCampaign(d.campaign))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStateChange = (code: string) => {
    setStateCode(code);
    const s = (STATES[countryCode] || []).find(x => x.code === code);
    if (s?.autoCity) setCity(s.autoCity);
  };

  const zipTimer = { current: null as any };
  const handleZipChange = useCallback((value: string) => {
    setZip(value);
    clearTimeout(zipTimer.current);
    if (!value || value.length < 3 || !countryCode) return;
    zipTimer.current = setTimeout(async () => {
      setZipLooking(true);
      const found = await lookupZip(countryCode, value);
      if (found) setCity(found);
      setZipLooking(false);
    }, 600);
  }, [countryCode]);

  const handleSubmit = async () => {
    if (!campaign || !amount) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/edufund/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id, amount: parseFloat(amount),
          email: email || undefined, full_name: fullName || undefined,
          phone: phone || undefined, city: city || undefined,
          country: countryName || undefined, state: stateName || undefined,
          zip: zip || undefined, is_anonymous: isAnonymous,
          notify_trace: notifyTrace, notify_outcome: notifyOutcome,
          message: message || undefined, payment_method: 'pending_stripe',
        }),
      });
      const data = await res.json();
      if (data.success) { setResult(data); setStep('success'); }
      else alert(data.error || 'Donation failed');
    } catch { alert('Something went wrong. Please try again.'); }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <AlertCircle className="h-12 w-12 text-slate-300 mx-auto" />
    </div>
  );

  if (step === 'success' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl shadow-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Thank you!</h1>
            <p className="text-purple-100">Your {fmtUSD(result.amount)} is funding a student's education</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
              <p className="font-bold text-purple-700 mb-1">Your Trace Code</p>
              <p className="text-3xl font-black text-purple-800 tracking-widest mb-3">{result.trace_code}</p>
              <p className="text-xs text-purple-500 mb-4">Track exactly where your dollars went</p>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(result.trace_url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-colors">
                  <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy trace URL'}
                </button>
                <Link href={`/trace/${result.trace_code}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-purple-200 hover:border-purple-400 text-purple-700 text-sm font-bold rounded-xl transition-colors">
                  View Trace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {result.allocations?.length > 0 && (
              <div>
                <p className="font-bold text-slate-700 mb-3 text-sm">Your dollars are funding:</p>
                <div className="space-y-2">
                  {result.allocations.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{a.student_name}</p>
                        <p className="text-xs text-slate-400">{a.item_description}</p>
                      </div>
                      <span className="font-black text-purple-600">{fmtUSD(a.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Link href={`/campaigns/${campaign.slug}`}
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-600 text-sm font-semibold rounded-xl transition-all">
              <ArrowLeft className="h-4 w-4" /> Back to Campaign
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [{ key: 'amount', label: 'Amount' }, { key: 'identity', label: 'Your Info' }, { key: 'confirm', label: 'Confirm' }];
  const stepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/campaigns/${slug}`} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to campaign
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-700 text-sm">EduFund</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate">{campaign.title}</p>
            <p className="text-xs text-slate-500">{campaign.org_name} · {campaign.city}, {campaign.country}</p>
          </div>
          {campaign.verified && (
            <span className="flex items-center gap-1 text-purple-600 text-xs font-bold shrink-0">
              <Shield className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3 flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < stepIdx ? 'bg-purple-500 text-white' : i === stepIdx ? 'bg-purple-500 text-white ring-4 ring-purple-100' : 'bg-slate-200 text-slate-500'}`}>
                {i < stepIdx ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === stepIdx ? 'text-purple-600' : 'text-slate-400'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${i < stepIdx ? 'bg-purple-300' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 'amount' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Choose an amount</h2>
            <p className="text-slate-500 text-sm mb-8">Your donation will be allocated to the highest-need student</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PRESET_AMOUNTS.map(a => (
                <button key={a} onClick={() => { setAmount(String(a)); setCustomAmount(false); }}
                  className={`py-4 rounded-2xl text-lg font-black transition-all border-2
                    ${amount === String(a) && !customAmount
                      ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-200'
                      : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-purple-300 hover:bg-purple-50'}`}>
                  ${a}
                </button>
              ))}
            </div>
            <div className="mb-8">
              <button onClick={() => setCustomAmount(true)}
                className={`w-full py-3 rounded-2xl text-sm font-semibold border-2 transition-all mb-3
                  ${customAmount ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:border-purple-300'}`}>
                Enter custom amount
              </button>
              {customAmount && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">$</span>
                  <input type="number" min="1" placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 text-xl font-black text-slate-800 border-2 border-purple-300 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100" />
                </div>
              )}
            </div>
            <button onClick={() => setStep('identity')} disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-lg rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 'identity' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Your information</h2>
              <p className="text-slate-500 text-sm">Only your country and state are shown publicly.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Full Name *</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your Name" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">Country <span className="text-purple-600 font-semibold text-xs">(shown publicly)</span> <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <select value={countryCode} onChange={e => { setCountryCode(e.target.value); setStateCode(''); setCity(''); setZip(''); }} className={selectCls}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
              </div>
            </div>
            {countryCode && hasStates && (
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">State / Province <span className="text-purple-600 font-semibold text-xs">(shown publicly)</span> <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <select value={stateCode} onChange={e => handleStateChange(e.target.value)} className={selectCls}>
                    <option value="">Select state...</option>
                    {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  ZIP / Postal Code <span className="text-slate-400 font-normal text-xs">(private)</span>
                  {zipLooking && <Loader2 className="h-3 w-3 animate-spin text-purple-500" />}
                </label>
                <input type="text" value={zip} onChange={e => handleZipChange(e.target.value)} placeholder="95101" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5">City <span className="text-slate-400 font-normal">(private)</span></label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="San Jose" className={inputCls} />
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAnonymous ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-purple-500" />}
                <div>
                  <p className="text-sm font-bold text-slate-700">Show my name publicly</p>
                  <p className="text-xs text-slate-400">{isAnonymous ? 'Shows as "Known Donor"' : 'Name + country/state only'}</p>
                </div>
              </div>
              <button onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${!isAnonymous ? 'bg-purple-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${!isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notifications</p>
              {[
                { key: 'trace',   val: notifyTrace,   set: setNotifyTrace,   label: 'Notify me when my dollars are traced to a payment', icon: Lock },
                { key: 'outcome', val: notifyOutcome, set: setNotifyOutcome, label: 'Notify me when the student outcome is reported',     icon: Bell },
              ].map(({ key, val, set, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <p className="text-sm text-slate-600">{label}</p>
                  </div>
                  <button onClick={() => set(!val)}
                    className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${val ? 'bg-purple-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Leave a message <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Wishing you success in your studies..." rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 focus:border-purple-400 rounded-xl outline-none text-sm resize-none transition-colors" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('amount')} className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:border-slate-300 transition-colors">Back</button>
              <button onClick={() => setStep('confirm')} disabled={!fullName || !email}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2">
                Review <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 'confirm' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Confirm your donation</h2>
              <p className="text-slate-500 text-sm">Review before completing</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 text-center">
              <p className="text-5xl font-black text-purple-600 mb-1">{fmtUSD(amount)}</p>
              <p className="text-slate-500 text-sm">to {campaign.title}</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Name',    value: isAnonymous ? 'Known Donor (anonymous)' : fullName },
                { label: 'Email',   value: email },
                { label: 'Country', value: countryName || '—' },
                { label: 'State',   value: stateName || '—' },
                { label: 'Notifications', value: [notifyTrace && 'Trace updates', notifyOutcome && 'Outcome updates'].filter(Boolean).join(' · ') || 'None' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                  <span className="text-sm text-slate-700 font-semibold text-right">{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
              <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">Payment processing via Stripe (coming soon). Every dollar is blockchain-anchored for permanent transparency.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('identity')} className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:border-slate-300 transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><GraduationCap className="h-5 w-5" /> Complete Donation</>}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-purple-500" /> Verified Institutions</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-indigo-500" /> Blockchain Anchored</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> 100% Traceable</span>
        </div>
      </div>
    </div>
  );
}