from fastapi import FastAPI
from fastapi.responses import JSONResponse

from routes.match import router as match_router

app = FastAPI(title="Gracera AI Service", version="0.1.0")
app.include_router(match_router)


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "service": "gracera-ai-service"})


@app.get("/")
async def root():
    return JSONResponse({"service": "gracera-ai-service", "version": "0.1.0"})
