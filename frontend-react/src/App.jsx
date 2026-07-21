import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Network, BrainCircuit, ShieldAlert, Server, IndianRupee, AudioLines, Puzzle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ThreatAnalyzer from './components/ThreatAnalyzer';
import CurrencyShield from './components/CurrencyShield';
import AudioShield from './components/AudioShield';
import GeoIntelligence from './components/geospatial';
import ScamIntelligence from './components/ScamIntelligence';
import LawEnforcement from './components/LawEnforcement';
import SystemStatus from './components/SystemStatus';
import ExtensionModal from './components/ExtensionModal';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analyze', label: 'Analyzer', icon: ShieldAlert },
  { path: '/currency', label: 'Currency', icon: IndianRupee },
  { path: '/audio', label: 'Audio', icon: AudioLines },
  { path: '/scam-intel', label: 'Scam Intel', icon: BrainCircuit },
  { path: '/law-enforcement', label: 'Law Enforcement', icon: ShieldCheck },
  { path: '/graph', label: 'Threat Map', icon: Network },
  { path: '/status', label: 'Status', icon: Server },
];

function Layout({ children, onOpenExtension }) {
  const location = useLocation();
  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    return (
      <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
        <Icon size={17} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner flex items-center justify-between">
          <Link to="/" className="brand">
            <div className="brand-mark">
              <ShieldCheck size={25} />
            </div>
            <div>
              <div className="brand-title">Sentinel<span className="text-primary">AI</span></div>
              <div className="brand-subtitle">Digital safety command</div>
            </div>
          </Link>

          {/* Mobile Extension Trigger */}
          <button
            onClick={onOpenExtension}
            className="flex md:hidden items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
          >
            <Puzzle size={14} className="text-cyan-400 animate-pulse" />
            <span>Extension</span>
          </button>

          <nav className="desktop-nav">
            {NAV_ITEMS.map(renderNavItem)}
            <button
              onClick={onOpenExtension}
              className="ml-2 hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-500/10 cursor-pointer shrink-0"
            >
              <Puzzle size={15} className="text-cyan-400 animate-pulse" />
              <span>Enable Extension</span>
            </button>
          </nav>
        </div>
      </header>
      <nav className="mobile-nav">
        {NAV_ITEMS.map(renderNavItem)}
      </nav>
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);

  return (
    <Router>
      <Layout onOpenExtension={() => setIsExtensionOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard onOpenExtension={() => setIsExtensionOpen(true)} />} />
          <Route path="/analyze" element={<ThreatAnalyzer />} />
          <Route path="/currency" element={<CurrencyShield />} />
          <Route path="/audio" element={<AudioShield />} />
          <Route path="/graph" element={<GeoIntelligence />} />
          <Route path="/scam-intel" element={<ScamIntelligence />} />
          <Route path="/law-enforcement" element={<LawEnforcement />} />
          <Route path="/status" element={<SystemStatus />} />
        </Routes>
      </Layout>
      <ExtensionModal isOpen={isExtensionOpen} onClose={() => setIsExtensionOpen(false)} />
    </Router>
  );
}
