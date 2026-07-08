from fastapi import Header, HTTPException

from config import settings


async def require_internal_secret(x_internal_secret: str | None = Header(default=None)) -> None:
    """Gates routes meant to be called only by apps/web's server-side proxy,
    not directly from the internet — this endpoint costs a real Claude call
    plus an outbound fetch per request.

    If AI_SERVICE_SECRET isn't configured (e.g. local dev), the check is
    skipped rather than locking the service out of itself; it must be set
    in any environment reachable from the internet.
    """
    if not settings.ai_service_secret:
        return
    if x_internal_secret != settings.ai_service_secret:
        raise HTTPException(status_code=401, detail="Missing or invalid internal secret")
