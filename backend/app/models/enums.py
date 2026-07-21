"""Domain enumerations for the Threat Intelligence Core."""

from enum import StrEnum


class SourceType(StrEnum):
    """Origin classification for ingested threat material."""

    # MVP sources
    NEWS_ARTICLE_URL = "news_article_url"
    PDF_ADVISORY = "pdf_advisory"
    CITIZEN_COMPLAINT = "citizen_complaint"
    POLICE_REPORT = "police_report"
    SCREENSHOT = "screenshot"
    RAW_TEXT = "raw_text"

    # Future-ready sources
    AUDIO_TRANSCRIPT = "audio_transcript"
    VOICE_CALL = "voice_call"
    WHATSAPP_EXPORT = "whatsapp_export"
    EMAIL = "email"
    SMS = "sms"
    API_INTEGRATION = "api_integration"


class DocumentStatus(StrEnum):
    """Lifecycle status of a threat document."""

    RECEIVED = "received"
    PROCESSING = "processing"
    STORED = "stored"
    FAILED = "failed"
    ARCHIVED = "archived"


class ProcessingStage(StrEnum):
    """Pipeline stage tracking for threat document ingestion."""

    VALIDATION = "validation"
    NORMALIZATION = "normalization"
    TEXT_EXTRACTION = "text_extraction"
    METADATA_EXTRACTION = "metadata_extraction"
    COMPLETE = "complete"


class ProcessingLogStatus(StrEnum):
    """Outcome status for a pipeline stage execution."""

    STARTED = "started"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class ThreatCategory(StrEnum):
    """High-level threat classification."""

    UNKNOWN = "unknown"
    PHISHING = "phishing"
    INVESTMENT_FRAUD = "investment_fraud"
    IMPERSONATION = "impersonation"
    LOTTERY_SCAM = "lottery_scam"
    LOAN_FRAUD = "loan_fraud"
    JOB_SCAM = "job_scam"
    TECH_SUPPORT = "tech_support"
    ROMANCE_SCAM = "romance_scam"
    UPI_FRAUD = "upi_fraud"
    OTHER = "other"


class TrustLevel(StrEnum):
    """Trust classification for registered intelligence sources."""

    UNKNOWN = "unknown"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    OFFICIAL = "official"
