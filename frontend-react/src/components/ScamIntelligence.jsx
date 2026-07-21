import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, RefreshCw, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { threatAPI } from '../services/api';

export default function ScamIntelligence() {
  const [intel, setIntel] = useState({ trending_categories: [], recent_variants: [], timeline: [] });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState('');

  const fetchIntel = async () => {
    try {
      const data = await threatAPI.getScamIntel();
      setIntel(data);
    } catch (err) {
      console.error("Failed to fetch intel", err);
      setError('Could not load stored scam intelligence.');
    }
  };

  useEffect(() => {
    fetchIntel();
  }, []);

  const handleMarketSync = async () => {
    setSyncing(true);
    setError('');
    setSyncResult(null);
    try {
      const result = await threatAPI.syncMarket({ limit: 10 });
      setSyncResult(result);
      await fetchIntel();
    } catch (err) {
      console.error("Failed to sync market intelligence", err);
      setError(err.response?.data?.detail || 'Market sync failed. Check backend network access and MongoDB.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div className="page-hero">
        <div>
          <div className="eyebrow">Market evolution monitor</div>
          <h2 className="page-title">Scam Variant Intelligence</h2>
          <p className="page-copy">Deep-dive analytics into fraud evolution and behavioral fingerprints from stored records.</p>
          {syncResult && (
            <p className="text-xs text-slate-400 mt-2">
              Last sync: fetched {syncResult.fetched}, ingested {syncResult.ingested}, skipped {syncResult.skipped}, failed {syncResult.failed}.
            </p>
          )}
          {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
        </div>
        <button
          type="button"
          onClick={handleMarketSync}
          disabled={syncing}
          className="btn btn-primary"
          style={{ opacity: syncing ? 0.7 : 1 }}
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Market Intelligence'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Evolution Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary"/> Variant Evolution Timeline
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
             {intel.timeline.length > 0 ? <ResponsiveContainer>
               <AreaChart data={intel.timeline}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                 {(intel.trending_categories || []).slice(0, 3).map((category, index) => (
                   <Area key={category} type="monotone" dataKey={category} stackId="1" stroke={['#3b82f6', '#f59e0b', '#ef4444'][index]} fill={['#3b82f6', '#f59e0b', '#ef4444'][index]} fillOpacity={0.6} name={category} />
                 ))}
               </AreaChart>
             </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-slate-500 text-sm">No evolution timeline yet. Analyze content or run market sync.</div>}
          </div>
        </motion.div>

        {/* Behavior Fingerprints Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 bg-slate-900/50">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Fingerprint size={16} className="text-primary"/> Similarity Matrix
          </h3>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                   <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Fingerprint ID</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Authority</th>
                      <th className="px-4 py-3">Tech</th>
                      <th className="px-4 py-3 rounded-tr-lg">Match</th>
                   </tr>
                </thead>
                <tbody>
                   {intel.recent_variants.map((v, i) => (
                     <tr key={i} className="border-b border-slate-700/50 bg-slate-800/20">
                        <td className="px-4 py-3 font-mono text-xs text-slate-300">FP-{v.id}</td>
                        <td className="px-4 py-3 text-red-400 font-bold">{v.name || v.category}</td>
                        <td className="px-4 py-3">{v.authority}</td>
                        <td className="px-4 py-3">{v.tech}</td>
                        <td className="px-4 py-3 text-green-400 font-bold">{v.classification === 'NEW_SCAM' ? 'NOVEL' : `${v.similarity}%`}</td>
                     </tr>
                   ))}
                   {intel.recent_variants.length === 0 && (
                     <tr className="bg-slate-800/20">
                       <td className="px-4 py-6 text-slate-500 text-center" colSpan="5">No fingerprints stored yet.</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
