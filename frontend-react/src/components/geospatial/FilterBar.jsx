import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';

/**
 * FilterBar component for filtering map markers and hotspots.
 */
export const FilterBar = ({
  categories,
  selectedCategory,
  selectedLevel,
  searchQuery,
  onCategoryChange,
  onLevelChange,
  onSearchChange,
  onReset
}) => {
  return (
    <div className="geo-filter-bar">
      <div className="geo-filter-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>
          <Filter size={16} color="#00f2fe" />
          <span>INTELLIGENCE FILTERS:</span>
        </div>

        {/* Threat Level Filter */}
        <select
          className="geo-filter-select"
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
        >
          <option value="ALL">Risk Level: ALL</option>
          <option value="HIGH">Risk Level: HIGH (Red)</option>
          <option value="MEDIUM">Risk Level: MEDIUM (Orange)</option>
          <option value="LOW">Risk Level: LOW (Green)</option>
        </select>

        {/* Category Filter */}
        <select
          className="geo-filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="ALL">Threat Category: ALL</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="geo-filter-group">
        {/* Search City */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', color: '#64748b' }} />
          <input
            type="text"
            className="geo-filter-input"
            style={{ paddingLeft: '2rem', width: '180px' }}
            placeholder="Search City..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Reset Button */}
        <button className="geo-btn" onClick={onReset} title="Reset all filters">
          <RotateCcw size={14} />
          Reset Filters
        </button>
      </div>
    </div>
  );
};
