"""
Geospatial Intelligence Demo Data Layer
---------------------------------------
Contains realistic cybercrime dataset for ~20 Indian cities.
Implements DemoHotspotRepository concrete class adhering to AbstractHotspotRepository.
"""

from typing import List, Optional
from app.geospatial.models import AbstractHotspotRepository, HotspotDomain


# Structured Demo Dataset representing Cybercrime Hotspots across India
DEMO_HOTSPOTS_DATA: List[HotspotDomain] = [
    HotspotDomain(
        id="geo-delhi-01",
        city="New Delhi",
        state="Delhi",
        latitude=28.6139,
        longitude=77.2090,
        threat_category="Digital Arrest",
        threat_level="HIGH",
        incident_count=34,
        trend_percentage=18.5,
        description="Spike in organized syndicates posing as CBI/Customs officials enforcing illegal video call digital arrests."
    ),
    HotspotDomain(
        id="geo-jamtara-02",
        city="Jamtara",
        state="Jharkhand",
        latitude=23.9626,
        longitude=86.8021,
        threat_category="OTP Fraud",
        threat_level="HIGH",
        incident_count=42,
        trend_percentage=28.4,
        description="High concentration of caller spoofing centers executing SIM swap and Vishing OTP harvesting operations."
    ),
    HotspotDomain(
        id="geo-mewat-03",
        city="Nuh (Mewat)",
        state="Haryana",
        latitude=28.1022,
        longitude=77.0135,
        threat_category="QR Scam",
        threat_level="HIGH",
        incident_count=38,
        trend_percentage=25.0,
        description="Hub for fraudulent OLX marketplace listings paired with malicious UPI QR code payment links."
    ),
    HotspotDomain(
        id="geo-bengaluru-04",
        city="Bengaluru",
        state="Karnataka",
        latitude=12.9716,
        longitude=77.5946,
        threat_category="AI Voice Scam",
        threat_level="HIGH",
        incident_count=31,
        trend_percentage=22.0,
        description="Sophisticated AI deepfake audio cloning impersonating family members requesting urgent distress funds."
    ),
    HotspotDomain(
        id="geo-kolkata-05",
        city="Kolkata",
        state="West Bengal",
        latitude=22.5726,
        longitude=88.3639,
        threat_category="Counterfeit Currency",
        threat_level="HIGH",
        incident_count=29,
        trend_percentage=9.8,
        description="Cross-border fake Indian currency note (FICN) circulation networks detected in commercial hubs."
    ),
    HotspotDomain(
        id="geo-mumbai-06",
        city="Mumbai",
        state="Maharashtra",
        latitude=19.0760,
        longitude=72.8777,
        threat_category="Investment Scam",
        threat_level="HIGH",
        incident_count=27,
        trend_percentage=12.3,
        description="Fraudulent trading applications promising high stock/crypto yields targeting retail investors."
    ),
    HotspotDomain(
        id="geo-hyderabad-07",
        city="Hyderabad",
        state="Telangana",
        latitude=17.3850,
        longitude=78.4867,
        threat_category="Fake Loan App",
        threat_level="HIGH",
        incident_count=24,
        trend_percentage=14.1,
        description="Predatory illegal micro-lending apps harvesting contact lists for extortion and harassment."
    ),
    HotspotDomain(
        id="geo-jaipur-08",
        city="Jaipur",
        state="Rajasthan",
        latitude=26.9124,
        longitude=75.7873,
        threat_category="UPI Fraud",
        threat_level="MEDIUM",
        incident_count=22,
        trend_percentage=11.0,
        description="Phishing schemes luring victims to enter PINs on collect-request notifications."
    ),
    HotspotDomain(
        id="geo-patna-09",
        city="Patna",
        state="Bihar",
        latitude=25.5941,
        longitude=85.1376,
        threat_category="KYC Scam",
        threat_level="MEDIUM",
        incident_count=21,
        trend_percentage=15.2,
        description="Fake bank SMS alerts warning of account suspension due to pending Aadhaar/PAN KYC updates."
    ),
    HotspotDomain(
        id="geo-ahmedabad-10",
        city="Ahmedabad",
        state="Gujarat",
        latitude=23.0225,
        longitude=72.5714,
        threat_category="Courier Scam",
        threat_level="MEDIUM",
        incident_count=19,
        trend_percentage=7.5,
        description="Fake FedEx/Customs parcel alerts demanding clearance fees for illegal contraband packages."
    ),
    HotspotDomain(
        id="geo-pune-11",
        city="Pune",
        state="Maharashtra",
        latitude=18.5204,
        longitude=73.8567,
        threat_category="Job Scam",
        threat_level="MEDIUM",
        incident_count=18,
        trend_percentage=-3.2,
        description="Work-from-home Telegram task rating scams asking victims to prepay for commission tasks."
    ),
    HotspotDomain(
        id="geo-lucknow-12",
        city="Lucknow",
        state="Uttar Pradesh",
        latitude=26.8467,
        longitude=80.9462,
        threat_category="Digital Arrest",
        threat_level="MEDIUM",
        incident_count=17,
        trend_percentage=8.1,
        description="Impersonation of telecom department officials threatening SIM disconnection within 2 hours."
    ),
    HotspotDomain(
        id="geo-surat-13",
        city="Surat",
        state="Gujarat",
        latitude=21.1702,
        longitude=72.8311,
        threat_category="Investment Scam",
        threat_level="MEDIUM",
        incident_count=16,
        trend_percentage=4.8,
        description="Fake WhatsApp VIP trading group schemes offering pre-IPO insider stock allocations."
    ),
    HotspotDomain(
        id="geo-ranchi-14",
        city="Ranchi",
        state="Jharkhand",
        latitude=23.3441,
        longitude=85.3096,
        threat_category="OTP Fraud",
        threat_level="MEDIUM",
        incident_count=15,
        trend_percentage=6.4,
        description="Customer care number spoofing targeting e-commerce refund portal users."
    ),
    HotspotDomain(
        id="geo-chandigarh-15",
        city="Chandigarh",
        state="Chandigarh",
        latitude=30.7333,
        longitude=76.7794,
        threat_category="Job Scam",
        threat_level="LOW",
        incident_count=11,
        trend_percentage=-5.0,
        description="Overseas visa processing and job offer fraud targeting students."
    ),
    HotspotDomain(
        id="geo-bhopal-16",
        city="Bhopal",
        state="Madhya Pradesh",
        latitude=23.2599,
        longitude=77.4126,
        threat_category="Fake Loan App",
        threat_level="LOW",
        incident_count=10,
        trend_percentage=2.1,
        description="Instant credit line social media advertisement fraud."
    ),
    HotspotDomain(
        id="geo-guwahati-17",
        city="Guwahati",
        state="Assam",
        latitude=26.1445,
        longitude=91.7362,
        threat_category="UPI Fraud",
        threat_level="LOW",
        incident_count=9,
        trend_percentage=-1.5,
        description="Reward point redemptions routing to fraudulent UPI links."
    ),
    HotspotDomain(
        id="geo-bhubaneswar-18",
        city="Bhubaneswar",
        state="Odisha",
        latitude=20.2961,
        longitude=85.8245,
        threat_category="QR Scam",
        threat_level="LOW",
        incident_count=8,
        trend_percentage=1.0,
        description="Public places QR code sticker replacement pointing to phishing portals."
    ),
    HotspotDomain(
        id="geo-visakhapatnam-19",
        city="Visakhapatnam",
        state="Andhra Pradesh",
        latitude=17.6868,
        longitude=83.2185,
        threat_category="Courier Scam",
        threat_level="LOW",
        incident_count=7,
        trend_percentage=-4.2,
        description="Logistics package tracking SMS phishing links."
    ),
    HotspotDomain(
        id="geo-kochi-20",
        city="Kochi",
        state="Kerala",
        latitude=9.9312,
        longitude=76.2673,
        threat_category="AI Voice Scam",
        threat_level="LOW",
        incident_count=6,
        trend_percentage=0.5,
        description="Cloned emergency voice messages targeting expatriate families."
    )
]


class DemoHotspotRepository(AbstractHotspotRepository):
    """Static In-Memory Data Repository for Demo / Phase 1."""

    def __init__(self, data: Optional[List[HotspotDomain]] = None):
        self._data = data if data is not None else DEMO_HOTSPOTS_DATA

    async def get_all_hotspots(
        self,
        category: Optional[str] = None,
        threat_level: Optional[str] = None
    ) -> List[HotspotDomain]:
        results = self._data
        if category:
            cat_clean = category.strip().lower()
            results = [h for h in results if cat_clean in h.threat_category.lower()]
        if threat_level:
            level_clean = threat_level.strip().upper()
            results = [h for h in results if h.threat_level.upper() == level_clean]
        return results

    async def get_hotspot_by_id(self, hotspot_id: str) -> Optional[HotspotDomain]:
        for h in self._data:
            if h.id == hotspot_id:
                return h
        return None
