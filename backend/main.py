import os
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import encounters, quest_radar, profile

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("scavenger")

# Simple in-process cache: {key: (value, expires_at)}
_cache: dict = {}

def cache_get(key: str):
    item = _cache.get(key)
    if item and item[1] > time.time():
        return item[0]
    return None

def cache_set(key: str, value, ttl: int = 300):
    _cache[key] = (value, time.time() + ttl)

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Scavenger.Work API starting up")
    yield
    log.info("Scavenger.Work API shutting down")

app = FastAPI(
    title="Scavenger.Work API",
    description="Real-life RPG for ambitious people. Hunt opportunities.",
    version="1.0.0",
    lifespan=lifespan,
)

# Make cache available to routers via app state
app.state.cache_get = cache_get
app.state.cache_set = cache_set

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    log.info(f"{request.method} {request.url.path} → {response.status_code} ({(time.time()-start)*1000:.0f}ms)")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "Internal server error", "detail": str(exc)})

app.include_router(encounters.router, prefix="/encounters", tags=["encounters"])
app.include_router(quest_radar.router, prefix="/quest-radar", tags=["quest-radar"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])

@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "version": "1.0.0", "project": "scavenger.work"}
