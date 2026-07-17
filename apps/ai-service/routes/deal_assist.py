from fastapi import APIRouter, Depends, HTTPException

from deal_assist import draft_deal_message, translate_deal_message
from internal_auth import require_internal_secret
from models import DealMessageAssistRequest, DealMessageAssistResponse

router = APIRouter(prefix="/assist", tags=["assist"], dependencies=[Depends(require_internal_secret)])


@router.post("/deal-message", response_model=DealMessageAssistResponse)
async def deal_message(request: DealMessageAssistRequest) -> DealMessageAssistResponse:
    try:
        if request.mode == "draft":
            draft = await draft_deal_message(
                request.intent or "",
                request.counterpart_context,
                request.match_summary,
                request.recent_messages,
                request.target_language,
            )
        else:
            draft = await translate_deal_message(request.text or "", request.target_language or "English")
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return DealMessageAssistResponse(draft=draft)
