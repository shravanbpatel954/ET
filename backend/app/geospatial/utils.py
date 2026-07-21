"""
Geospatial Intelligence Utility Helpers
----------------------------------------
Utility functions for scoring, color mapping, and data formatting.
"""

from typing import Dict


THREAT_COLOR_MAP: Dict[str, str] = {
    "HIGH": "#ff3366",      # Bright Red
    "MEDIUM": "#ff9900",    # Neon Amber / Orange
    "LOW": "#00e676",       # Bright Emerald Green
}


def get_threat_color(threat_level: str) -> str:
    """Return hex color code associated with threat level."""
    return THREAT_COLOR_MAP.get(threat_level.upper(), "#9e9e9e")


def format_trend_label(trend_percentage: float) -> str:
    """Format trend float into display string with sign."""
    if trend_percentage > 0:
        return f"+{trend_percentage:.1f}%"
    return f"{trend_percentage:.1f}%"
