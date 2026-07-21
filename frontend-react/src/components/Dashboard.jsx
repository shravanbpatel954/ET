import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldCheck, Crosshair, 
  Map, TrendingUp, Globe, FileWarning, IndianRupee, AudioLines, Puzzle, Download, Sparkles, Eye, ArrowDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { threatAPI } from '../services/api';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function Dashboard({ onOpenExtension }) {
  const [stats, setStats] = useState({
    total_documents: 0,
    total_variants: 0,
    critical_threats: 0,
    attacks_prevented: 0,
    hotspot_regions: 0,
    category_distribution: [],
    timeline: [],
    recent_threats: []
  });
  const [currencyStatus, setCurrencyStatus] = useState(null);
  const [audioStatus, setAudioStatus] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await threatAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
      try {
        const currency = await threatAPI.getCurrencyStatus();
        setCurrencyStatus(currency);
      } catch (err) {
        console.error("Failed to fetch currency model status", err);
        setCurrencyStatus(null);
      }
      try {
        const audio = await threatAPI.getAudioStatus();
        setAudioStatus(audio);
      } catch (err) {
        console.error("Failed to fetch audio model status", err);
        setAudioStatus(null);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenGuide = () => {
    if (onOpenExtension) onOpenExtension();
  };

  const trendData = stats.timeline || [];
  const distributionData = stats.category_distribution || [];

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div className="page-hero">
        <div>
          <div className="eyebrow">National threat matrix</div>
          <h2 className="page-title">Intelligence Command Center</h2>
          <p className="page-copy flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Local Threat Matrix Online (Database Sync)
          </p>
        </div>
      </div>

      {/* Extension Hackathon Presentation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleOpenGuide}
        className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-950/20 cursor-pointer hover:border-cyan-500/60 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
            <Puzzle size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">SentinelAI Chrome Threat Shield Extension</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Hackathon Presentation Feature
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Enable real-time URL threat checking & on-page PDF advisory verification directly inside Chrome / Edge browsers. Zero hosting cost — click to open installation popup box.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <a
            href="/sentinel-ai-extension.zip"
            download="sentinel-ai-extension.zip"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
          >
            <Download size={14} /> Download ZIP
          </a>
          <button
            onClick={handleOpenGuide}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles size={14} /> Installation & Demo Guide (Popup Box)
          </button>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-900/30 rounded-lg text-red-500"><Crosshair size={24} /></div>
            <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">+Live</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.total_documents.toLocaleString()}</h3>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Total Threats Analyzed</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><ShieldCheck size={24} /></div>
            <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">+8%</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.attacks_prevented.toLocaleString()}</h3>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Attacks Prevented</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-yellow-900/30 rounded-lg text-yellow-500"><Activity size={24} /></div>
            <span className="text-xs font-bold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">Monitoring</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.total_variants}</h3>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Active Scam Variants</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400"><Globe size={24} /></div>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.hotspot_regions}</h3>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Hotspot Regions</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400"><IndianRupee size={24} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${currencyStatus?.model_present && currencyStatus?.runtime_available ? 'text-green-400 bg-green-900/30' : 'text-yellow-300 bg-yellow-900/30'}`}>
              {currencyStatus?.model_present && currencyStatus?.runtime_available ? 'Model Ready' : 'Setup Needed'}
            </span>
          </div>
          <h3 className="text-3xl font-black text-white">{currencyStatus?.model_present ? 'ON' : 'OFF'}</h3>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Currency Shield</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-5 bg-slate-900/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><AudioLines size={24} /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${audioStatus?.folder_model_present && audioStatus?.runtime_available ? 'text-green-400 bg-green-900/30' : 'text-yellow-300 bg-yellow-900/30'}`}>
              {audioStatus?.folder_model_present && audioStatus?.runtime_available ? 'Model Ready' : 'Setup Needed'}
            </span>
          </div>
          <h3 className="text-3xl font-black text-white">{audioStatus?.folder_model_present ? 'ON' : 'OFF'}</h3>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">Audio Shield</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-panel p-6 bg-slate-900/50 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary"/> Threat Activity Timeline
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
             {trendData.length > 0 ? <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorThreats)" />
                <Area type="monotone" dataKey="blocked" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-slate-500 text-sm">No analyzed threats yet.</div>}
          </div>
        </motion.div>

        {/* Threat Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-6 bg-slate-900/50 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileWarning size={16} className="text-primary"/> Category Distribution
          </h3>
          <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
             {distributionData.length > 0 ? <ResponsiveContainer>
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: '8px' }} />
                </PieChart>
             </ResponsiveContainer> : <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No category data yet.</div>}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {distributionData.map((item, i) => (
               <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  {item.name} ({item.value}%)
               </div>
            ))}
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-panel p-6 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Activity size={16} className="text-primary"/> Threat Feed (Database)
          </h3>
          <div className="space-y-3">
             {stats.recent_threats.length > 0 ? stats.recent_threats.map(feed => (
                <div key={feed.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <div>
                         <div className="font-bold text-sm text-slate-200">{feed.title}</div>
                         <div className="text-xs text-slate-500">{feed.category} • {new Date(feed.created_at).toLocaleTimeString()}</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">Analyzed</div>
                   </div>
                </div>
             )) : <div className="text-sm text-slate-500">Waiting for live events... Submit via Analyzer.</div>}
          </div>
        </motion.div>

        {/* Live Cyber Threat Map Panel */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="glass-panel p-6 bg-slate-900/50 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Map size={16} className="text-primary"/> Regional Threat Map
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Access the interactive geospatial command visualization mapping fraud hotspots and incident distributions across India in real-time.
            </p>
          </div>
          <div className="w-full h-[150px] rounded-xl border border-slate-800/80 bg-slate-950/40 flex flex-col items-center justify-center relative overflow-hidden p-4">
             <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)',
                backgroundSize: '12px 12px'
             }}></div>
             <Map size={32} className="text-accent mb-2 animate-pulse" />
             <span className="text-slate-300 font-bold text-xs">National Cyber Threat Radar</span>
             <span className="text-accent text-[10px] font-mono font-bold mt-1 uppercase tracking-wider">{stats.hotspot_regions || 20} Active Hotspots Registered</span>
          </div>
          <Link to="/graph" className="btn btn-primary w-full mt-4 text-center justify-center text-xs" style={{ minHeight: '38px', padding: '0.5rem' }}>
            Open Interactive Threat Map
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
