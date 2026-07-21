"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import analyze, audio, currency, documents, evolution, fingerprint, health, intelligence
from app.geospatial.api import router as geo_router

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(documents.router, tags=["Documents"])
api_v1_router.include_router(intelligence.router, prefix="/intelligence", tags=["Threat Intelligence"])
api_v1_router.include_router(fingerprint.router, prefix="/fingerprint", tags=["Scam Fingerprint"])
api_v1_router.include_router(evolution.router, prefix="/evolution", tags=["Scam Evolution"])
api_v1_router.include_router(analyze.router, tags=["Analyze"])
api_v1_router.include_router(currency.router, tags=["Currency Shield"])
api_v1_router.include_router(audio.router, tags=["Audio Shield"])
api_v1_router.include_router(geo_router, tags=["Geospatial Intelligence"])
