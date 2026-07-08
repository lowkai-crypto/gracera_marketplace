from fastapi import APIRouter, Depends, HTTPException

from internal_auth import require_internal_secret
from matching import compose_final_score, parse_dimensions, quality_label, score_match
from models import MatchScoreRequest, MatchScoreResponse

router = APIRouter(prefix="/match", tags=["match"], dependencies=[Depends(require_internal_secret)])


@router.post("/score", response_model=MatchScoreResponse)
async def score(request: MatchScoreRequest) -> MatchScoreResponse:
    try:
        raw = await score_match(request.supplier, request.buyer, request.language)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    semantic_score = raw.get("overall_score")
    if not isinstance(semantic_score, (int, float)):
        raise HTTPException(status_code=502, detail="Claude response missing overall_score")

    final_score, bonuses_applied = compose_final_score(semantic_score, request.bonuses)

    return MatchScoreResponse(
        semantic_score=semantic_score,
        final_score=final_score,
        quality=quality_label(final_score),
        dimensions=parse_dimensions(raw),
        summary=raw.get("summary", ""),
        bonuses_applied=bonuses_applied,
    )
