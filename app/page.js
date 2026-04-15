import Link from 'next/link';
import {
  ShieldCheck,
  QrCode,
  Upload,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import { createClient } from '../lib/supabase/server';

const features = [
  {
    icon: Upload,
    color: 'bg-blue-50 text-blue-600',
    title: 'Mandatory Receipt Proof',
    desc: 'Every payment requires a screenshot of the transfer. No proof, no settlement — keeping every peso accounted for.',
  },
  {
    icon: Clock,
    color: 'bg-amber-50 text-amber-600',
    title: 'Settlement History',
    desc: 'A full timestamped trail from request to verification. Know exactly when money moved and who confirmed it.',
  },
  {
    icon: Users,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Group Splitting',
    desc: 'Create groups for flatmates, road trips, or regular hangouts. Track shared expenses in one place.',
  },
  {
    icon: QrCode,
    color: 'bg-purple-50 text-purple-600',
    title: 'QR Code Payments',
    desc: 'Link your GCash, Maya, or bank QR to your profile. Others scan and pay you directly — no app needed on their end.',
  },
  {
    icon: Smartphone,
    color: 'bg-rose-50 text-rose-600',
    title: 'Mobile-First Design',
    desc: 'Built for your phone first. Works perfectly on any screen size, with safe area support for notched devices.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-teal-50 text-teal-600',
    title: 'High-Trust by Default',
    desc: 'No payment is marked settled until the recipient verifies the proof. Trust is earned, not assumed.',
  },
];

const steps = [
  { number: '01', title: 'Create your account', desc: 'Sign up with your name, mobile number, and payment QR.' },
  { number: '02', title: 'Request or owe a bill', desc: 'Log any expense and assign it to a contact or group.' },
  { number: '03', title: 'Pay and upload proof', desc: 'Transfer the money and attach your receipt screenshot.' },
  { number: '04', title: 'Recipient verifies', desc: 'The other party confirms the receipt. Settlement complete.' },
];

// Simulated phone screen content blocks
function PhoneFrame({ screen }) {
  return (
    <div className="relative mx-auto w-[220px] shrink-0">
      {/* Phone shell */}
      <div className="relative bg-[#1A1C1E] rounded-[36px] p-[10px] shadow-2xl shadow-black/40 ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[70px] h-[20px] bg-[#1A1C1E] rounded-full z-10" />
        {/* Screen */}
        <div className="bg-[#F4F7F9] rounded-[28px] overflow-hidden h-[420px] relative">
          {screen}
        </div>
        {/* Home bar */}
        <div className="mt-2 mx-auto w-16 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex flex-col h-full bg-[#F4F7F9] text-[#1A1C1E]">
      {/* Header */}
      <div className="px-4 pt-8 pb-3 bg-white/80 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#2563EB] rounded-[3px]" />
          <span className="text-[11px] font-black tracking-tight">AbonoShare</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-[#E2E8F0]" />
      </div>
      {/* Balance */}
      <div className="mx-3 mt-3 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
        <p className="text-[8px] font-bold uppercase tracking-widest text-[#6C727A] mb-0.5">Your Balance</p>
        <p className="text-2xl font-black text-[#1A1C1E]">₱2,000.00</p>
      </div>
      {/* Transaction list */}
      <div className="mx-3 mt-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex-1">
        <p className="text-[8px] font-bold uppercase tracking-widest text-[#6C727A] px-3 py-2 border-b border-[#E2E8F0]">Settlement Ledger</p>
        {[
          { name: 'Maria Santos', amount: '₱1,250', status: 'Unpaid', color: 'bg-red-50 text-red-600' },
          { name: 'Jose Reyes', amount: '₱450', status: 'Pending', color: 'bg-amber-50 text-amber-600' },
          { name: 'Maria Santos', amount: '₱1,500', status: 'Settled', color: 'bg-emerald-50 text-emerald-600' },
        ].map((tx, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-[#F4F7F9] last:border-0">
            <div>
              <p className="text-[9px] font-bold text-[#1A1C1E]">{tx.name}</p>
              <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${tx.color}`}>{tx.status}</span>
            </div>
            <p className="text-[10px] font-black text-[#1A1C1E]">{tx.amount}</p>
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="flex justify-around items-center px-2 py-2 bg-white/90 border-t border-[#E2E8F0]">
        {['Ledger', 'Active', 'Groups', 'Settings'].map((label, i) => (
          <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 0 ? 'text-[#2563EB]' : 'text-[#6C727A]'}`}>
            <div className="w-3.5 h-3.5 rounded bg-current opacity-70" />
            <span className="text-[6px] font-bold uppercase">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettleScreen() {
  return (
    <div className="flex flex-col h-full bg-[#F4F7F9]">
      {/* Header */}
      <div className="px-4 pt-8 pb-3 bg-white/80 border-b border-[#E2E8F0] flex items-center gap-2">
        <div className="w-4 h-4 bg-[#2563EB] rounded-[3px]" />
        <span className="text-[11px] font-black tracking-tight text-[#1A1C1E]">AbonoShare</span>
      </div>
      {/* Blue summary bar */}
      <div className="px-4 py-2.5 bg-[#2563EB] text-white flex justify-between items-center">
        <div>
          <p className="text-[6px] uppercase tracking-widest opacity-70 font-bold">Settlement</p>
          <p className="text-lg font-black">₱1,250.00</p>
        </div>
        <div className="text-right">
          <p className="text-[6px] uppercase tracking-widest opacity-70 font-bold">Recipient</p>
          <p className="text-[10px] font-bold">Maria Santos</p>
        </div>
      </div>
      {/* QR card */}
      <div className="mx-3 mt-3 p-3 bg-white rounded-xl border border-[#E2E8F0] text-center">
        <p className="text-[7px] font-bold uppercase tracking-widest text-[#6C727A] mb-2">Step 1: Scan & Pay</p>
        <div className="w-20 h-20 mx-auto border-4 border-[#1A1C1E] bg-white flex items-center justify-center">
          <div className="grid grid-cols-3 gap-px w-full h-full p-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`rounded-sm ${[0,2,4,6,8].includes(i) ? 'bg-[#1A1C1E]' : 'bg-white'}`} />
            ))}
          </div>
        </div>
        <button className="mt-2 w-full py-1.5 bg-[#2563EB] text-white text-[8px] font-black rounded-lg">
          I've Paid
        </button>
      </div>
      {/* Upload card */}
      <div className="mx-3 mt-2 p-3 bg-white rounded-xl border border-[#E2E8F0] text-center opacity-40">
        <p className="text-[7px] font-bold uppercase tracking-widest text-[#6C727A] mb-1">Step 2: Upload Proof</p>
        <div className="w-10 h-10 mx-auto bg-[#F4F7F9] rounded-full flex items-center justify-center">
          <div className="w-5 h-5 text-[#6C727A]">↑</div>
        </div>
        <p className="text-[7px] text-[#6C727A] mt-1">Complete Step 1 first</p>
      </div>
    </div>
  );
}

function GroupScreen() {
  return (
    <div className="flex flex-col h-full bg-[#F4F7F9]">
      <div className="px-4 pt-8 pb-3 bg-white/80 border-b border-[#E2E8F0] flex items-center gap-2">
        <div className="w-4 h-4 bg-[#2563EB] rounded-[3px]" />
        <span className="text-[11px] font-black tracking-tight text-[#1A1C1E]">AbonoShare</span>
      </div>
      <div className="px-3 pt-3 pb-2 flex justify-between items-center">
        <div>
          <p className="text-[12px] font-black text-[#1A1C1E]">Groups</p>
          <p className="text-[7px] text-[#6C727A] font-bold uppercase">Shared expenses</p>
        </div>
        <div className="px-2 py-1 bg-[#2563EB] text-white text-[7px] font-bold rounded-lg">+ New</div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 px-3 mb-2">
        {[['2', 'Groups'], ['4', 'Members'], ['₱16.5k', 'Volume']].map(([val, lbl]) => (
          <div key={lbl} className="bg-white rounded-lg p-2 border border-[#E2E8F0] text-center">
            <p className="text-[10px] font-black text-[#1A1C1E]">{val}</p>
            <p className="text-[6px] font-bold uppercase text-[#6C727A]">{lbl}</p>
          </div>
        ))}
      </div>
      {/* Group cards */}
      {[
        { name: 'BGC Foodies', members: 3, amount: '₱4,500' },
        { name: 'Weekend Trip', members: 2, amount: '₱12,000' },
      ].map((g) => (
        <div key={g.name} className="mx-3 mb-2 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex justify-between items-start mb-1.5">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-[#2563EB]/40 rounded-sm" />
            </div>
            <div className="text-right">
              <p className="text-[7px] text-[#6C727A] font-bold uppercase">Total</p>
              <p className="text-[10px] font-black text-[#1A1C1E]">{g.amount}</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-[#1A1C1E]">{g.name}</p>
          <p className="text-[7px] text-[#6C727A]">{g.members} members</p>
        </div>
      ))}
    </div>
  );
}

export default async function LandingPage() {
  let topGroups = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('groups')
      .select('id, name, total_settled, group_members(user_id)')
      .order('total_settled', { ascending: false })
      .limit(5);
    topGroups = data || [];
  } catch {
    // leaderboard is non-critical — fail silently
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] dark:bg-[#0F172A] text-[#1A1C1E] dark:text-[#F8FAFC] font-sans transition-colors duration-300">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-white/10 px-5 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-[#1A1C1E] dark:text-white">
          <div className="w-7 h-7 bg-[#2563EB] rounded-[6px] flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          AbonoShare
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/app"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all active:scale-95"
          >
            Open App
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-5 sm:px-10 lg:px-16 pt-20 pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-full text-xs font-bold border border-blue-100">
              <ShieldCheck size={13} />
              Para sa tropang walang iwanan sa bayaran.
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-[#1A1C1E] dark:text-white leading-[1.05]">
              Split the bill,<br />
              <span className="text-[#2563EB]">keep the friends.</span>
            </h1>
            <p className="text-lg text-[#6C727A] dark:text-[#94A3B8] leading-relaxed">
              Eat together. Pay apart. AbonoShare makes every peso traceable — mandatory receipt verification, QR payments, and settlement history so no one ever has to take anyone's word for it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2563EB] text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all active:scale-95"
              >
                Launch AbonoShare
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1A1C1E] rounded-2xl font-bold text-base border border-[#E2E8F0] hover:border-[#2563EB]/30 transition-all"
              >
                See how it works
              </a>
            </div>
            <p className="text-xs text-[#94A3B8] dark:text-[#64748B] font-medium">Free to use · No account required to start · Works on any device</p>
          </div>

          {/* Phone mockups */}
          <div className="flex-1 flex items-end justify-center gap-4 sm:gap-6">
            <div className="translate-y-6">
              <PhoneFrame screen={<SettleScreen />} />
            </div>
            <div className="-translate-y-2">
              <PhoneFrame screen={<DashboardScreen />} />
            </div>
            <div className="translate-y-8 hidden sm:block">
              <PhoneFrame screen={<GroupScreen />} />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-[#1E293B] border-y border-[#E2E8F0] dark:border-white/10 px-5 sm:px-10 lg:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1C1E] dark:text-white">How AbonoShare works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-black text-[#E2E8F0] dark:text-white/10 mb-3 leading-none">{step.number}</div>
                <h3 className="text-base font-black text-[#1A1C1E] dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#6C727A] dark:text-[#94A3B8] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-5 sm:px-10 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1C1E] dark:text-white">Everything you need to settle up right</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-white/10 p-6 hover:border-[#2563EB]/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon size={22} />
              </div>
              <h3 className="text-base font-black text-[#1A1C1E] dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#6C727A] dark:text-[#94A3B8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Leaderboard Teaser */}
      <section className="bg-[#0F172A] px-5 sm:px-10 lg:px-16 py-20">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">Community</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Groups are already thriving</h2>
            <p className="text-[#94A3B8]">See who&apos;s splitting the most. Join them.</p>
          </div>

          {topGroups.length > 0 ? (
            <div className="space-y-3">
              {topGroups.map((group, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                const memberCount = (group.group_members || []).length;
                return (
                  <div key={group.id} className="flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center font-black text-lg shrink-0">
                        {medal || <span className="text-sm text-[#64748B] font-bold">#{index + 1}</span>}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{group.name}</p>
                        <p className="text-[11px] text-[#64748B]">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#2563EB] text-base">₱{Number(group.total_settled).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      <p className="text-[10px] text-[#64748B] uppercase tracking-wider">settled</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748B] text-sm">Be the first group on the leaderboard.</div>
          )}

          <div className="text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563EB] text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
            >
              Join the community
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Screenshot strip — single phone centered with caption */}
      <section className="bg-[#0F172A] py-24 px-5 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-3">The App</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Math-free meals.<br />
              <span className="text-[#2563EB]">Smart splitting for every outing.</span>
            </h2>
            <p className="text-[#94A3B8] leading-relaxed">
              Fair share, simplified. A native-feel experience that works on any Android or iOS device — no install required. Open it in your browser and it just works.
            </p>
            <ul className="space-y-3">
              {[
                'Safe-area support for notched iPhones',
                'Dark mode built in',
                'Works offline with local storage',
                'No app store download needed',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#CBD5E1]">
                  <CheckCircle2 size={16} className="text-[#2563EB] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-5 items-end justify-center">
            <div className="translate-y-4">
              <PhoneFrame screen={<GroupScreen />} />
            </div>
            <div>
              <PhoneFrame screen={<DashboardScreen />} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-10 lg:px-16 py-24 max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563EB] text-white rounded-2xl shadow-xl shadow-blue-500/30 mb-2">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1C1E] dark:text-white">
          Good times, evened out.
        </h2>
        <p className="text-lg text-[#6C727A] dark:text-[#94A3B8]">Keep your change. And your friendships. Open the app and start settling in seconds.</p>
        <Link
          href="/app"
          className="inline-flex items-center gap-3 px-10 py-5 bg-[#2563EB] text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all active:scale-95"
        >
          Launch AbonoShare
          <ArrowRight size={20} />
        </Link>
        <p className="text-xs text-[#94A3B8]">Free · No install · Works on any device</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-white/10 px-5 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#94A3B8]">
        <div className="flex items-center gap-2 font-black text-base text-[#1A1C1E] dark:text-white">
          <div className="w-6 h-6 bg-[#2563EB] rounded-[5px] flex items-center justify-center">
            <ShieldCheck size={13} className="text-white" />
          </div>
          AbonoShare
        </div>
        <p className="text-xs">© {new Date().getFullYear()} AbonoShare · Built by <span className="font-bold text-[#1A1C1E] dark:text-white">Remarx Foundation</span></p>
        <Link href="/app" className="text-[#2563EB] font-bold hover:underline text-xs">
          Open App →
        </Link>
      </footer>

    </div>
  );
}
