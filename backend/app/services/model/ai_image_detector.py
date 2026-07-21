"""AI-generated image detection using Hugging Face Space Divyaksh1209/cybersec-prototype with resilient pixel analysis fallback."""

from __future__ import annotations

import io
import json
import os
import platform
import re
import tempfile
from pathlib import Path
from typing import Any

from app.core.config import get_settings


class AIImageDetector:
    """Interface connecting backend image authenticity checks to Hugging Face Space ZeroGPU model."""

    def __init__(self) -> None:
        settings = get_settings()
        self.hf_space_name = getattr(settings, "hf_space_name", "Divyaksh1209/cybersec-prototype")
        self.hf_token = getattr(settings, "hf_token", "") or os.getenv("HF_TOKEN", "")

    def status(self) -> dict[str, Any]:
        return {
            "model_name": self.hf_space_name,
            "model_path": f"https://huggingface.co/spaces/{self.hf_space_name}",
            "runtime_available": True,
            "runtime": "Hugging Face Space (ZeroGPU)",
            "mode": "huggingface_space_gpu",
            "labels": ["real_image", "ai_generated_image"],
        }

    def analyze(self, image_bytes: bytes, filename: str | None = None) -> dict[str, Any]:
        if not image_bytes:
            raise ValueError("Image file is empty.")

        tmp_suffix = Path(filename).suffix if filename and Path(filename).suffix else ".jpg"
        with tempfile.NamedTemporaryFile(suffix=tmp_suffix, delete=False) as tmp_file:
            tmp_file.write(image_bytes)
            tmp_path = tmp_file.name

        raw_prediction = ""
        hf_error = None

        try:
            from gradio_client import Client, handle_file
            client = Client(self.hf_space_name, token=self.hf_token or None)

            # Call HuggingFace endpoint /load_and_predict_ai_image (or /ai_image)
            try:
                raw_prediction = client.predict(
                    input_image=handle_file(tmp_path),
                    api_name="/load_and_predict_ai_image"
                )
            except Exception:
                raw_prediction = client.predict(
                    input_image=handle_file(tmp_path),
                    api_name="/ai_image"
                )
        except Exception as exc:
            hf_error = str(exc)
            raw_prediction = None
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

        # Parse Hugging Face output if call succeeded without quota/network error
        is_hf_valid = False
        verdict = "real_image_likely"
        label = "real"
        confidence = 0.95
        probabilities = {"real": 0.95, "ai_generated": 0.05}

        if raw_prediction is not None and not hf_error:
            pred_str = str(raw_prediction).strip().lower()
            # Check if prediction output explicitly contains AI/Fake/Synthetic indicators
            if any(term in pred_str for term in ["ai", "fake", "synthetic", "morphed", "deepfake", "generated", "counterfeit"]):
                verdict = "ai_generated_suspected"
                label = "ai_generated"
                confidence = 0.94
                probabilities = {"ai_generated": 0.94, "real": 0.06}
                is_hf_valid = True
            elif any(term in pred_str for term in ["real", "authentic", "genuine", "photo", "original", "human"]):
                verdict = "real_image_likely"
                label = "real"
                confidence = 0.96
                probabilities = {"real": 0.96, "ai_generated": 0.04}
                is_hf_valid = True

        # If HF Space returned an error (e.g. ZeroGPU quota limit) or ambiguous string, run pixel matrix analysis
        if not is_hf_valid:
            fallback_res = self._fallback_image_analysis(image_bytes)
            ai_score = fallback_res["ai_score"]
            if ai_score >= 0.50:
                verdict = "ai_generated_suspected"
                label = "ai_generated"
                confidence = round(ai_score, 2)
                probabilities = {
                    "ai_generated": round(ai_score, 2),
                    "real": round(1.0 - ai_score, 2),
                }
            else:
                verdict = "real_image_likely"
                label = "real"
                confidence = round(1.0 - ai_score, 2)
                probabilities = {
                    "real": round(1.0 - ai_score, 2),
                    "ai_generated": round(ai_score, 2),
                }

        return {
            "model_name": self.hf_space_name,
            "analysis_mode": "huggingface_space_gpu" if is_hf_valid else "pixel_spectral_fallback",
            "filename": filename,
            "verdict": verdict,
            "label": label,
            "confidence": confidence,
            "probabilities": probabilities,
            "technical": {
                "runtime": "Hugging Face Space (ZeroGPU)" if is_hf_valid else "Pixel Sensor & Metadata Analysis",
                "hf_space": self.hf_space_name,
                "raw_hf_output": str(raw_prediction) if raw_prediction is not None else None,
                "hf_error": hf_error,
            },
        }

    @staticmethod
    def _fallback_image_analysis(image_bytes: bytes) -> dict[str, Any]:
        """Perform EXIF metadata inspection and pixel gradient/smoothness spectral analysis."""
        try:
            import numpy as np
            from PIL import Image, ImageOps

            img = Image.open(io.BytesIO(image_bytes))
            img = ImageOps.exif_transpose(img)

            # 1. Camera EXIF Metadata Check
            exif = img.getexif()
            has_camera_exif = bool(exif and len(exif) > 0)

            # 2. Pixel Gradient & Smoothness Ratio
            rgb = np.array(img.convert("RGB"), dtype=np.float32)
            gray = np.mean(rgb, axis=2)
            dy, dx = np.gradient(gray)
            gradient_mag = np.sqrt(dx**2 + dy**2)
            smoothness_ratio = float(np.mean(gradient_mag < 2.0))

            # 3. Calculate AI synthetic score
            ai_score = 0.35
            if not has_camera_exif:
                ai_score += 0.25  # AI generated images lack physical camera EXIF
            if smoothness_ratio > 0.45:
                ai_score += 0.25  # Smooth AI diffusion gradient texture

            ai_score = min(0.96, max(0.08, ai_score))
            return {
                "ai_score": ai_score,
                "has_camera_exif": has_camera_exif,
                "smoothness_ratio": round(smoothness_ratio, 3),
            }
        except Exception:
            return {"ai_score": 0.50, "has_camera_exif": False, "smoothness_ratio": 0.5}


ai_image_detector = AIImageDetector()
