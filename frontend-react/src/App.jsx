import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Network, BrainCircuit, ShieldAlert, Server, IndianRupee, AudioLines } from 'lucide-react';
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
  { path: '/',               label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/analyze',        label: 'Analyzer',       icon: ShieldAlert },
  { path: '/currency',       label: 'Currency',       icon: IndianRupee },
  { path: '/audio',          label: 'Audio',          icon: AudioLines },
  { path: '/graph',          label: 'National Cybercrime Map', icon: Network },
  { path: '/scam-intel',     label: 'Scam Intel',     icon: BrainCircuit },
  { path: '/law-enforcement',label: 'Law Enforcement',icon: ShieldCheck },
  { path: '/status',         label: 'Status',         icon: Server },
];

function Layout({ children, onOpenExtension }) {
  const location = useLocation();

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    return (
      <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
        <Icon size={15} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          {/* Brand */}
          <Link to="/" className="brand">
            <div className="brand-mark">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="brand-title">Sentinel<span className="text-primary">AI</span></div>
              <div className="brand-subtitle">Digital Safety Command</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {NAV_ITEMS.map(renderNavItem)}
          </nav>
        </div>
      </header>

      {/* Mobile Navigation */}
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
          <Route path="/"                element={<Dashboard onOpenExtension={() => setIsExtensionOpen(true)} />} />
          <Route path="/analyze"         element={<ThreatAnalyzer />} />
          <Route path="/currency"        element={<CurrencyShield />} />
          <Route path="/audio"           element={<AudioShield />} />
          <Route path="/graph"           element={<GeoIntelligence />} />
          <Route path="/scam-intel"      element={<ScamIntelligence />} />
          <Route path="/law-enforcement" element={<LawEnforcement />} />
          <Route path="/status"          element={<SystemStatus />} />
        </Routes>
      </Layout>
      <ExtensionModal isOpen={isExtensionOpen} onClose={() => setIsExtensionOpen(false)} />
    </Router>
  );
}
