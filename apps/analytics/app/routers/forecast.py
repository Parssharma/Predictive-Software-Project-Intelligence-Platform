from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.post("/forecast")
async def create_forecast():
    """Stub endpoint for forecast generation. Returns 501 Not Implemented."""
    return JSONResponse(
        status_code=501,
        content={
            "error": "Not Implemented",
            "message": "Forecast generation is not yet implemented. "
            "This endpoint will accept milestone data and return "
            "P50/P85/P95 completion dates via Monte Carlo simulation.",
            "phase": "Phase 6 - Monte Carlo",
        },
    )
