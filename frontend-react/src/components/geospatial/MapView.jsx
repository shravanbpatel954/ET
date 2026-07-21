import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS directly so Vite bundles it locally without CDN dependency
import { MapPin, Layers, RefreshCcw } from 'lucide-react';

// Center of India coordinates
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

/**
 * Helper component to pan and zoom map dynamically when a hotspot is selected.
 */
function MapFlyTo({ selectedHotspot }) {
  const map = useMap();

  useEffect(() => {
    if (selectedHotspot && selectedHotspot.latitude && selectedHotspot.longitude) {
      map.flyTo(
        [selectedHotspot.latitude, selectedHotspot.longitude],
        9,
        { duration: 1.2, animate: true }
      );
    }
  }, [selectedHotspot, map]);

  return null;
}

/**
 * Forces Leaflet to invalidate container size on mount to ensure all tile grids load completely.
 */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

/**
 * Reset Map View to default India Center
 */
function ResetViewControl() {
  const map = useMap();
  return (
    <button
      className="geo-map-btn-reset"
      onClick={() => map.flyTo(INDIA_CENTER, DEFAULT_ZOOM, { duration: 1 })}
      title="Reset Map View to India Center"
    >
      <RefreshCcw size={14} />
      <span>Reset Center</span>
    </button>
  );
}

/**
 * Create high-visibility, crisp, color-coded marker pins with sharp contrast badges.
 */
const createHighVisMarkerIcon = (threatLevel, incidentCount) => {
  const levelClass = threatLevel ? threatLevel.toLowerCase() : 'low';
  
  const htmlStr = `
    <div class="vis-marker-wrapper vis-marker-${levelClass}">
      <div class="vis-marker-pin vis-marker-pin-${levelClass}">
        <span class="vis-marker-count">${incidentCount}</span>
      </div>
      <div class="vis-marker-pulse vis-marker-pulse-${levelClass}"></div>
    </div>
  `;

  return L.divIcon({
    html: htmlStr,
    className: 'custom-leaflet-vis-icon',
    iconSize: [36, 46],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
};

export const MapView = ({ hotspots, selectedHotspot, onSelectHotspot }) => {
  const [showHeatRings, setShowHeatRings] = useState(true);
  const [mapTileType, setMapTileType] = useState('osm'); // Default to standard reliable OpenStreetMap

  return (
    <div className="geo-map-container">
      {/* Map Header Overlay */}
      <div className="geo-map-header">
        <div className="geo-map-header-left">
          <MapPin size={18} color="#00f2fe" />
          <span className="geo-header-title-text">NATIONAL CYBER THREAT MAP</span>
          <span className="geo-header-subtag">HIGH VISIBILITY</span>
        </div>

        <div className="geo-map-controls">
          {/* Map Style Selector */}
          <select
            className="geo-filter-select-sm"
            value={mapTileType}
            onChange={(e) => setMapTileType(e.target.value)}
            title="Change Map Tile Style"
          >
            <option value="osm">Map: OpenStreetMap (Standard)</option>
            <option value="voyager">Map: Carto Voyager (Clean)</option>
          </select>

          {/* Toggle Heat Rings */}
          <button
            className={`geo-btn-sm ${showHeatRings ? 'geo-btn-active' : ''}`}
            onClick={() => setShowHeatRings(!showHeatRings)}
            title="Toggle Volumetric Risk Rings"
          >
            <Layers size={13} />
            <span>{showHeatRings ? 'Rings ON' : 'Rings OFF'}</span>
          </button>
        </div>
      </div>

      {/* Clean, Full-Visibility Map Canvas */}
      <div className="geo-map-wrapper-flat">
        <MapContainer
          center={INDIA_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="geo-leaflet-map-flat"
          style={{ width: '100%', height: '540px', minHeight: '480px' }}
        >
          {/* Ensure complete map tile grid loading */}
          <MapResizeHandler />

          {/* Map Tile Layer */}
          {mapTileType === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              subdomains={['a', 'b', 'c']}
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains={['a', 'b', 'c', 'd']}
              maxZoom={19}
            />
          )}

          {/* Dynamic Fly-To Controller */}
          <MapFlyTo selectedHotspot={selectedHotspot} />

          {/* Map Reset View Controller */}
          <div className="leaflet-top leaflet-right" style={{ marginTop: '50px', marginRight: '10px', pointerEvents: 'auto' }}>
            <ResetViewControl />
          </div>

          {/* Risk Circles under markers */}
          {showHeatRings && hotspots.map((hotspot) => {
            const isHigh = hotspot.threat_level === 'HIGH';
            const isMed = hotspot.threat_level === 'MEDIUM';
            const color = isHigh ? '#dc2626' : isMed ? '#ea580c' : '#16a34a';
            const radius = Math.max(14, Math.min(40, hotspot.incident_count * 0.85));

            return (
              <CircleMarker
                key={`ring-${hotspot.id}`}
                center={[hotspot.latitude, hotspot.longitude]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.22,
                  weight: 2,
                }}
              />
            );
          })}

          {/* High-Visibility Markers */}
          {hotspots.map((hotspot) => {
            const icon = createHighVisMarkerIcon(hotspot.threat_level, hotspot.incident_count);
            const isHigh = hotspot.threat_level === 'HIGH';
            const isMed = hotspot.threat_level === 'MEDIUM';

            return (
              <Marker
                key={hotspot.id}
                position={[hotspot.latitude, hotspot.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectHotspot(hotspot),
                }}
              >
                {/* High-Contrast Readability Popup */}
                <Popup className="geo-vis-popup">
                  <div className="geo-vis-popup-container">
                    <div className="geo-vis-popup-header">
                      <div>
                        <div className="geo-vis-popup-city">{hotspot.city}</div>
                        <div className="geo-vis-popup-state">{hotspot.state}</div>
                      </div>
                      <span className={`geo-vis-badge ${isHigh ? 'geo-vis-badge-high' : isMed ? 'geo-vis-badge-medium' : 'geo-vis-badge-low'}`}>
                        {hotspot.threat_level} RISK
                      </span>
                    </div>

                    <div className="geo-vis-popup-body">
                      <div className="geo-vis-popup-row">
                        <span className="geo-vis-label">Category:</span>
                        <span className="geo-vis-val-category">
                          {hotspot.threat_category}
                        </span>
                      </div>

                      <div className="geo-vis-popup-row">
                        <span className="geo-vis-label">Incidents:</span>
                        <span className="geo-vis-val-count">
                          {hotspot.incident_count} Reported Cases
                        </span>
                      </div>

                      <div className="geo-vis-popup-row">
                        <span className="geo-vis-label">Trend:</span>
                        <span className={`geo-vis-val-trend ${hotspot.trend_percentage >= 0 ? 'trend-up' : 'trend-down'}`}>
                          {hotspot.trend_percentage >= 0 ? `▲ +${hotspot.trend_percentage}%` : `▼ ${hotspot.trend_percentage}%`}
                        </span>
                      </div>

                      <div className="geo-vis-popup-desc">
                        {hotspot.description}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Clean Map Legend Overlay */}
        <div className="geo-map-legend-clean">
          <div className="geo-legend-title">Risk Level Legend</div>
          <div className="geo-legend-item">
            <span className="geo-legend-dot dot-high"></span>
            <span>HIGH RISK (Red)</span>
          </div>
          <div className="geo-legend-item">
            <span className="geo-legend-dot dot-med"></span>
            <span>MEDIUM RISK (Orange)</span>
          </div>
          <div className="geo-legend-item">
            <span className="geo-legend-dot dot-low"></span>
            <span>LOW RISK (Green)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
