import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Radio, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { SummaryCards } from './SummaryCards';
import { FilterBar } from './FilterBar';
import { MapView } from './MapView';
import { HotspotPanel } from './HotspotPanel';
import { threatAPI } from '../../services/api';
import './GeoIntelligence.css';

/**
 * GeoIntelligence - Standalone Cyber Threat Intelligence Dashboard Component.
 * Pluggable into any React application layout.
 */
export const GeoIntelligence = () => {
  const [hotspots, setHotspots] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Selection state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Live timestamp
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Hotspots & Summary Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hotspotsData, summaryData] = await Promise.all([
        threatAPI.getGeoHotspots(),
        threatAPI.getGeoSummary(),
      ]);

      setHotspots(hotspotsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('GeoIntelligence API Fetch Error:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to Geospatial API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Extract unique threat categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set(hotspots.map((h) => h.threat_category));
    return Array.from(set).sort();
  }, [hotspots]);

  // Filtered hotspots based on user selections
  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      const matchCategory =
        selectedCategory === 'ALL' || h.threat_category === selectedCategory;
      const matchLevel =
        selectedLevel === 'ALL' || h.threat_level === selectedLevel;
      const matchSearch =
        !searchQuery.trim() ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.threat_category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchLevel && matchSearch;
    });
  }, [hotspots, selectedCategory, selectedLevel, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedLevel('ALL');
    setSearchQuery('');
    setSelectedHotspot(null);
  };

  return (
    <div className="container" style={{ maxWidth: '1600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Command Center Header / Page Hero */}
      <div className="page-hero">
        <div className="flex items-center gap-3">
          <div className="brand-mark" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <Shield size={24} />
          </div>
          <div>
            <div className="eyebrow">Digital Public Safety Platform</div>
            <h2 className="page-title">National Cyber Threat Map</h2>
            <p className="page-copy">
              Live threat intelligence feeds and regional cybercrime hotspot monitoring across India.
            </p>
          </div>
        </div>
        <div className="status-pill flex items-center gap-2" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.08)' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>LIVE RADAR</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>|</span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>{currentTime}</span>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <SummaryCards summary={summary} />

      {/* Interactive Filter Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onLevelChange={setSelectedLevel}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
      />

      {/* Loading state alert */}
      {loading && !error && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fcd34d',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
        }}>
          <RefreshCw size={18} className="animate-spin" />
          <span>Connecting to backend server, fetching national cybercrime data...</span>
        </div>
      )}

      {/* Error state alert */}
      {error && (
        <div style={{
          background: 'rgba(255, 51, 102, 0.15)',
          border: '1px solid #ff3366',
          color: '#ff3366',
          padding: '0.8rem 1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}. Please verify the FastAPI backend server is running on port 8000.</span>
        </div>
      )}

      {/* Main Dashboard Grid: Map + Right Panel */}
      <main className="geo-main-grid">
        <MapView
          hotspots={filteredHotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={setSelectedHotspot}
        />

        <HotspotPanel
          hotspots={filteredHotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={setSelectedHotspot}
        />
      </main>
    </div>
  );
};

export default GeoIntelligence;
