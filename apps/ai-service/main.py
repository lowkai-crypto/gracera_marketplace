import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from browser_fetch import get_browser, shutdown_browser
from config import settings
from routes.coaching import router as coaching_router
from routes.deal_assist import router as deal_assist_router
from routes.extract import router as extract_router
from routes.match import router as match_router
from routes.verification import router as verification_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.enable_headless_render:
        try:
            await get_browser()
        except Exception:
            # Headless rendering is a fallback for JS-rendered sites, not a
            # hard dependency — the service must keep serving matching and
            # normal extraction even if Chromium can't launch here.
            logger.exception(
                "Headless browser failed to start; JS-rendered site pre-fill will be unavailable"
            )
    yield
    await shutdown_browser()


app = FastAPI(title="Gracera AI Service", version="0.1.0", lifespan=lifespan)
app.include_router(match_router)
app.include_router(extract_router)
app.include_router(coaching_router)
app.include_router(deal_assist_router)
app.include_router(verification_router)


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "service": "gracera-ai-service"})


@app.get("/")
async def root():
    return JSONResponse({"service": "gracera-ai-service", "version": "0.1.0"})
