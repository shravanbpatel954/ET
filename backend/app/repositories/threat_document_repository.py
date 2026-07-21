"""Threat document persistence repository."""

from uuid import UUID

from app.database.models.threat import DocumentMetadata, ThreatDocumentModel
from app.interfaces.repository import IThreatDocumentRepository
from app.models.enums import DocumentStatus, SourceType
from app.models.threat_document import ThreatDocument
from app.utils.mappers import domain_to_orm, orm_to_domain


class ThreatDocumentRepository(IThreatDocumentRepository):
    """Beanie MongoDB repository for ThreatDocument entities."""

    def __init__(self, session=None) -> None:
        # We don't need the session for MongoDB Beanie Odm, but we keep signature compatible
        pass

    async def create(self, document: ThreatDocument) -> ThreatDocument:
        model = domain_to_orm(document)
        # Convert metadata dict to embedded documents
        model.document_metadata = [
            DocumentMetadata(key=k, value=v) for k, v in document.metadata.items()
        ]
        await model.insert()
        return orm_to_domain(model)

    async def get_by_id(self, document_id: UUID) -> ThreatDocument | None:
        model = await ThreatDocumentModel.find_one(ThreatDocumentModel.id == document_id)
        return orm_to_domain(model) if model else None

    async def list_documents(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
        source_type: SourceType | None = None,
        status: DocumentStatus | None = None,
    ) -> tuple[list[ThreatDocument], int]:
        
        query_params = {}
        if source_type is not None:
            query_params["source_type"] = source_type
        if status is not None:
            query_params["status"] = status
            
        find_query = ThreatDocumentModel.find(query_params)
        total = await find_query.count()
        models = await find_query.sort("-created_at").skip(offset).limit(limit).to_list()
        
        items = [orm_to_domain(model) for model in models]
        return items, total

    async def delete(self, document_id: UUID) -> bool:
        model = await ThreatDocumentModel.find_one(ThreatDocumentModel.id == document_id)
        if model:
            await model.delete()
            return True
        return False

    async def update(self, document: ThreatDocument) -> ThreatDocument:
        model = await ThreatDocumentModel.find_one(ThreatDocumentModel.id == document.id)
        if not model:
            raise ValueError(f"Document {document.id} not found for update")
            
        model.title = document.title
        model.content = document.content
        model.summary = document.summary
        model.source = document.source
        model.source_type = document.source_type
        model.language = document.language
        model.country = document.country
        model.category = document.category
        model.publish_date = document.publish_date
        model.extra_metadata = document.metadata
        model.status = document.status
        model.processing_stage = document.processing_stage
        
        await model.save()
        return orm_to_domain(model)
