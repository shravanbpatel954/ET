"""Currency-note verification endpoints."""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.model.currency_note_detector import (
    CurrencyModelNotReadyError,
    currency_note_detector,
)

router = APIRouter(prefix="/currency")


@router.get("/status")
async def currency_status():
    """Return local model availability and runtime status."""
    return currency_note_detector.status()


@router.post("/analyze")
async def analyze_currency_note(file: UploadFile = File(...)):
    """Analyze an uploaded Indian currency note image using the local model."""
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload a valid image file.")

    image_bytes = await file.read()
    try:
        return currency_note_detector.analyze(image_bytes, filename=file.filename)
    except CurrencyModelNotReadyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

