from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, EmailStr, Field

from config import settings
from email_alert import send_alert
from geocode import geocode_address

app = FastAPI(title="Address Alert API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    address: str = Field(..., min_length=3)
    recipients: list[EmailStr] = Field(..., min_length=1)


class SearchResponse(BaseModel):
    found: bool
    matched_address: str | None = None
    coordinates: dict | None = None
    email_sent: bool = False
    email_error: str | None = None


# Lambda handler (ignored when running locally with uvicorn)
handler = Mangum(app)


@app.get("/health")
async def health():
    return {"status": "ok", "email_configured": settings.email_configured}


@app.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest):
    matches = await geocode_address(req.address)

    if not matches:
        return SearchResponse(found=False)

    best = matches[0]
    matched_address = best.get("matchedAddress")
    coordinates = best.get("coordinates")

    email_sent = False
    email_error = None
    if settings.email_configured:
        try:
            send_alert(req.address, matched_address, coordinates, list(req.recipients))
            email_sent = True
        except Exception as exc:
            email_error = str(exc)
    else:
        email_error = "Email not configured (.env missing Gmail credentials)"

    return SearchResponse(
        found=True,
        matched_address=matched_address,
        coordinates=coordinates,
        email_sent=email_sent,
        email_error=email_error,
    )
