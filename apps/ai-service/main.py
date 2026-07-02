from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Gracera AI Service", version="0.1.0")


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "service": "gracera-ai-service"})


@app.get("/")
async def root():
    return JSONResponse({"service": "gracera-ai-service", "version": "0.1.0"})
