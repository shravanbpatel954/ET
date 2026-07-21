"""Manager for LLM prompt templates used in Threat Intelligence extraction."""

import json

class PromptManager:
    """Manages system and user prompts for Gemini."""

    @staticmethod
    def get_system_prompt() -> str:
        """Returns the system instruction for the LLM."""
        return (
            "You are a Senior AI Engineer specializing in Cyber Threat Intelligence Extraction. "
            "Your task is to analyze threat documents and extract specific structured intelligence. "
            "For websites, do not classify as Safe from visible text alone. Inspect domain spelling, typo-squatting, brand impersonation, page title, description, canonical URL, forms, password fields, links, scripts, and extracted entities. "
            "Examples: amazon.com can be legitimate, but amazan.com, amaz0n-login, amazon-verify, or similar lookalikes should be treated as phishing or brand impersonation unless strong evidence proves otherwise. "
            "If the provided document, URL, or text is genuinely benign after these checks, classify it as Safe. "
            "In that case, set 'scam_name' and 'scam_category' to 'Safe', 'confidence' to 0.0, 'urgency_level' to 'Low', and leave threat-specific fields empty. "
            "You MUST output valid JSON only. Do NOT include markdown blocks, explanations, or any text outside of the JSON structure. "
            "Follow the provided schema strictly. If information is missing, leave the field null or empty as per the schema."
        )

    @staticmethod
    def get_user_prompt(document_text: str, document_features: dict) -> str:
        """Constructs the user prompt containing the document and its features."""
        features_json = json.dumps(document_features, indent=2)
        return f"""
Please extract threat intelligence from the following document and its associated website/security features.

--- DOCUMENT ---
{document_text}

--- FEATURES ---
{features_json}
"""

    @staticmethod
    def get_response_schema() -> dict:
        """Returns the JSON schema expected from the model."""
        return {
            "type": "OBJECT",
            "properties": {
                "scam_name": {"type": "STRING", "description": "Specific name of the scam, if any."},
                "scam_category": {"type": "STRING", "description": "Category of the scam (e.g. Phishing)."},
                "scam_summary": {"type": "STRING", "description": "Brief summary of how it operates."},
                "threat_actor": {"type": "STRING", "description": "Suspected or known actor."},
                "impersonated_authority": {"type": "STRING", "description": "Who they pretend to be."},
                "victim_type": {"type": "STRING", "description": "Demographic targeted."},
                "attack_channel": {"type": "STRING", "description": "How the attack was delivered."},
                "communication_mode": {"type": "STRING", "description": "Email, SMS, Call, etc."},
                "payment_method": {"type": "STRING", "description": "Requested payment method."},
                "money_flow": {"type": "STRING", "description": "How the money moves."},
                "technologies_used": {"type": "ARRAY", "items": {"type": "STRING"}},
                "psychological_tactics": {"type": "ARRAY", "items": {"type": "STRING"}},
                "urgency_level": {"type": "STRING", "description": "High, Medium, Low."},
                "estimated_loss_type": {"type": "STRING", "description": "E.g., Financial, Data."},
                "target_sector": {"type": "STRING", "description": "Sector targeted."},
                "attack_steps": {"type": "ARRAY", "items": {"type": "STRING"}},
                "prevention_steps": {"type": "ARRAY", "items": {"type": "STRING"}},
                "confidence": {"type": "NUMBER", "description": "0.0 to 1.0 confidence score."},
                "extracted_entities": {
                    "type": "OBJECT",
                    "description": "Categorized entities like IPs, URLs, Crypto Wallets, etc. Values are lists of strings."
                }
            }
        }
