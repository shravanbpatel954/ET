from uuid import UUID
from pydantic import BaseModel
from typing import Dict, List, Optional

from app.schemas.documents import ThreatDocumentResponse
from app.schemas.intelligence import ThreatIntelligenceResponse
from app.schemas.fingerprint import ScamFingerprintResponse
from app.schemas.evolution import EvolutionResultResponse


class AnalyzeFullRequest(BaseModel):
    content: str
    source_type: str = "raw_text"
    source: str = "web_input"


class AnalyzeFullResponse(BaseModel):
    threat_level: str
    threat_score: int
    scam_category: str
    is_new_variant: bool
    variant_version: Optional[str] = None
    similarity_score: float
    indicators: List[str] = []
    explainability: List[Dict[str, str]] = []
    recommendations: List[str]
    evidence: dict
    
    document: ThreatDocumentResponse
    intelligence: ThreatIntelligenceResponse
    fingerprint: ScamFingerprintResponse
    evolution: EvolutionResultResponse

    ai_image_analysis: Optional[Dict] = None
