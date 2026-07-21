import React from 'react';
import { MapPin, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

/**
 * Top Summary Metric Cards for Cyber Command Dashboard
 */
export const SummaryCards = ({ summary }) => {
  const {
    total_hotspots = 0,
    high_risk_locations = 0,
    most_common_scam = 'N/A',
    total_demo_incidents = 0,
  } = summary || {};

  return (
    <div className="geo-summary-cards-grid">
      {/* Total Hotspots Card */}
      <div className="geo-card">
        <div>
          <div className="geo-card-label">Total Hotspots</div>
          <div className="geo-card-value">{total_hotspots}</div>
          <div className="geo-card-subtext">Monitored Indian Cities</div>
        </div>
        <div className="geo-card-icon-wrapper">
          <MapPin size={24} />
        </div>
      </div>

      {/* High Risk Cities Card */}
      <div className="geo-card geo-card-high-risk">
        <div>
          <div className="geo-card-label">High Risk Cities</div>
          <div className="geo-card-value">{high_risk_locations}</div>
          <div className="geo-card-subtext">Critical Threat Level</div>
        </div>
        <div className="geo-card-icon-wrapper">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* Most Common Scam Card */}
      <div className="geo-card geo-card-scam">
        <div>
          <div className="geo-card-label">Most Common Scam</div>
          <div className="geo-card-value" style={{ fontSize: '1.25rem' }}>
            {most_common_scam}
          </div>
          <div className="geo-card-subtext">Highest Frequency Category</div>
        </div>
        <div className="geo-card-icon-wrapper">
          <ShieldAlert size={24} />
        </div>
      </div>

      {/* Total Incidents Card */}
      <div className="geo-card geo-card-incidents">
        <div>
          <div className="geo-card-label">Total Incidents</div>
          <div className="geo-card-value">{total_demo_incidents}</div>
          <div className="geo-card-subtext">Aggregated Threat Reports</div>
        </div>
        <div className="geo-card-icon-wrapper">
          <Activity size={24} />
        </div>
      </div>
    </div>
  );
};
