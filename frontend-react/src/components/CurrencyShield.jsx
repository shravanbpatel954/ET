import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cpu,
  Image as ImageIcon,
  IndianRupee,
  Loader2,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  Upload,
  XCircle,
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { threatAPI } from '../services/api';

export default function CurrencyShield() {
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [autoScanActive, setAutoScanActive] = useState(false);
  const [isAutoScanningFrame, setIsAutoScanningFrame] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const autoScanIntervalRef = useRef(null);
  const isProcessingFrameRef = useRef(false);

  useEffect(() => {
    refreshStatus();
    return () => {
      stopCamera();
      stopAutoScan();
    };
  }, []);

  // Bind video element when React mounts it
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Continuous auto-scan loop engine
  useEffect(() => {
    if (autoScanActive && cameraActive) {
      autoScanIntervalRef.current = setInterval(async () => {
        if (!isProcessingFrameRef.current && videoRef.current && videoRef.current.videoWidth) {
          isProcessingFrameRef.current = true;
          setIsAutoScanningFrame(true);
          try {
            await performAutoScanCapture();
          } catch (err) {
            console.error('Auto scan frame capture error:', err);
          } finally {
            setIsAutoScanningFrame(false);
            isProcessingFrameRef.current = false;
          }
        }
      }, 2500);
    } else {
      stopAutoScan();
    }
    return () => stopAutoScan();
  }, [autoScanActive, cameraActive]);

  const stopAutoScan = () => {
    if (autoScanIntervalRef.current) {
      clearInterval(autoScanIntervalRef.current);
      autoScanIntervalRef.current = null;
    }
    isProcessingFrameRef.current = false;
    setIsAutoScanningFrame(false);
  };

  const refreshStatus = async () => {
    try {
      const data = await threatAPI.getCurrencyStatus();
      setStatus(data);
      setStatusError('');
    } catch (err) {
      setStatusError(err.response?.data?.detail || 'Currency model status is unavailable.');
    }
  };

  const setFileForAnalysis = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setError('');
    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (event) => {
    setFileForAnalysis(event.target.files?.[0]);
  };

  const analyzeFile = async (fileToAnalyze = selectedFile, silent = false) => {
    if (!isReady) {
      setError('Currency model runtime is not ready. Verify backend setup.');
      return;
    }
    if (!fileToAnalyze) {
      setError('Upload or capture a currency-note image first.');
      return;
    }
    if (!silent) setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', fileToAnalyze);
    try {
      const data = await threatAPI.analyzeCurrencyNote(formData);
      setResult(data);
      refreshStatus();
    } catch (err) {
      if (!silent) setError(err.response?.data?.detail || 'Currency analysis failed.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      setCameraActive(true);
      return true;
    } catch (err) {
      setError('Camera permission was blocked or no camera is available. Please allow camera access in your browser.');
      return false;
    }
  };

  const stopCamera = () => {
    stopAutoScan();
    setAutoScanActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleAutoScan = async () => {
    if (autoScanActive) {
      setAutoScanActive(false);
      stopAutoScan();
    } else {
      let cameraReady = cameraActive;
      if (!cameraReady) {
        cameraReady = await startCamera();
      }
      if (cameraReady) {
        setAutoScanActive(true);
      }
    }
  };

  const performAutoScanCapture = () => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return resolve();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `auto-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFileForAnalysis(file);
          await analyzeFile(file, true);
        }
        resolve();
      }, 'image/jpeg', 0.9);
    });
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError('Camera preview is initializing. Please wait a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Could not capture camera frame.');
        return;
      }
      const file = new File([blob], `live-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFileForAnalysis(file);
      analyzeFile(file, false);
    }, 'image/jpeg', 0.92);
  };

  const isReady = status?.model_present && status?.runtime_available;
  const verdictStyle = result?.verdict === 'counterfeit_suspected'
    ? 'border-red-500/40 bg-red-950/30 text-red-200'
    : 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200';

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div className="page-hero">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <IndianRupee size={15} /> Real Keras Model • naklinote.keras
          </div>
          <h2 className="page-title">Currency Shield</h2>
          <p className="page-copy">
            Upload an Indian currency note photo or scan live via webcam/mobile camera. Analyzed directly with
            <span className="text-slate-200 font-semibold"> naklinote.keras</span> CNN.
          </p>
        </div>
        <button onClick={refreshStatus} className="btn cursor-pointer">
          <RefreshCcw size={17} /> Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Model Runtime Info */}
        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-4 sm:p-5 bg-slate-900/50">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><Cpu size={19} /> Model Runtime</h3>
              <p className="text-xs text-slate-400 mt-0.5">Local Keras CNN Engine</p>
            </div>
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${isReady ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'}`}>
              {isReady ? 'READY' : 'SETUP NEEDED'}
            </span>
          </div>
          {statusError ? (
            <div className="text-xs text-red-300 bg-red-950/30 border border-red-500/30 rounded-lg p-3">{statusError}</div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <StatusRow label="Model file" value={status?.model_present ? `${status.model_name} (${status.model_size_mb} MB)` : 'Missing'} ok={status?.model_present} />
              <StatusRow label="Runtime" value={status?.runtime || 'TensorFlow missing'} ok={status?.runtime_available} />
              <StatusRow label="Python" value={status?.python_version || 'Unknown'} ok />
              <StatusRow label="Mode" value={status?.mode || 'real_keras_model'} ok />
              <StatusRow label="Labels" value={(status?.labels || ['genuine', 'counterfeit']).join(' / ')} ok />
            </div>
          )}
        </motion.div>

        {/* Action Grid: File Upload & Camera Live Scan */}
        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 }} className="xl:col-span-2 glass-panel p-4 sm:p-5 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <label className="min-h-[260px] sm:min-h-[300px] rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/40 flex flex-col items-center justify-center text-center p-5 cursor-pointer transition-all">
              <Upload size={38} className="text-cyan-400 mb-3" />
              <span className="text-white font-bold text-base">Upload Note Photo</span>
              <span className="text-slate-400 text-xs mt-1 max-w-xs">Use a clear image of full Indian note under good light.</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Fully Clickable Live Camera Scanner Box */}
            <div
              onClick={() => {
                if (!cameraActive) {
                  startCamera();
                }
              }}
              className={`rounded-xl border-2 transition-all p-4 min-h-[260px] sm:min-h-[300px] flex flex-col justify-between cursor-pointer ${
                cameraActive
                  ? 'border-cyan-500/50 bg-slate-950/60'
                  : 'border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <Camera size={20} className="text-cyan-400" /> Live Camera Scanner
                  </h3>
                  {cameraActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      CAMERA LIVE
                    </span>
                  )}
                </div>

                <div
                  className="relative rounded-lg overflow-hidden bg-black/80 border border-slate-800 h-[180px] sm:h-[220px] flex items-center justify-center group"
                  onClick={(e) => {
                    if (cameraActive) {
                      e.stopPropagation();
                      captureFrame();
                    }
                  }}
                >
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      {/* Live Scanning Laser Overlay */}
                      <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/40 m-2 rounded-lg flex flex-col justify-between p-2">
                        <div className="flex justify-between items-center text-[10px] text-cyan-400 font-mono bg-black/70 px-2 py-0.5 rounded w-full">
                          <span>CLICK TO SCAN FRAME</span>
                          {autoScanActive && (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              AUTO-SCANNING (2.5s)
                            </span>
                          )}
                        </div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-500"></div>
                        <div className="text-right text-[10px] text-cyan-400 font-mono bg-black/70 px-2 py-0.5 rounded w-fit ml-auto">
                          ALIGN CURRENCY NOTE
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-400 p-4 group-hover:scale-105 transition-transform">
                      <ScanLine size={44} className="mx-auto mb-2 text-cyan-400" />
                      <p className="text-white font-bold text-base">Click Anywhere to Open Live Camera</p>
                      <p className="text-slate-400 text-xs mt-1">Tap box to activate real-time camera scanning</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Controls when Active */}
              {cameraActive ? (
                <div className="grid grid-cols-2 gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={toggleAutoScan}
                    disabled={!isReady}
                    className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      autoScanActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-lg shadow-rose-600/30'
                        : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {autoScanActive ? <Square size={14} /> : <Play size={14} />}
                    {autoScanActive ? 'Stop Auto-Scan' : '⚡ Start Auto-Scan'}
                  </button>

                  <button
                    onClick={stopCamera}
                    className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <div className="text-center text-[11px] text-cyan-400 font-semibold pt-1">
                  ⚡ Click box to start webcam / mobile camera
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Selected Image Preview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="glass-panel p-4 sm:p-5 bg-slate-900/50">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mb-4"><ImageIcon size={19} /> Selected Evidence</h3>
          <div className="rounded-xl bg-slate-950/50 border border-slate-800 min-h-[280px] sm:min-h-[320px] flex items-center justify-center overflow-hidden p-2">
            {preview ? (
              <img src={preview} alt="Selected currency note" className="max-h-[380px] w-full object-contain rounded" />
            ) : (
              <div className="text-center text-slate-500">
                <ImageIcon size={44} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No note image captured yet</p>
              </div>
            )}
          </div>
          <button
            onClick={() => analyzeFile()}
            disabled={!selectedFile || loading || !isReady}
            className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black flex items-center justify-center gap-2 transition-all cursor-pointer text-xs sm:text-sm"
          >
            {loading ? <Loader2 size={19} className="animate-spin" /> : <ShieldCheck size={19} />}
            {loading ? 'Analyzing with naklinote.keras...' : isReady ? 'Analyze Currency Note' : 'Model Runtime Needed'}
          </button>
          {error && (
            <div className="mt-4 p-3.5 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-xs flex gap-2.5 items-center">
              <AlertTriangle size={18} className="shrink-0 text-red-400" /> {error}
            </div>
          )}
        </motion.div>

        {/* Model Verdict Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="glass-panel p-4 sm:p-5 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2"><ShieldCheck size={19} /> Model Verdict</h3>
            {isAutoScanningFrame && (
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse flex items-center gap-1">
                <Sparkles size={11} /> Auto-Scanning...
              </span>
            )}
          </div>
          {!result ? (
            <div className="min-h-[280px] sm:min-h-[320px] rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-center text-center p-6 text-slate-500">
              <div>
                <IndianRupee size={52} className="mx-auto mb-3 opacity-50 text-cyan-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-400">Real model output appears here after upload or live scan.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 sm:p-5 ${verdictStyle}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Verdict</div>
                    <div className="text-xl sm:text-2xl font-black mt-0.5">
                      {result.verdict === 'counterfeit_suspected' ? 'Counterfeit Suspected' : 'Likely Genuine'}
                    </div>
                  </div>
                  {result.verdict === 'counterfeit_suspected' ? <XCircle size={40} className="text-red-400 shrink-0" /> : <CheckCircle2 size={40} className="text-emerald-400 shrink-0" />}
                </div>
                <div className="mt-3.5 grid grid-cols-3 gap-2 text-xs">
                  <Metric label="Risk" value={`${result.risk_score}%`} />
                  <Metric label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
                  <Metric label="Severity" value={result.severity} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
                <h4 className="text-white font-bold text-xs mb-2.5">Class Probabilities</h4>
                <div className="space-y-2.5">
                  {Object.entries(result.probabilities || {}).map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 capitalize">{label}</span>
                        <span className="text-white font-bold">{Math.round(value * 100)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.round(value * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
                <h4 className="text-white font-bold text-xs mb-2 text-xs">What to do next</h4>
                <ol className="space-y-1.5 text-xs text-slate-300">
                  {(result.recommendations || []).map((item, index) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-cyan-400 font-bold">{index + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800">
                <span>Image: {result.image?.width} x {result.image?.height}</span>
                <span>Runtime: {result.technical?.runtime || 'unknown'}</span>
                <span>Model: {result.model_name}</span>
                <span>Mode: {result.analysis_mode}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold text-right ${ok ? 'text-slate-100' : 'text-yellow-300'}`}>{value}</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/10 p-2 text-center">
      <div className="text-[9px] opacity-70 uppercase tracking-wider">{label}</div>
      <div className="font-black text-sm sm:text-base mt-0.5">{value}</div>
    </div>
  );
}
