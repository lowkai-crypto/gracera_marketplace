from fastapi import APIRouter, Depends, HTTPException

from extraction import extract_website
from internal_auth import require_internal_secret
from models import ExtractWebsiteRequest, ExtractWebsiteResponse
from url_safety import UnsafeUrlError

router = APIRouter(prefix="/extract", tags=["extract"], dependencies=[Depends(require_internal_secret)])


@router.post("/website", response_model=ExtractWebsiteResponse)
async def website(request: ExtractWebsiteRequest) -> ExtractWebsiteResponse:
    try:
        fields, warnings = await extract_website(request.url)
    except UnsafeUrlError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ExtractWebsiteResponse(source_url=request.url, fields=fields, warnings=warnings)
