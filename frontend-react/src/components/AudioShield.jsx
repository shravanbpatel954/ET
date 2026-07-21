import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AudioLines,
  CheckCircle2,
  Cpu,
  FileAudio,
  Loader2,
  Mic,
  RefreshCcw,
  ShieldCheck,
  Square,
  Upload,
  XCircle
} from 'lucide-react';
import { threatAPI } from '../services/api';

export default function AudioShield() {
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    refreshStatus();
    return () => stopTimer();
  }, []);

  const refreshStatus = async () => {
    try {
      const data = await threatAPI.getAudioStatus();
      setStatus(data);
      setStatusError('');
    } catch (err) {
      setStatusError(err.response?.data?.detail || 'Audio model status is unavailable.');
    }
  };

  const isReady = status?.folder_model_present && status?.runtime_available;

  const setFileForAnalysis = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setError('');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const analyzeFile = async (file = selectedFile) => {
    if (!isReady) {
      setError('Audio model runtime is not ready. Install torch, transformers, safetensors, soundfile, and librosa in the backend environment.');
      return;
    }
    if (!file) {
      setError('Upload or record an audio sample first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await threatAPI.analyzeAudio(formData);
      setResult(data);
      refreshStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Audio analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const wavBlob = await convertBlobToWav(blob);
        const file = new File([wavBlob], `audio-scan-${Date.now()}.wav`, { type: 'audio/wav' });
        stream.getTracks().forEach((track) => track.stop());
        setFileForAnalysis(file);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch {
      setError('Microphone permission was blocked or no microphone is available.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setRecording(false);
    stopTimer();
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const verdictStyle = result?.verdict === 'ai_generated_suspected'
    ? 'border-red-500/40 bg-red-950/30 text-red-200'
    : 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200';

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div className="page-hero">
        <div>
          <div className="eyebrow"><AudioLines size={16} /> Voice authenticity model</div>
          <h2 className="page-title">Audio Shield</h2>
          <p className="page-copy">
            Upload or record audio to detect AI-generated or cloned voice patterns using the local Wav2Vec2 Transformers model.
          </p>
        </div>
        <button onClick={refreshStatus} className="btn">
          <RefreshCcw size={18} /> Refresh Model Status
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2"><Cpu size={20} /> Model Runtime</h3>
              <p className="text-sm text-slate-400 mt-1">Local audio folder and PyTorch stack</p>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-full ${isReady ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/15 text-yellow-300'}`}>
              {isReady ? 'READY' : 'SETUP NEEDED'}
            </span>
          </div>
          {statusError ? (
            <div className="text-sm text-red-300 bg-red-950/30 border border-red-500/30 rounded-lg p-3">{statusError}</div>
          ) : (
            <div className="space-y-3 text-sm">
              <StatusRow label="Folder model" value={status?.folder_model_present ? 'audio/' : 'Missing'} ok={status?.folder_model_present} />
              <StatusRow label="Runtime" value={status?.runtime || 'PyTorch/Transformers missing'} ok={status?.runtime_available} />
              <StatusRow label="audio.keras" value={status?.keras_file_present ? `${status.keras_file_size_mb} MB copy present` : 'Not present'} ok />
              <StatusRow label="Labels" value={(status?.labels || ['real', 'ai_generated']).join(' / ')} ok />
            </div>
          )}
          {!isReady && (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-900/30 p-4 text-sm text-yellow-100">
              <div className="font-black text-yellow-300 mb-1">Real audio runtime required</div>
              <div>{status?.last_error || 'Install torch, transformers, safetensors, soundfile, and librosa.'}</div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 }} className="xl:col-span-2 glass-panel p-5 bg-slate-900/50">
          <div className="currency-action-grid">
            <label className="min-h-[300px] rounded-lg border-2 border-dashed border-slate-700 hover:border-primary/70 bg-slate-950/40 flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-colors surface-grid">
              <Upload size={42} className="text-primary mb-4" />
              <span className="text-white font-black text-lg">Upload audio</span>
              <span className="text-slate-400 text-sm mt-2">WAV is best. MP3, OGG, and FLAC may work depending on backend codecs.</span>
              <input type="file" accept="audio/*" onChange={(event) => setFileForAnalysis(event.target.files?.[0])} className="hidden" />
            </label>

            <div className="min-h-[300px] rounded-lg border border-slate-800 bg-slate-950/40 p-6 flex flex-col items-center justify-center text-center surface-grid">
              <Mic size={46} className={recording ? 'text-red-400 animate-pulse mb-4' : 'text-primary mb-4'} />
              <span className="text-white font-black text-lg">{recording ? `Recording ${seconds}s` : 'Record live audio'}</span>
              <span className="text-slate-400 text-sm mt-2 mb-5">Record suspicious voice calls, cloned voice samples, or threatening voice notes.</span>
              <button onClick={recording ? stopRecording : startRecording} className={recording ? 'btn' : 'btn btn-primary'}>
                {recording ? <Square size={18} /> : <Mic size={18} />}
                {recording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="glass-panel p-5 bg-slate-900/50">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4"><FileAudio size={20} /> Selected Evidence</h3>
          <div className="empty-state">
            {previewUrl ? (
              <div className="w-full">
                <FileAudio size={58} className="mx-auto mb-4 text-primary" />
                <div className="text-white font-black mb-4">{selectedFile?.name}</div>
                <audio src={previewUrl} controls className="w-full" />
              </div>
            ) : (
              <div>
                <FileAudio size={58} className="mx-auto mb-4" />
                No audio selected
              </div>
            )}
          </div>
          <button
            onClick={() => analyzeFile()}
            disabled={!selectedFile || loading || !isReady}
            className="mt-4 w-full py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
            {loading ? 'Analyzing audio...' : isReady ? 'Analyze Audio' : 'Model Runtime Needed'}
          </button>
          {error && (
            <div className="mt-4 p-4 rounded-lg border border-red-500/30 bg-red-950/30 text-red-200 text-sm flex gap-3">
              <AlertTriangle size={20} className="shrink-0" /> {error}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="glass-panel p-5 bg-slate-900/50">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4"><ShieldCheck size={20} /> Audio Verdict</h3>
          {!result ? (
            <div className="empty-state">
              <div>
                <AudioLines size={58} className="mx-auto mb-4" />
                Real prediction output will appear after upload or recording.
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`rounded-lg border p-5 ${verdictStyle}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.25em] opacity-80">Verdict</div>
                    <div className="text-2xl font-black mt-1">
                      {result.verdict === 'ai_generated_suspected' ? 'AI-generated voice suspected' : 'Likely real voice'}
                    </div>
                  </div>
                  {result.verdict === 'ai_generated_suspected' ? <XCircle size={44} /> : <CheckCircle2 size={44} />}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Metric label="Synthetic" value={`${Math.round(result.synthetic_probability * 100)}%`} />
                  <Metric label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
                  <Metric label="Severity" value={result.severity} />
                </div>
              </div>

              <ResultList title="Class probabilities" items={Object.entries(result.probabilities || {}).map(([label, value]) => `${label}: ${Math.round(value * 100)}%`)} />
              <ResultList title="Acoustic warning signals" items={result.threatening_audio?.signals?.length ? result.threatening_audio.signals : ['No high-intensity acoustic warnings detected.']} />
              <ResultList title="What to do next" items={result.recommendations || []} numbered />

              <div className="text-xs text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span>Duration: {result.audio?.duration_seconds}s</span>
                <span>Rate: {result.audio?.sampling_rate} Hz</span>
                <span>Runtime: {result.technical?.runtime || 'unknown'}</span>
                <span>Mode: {result.analysis_mode}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

async function convertBlobToWav(blob) {
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const decoded = await audioContext.decodeAudioData(arrayBuffer);
  const channelData = decoded.getChannelData(0);
  const wavBuffer = encodeWav(channelData, decoded.sampleRate);
  await audioContext.close();
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function StatusRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold text-right ${ok ? 'text-slate-100' : 'text-yellow-300'}`}>{value}</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-black/20 border border-white/10 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-black text-lg">{value}</div>
    </div>
  );
}

function ResultList({ title, items, numbered = false }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <h4 className="text-white font-black mb-3">{title}</h4>
      <ol className="space-y-2 text-sm text-slate-300">
        {items.map((item, index) => (
          <li key={`${title}-${item}`} className="flex gap-3">
            <span className="text-primary font-black">{numbered ? index + 1 : '•'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
