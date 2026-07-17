from fastapi import APIRouter, Depends, HTTPException

from internal_auth import require_internal_secret
from models import VerificationTriageRequest, VerificationTriageResponse
from verification_triage import triage_verification

router = APIRouter(prefix="/assist", tags=["assist"], dependencies=[Depends(require_internal_secret)])


@router.post("/verification-triage", response_model=VerificationTriageResponse)
async def verification_triage(request: VerificationTriageRequest) -> VerificationTriageResponse:
    try:
        flags, overall_assessment = await triage_verification(request.profile)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return VerificationTriageResponse(flags=flags, overall_assessment=overall_assessment)
