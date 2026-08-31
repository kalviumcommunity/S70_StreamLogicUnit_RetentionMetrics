"""Main FastAPI application entrypoint for StreamPulse."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.api.models import HealthResponse
from src.api.routers import engagement, retention, predict, behavior, auth

load_dotenv()

app = FastAPI(
    title="StreamPulse Analytics API",
    description="Viewer engagement and subscriber retention analytics platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Robust CORS configuration supporting local dev and cloud deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api prefix
app.include_router(engagement.router, prefix="/api", tags=["Engagement"])
app.include_router(retention.router, prefix="/api", tags=["Retention"])
app.include_router(predict.router, prefix="/api", tags=["Predict"])
app.include_router(behavior.router, prefix="/api", tags=["Behavior"])
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(auth.router, prefix="", tags=["Authentication"])


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Health check endpoint for container orchestrators and CI/CD smoke tests."""
    return HealthResponse(status="ok")
