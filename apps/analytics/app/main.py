from fastapi import FastAPI

from app.routers import forecast, health

app = FastAPI(
    title="PPI Analytics Service",
    description="Predictive Software Project Intelligence - Analytics Engine",
    version="0.1.0",
)

app.include_router(health.router)
app.include_router(forecast.router)
