import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, ShieldCheck, Crosshair,
  Network, TrendingUp, Globe, IndianRupee, AudioLines,
  Puzzle, Download, Sparkles, ArrowRight, Zap, Eye
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { threatAPI } from '../services/api';

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#f43f5e'];

const cardVariants = {
  hidden:  { y: 24, opacity: 0 },
  visible: (i) => ({ y: 0, opacity: 1, transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Dashboard({ onOpenExtension }) {
  const [stats, setStats] = useState({
    total_documents: 0, total_variants: 0, critical_threats: 0,
    attacks_prevented: 0, hotspot_regions: 0,
    category_distribution: [], timeline: [], recent_threats: []
  });
  const [currencyReady, setCurrencyReady] = useState(null);
  const [audioReady,    setAudioReady]    = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try { const d = await threatAPI.getStats(); setStats(d); } catch {}
      try { const c = await threatAPI.getCurrencyStatus(); setCurrencyReady(c?.model_present && c?.runtime_available); } catch { setCurrencyReady(false); }
      try { const a = await threatAPI.getAudioStatus();    setAudioReady(a?.folder_model_present && a?.runtime_available); } catch { setAudioReady(false); }
    };
    fetchStats();
    const iv = setInterval(fetchStats, 6000);
    return () => clearInterval(iv);
  }, []);

  const trendData = stats.timeline || [];
  const distData  = stats.category_distribution || [];

  const STAT_CARDS = [
    { icon: Crosshair,   color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   label: 'Threats Analyzed',    value: stats.total_documents, badge: '+Live',     badgeColor: '#4ade80' },
    { icon: ShieldCheck, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   label: 'Attacks Prevented',   value: stats.attacks_prevented, badge: '+8%',    badgeColor: '#4ade80' },
    { icon: Activity,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Scam Variants Active', value: stats.total_variants,  badge: 'Live',    badgeColor: '#f59e0b' },
    { icon: Globe,       color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Hotspot Regions',     value: stats.hotspot_regions, badge: null,       badgeColor: null },
    {
      icon: IndianRupee, color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      label: 'Currency Shield', value: null,
      badge: currencyReady === null ? '—' : currencyReady ? 'Active' : 'Offline',
      badgeColor: currencyReady ? '#4ade80' : '#f43f5e',
      valueText: currencyReady === null ? '—' : currencyReady ? 'ON' : 'OFF',
    },
    {
      icon: AudioLines, color: '#818cf8', bg: 'rgba(129,140,248,0.12)',
      label: 'Audio Shield', value: null,
      badge: audioReady === null ? '—' : audioReady ? 'Active' : 'Offline',
      badgeColor: audioReady ? '#4ade80' : '#f43f5e',
      valueText: audioReady === null ? '—' : audioReady ? 'ON' : 'OFF',
    },
  ];

  return (
    <div className="container" style={{ maxWidth: '1440px' }}>

      {/* ── Page Hero ──────────────────────────────────────────── */}
      <div className="page-hero">
        <div>
          <div className="eyebrow">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ display: 'inline-block' }} />
            National Threat Matrix • Live
          </div>
          <h1 className="page-title">AI-Powered Digital Safety Platform</h1>
          <p className="page-copy">Real-time scam detection, currency verification, and voice authentication — all in one platform.</p>
        </div>
      </div>

      {/* ── Extension Banner ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onOpenExtension}
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(6,182,212,0.12) 100%)',
          border: '1px solid rgba(124,58,237,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          cursor: 'pointer', flexWrap: 'wrap',
          boxShadow: '0 8px 32px rgba(124,58,237,0.15)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        whileHover={{ borderColor: 'rgba(124,58,237,0.55)', boxShadow: '0 12px 40px rgba(124,58,237,0.25)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem', borderRadius: '14px',
            background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)',
            color: '#a78bfa', flexShrink: 0,
          }}>
            <Puzzle size={28} className="animate-pulse" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem' }}>SentinelAI Browser Extension</h3>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                borderRadius: '999px', background: 'rgba(124,58,237,0.25)',
                color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>Hackathon Feature</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
              Real-time URL threat checking directly in Chrome / Edge — click to view installation guide.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <a
            href="/sentinel-ai-extension.zip"
            download
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <Download size={14} /> Download ZIP
          </a>
          <button
            onClick={onOpenExtension}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.1rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: '#fff', fontSize: '0.8rem', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Sparkles size={14} /> Installation Guide
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="stat-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.55rem', borderRadius: '10px', background: card.bg, color: card.color }}>
                  <Icon size={22} />
                </div>
                {card.badge && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700,
                    padding: '0.18rem 0.55rem', borderRadius: '999px',
                    background: `${card.badgeColor}18`,
                    color: card.badgeColor,
                    border: `1px solid ${card.badgeColor}30`,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{card.badge}</span>
                )}
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '0.35rem' }}>
                {card.valueText ?? (card.value?.toLocaleString() ?? '—')}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {card.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-panel p-6 xl:col-span-2"
          style={{ minHeight: '280px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div className="eyebrow"><TrendingUp size={12} /> Threat Activity</div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>Timeline</h3>
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem',
              borderRadius: '999px', background: 'rgba(16,185,129,0.12)',
              color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)',
            }}>Live Sync</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0b1120', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#f1f5f9', fontSize: '0.8rem' }}
                  cursor={{ stroke: 'rgba(124,58,237,0.3)' }}
                />
                <Area type="monotone" dataKey="threats" stroke="#7c3aed" strokeWidth={2} fill="url(#violetGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ minHeight: 180 }}>
              <div>
                <TrendingUp size={36} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                <p>Waiting for live data...</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="glass-panel p-6"
          style={{ minHeight: '280px' }}
        >
          <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><Eye size={12} /> Category Distribution</div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', marginBottom: '1rem' }}>Threat Types</h3>
          {distData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={distData} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {distData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0b1120', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#f1f5f9', fontSize: '0.8rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                {distData.slice(0, 4).map((d, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'inline-block' }} />
                      <span style={{ color: '#94a3b8' }}>{d.name}</span>
                    </div>
                    <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <div>
                <Globe size={36} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                <p>No data yet</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick Access Cards ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="eyebrow" style={{ marginBottom: '1rem' }}><Zap size={12} /> Quick Access</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { to: '/analyze',  icon: ShieldCheck,  label: 'Threat Analyzer',   desc: 'Analyze messages, URLs, PDFs and screenshots for scam patterns.',   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)'  },
            { to: '/currency', icon: IndianRupee,  label: 'Currency Shield',   desc: 'Verify Indian currency note authenticity using live camera or upload.', color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
            { to: '/audio',    icon: AudioLines,   label: 'Audio Shield',      desc: 'Detect AI-generated or cloned voice patterns from recordings.',      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}>
                <motion.div
                  whileHover={{ y: -3 }}
                  style={{
                    padding: '1.25rem', borderRadius: '18px',
                    background: 'linear-gradient(145deg, rgba(11,17,32,0.9), rgba(7,13,26,0.95))',
                    border: '1px solid rgba(148,163,184,0.1)',
                    transition: 'border-color 0.25s, box-shadow 0.25s',
                    cursor: 'pointer',
                  }}
                  whileHover={{ borderColor: `${item.color}40`, boxShadow: `0 8px 32px ${item.color}18` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '0.6rem', borderRadius: '12px', background: item.bg, color: item.color }}>
                      <Icon size={22} />
                    </div>
                    <ArrowRight size={16} style={{ color: '#475569', marginTop: '0.25rem' }} />
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.35rem' }}>{item.label}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.55 }}>{item.desc}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
