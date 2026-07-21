import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Cloud, Activity, CheckCircle, Clock, AlertTriangle, IndianRupee, AudioLines } from 'lucide-react';
import { threatAPI } from '../services/api';

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await threatAPI.getSystemStatus();
        const currency = data.currency_model || await threatAPI.getCurrencyStatus();
        const audio = data.audio_model || await threatAPI.getAudioStatus();
        setStatus({ ...data, currency_model: currency, audio_model: audio });
      } catch {
        setStatus({
          fastapi: { status: "Unavailable", latency: "N/A" },
          gemini: { status: "Unknown", quota: "N/A" },
          mongodb: { status: "Unavailable", docs: "0" },
          evolution_engine: { status: "Unavailable", sync: "No backend connection" },
          currency_model: { model_present: false, runtime_available: false, runtime: null, python_version: "N/A" },
          audio_model: { folder_model_present: false, runtime_available: false, runtime: null, python_version: "N/A" },
          processing_queue: 0
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <div className="container p-10 text-center"><span className="text-muted">Initializing Diagnostics...</span></div>;

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div className="page-hero">
        <div>
          <div className="eyebrow">Platform diagnostics</div>
          <h2 className="page-title">System Health & Status</h2>
          <p className="page-copy">Real-time monitoring of platform infrastructure and local AI model readiness.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><Server size={28}/></div>
               <div>
                  <h3 className="font-bold text-slate-200">FastAPI Orchestrator</h3>
                  <p className="text-xs text-slate-500 font-mono">API health endpoint</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={`flex items-center gap-1 text-sm font-bold ${status.fastapi.status === 'Operational' ? 'text-green-400' : 'text-red-400'}`}>
                 {status.fastapi.status === 'Operational' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {status.fastapi.status}
               </span>
               <span className="text-xs text-slate-400 mt-1">Latency: {status.fastapi.latency}</span>
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-6 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400"><Cloud size={28}/></div>
               <div>
                  <h3 className="font-bold text-slate-200">Gemini AI Engine</h3>
                  <p className="text-xs text-slate-500 font-mono">Google Cloud Vertex AI</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={`flex items-center gap-1 text-sm font-bold ${status.gemini.status.includes('Operational') ? 'text-green-400' : 'text-yellow-400'}`}>
                 {status.gemini.status.includes('Operational') ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {status.gemini.status}
               </span>
               <span className="text-xs text-slate-400 mt-1">Quota: {status.gemini.quota}</span>
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-6 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-green-900/30 rounded-lg text-green-400"><Database size={28}/></div>
               <div>
                  <h3 className="font-bold text-slate-200">MongoDB Atlas</h3>
                  <p className="text-xs text-slate-500 font-mono">Primary Data Store</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={`flex items-center gap-1 text-sm font-bold ${status.mongodb.status === 'Operational' ? 'text-green-400' : 'text-red-400'}`}>
                 {status.mongodb.status === 'Operational' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {status.mongodb.status}
               </span>
               <span className="text-xs text-slate-400 mt-1">Docs: {status.mongodb.docs}</span>
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-6 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-orange-900/30 rounded-lg text-orange-400"><Activity size={28}/></div>
               <div>
                  <h3 className="font-bold text-slate-200">Evolution Engine</h3>
                  <p className="text-xs text-slate-500 font-mono">Vector Similarity Service</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={`flex items-center gap-1 text-sm font-bold ${status.evolution_engine.status === 'Operational' ? 'text-green-400' : 'text-red-400'}`}>
                 {status.evolution_engine.status === 'Operational' ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {status.evolution_engine.status}
               </span>
               <span className="text-xs text-slate-400 mt-1">Sync: {status.evolution_engine.sync}</span>
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-6 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-900/30 rounded-lg text-emerald-400"><IndianRupee size={28}/></div>
               <div>
                  <h3 className="font-bold text-slate-200">Currency Shield Model</h3>
                  <p className="text-xs text-slate-500 font-mono">{status.currency_model.model_name || 'naklinote.keras'}</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={`flex items-center gap-1 text-sm font-bold ${status.currency_model.model_present && status.currency_model.runtime_available ? 'text-green-400' : 'text-yellow-400'}`}>
                 {status.currency_model.model_present && status.currency_model.runtime_available ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                 {status.currency_model.model_present && status.currency_model.runtime_available ? 'Operational' : 'Setup Needed'}
               </span>
               <span className="text-xs text-slate-400 mt-1">Python: {status.currency_model.python_version || 'N/A'}</span>
            </div>
         </motion.div>

         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-6 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><AudioLines size={28}/></div>
               <div>
                  <h3 className="font-bold text-slate-200">Audio Shield Model</h3>
                  <p className="text-xs text-slate-500 font-mono">{status.audio_model.model_name || 'audio/'}</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={`flex items-center gap-1 text-sm font-bold ${status.audio_model.folder_model_present && status.audio_model.runtime_available ? 'text-green-400' : 'text-yellow-400'}`}>
                 {status.audio_model.folder_model_present && status.audio_model.runtime_available ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                 {status.audio_model.folder_model_present && status.audio_model.runtime_available ? 'Operational' : 'Setup Needed'}
               </span>
               <span className="text-xs text-slate-400 mt-1">Runtime: {status.audio_model.runtime || 'missing'}</span>
            </div>
         </motion.div>
      </div>

      <div className="mt-8 glass-panel p-6 bg-slate-900/50">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
           <Clock size={16} className="text-primary"/> Processing Queue
         </h3>
         <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div>
               <div className="font-bold text-white">Active Analysis Jobs</div>
               <div className="text-sm text-slate-400 mt-1">Current load on the AI pipeline.</div>
            </div>
            <div className="text-3xl font-black text-primary animate-pulse">{status.processing_queue}</div>
         </div>
      </div>
    </div>
  );
}
