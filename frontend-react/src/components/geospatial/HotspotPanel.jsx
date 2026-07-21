import React from 'react';
import { Flame, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

/**
 * Right Side Panel displaying Top Cyber Crime Hotspots sorted by incident count.
 */
export const HotspotPanel = ({ hotspots, selectedHotspot, onSelectHotspot }) => {
  return (
    <div className="geo-panel-container">
      {/* Panel Header */}
      <div className="geo-panel-header">
        <div className="geo-panel-title">
          <Flame size={18} color="#ff3366" />
          Top Cyber Hotspots
        </div>
        <div className="geo-panel-count">
          {hotspots.length} Active
        </div>
      </div>

      {/* Ranked Feed List */}
      <div className="geo-panel-list">
        {hotspots.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 1rem', fontSize: '0.82rem' }}>
            No hotspots matching selected criteria.
          </div>
        ) : (
          hotspots.map((h, idx) => {
            const isSelected = selectedHotspot?.id === h.id;
            const isTrendUp = h.trend_percentage >= 0;

            return (
              <div
                key={h.id}
                className={`geo-panel-item ${isSelected ? 'geo-panel-item-active' : ''}`}
                onClick={() => onSelectHotspot(h)}
              >
                {/* Top Row: City & Incidents */}
                <div className="geo-item-top-row">
                  <div className="geo-item-city">
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                      #{idx + 1}
                    </span>
                    {h.threat_level === 'HIGH' && <span style={{ color: '#ff3366' }}>🔥</span>}
                    {h.city}
                  </div>
                  <div className="geo-item-incidents">
                    {h.incident_count} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Incidents</span>
                  </div>
                </div>

                {/* Meta Row: Threat Category & Trend */}
                <div className="geo-item-meta-row">
                  <span className="geo-item-category">
                    {h.threat_category}
                  </span>

                  <span className={isTrendUp ? 'geo-item-trend-up' : 'geo-item-trend-down'}>
                    {isTrendUp ? <TrendingUp size={12} style={{ display: 'inline', marginRight: '2px' }} /> : <TrendingDown size={12} style={{ display: 'inline', marginRight: '2px' }} />}
                    {isTrendUp ? `+${h.trend_percentage}%` : `${h.trend_percentage}%`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
