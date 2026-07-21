"""Processing log persistence repository for Beanie MongoDB."""

from uuid import UUID

from app.database.models.threat import ThreatDocumentModel, ProcessingLog
from app.interfaces.repository import IProcessingLogRepository
from app.models.enums import ProcessingLogStatus, ProcessingStage


class ProcessingLogRepository(IProcessingLogRepository):
    """Beanie repository for pipeline audit logs."""

    def __init__(self, session=None) -> None:
        self._session = session

    async def log_stage(
        self,
        document_id: UUID,
        stage: str,
        status: str,
        message: str,
        details: dict | None = None,
    ) -> None:
        model = await ThreatDocumentModel.find_one(ThreatDocumentModel.id == document_id)
        if model:
            log_entry = ProcessingLog(
                stage=ProcessingStage(stage),
                status=status,
                message=message,
                details=details or {},
            )
            model.processing_logs.append(log_entry)
            await model.save()
