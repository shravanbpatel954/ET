import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Download, FileCode, FileText,
  Fingerprint, Image as ImageIcon, Link as LinkIcon, Loader2,
  PhoneOff, Search, Server, ShieldAlert, ShieldCheck, TrendingUp,
} from 'lucide-react';
import { threatAPI } from '../services/api';

const TABS = [
  { id: 'text',  label: 'Text / Transcript', icon: FileText,   active: true  },
  { id: 'url',   label: 'Website URL',        icon: LinkIcon,   active: true  },
  { id: 'pdf',   label: 'PDF',                icon: FileCode,   active: true  },
  { id: 'image', label: 'AI Image Detector',  icon: ImageIcon,  active: true  },
  { id: 'voice', label: 'Voice',              icon: PhoneOff,   active: false },
];

const normalizeUrl = (v) => {
  const t = v.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const getScoreColor = (s) => s >= 90 ? '#f43f5e' : s >= 70 ? '#f97316' : s >= 40 ? '#facc15' : '#10b981';

const verdictCopy = (s) => {
  if (s >= 70) return { title: 'HIGH RISK DETECTED', body: 'Strong scam or impersonation signals found. Do not share money, OTPs, passwords, or personal data.' };
  if (s >= 40) return { title: 'SUSPICIOUS CONTENT', body: 'Warning signs detected. Verify the source independently before proceeding.' };
  return { title: 'LOW RISK', body: 'No strong scam pattern found. Still avoid sharing sensitive information with unknown sources.' };
};

export default function ThreatAnalyzer() {
  const [content,    setContent]    = useState('');
  const [file,       setFile]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTab,  setActiveTab]  = useState('text');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState('');

  const handleFileSelect = (f) => {
    if (!f) return;
    setFile(f);
    setPreviewUrl(f.type.startsWith('image/') ? URL.createObjectURL(f) : '');
  };

  const canSubmit = (activeTab === 'text' || activeTab === 'url') ? content.trim() : file;
  const verdict   = result ? verdictCopy(result.threat_score) : null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      const sourceMap = { text: 'raw_text', url: 'news_article_url', pdf: 'pdf_advisory', image: 'screenshot' };
      fd.append('source_type', sourceMap[activeTab] || 'raw_text');
      const payload = activeTab === 'url' ? normalizeUrl(content) : content;
      if (payload) fd.append('content', payload);
      if (file)    fd.append('file', file);
      setResult(await threatAPI.analyzeContent(fd));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Please check your backend connection.');
    } finally { setLoading(false); }
  };

  const downloadReport = () => {
    if (!result) return;
    const lines = [
      'SentinelAI Digital Safety Report',
      `Generated: ${new Date().toLocaleString()}`,
      '', `Threat Level: ${result.threat_level}`, `Score: ${result.threat_score}`,
      `Category: ${result.scam_category}`,
      '', 'Indicators:', ...(result.indicators || []).map(i => `- ${i}`),
      '', 'Recommended Actions:', ...(result.recommendations || []).map(r => `- ${r}`),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }));
    a.download = `sentinelai-report-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="container" style={{ maxWidth: '1480px' }}>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="brand-mark"><ShieldAlert size={22} /></div>
          <div>
            <div className="eyebrow">Threat Intelligence Pipeline</div>
            <h1 className="page-title">Threat Analyzer</h1>
            <p className="page-copy">Analyze messages, URLs, PDFs, and images for scam patterns with AI-powered behavioral fingerprinting.</p>
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.9rem', borderRadius: '999px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          color: '#6ee7b7', fontSize: '0.72rem', fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live Analysis
        </span>
      </div>

      {/* Two-column layout */}
      <div className="analyzer-layout">
        {/* ── Left: Input Panel ──────────────────────────────────── */}
        <div className="glass-panel analyzer-input-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.4rem' }}>What do you want to check?</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
            Choose an evidence type. SentinelAI will analyze it and explain the risk in plain language.
          </p>

          {/* Tab Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={!tab.active}
                  onClick={() => { setActiveTab(tab.id); setResult(null); setError(''); setFile(null); setPreviewUrl(''); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '48px', padding: '0.45rem 0.5rem', borderRadius: '10px', cursor: tab.active ? 'pointer' : 'not-allowed',
                    border: active ? '2px solid rgba(124,58,237,0.6)' : '2px solid rgba(255,255,255,0.05)',
                    background: active ? 'rgba(124,58,237,0.2)' : tab.active ? 'rgba(11,17,32,0.8)' : 'rgba(11,17,32,0.4)',
                    color: active ? '#c4b5fd' : tab.active ? '#94a3b8' : '#334155',
                    opacity: tab.active ? 1 : 0.5,
                    transition: 'all 0.18s ease',
                    boxShadow: active ? '0 0 12px rgba(124,58,237,0.12)' : 'none',
                  }}
                >
                  <Icon size={16} style={{ marginBottom: '0.2rem' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Area */}
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '160px',
              background: 'rgba(4,7,15,0.5)', borderRadius: '12px',
              border: '1px solid rgba(148,163,184,0.1)', padding: '0.75rem', marginBottom: '0.75rem',
            }}>
              {activeTab === 'text' && (
                <textarea
                  className="input-field"
                  style={{ width: '100%', minHeight: '140px', background: 'transparent', border: 'none', padding: 0, color: '#f1f5f9', fontSize: '0.9rem', resize: 'none' }}
                  placeholder="Paste suspicious SMS, WhatsApp message, email, or call transcript..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={loading}
                />
              )}
              {activeTab === 'url' && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '140px', width: '100%' }}>
                  <label style={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>Paste a suspicious website link</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <LinkIcon size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="text" inputMode="url" autoCapitalize="none" spellCheck="false"
                      className="input-field"
                      style={{ paddingLeft: '2.5rem', fontSize: '0.9rem', minHeight: '38px', py: '0.5rem' }}
                      placeholder="example.com or https://suspicious-site.com"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      onBlur={() => setContent(normalizeUrl(content))}
                      disabled={loading}
                    />
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    Checks protocol, typo-squatting, metadata, scripts, links, and AI intelligence.
                  </p>
                </div>
              )}
              {(activeTab === 'pdf' || activeTab === 'image') && (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: '140px', border: '2px dashed rgba(124,58,237,0.25)', borderRadius: '12px',
                  background: 'rgba(124,58,237,0.04)', cursor: 'pointer', padding: '0.75rem',
                  transition: 'border-color 0.2s',
                }}>
                  {file && previewUrl && activeTab === 'image' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ border: '2px solid rgba(6,182,212,0.5)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.4rem', background: 'rgba(0,0,0,0.5)', padding: '3px' }}>
                        <img src={previewUrl} alt="Preview" style={{ maxHeight: 90, objectFit: 'contain', borderRadius: '6px' }} />
                      </div>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem' }}>{file.name}</p>
                      <span style={{ fontSize: '0.65rem', color: '#67e8f9', fontWeight: 700, marginTop: '0.25rem', background: 'rgba(6,182,212,0.15)', padding: '0.15rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(6,182,212,0.3)' }}>
                        Ready for detection
                      </span>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: '0.6rem', background: 'rgba(124,58,237,0.15)', borderRadius: '50%', marginBottom: '0.4rem' }}>
                        {activeTab === 'pdf' ? <FileCode size={24} color="#a78bfa" /> : <ImageIcon size={24} color="#c084fc" />}
                      </div>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        {file ? file.name : 'Upload evidence'}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.72rem', textAlign: 'center' }}>
                        {activeTab === 'pdf' ? 'PDF notice / bank document' : 'Photo or screenshot'}
                      </p>
                    </>
                  )}
                  <input type="file" style={{ display: 'none' }} accept={activeTab === 'pdf' ? '.pdf' : 'image/*'} onChange={e => { if (e.target.files?.length) handleFileSelect(e.target.files[0]); }} />
                </label>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 800,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                background: canSubmit ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : 'rgba(30,41,59,0.8)',
                opacity: loading || !canSubmit ? 0.65 : 1,
                cursor: loading || !canSubmit ? 'not-allowed' : 'pointer', border: 'none',
                boxShadow: canSubmit ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
              disabled={loading || !canSubmit}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              {loading ? 'Running analysis...' : 'Analyze with SentinelAI'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}
        </div>

        {/* ── Right: Output Panel ────────────────────────────────── */}
        <div className="glass-panel analyzer-output-panel relative overflow-hidden" style={{ padding: '1.5rem' }}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '96px', height: '96px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
                    border: '1px solid rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                    animation: 'pulse 2.5s ease-in-out infinite',
                  }}>
                    <Search size={38} style={{ color: '#7c3aed', opacity: 0.7 }} />
                  </div>
                  <div style={{
                    position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(6,182,212,0.3)', border: '1px solid rgba(6,182,212,0.5)',
                    animation: 'ping 1.5s ease-in-out infinite',
                  }} />
                </div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Submit evidence to begin analysis</h3>
                <p style={{ color: '#64748b', maxWidth: '24rem', lineHeight: 1.65, fontSize: '0.875rem' }}>
                  SentinelAI will extract content, inspect metadata, create a behavioral fingerprint, and generate citizen-safe guidance.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#374151' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  Live backend ready
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ position: 'relative', marginBottom: '2rem', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ position: 'absolute', width: '100%', height: '100%', animation: 'spin 2s linear infinite' }} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="rgba(124,58,237,0.2)" strokeWidth="2" fill="none" />
                    <path fill="rgba(124,58,237,0.8)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <Search size={40} style={{ color: '#7c3aed', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Scanning for threats...</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Inspecting content, metadata, and behavioral fingerprints.</p>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem' }}>
                {/* Verdict Banner */}
                <div style={{
                  padding: '1.75rem', borderRadius: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  background: result.threat_score >= 70 ? 'linear-gradient(135deg, rgba(127,29,29,0.8), rgba(69,10,10,0.9))' :
                              result.threat_score >= 40 ? 'linear-gradient(135deg, rgba(120,53,15,0.8), rgba(67,20,7,0.9))' :
                                                          'linear-gradient(135deg, rgba(20,83,45,0.8), rgba(5,46,22,0.9))',
                  border: `2px solid ${result.threat_score >= 70 ? 'rgba(244,63,94,0.5)' : result.threat_score >= 40 ? 'rgba(249,115,22,0.5)' : 'rgba(16,185,129,0.5)'}`,
                  boxShadow: result.threat_score >= 70 ? '0 8px 32px rgba(244,63,94,0.2)' : result.threat_score >= 40 ? '0 8px 32px rgba(249,115,22,0.2)' : '0 8px 32px rgba(16,185,129,0.2)',
                }}>
                  {result.threat_score >= 70 ? <ShieldAlert size={64} style={{ color: '#f87171', marginBottom: '0.75rem', animation: 'pulse 1.5s ease-in-out infinite' }} /> :
                   result.threat_score >= 40 ? <AlertTriangle size={64} style={{ color: '#fb923c', marginBottom: '0.75rem' }} /> :
                                               <ShieldCheck  size={64} style={{ color: '#34d399', marginBottom: '0.75rem' }} />}
                  <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.75rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{verdict.title}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '36rem', margin: '0 auto' }}>{verdict.body}</p>
                </div>

                {/* Score Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { label: 'Threat Score', val: result.threat_score, color: getScoreColor(result.threat_score) },
                    { label: 'Category',     val: result.scam_category },
                    { label: 'Variant',      val: result.variant_version || 'N/A' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ padding: '0.875rem', borderRadius: '12px', background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(148,163,184,0.1)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{label}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: color || '#f1f5f9' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Why flagged */}
                {result.explainability?.length > 0 && (
                  <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(11,17,32,0.8)', borderLeft: '4px solid #7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '0.875rem', fontSize: '1rem' }}>Why SentinelAI flagged this</h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', listStyle: 'none', padding: 0 }}>
                      {result.explainability.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                          <AlertTriangle size={14} style={{ color: '#fb923c', marginTop: 3, flexShrink: 0 }} />
                          {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={20} style={{ color: '#34d399' }} /> What you should do next
                      </h3>
                      <button type="button" onClick={downloadReport} style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem',
                        borderRadius: '8px', background: 'rgba(11,17,32,0.9)', color: '#94a3b8',
                        border: '1px solid rgba(148,163,184,0.15)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      }}>
                        <Download size={14} /> Report
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
                      {result.recommendations.map((item, i) => (
                        <div key={i} style={{ padding: '0.875rem', borderRadius: '12px', background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attack Timeline */}
                {result.intelligence?.attack_steps?.length > 0 && (
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      <TrendingUp size={20} style={{ color: '#7c3aed' }} /> Attack Timeline
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {result.intelligence.attack_steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', borderRadius: '12px', background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(148,163,184,0.1)' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)', color: '#a78bfa', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
