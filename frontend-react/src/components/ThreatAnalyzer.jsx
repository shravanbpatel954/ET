import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode,
  FileText,
  Fingerprint,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  PhoneOff,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { threatAPI } from '../services/api';

const TABS = [
  { id: 'text', label: 'Text / Transcript', icon: FileText, active: true },
  { id: 'url', label: 'Website URL', icon: LinkIcon, active: true },
  { id: 'pdf', label: 'PDF', icon: FileCode, active: true },
  { id: 'image', label: 'AI Image Detector', icon: ImageIcon, active: true },
  { id: 'voice', label: 'Voice', icon: PhoneOff, active: false },
];

const normalizeUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const getGaugeColor = (score) => {
  if (score >= 90) return '#ef4444';
  if (score >= 70) return '#f97316';
  if (score >= 40) return '#facc15';
  return '#22c55e';
};

const verdictCopy = (score) => {
  if (score >= 70) {
    return {
      title: 'DANGER: HIGH RISK',
      body: 'This shows strong scam or impersonation signals. Do not share money, OTPs, passwords, or personal data.',
    };
  }
  if (score >= 40) {
    return {
      title: 'CAUTION: SUSPICIOUS',
      body: 'We found warning signs. Verify the source independently before you continue.',
    };
  }
  return {
    title: 'LOW RISK FOUND',
    body: 'No strong scam pattern was found, but still avoid sharing sensitive information unless you trust the source.',
  };
};

