import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, AudioLines, CheckCircle2, FileAudio,
  Loader2, Mic, RefreshCcw, ShieldCheck, Square, Upload, XCircle, BookOpen
} from 'lucide-react';
import { threatAPI } from '../services/api';

function convertBlobToWav(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(new Blob([reader.result], { type: 'audio/wav' }));
    reader.readAsArrayBuffer(blob);
  });
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
    </div>
  );
}

export default function AudioShield() {
  const [status,      setStatus]      = useState(null);
  const [statusError, setStatusError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState('');
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [seconds,     setSeconds]     = useState(0);
  const [activeInputTab, setActiveInputTab] = useState('upload'); // 'upload' or 'record'

  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);

  useEffect(() => { refreshStatus(); return () => stopTimer(); }, []);

  const refreshStatus = async () => {
    try { const d = await threatAPI.getAudioStatus(); setStatus(d); setStatusError(''); }
    catch { setStatusError('Voice analysis service check failed.'); }
  };

  const isReady = status?.folder_model_present && status?.runtime_available;

  const setFileForAnalysis = (file) => {
    if (!file) return;
    setSelectedFile(file); setResult(null); setError(''); setPreviewUrl(URL.createObjectURL(file));
  };

  const analyzeFile = async (file = selectedFile) => {
    if (!isReady) { setError('Voice analysis service is offline. Please try again later.'); return; }
    if (!file) { setError('Please upload or record an audio sample first.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      setResult(await threatAPI.analyzeAudio(fd));
      refreshStatus();
    } catch (err) {
      setError('Audio analysis failed. Check file format and length.');
    } finally { setLoading(false); }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const wavBlob = await convertBlobToWav(blob);
        const f = new File([wavBlob], `voice-scan-${Date.now()}.wav`, { type: 'audio/wav' });
        stream.getTracks().forEach(t => t.stop());
        setFileForAnalysis(f);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(v => v + 1), 1000);
    } catch { setError('Microphone access denied. Please allow microphone permissions.'); }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false); stopTimer();
  };

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const isAI = result?.verdict === 'ai_generated_suspected';
  const fmt  = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #0284c7, #4f46e5)' }}>
            <AudioLines size={22} />
          </div>
          <div>
            <div className="eyebrow"><AudioLines size={12} /> National Public Safety Portal</div>
            <h1 className="page-title">Voice Clone Authenticity Shield</h1>
            <p className="page-copy">Detecting AI voice impersonation and audio deepfakes to protect public communication security.</p>
          </div>
        </div>
        <button onClick={refreshStatus} className="btn" style={{ flexShrink: 0 }}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* ── Split Layout Grid ──────────────────────────────────── */}
      <div className="analyzer-layout">
        
        {/* ── Left Column: Control Panel (Inputs & Capture) ───────── */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          
          {/* Status banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.5rem 0.85rem', borderRadius: '10px', marginBottom: '1rem',
            background: isReady ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${isReady ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isReady ? '#34d399' : '#fbbf24', display: 'inline-block', animation: isReady ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isReady ? '#6ee7b7' : '#fcd34d' }}>
              {isReady ? 'Voice Pipeline Active' : 'System Setup Incomplete'}
            </span>
          </div>

          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>Select Capture Method</h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>Upload voice recording or record live voice pattern from mic.</p>

          {/* Toggle buttons for capture method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => { setActiveInputTab('upload'); stopRecording(); }}
              style={{
                padding: '0.65rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                background: activeInputTab === 'upload' ? 'rgba(124,58,237,0.2)' : 'rgba(11,17,32,0.8)',
                color: activeInputTab === 'upload' ? '#c4b5fd' : '#94a3b8',
                border: activeInputTab === 'upload' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              📁 Upload Recording
            </button>
            <button
              onClick={() => { setActiveInputTab('record'); }}
              style={{
                padding: '0.65rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                background: activeInputTab === 'record' ? 'rgba(124,58,237,0.2)' : 'rgba(11,17,32,0.8)',
                color: activeInputTab === 'record' ? '#c4b5fd' : '#94a3b8',
                border: activeInputTab === 'record' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              🎙️ Record Live Voice
            </button>
          </div>

          {/* Input Area */}
          <div style={{
            background: 'rgba(4,7,15,0.5)', borderRadius: '12px',
            border: '1px solid rgba(148,163,184,0.1)', padding: '0.75rem', marginBottom: '1rem',
          }}>
            {activeInputTab === 'upload' ? (
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center',
                minHeight: '160px', cursor: 'pointer', padding: '1rem', textAlign: 'center',
              }}>
                <Upload size={32} style={{ color: '#06b6d4', marginBottom: '0.5rem' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Select Audio File</span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>WAV, MP3, or FLAC formats.</span>
                <input type="file" accept="audio/*" onChange={e => { if (e.target.files?.[0]) setFileForAnalysis(e.target.files[0]); }} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center',
                minHeight: '160px', textAlign: 'center', padding: '1rem', position: 'relative',
              }}>
                {recording && (
                  <div style={{ position: 'absolute', width: 68, height: 68, borderRadius: '50%', border: '2px solid rgba(244,63,94,0.4)', animation: 'ping 1.5s infinite' }} />
                )}
                <div style={{ padding: '0.75rem', borderRadius: '50%', background: recording ? 'rgba(244,63,94,0.2)' : 'rgba(124,58,237,0.15)', marginBottom: '0.5rem', border: `1px solid ${recording ? 'rgba(244,63,94,0.4)' : 'rgba(124,58,237,0.3)'}` }}>
                  <Mic size={24} style={{ color: recording ? '#f87171' : '#a78bfa' }} />
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                  {recording ? `Recording... ${fmt(seconds)}` : 'Microphone Ready'}
                </span>
                <div style={{ marginTop: '0.75rem' }}>
                  {!recording ? (
                    <button onClick={startRecording} style={{ padding: '0.45rem 1.25rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #0891b2)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Start Recording
                    </button>
                  ) : (
                    <button onClick={stopRecording} style={{ padding: '0.45rem 1.25rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(244,63,94,0.15)', color: '#fca5a5', border: '1px solid rgba(244,63,94,0.4)', cursor: 'pointer' }}>
                      Stop Recording
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Audio Player if sample is loaded */}
          {previewUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(4,7,15,0.4)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', itemsCenter: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  {selectedFile ? selectedFile.name : 'Live Recording.wav'}
                </span>
                <button onClick={() => { setPreviewUrl(''); setSelectedFile(null); setResult(null); }} style={{ fontSize: '0.7rem', color: '#f43f5e', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Remove
                </button>
              </div>
              <audio controls src={previewUrl} style={{ width: '100%', height: '32px' }} />
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={() => analyzeFile()}
            disabled={!previewUrl || loading || !isReady}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800,
              border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: (previewUrl && isReady) ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : 'rgba(30,41,59,0.8)',
              opacity: (!previewUrl || loading || !isReady) ? 0.6 : 1,
              cursor: (!previewUrl || loading || !isReady) ? 'not-allowed' : 'pointer',
              boxShadow: (previewUrl && isReady) ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Analyzing voice prints...' : isReady ? 'Analyze Voice Sample' : 'Service Unavailable'}
          </button>

          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fca5a5', fontSize: '0.78rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
            </div>
          )}

        </div>

        {/* ── Right Column: Verdict & Citizen Safety Guidelines ────── */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="awaiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', minHeight: '340px', textAlign: 'center', padding: '2rem' }}
              >
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', items: 'center', justify: 'center', margin: '0 auto 1.25rem', animation: 'pulse 2s infinite' }}>
                  <AudioLines size={32} style={{ color: '#818cf8', opacity: 0.7 }} />
                </div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.4rem' }}>Awaiting Audio Sample</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', maxWidth: '20rem', lineHeight: 1.6 }}>
                  Upload a voice call recording or record audio patterns using your microphone to inspect spectral cloning indicators.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Verdict Banner */}
                <div style={{
                  padding: '1.25rem', borderRadius: '14px', textAlign: 'center',
                  background: isAI ? 'linear-gradient(135deg, rgba(127,29,29,0.85), rgba(69,10,10,0.95))' : 'linear-gradient(135deg, rgba(20,83,45,0.85), rgba(5,46,22,0.95))',
                  border: `2px solid ${isAI ? 'rgba(244,63,94,0.45)' : 'rgba(16,185,129,0.45)'}`,
                  boxShadow: isAI ? '0 8px 24px rgba(244,63,94,0.15)' : '0 8px 24px rgba(16,185,129,0.15)',
                }}>
                  {isAI
                    ? <XCircle size={44} style={{ color: '#f87171', margin: '0 auto 0.5rem' }} />
                    : <CheckCircle2 size={44} style={{ color: '#34d399', margin: '0 auto 0.5rem' }} />}
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#cbd5e1', marginBottom: '0.2rem' }}>Safety Verdict</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.02em' }}>
                    {isAI ? 'AI Cloned / Deepfake Voice' : 'Authentic Voice Sample'}
                  </div>
                </div>

                {/* Score Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  <Metric label="AI Match Confidence" value={`${result.confidence != null ? Math.round(result.confidence * 100) : '—'}%`} />
                  <Metric label="Authenticity Likelihood" value={`${result.confidence != null ? Math.round((1 - result.confidence) * 100) : '—'}%`} />
                </div>

                {/* Probability Distribution */}
                {result.probabilities && Object.keys(result.probabilities).length > 0 && (
                  <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem' }}>Spectral Signatures</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(result.probabilities).map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{lbl.replace(/_/g, ' ')}</span>
                            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{Math.round(val * 100)}%</span>
                          </div>
                          <div style={{ height: 5, borderRadius: '999px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', width: `${Math.round(val * 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Guidelines */}
                {result.recommendations?.length > 0 && (
                  <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} style={{ color: '#06b6d4' }} /> Citizen Safety Advisory
                    </h4>
                    <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {result.recommendations.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                          <span style={{ color: '#7c3aed', fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
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
