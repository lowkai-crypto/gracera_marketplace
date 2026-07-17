from fastapi import APIRouter, Depends, HTTPException

from coaching import coach_match
from internal_auth import require_internal_secret
from models import MatchCoachingRequest, MatchCoachingResponse

router = APIRouter(prefix="/assist", tags=["assist"], dependencies=[Depends(require_internal_secret)])


@router.post("/match-coaching", response_model=MatchCoachingResponse)
async def match_coaching(request: MatchCoachingRequest) -> MatchCoachingResponse:
    try:
        items = await coach_match(request)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return MatchCoachingResponse(items=items)
