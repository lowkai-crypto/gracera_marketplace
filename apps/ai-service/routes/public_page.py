from fastapi import APIRouter, Depends, HTTPException

from internal_auth import require_internal_secret
from models import GeneratePublicPageRequest, GeneratePublicPageResponse
from public_page import generate_public_page

router = APIRouter(prefix="/assist", tags=["assist"], dependencies=[Depends(require_internal_secret)])


@router.post("/generate-public-page", response_model=GeneratePublicPageResponse)
async def generate_public_page_route(request: GeneratePublicPageRequest) -> GeneratePublicPageResponse:
    try:
        return await generate_public_page(request.supplier_profile, request.product_lines)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
