import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Camera, CheckCircle2, Image as ImageIcon,
  IndianRupee, Loader2, RefreshCcw, ScanLine, ShieldCheck,
  Upload, XCircle, Play, Square, Sparkles, ShieldAlert, BookOpen
} from 'lucide-react';
import { threatAPI } from '../services/api';

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
    </div>
  );
}

export default function CurrencyShield() {
  const [status,            setStatus]            = useState(null);
  const [statusError,       setStatusError]       = useState('');
  const [selectedFile,      setSelectedFile]      = useState(null);
  const [preview,           setPreview]           = useState('');
  const [result,            setResult]            = useState(null);
  const [error,             setError]             = useState('');
  const [loading,           setLoading]           = useState(false);
  const [cameraActive,      setCameraActive]      = useState(false);
  const [autoScanActive,    setAutoScanActive]    = useState(false);
  const [isAutoScanningFrame, setIsAutoScanningFrame] = useState(false);
  const [activeInputTab,    setActiveInputTab]    = useState('upload'); // 'upload' or 'camera'

  const videoRef             = useRef(null);
  const streamRef            = useRef(null);
  const autoScanIntervalRef  = useRef(null);
  const isProcessingFrameRef = useRef(false);

  useEffect(() => {
    refreshStatus();
    return () => { stopCamera(); stopAutoScan(); };
  }, []);

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  useEffect(() => {
    if (autoScanActive && cameraActive) {
      autoScanIntervalRef.current = setInterval(async () => {
        if (!isProcessingFrameRef.current && videoRef.current?.videoWidth) {
          isProcessingFrameRef.current = true;
          setIsAutoScanningFrame(true);
          try { await performAutoScanCapture(); } catch {}
          finally { setIsAutoScanningFrame(false); isProcessingFrameRef.current = false; }
        }
      }, 2500);
    } else { stopAutoScan(); }
    return () => stopAutoScan();
  }, [autoScanActive, cameraActive]);

  const stopAutoScan = () => {
    if (autoScanIntervalRef.current) { clearInterval(autoScanIntervalRef.current); autoScanIntervalRef.current = null; }
    isProcessingFrameRef.current = false;
    setIsAutoScanningFrame(false);
  };

  const refreshStatus = async () => {
    try { const d = await threatAPI.getCurrencyStatus(); setStatus(d); setStatusError(''); }
    catch { setStatusError('Verification service check failed.'); }
  };

  const setFileForAnalysis = (file) => {
    if (!file) return;
    setSelectedFile(file); setError(''); setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => setFileForAnalysis(e.target.files?.[0]);

  const analyzeFile = async (fileToAnalyze = selectedFile, silent = false) => {
    if (!isReady) { setError('Verification service is offline. Please verify your connection.'); return; }
    if (!fileToAnalyze) { setError('Please select or capture a currency note first.'); return; }
    if (!silent) setLoading(true);
    setError('');
    try {
      const fd = new FormData(); fd.append('file', fileToAnalyze);
      const res = await threatAPI.analyzeCurrencyNote(fd);
      setResult(res);
      refreshStatus();
    } catch (err) {
      if (!silent) setError('Note verification failed. Ensure notes are fully aligned and legible.');
    } finally { if (!silent) setLoading(false); }
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream; setCameraActive(true); return true;
    } catch { setError('Camera permission blocked. Please check your system settings.'); return false; }
  };

  const stopCamera = () => {
    stopAutoScan(); setAutoScanActive(false);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const toggleAutoScan = async () => {
    if (autoScanActive) { setAutoScanActive(false); stopAutoScan(); }
    else {
      const ready = cameraActive || await startCamera();
      if (ready) setAutoScanActive(true);
    }
  };

  const performAutoScanCapture = () => new Promise(resolve => {
    const video = videoRef.current;
    if (!video?.videoWidth) return resolve();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async blob => {
      if (blob) { const f = new File([blob], `auto-${Date.now()}.jpg`, { type: 'image/jpeg' }); setFileForAnalysis(f); await analyzeFile(f, true); }
      resolve();
    }, 'image/jpeg', 0.9);
  });

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) { setError('Scanner is starting. Please try again.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) { setError('Frame capture failed.'); return; }
      const f = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFileForAnalysis(f); analyzeFile(f, false);
    }, 'image/jpeg', 0.92);
  };

  const isReady     = status?.model_present && status?.runtime_available;
  const isCounterfeit = result?.verdict === 'counterfeit_suspected';

  return (
    <div className="container" style={{ maxWidth: '1480px' }}>
      {/* ── Page Hero ──────────────────────────────────────────── */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div className="eyebrow"><IndianRupee size={12} /> National Public Safety Portal</div>
            <h1 className="page-title">Currency Authenticity Shield</h1>
            <p className="page-copy">Protecting citizens against counterfeit currency distribution using on-device deep learning analysis.</p>
          </div>
        </div>
        <button onClick={refreshStatus} className="btn" style={{ flexShrink: 0 }}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* ── Split Layout Grid ──────────────────────────────────── */}
      <div className="analyzer-layout">
        
        {/* ── Left Column: Control Panel (Inputs & Action) ────────── */}
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
              {isReady ? 'On-Device Verification Active' : 'System Setup Incomplete'}
            </span>
          </div>

          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>Select Verification Method</h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>Upload note photo or capture directly via live webcam scanner.</p>

          {/* Toggle buttons for capture method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => { setActiveInputTab('upload'); stopCamera(); }}
              style={{
                padding: '0.65rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                background: activeInputTab === 'upload' ? 'rgba(124,58,237,0.2)' : 'rgba(11,17,32,0.8)',
                color: activeInputTab === 'upload' ? '#c4b5fd' : '#94a3b8',
                border: activeInputTab === 'upload' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              📁 Upload Note Image
            </button>
            <button
              onClick={() => { setActiveInputTab('camera'); startCamera(); }}
              style={{
                padding: '0.65rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                background: activeInputTab === 'camera' ? 'rgba(124,58,237,0.2)' : 'rgba(11,17,32,0.8)',
                color: activeInputTab === 'camera' ? '#c4b5fd' : '#94a3b8',
                border: activeInputTab === 'camera' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              📷 Live Webcam Scan
            </button>
          </div>

          {/* Input Area */}
          <div style={{
            background: 'rgba(4,7,15,0.5)', borderRadius: '12px',
            border: '1px solid rgba(148,163,184,0.1)', padding: '0.75rem', marginBottom: '1rem',
          }}>
            {activeInputTab === 'upload' ? (
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '190px', cursor: 'pointer', padding: '1rem', textAlign: 'center',
              }}>
                <Upload size={32} style={{ color: '#06b6d4', marginBottom: '0.5rem' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Select Currency Photo</span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>Supports Indian bank note snapshots.</span>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ position: 'relative', minHeight: '190px', borderRadius: '8px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '190px', objectFit: 'cover' }} onClick={captureFrame} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '2px solid rgba(6,182,212,0.4)', margin: '6px', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px' }}>
                      <span style={{ alignSelf: 'flex-start', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#22d3ee', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>
                        CLICK SCREEN TO VERIFY
                      </span>
                      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)', animation: 'pulse 1.5s infinite' }} />
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer' }} onClick={startCamera}>
                    <ScanLine size={32} style={{ color: '#06b6d4', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Activate Web Camera</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Camera controls if active */}
          {activeInputTab === 'camera' && cameraActive && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={toggleAutoScan} disabled={!isReady}
                style={{
                  padding: '0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: autoScanActive ? '#be123c' : 'rgba(6,182,212,0.15)', color: autoScanActive ? '#fecaca' : '#67e8f9',
                  border: autoScanActive ? '1px solid #be123c' : '1px solid rgba(6,182,212,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                }}
              >
                {autoScanActive ? <Square size={12} /> : <Play size={12} />}
                {autoScanActive ? 'Stop Auto' : '⚡ Auto-Scan'}
              </button>
              <button
                onClick={stopCamera}
                style={{ padding: '0.55rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fca5a5' }}
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Selected Evidence Thumbnail */}
          {preview && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'rgba(4,7,15,0.4)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem' }}>
              <img src={preview} alt="Thumbnail" style={{ width: 64, height: 42, objectFit: 'contain', borderRadius: '4px', background: '#000' }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile ? selectedFile.name : 'Live Frame Captured'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Ready for inspection</div>
              </div>
              <button onClick={() => { setPreview(''); setSelectedFile(null); setResult(null); }} style={{ fontSize: '0.7rem', color: '#f43f5e', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Remove
              </button>
            </div>
          )}

          {/* Analyze CTA button (placed above the fold, no scroll required!) */}
          <button
            onClick={() => analyzeFile()}
            disabled={!preview || loading || !isReady}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800,
              border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: (preview && isReady) ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : 'rgba(30,41,59,0.8)',
              opacity: (!preview || loading || !isReady) ? 0.6 : 1,
              cursor: (!preview || loading || !isReady) ? 'not-allowed' : 'pointer',
              boxShadow: (preview && isReady) ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Analyzing security indicators...' : isReady ? 'Verify Bank Note' : 'Service Unavailable'}
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
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', textAlign: 'center', padding: '2rem' }}
              >
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', animation: 'pulse 2s infinite' }}>
                  <IndianRupee size={32} style={{ color: '#10b981', opacity: 0.7 }} />
                </div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.4rem' }}>Awaiting Note Inspection</h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', maxWidth: '20rem', lineHeight: 1.6 }}>
                  Upload a photo of your currency note or activate the live scanner to evaluate watermarks, printing, and security threads.
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
                  background: isCounterfeit ? 'linear-gradient(135deg, rgba(127,29,29,0.85), rgba(69,10,10,0.95))' : 'linear-gradient(135deg, rgba(20,83,45,0.85), rgba(5,46,22,0.95))',
                  border: `2px solid ${isCounterfeit ? 'rgba(244,63,94,0.45)' : 'rgba(16,185,129,0.45)'}`,
                  boxShadow: isCounterfeit ? '0 8px 24px rgba(244,63,94,0.15)' : '0 8px 24px rgba(16,185,129,0.15)',
                }}>
                  {isCounterfeit
                    ? <XCircle size={44} style={{ color: '#f87171', margin: '0 auto 0.5rem' }} />
                    : <CheckCircle2 size={44} style={{ color: '#34d399', margin: '0 auto 0.5rem' }} />}
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#cbd5e1', marginBottom: '0.2rem' }}>Safety Verdict</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.02em' }}>
                    {isCounterfeit ? 'Counterfeit Susppected' : 'Authentic Currency'}
                  </div>
                </div>

                {/* Score Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <Metric label="Risk Level" value={`${result.risk_score}%`} />
                  <Metric label="Confidence" value={`${result.confidence != null ? Math.round(result.confidence * 100) : '—'}%`} />
                  <Metric label="Severity" value={result.severity || 'Low'} />
                </div>

                {/* Probability Distribution */}
                {result.probabilities && Object.keys(result.probabilities).length > 0 && (
                  <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem' }}>Analysis Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(result.probabilities).map(([lbl, val]) => (
                        <div key={lbl}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{lbl}</span>
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