export default function ThreatAnalyzer() {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (selected) => {
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl('');
      }
    }
  };

  const canSubmit = activeTab === 'text' || activeTab === 'url' ? content.trim() : file;
  const verdict = result ? verdictCopy(result.threat_score) : null;

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      let sourceType = 'raw_text';
      if (activeTab === 'url') sourceType = 'news_article_url';
      if (activeTab === 'pdf') sourceType = 'pdf_advisory';
      if (activeTab === 'image') sourceType = 'screenshot';

      const payloadContent = activeTab === 'url' ? normalizeUrl(content) : content;
      formData.append('source_type', sourceType);
      if (payloadContent) formData.append('content', payloadContent);
      if (file) formData.append('file', file);

      const response = await threatAPI.analyzeContent(formData);
      setResult(response);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Analysis failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const report = [
      'SentinelAI Digital Safety Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Threat Level: ${result.threat_level}`,
      `Threat Score: ${result.threat_score}`,
      `Category: ${result.scam_category}`,
      `Variant: ${result.variant_version || 'N/A'}`,
      `Similarity: ${result.similarity_score || 0}%`,
      '',
      'Indicators:',
      ...(result.indicators || []).map((item) => `- ${item}`),
      '',
      'Recommended Actions:',
      ...(result.recommendations || []).map((item) => `- ${item}`),
      '',
      'Attack Timeline:',
      ...(result.intelligence?.attack_steps || []).map((item, index) => `${index + 1}. ${item}`),
      '',
      'Evidence:',
      JSON.stringify(result.evidence || {}, null, 2),
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sentinelai-report-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container" style={{ maxWidth: '1500px' }}>
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="brand-mark">
            <ShieldAlert size={26} />
          </div>
          <div>
            <div className="eyebrow">Backend intelligence pipeline</div>
            <h2 className="page-title">Threat Analyzer</h2>
            <p className="page-copy">Check messages, websites, PDFs, and screenshots with metadata inspection, behavior fingerprinting, and citizen-safe guidance.</p>
          </div>
        </div>
        <div className="status-pill">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Live backend only
        </div>
      </div>

      <div className="analyzer-layout">
        <div className="glass-panel analyzer-input-panel flex flex-col" style={{ padding: '1.25rem' }}>
          <h2 className="text-2xl font-bold mb-2 text-white">What do you want to check?</h2>
          <p className="text-sm mb-6 text-slate-400">Choose evidence type. SentinelAI sends it to the live backend and explains the risk in plain language.</p>

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '0.55rem', marginBottom: '1.25rem' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={!tab.active}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResult(null);
                    setError('');
                    setFile(null);
                    setPreviewUrl('');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '82px',
                    padding: '0.8rem',
                    borderRadius: '0.75rem',
                    border: isActive ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.05)',
                    background: isActive ? 'rgba(99, 102, 241, 0.24)' : (!tab.active ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.5)'),
                    color: isActive ? '#fff' : (!tab.active ? '#475569' : '#94a3b8'),
                    cursor: tab.active ? 'pointer' : 'not-allowed',
                    opacity: tab.active ? 1 : 0.5,
                  }}
                >
                  <Icon size={23} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.2 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAnalyze} className="flex flex-col" style={{ flexGrow: 1 }}>
            <div className="flex flex-col mb-6 surface-grid" style={{ minHeight: '300px', background: 'rgba(2, 6, 23, 0.42)', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.16)', padding: '1rem' }}>
              {activeTab === 'text' && (
                <textarea
                  className="input-field"
                  style={{ width: '100%', minHeight: '260px', background: 'rgba(2,6,23,0.45)', color: '#fff', fontSize: '1rem', resize: 'vertical', outline: 'none' }}
                  placeholder="Paste suspicious SMS, WhatsApp message, email, or call transcript..."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  disabled={loading}
                />
              )}

              {activeTab === 'url' && (
                <div className="flex flex-col justify-center items-center" style={{ minHeight: '260px', width: '100%' }}>
                  <label className="text-slate-400 font-semibold mb-4">Paste suspicious website link</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <LinkIcon size={24} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      inputMode="url"
                      autoCapitalize="none"
                      spellCheck="false"
                      className="input-field"
                      style={{ width: '100%', background: 'rgba(15, 23, 42, 0.86)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '1rem 1rem 1rem 3rem', color: '#fff', fontSize: '1.05rem' }}
                      placeholder="amazan.com or https://example.com"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      onBlur={() => setContent(normalizeUrl(content))}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 text-center">Checks protocol, typo-squatting, page metadata, forms, scripts, links, extracted text, and Gemini intelligence.</p>
                </div>
              )}

              {(activeTab === 'pdf' || activeTab === 'image') && (
                <label className="flex flex-col items-center justify-center p-4" style={{ minHeight: '260px', border: '2px dashed rgba(255,255,255,0.22)', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.3)', cursor: 'pointer' }}>
                  {file && previewUrl && activeTab === 'image' ? (
                    <div className="flex flex-col items-center max-w-full text-center">
                      <div className="relative overflow-hidden rounded-xl border-2 border-cyan-500/50 mb-3 bg-black/60 p-1 shadow-lg">
                        <img src={previewUrl} alt="Evidence preview" className="max-h-[170px] w-auto object-contain rounded-lg" />
                      </div>
                      <p className="text-white font-bold text-sm truncate max-w-[280px]">{file.name}</p>
                      <span className="text-[11px] text-cyan-300 font-semibold mt-1 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                        ⚡ Ready for AI Image Detection (Click to change)
                      </span>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '50%', marginBottom: '1rem' }}>
                        {activeTab === 'pdf' ? <FileCode size={40} color="#60a5fa" /> : <ImageIcon size={40} color="#c084fc" />}
                      </div>
                      <p className="text-white font-bold text-lg mb-1">{file ? file.name : 'Click to upload evidence'}</p>
                      <p className="text-slate-400 text-sm text-center">{activeTab === 'pdf' ? 'PDF notices, advisories, bank documents' : 'Upload photo or screenshot to detect AI generation, morphing, or deepfakes'}</p>
                    </>
                  )}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    accept={activeTab === 'pdf' ? '.pdf' : 'image/*'}
                    onChange={(event) => {
                      if (event.target.files?.length) handleFileSelect(event.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: canSubmit ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#334155',
                opacity: loading || !canSubmit ? 0.72 : 1,
                cursor: loading || !canSubmit ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
              disabled={loading || !canSubmit}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
              {loading ? 'Running live analysis...' : 'Analyze with SentinelAI'}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex" style={{ padding: '1rem', borderRadius: '0.5rem', background: 'rgba(127, 29, 29, 0.3)', border: '1px solid rgba(185, 28, 28, 0.5)', color: '#fecaca', fontSize: '0.875rem', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              {error}
            </div>
          )}
        </div>

        <div className="glass-panel analyzer-output-panel relative overflow-hidden" style={{ padding: '1.25rem' }}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-muted text-center pt-24">
                <div className="relative mb-6">
                  <ShieldCheck size={86} className="text-slate-700 opacity-25" />
                  <Search size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 opacity-60" />
                </div>
                <h3 className="text-2xl mb-2 font-bold text-white">Submit evidence to begin live analysis.</h3>
                <p className="max-w-md mx-auto text-slate-400">SentinelAI will extract content, inspect metadata, create a behavioral fingerprint, compare variants, and generate citizen guidance.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center pt-24">
                <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
                  <svg className="animate-spin w-full h-full text-primary opacity-20 absolute" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <Search size={48} className="text-primary animate-pulse" />
                </div>
                <h3 className="text-2xl mb-4 font-bold text-white">Checking for scams...</h3>
                <p className="text-slate-400">Inspecting content, metadata, page structure, and behavioral fingerprints.</p>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 pb-10">
                <div className={`p-8 rounded-2xl flex flex-col items-center text-center shadow-2xl relative overflow-hidden ${
                  result.threat_score >= 70 ? 'bg-gradient-to-br from-red-900 to-red-950 border-2 border-red-500' :
                  result.threat_score >= 40 ? 'bg-gradient-to-br from-orange-900 to-orange-950 border-2 border-orange-500' :
                  'bg-gradient-to-br from-green-900 to-green-950 border-2 border-green-500'
                }`}>
                  {result.threat_score >= 70 ? <ShieldAlert size={80} className="text-red-400 mb-4 animate-pulse" /> : result.threat_score >= 40 ? <AlertTriangle size={80} className="text-orange-400 mb-4" /> : <ShieldCheck size={80} className="text-green-400 mb-4" />}
                  <h1 className="text-5xl font-black text-white mb-4">{verdict.title}</h1>
                  <p className="text-xl font-medium text-white/90 max-w-2xl">{verdict.body}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">Threat Score</div>
                    <div className="text-3xl font-black" style={{ color: getGaugeColor(result.threat_score) }}>{result.threat_score}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">Category</div>
                    <div className="text-lg font-black text-white">{result.scam_category}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">Variant</div>
                    <div className="text-lg font-black text-white">{result.variant_version || 'N/A'}</div>
                  </div>
                </div>

                {result.explainability?.length > 0 && (
                  <div className="glass-panel p-6 bg-slate-800/80 border-l-4 border-l-primary">
                    <h3 className="text-xl font-bold text-white mb-4">Why did SentinelAI flag this?</h3>
                    <ul className="space-y-3">
                      {result.explainability.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-200">
                          <AlertTriangle size={16} className="text-orange-400 mt-1 flex-shrink-0" />
                          {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.ai_image_analysis && (
                  <div className="glass-panel p-6 bg-slate-900/80 border border-cyan-500/40 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ImageIcon size={22} className="text-cyan-400" /> AI Image & Morphed Verification
                      </h3>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Hugging Face ZeroGPU Model
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 mb-4 ${
                      result.ai_image_analysis.verdict === 'ai_generated_suspected'
                        ? 'bg-red-950/40 border-red-500/40 text-red-200'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    }`}>
                      <div>
                        <div className="text-xs uppercase font-bold tracking-wider opacity-80">Authenticity Verdict</div>
                        <div className="text-2xl font-black mt-0.5">
                          {result.ai_image_analysis.verdict === 'ai_generated_suspected' ? 'AI Generated / Morphed Image Suspected' : 'Real Image Likely'}
                        </div>
                        <p className="text-xs opacity-90 mt-1">
                          Evaluated by Hugging Face model <span className="font-mono font-semibold">{result.ai_image_analysis.model_name}</span>.
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80 uppercase font-bold">Confidence</div>
                        <div className="text-3xl font-black">
                          {Math.round((result.ai_image_analysis.confidence || 0.92) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
                      <div className="text-xs font-bold text-slate-400 mb-2">Hugging Face Space Class Probabilities</div>
                      <div className="space-y-2">
                        {Object.entries(result.ai_image_analysis.probabilities || {}).map(([cls, prob]) => (
                          <div key={cls}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300 capitalize">{cls.replace(/_/g, ' ')}</span>
                              <span className="text-white font-bold">{Math.round(prob * 100)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${Math.round(prob * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(result.evidence?.Domain || result.evidence?.['URL Signals'] || result.evidence?.['Page Metadata']) && (
                  <div className="glass-panel p-6 bg-slate-900/70 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <LinkIcon size={22} className="text-primary" /> Website intelligence
                    </h3>
                    <div className="grid gap-4">
                      {['Domain', 'Brand Impersonation', 'URL Signals', 'Page Metadata', 'Page Structure'].map((type) => (
                        result.evidence?.[type]?.length > 0 && (
                          <div key={type}>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">{type}</div>
                            <div className="flex flex-wrap gap-2">
                              {result.evidence[type].map((item, index) => (
                                <span key={index} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200">{item}</span>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {result.recommendations?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle2 size={24} className="text-green-400" /> What you should do next
                      </h3>
                      <button type="button" onClick={downloadReport} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.9)', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.35)', fontWeight: 800 }}>
                        <Download size={18} /> Report
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.recommendations.map((item, index) => (
                        <div key={index} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center flex-shrink-0">{index + 1}</div>
                          <span className="font-semibold text-slate-200">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.intelligence?.attack_steps?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={24} className="text-primary" /> Attack timeline
                    </h3>
                    <div className="grid gap-3">
                      {result.intelligence.attack_steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-700">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/40 text-indigo-100 font-black flex items-center justify-center flex-shrink-0">{index + 1}</div>
                          <span className="text-slate-200 font-semibold">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="group border-t border-slate-700 pt-8">
                  <summary className="flex items-center justify-between cursor-pointer list-none glass-panel p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Server className="text-primary" size={24} />
                      <span className="text-lg font-bold text-slate-300">Law Enforcement / Technical Analysis</span>
                    </div>
                  </summary>
                  <div className="pt-6 grid gap-6">
                    <div>
                      <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                        <Fingerprint size={14} className="text-primary" /> Behavioral Fingerprint
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(result.fingerprint?.behavior_vector || {}).filter(([, value]) => typeof value === 'number').map(([key, value]) => (
                          <div key={key} className="glass-panel flex flex-col justify-between" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.4)', borderTop: `2px solid rgba(99, 102, 241, ${value})` }}>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{key}</span>
                            <span className="text-lg font-black mt-1 text-white">{(value * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-widest">Extracted Evidence</h3>
                      <div className="glass-panel p-4 bg-slate-900/50 flex flex-col gap-3">
                        {Object.entries(result.evidence || {}).map(([type, items]) => (
                          <div key={type}>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{type}</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(items || []).map((item, index) => (
                                <span key={index} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-200">{item}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
