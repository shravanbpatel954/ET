"""Audio authenticity and safety endpoints."""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.model.audio_deepfake_detector import (
    AudioModelNotReadyError,
    audio_deepfake_detector,
)

router = APIRouter(prefix="/audio")


@router.get("/status")
async def audio_status():
    """Return local audio model and runtime status."""
    return audio_deepfake_detector.status()


@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """Analyze uploaded or recorded audio using the local Transformers model."""
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Upload a valid audio file.")

    audio_bytes = await file.read()
    try:
        return audio_deepfake_detector.analyze(audio_bytes, filename=file.filename)
    except AudioModelNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

