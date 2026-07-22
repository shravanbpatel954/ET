import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, AlertOctagon, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { threatAPI } from '../services/api';

export default function LawEnforcement() {
  const [data, setData] = useState({
    hotspots: [],
    top_authorities: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await threatAPI.getLawEnforcement();
        setData({
          hotspots: res.hotspots || [],
          top_authorities: res.top_authorities || []
        });
      } catch (err) {
        console.error("Failed to fetch law enforcement data", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div className="page-hero">
        <div>
          <div className="eyebrow">Operational intelligence</div>
          <h2 className="page-title">Law Enforcement Portal</h2>
          <p className="page-copy">Actionable intelligence for cyber crime units from analyzed records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 bg-slate-900/50">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <AlertOctagon size={16} className="text-red-500"/> Top Impersonated Authorities
           </h3>
           <ul className="space-y-3">
              {data.top_authorities.map((auth, index) => (
                <li key={index} className="flex justify-between items-center text-sm font-bold text-slate-300">
                   <span>{index + 1}. {auth.name}</span>
                   <span className={index === 0 ? "text-red-400" : index === 1 ? "text-orange-400" : "text-yellow-400"}>{auth.percentage}%</span>
                </li>
              ))}
              {data.top_authorities.length === 0 && (
                <li className="text-sm text-slate-500 flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" /> Connecting to server, fetching authorities...
                </li>
              )}
           </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 glass-panel p-6 bg-slate-900/50">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <MapPin size={16} className="text-primary"/> Fraud Hotspots (Active Clusters)
           </h3>
           <div style={{ width: '100%', height: '200px' }}>
             {data.hotspots.length > 0 ? <ResponsiveContainer>
               <BarChart data={data.hotspots} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                 <XAxis type="number" stroke="#64748b" tickLine={false} axisLine={false} />
                 <YAxis type="category" dataKey="region" stroke="#64748b" width={80} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: 'none' }} />
                 <Bar dataKey="cases" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-slate-500 text-sm"><RefreshCw size={14} className="animate-spin mr-2" /> Connecting to server, fetching hotspots...</div>}
           </div>
        </motion.div>
      </div>

      <div className="glass-panel p-6 bg-slate-900/50">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
           <Users size={16} className="text-primary"/> Connected Fraud Campaigns
         </h3>
         <div className="text-sm text-slate-500">Campaign clustering is generated through the Knowledge Graph and Evolution records after submissions or market sync runs.</div>
      </div>
    </div>
  );
}
