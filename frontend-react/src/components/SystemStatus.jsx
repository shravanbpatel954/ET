import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server, Database, Activity, CheckCircle, AlertTriangle,
  IndianRupee, AudioLines, Clock, RefreshCcw, Zap, Shield, Network
} from 'lucide-react';
import { threatAPI } from '../services/api';

const cardVariants = {
  hidden:  { y: 16, opacity: 0 },
  visible: (i) => ({ y: 0, opacity: 1, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

function StatusCard({ icon: Icon, color, bg, title, subtitle, operational, delay, badgeText }) {
  return (
    <motion.div
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        padding: '1.25rem 1.5rem', borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(11,17,32,0.9), rgba(7,13,26,0.95))',
        border: `1px solid ${operational ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
        boxShadow: operational ? '0 4px 24px rgba(16,185,129,0.05)' : '0 4px 24px rgba(245,158,11,0.05)',
        transition: 'border-color 0.25s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '12px', background: bg, color, flexShrink: 0 }}>
          <Icon size={26} />
        </div>
        <div>
          <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.2rem' }}>{title}</h3>
          <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 500 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
          background: operational ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          color: operational ? '#6ee7b7' : '#fcd34d',
          border: `1px solid ${operational ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
        }}>
          {operational
            ? <CheckCircle size={13} />
            : <AlertTriangle size={13} />}
          {operational ? 'Operational' : 'Setup Required'}
        </span>
        {badgeText && <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>{badgeText}</span>}
      </div>
    </motion.div>
  );
}

export default function SystemStatus() {
  const [status,   setStatus]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lastSync, setLastSync] = useState(null);

  const fetchStatus = async () => {
    try {
      const data = await threatAPI.getSystemStatus();
      setStatus(data); setError('');
      setLastSync(new Date());
    } catch (err) {
      setError('Unable to reach the backend. Ensure the server is running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); const iv = setInterval(fetchStatus, 12000); return () => clearInterval(iv); }, []);

  const services = status ? [
    {
      icon: Server,     color: '#818cf8', bg: 'rgba(129,140,248,0.12)',
      title: 'API Gateway',       subtitle: 'Core backend services',
      operational: true,
    },
    {
      icon: Database,   color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      title: 'Threat Database',   subtitle: 'Scam pattern repository',
      operational: status.mongodb?.status?.includes('Connected') || status.mongodb?.status === 'Operational',
    },
    {
      icon: Activity,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
      title: 'Intelligence Engine', subtitle: 'Threat analysis pipeline',
      operational: status.evolution_engine?.status?.includes('Operational'),
    },
    {
      icon: IndianRupee, color: '#34d399', bg: 'rgba(52,211,153,0.12)',
      title: 'Currency Shield',   subtitle: 'Note authentication engine',
      operational: status.currency_model?.model_present && status.currency_model?.runtime_available,
    },
    {
      icon: AudioLines,  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',
      title: 'Audio Shield',      subtitle: 'Voice authentication engine',
      operational: status.audio_model?.folder_model_present && status.audio_model?.runtime_available,
    },
  ] : [];

  const operationalCount = services.filter(s => s.operational).length;
  const allGood = operationalCount === services.length;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
            <Shield size={22} />
          </div>
          <div>
            <div className="eyebrow"><Server size={12} /> Platform Health</div>
            <h1 className="page-title">System Status</h1>
            <p className="page-copy">Live health monitoring of all SentinelAI services.</p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); fetchStatus(); }}
          className="btn"
          style={{ flexShrink: 0 }}
          disabled={loading}
        >
          <RefreshCcw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Overall status banner */}
      {!loading && !error && status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem', padding: '1.25rem 1.5rem', borderRadius: '16px',
            background: allGood ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
            border: `1px solid ${allGood ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: allGood ? '#4ade80' : '#fbbf24',
              boxShadow: allGood ? '0 0 10px #4ade8099' : '0 0 10px #fbbf2499',
              animation: 'pulse 2s ease-in-out infinite', flexShrink: 0,
            }} />
            <div>
              <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1rem' }}>
                {allGood ? 'All Systems Operational' : `${operationalCount} of ${services.length} Services Operational`}
              </div>
              {lastSync && (
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={11} /> Last synced {lastSync.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['API', 'Database', 'AI Engine', 'Currency', 'Audio'].map((label, i) => (
              <span key={label} style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px',
                background: services[i]?.operational ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: services[i]?.operational ? '#6ee7b7' : '#fcd34d',
                border: `1px solid ${services[i]?.operational ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>{label}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#fca5a5', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Backend Unreachable</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</div>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && !status && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 80, borderRadius: '16px', background: 'rgba(11,17,32,0.7)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Service Cards */}
      {status && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {services.map((svc, i) => (
            <StatusCard key={svc.title} {...svc} delay={i} />
          ))}
        </div>
      )}

      {/* Processing Queue */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel"
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Zap size={15} style={{ color: '#7c3aed' }} /> Processing Queue
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(4,7,15,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Active Analysis Jobs</div>
              <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.2rem' }}>Current load on the AI pipeline</div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#7c3aed', fontFamily: 'JetBrains Mono, monospace', animation: status.processing_queue > 0 ? 'pulse 2s ease-in-out infinite' : 'none' }}>
              {status.processing_queue ?? 0}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
