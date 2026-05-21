import resend

from config import settings

# Resend uses HTTPS — works on all cloud platforms including Railway free tier


def send_alert(address: str, matched: str, coordinates: dict | None, recipients: list[str]) -> None:
    """Send an email alert via Resend API (HTTPS, no SMTP port required)."""
    resend.api_key = settings.resend_api_key

    body_lines = [
        "An address you searched for was found by the US Census geocoder.",
        "",
        f"Searched:  {address}",
        f"Matched:   {matched}",
    ]
    if coordinates:
        body_lines.append(f"Longitude: {coordinates.get('x')}")
        body_lines.append(f"Latitude:  {coordinates.get('y')}")

    resend.Emails.send({
        "from": "Address Alert <onboarding@resend.dev>",
        "to": recipients,
        "subject": f"Address Alert: match found for '{address}'",
        "text": "\n".join(body_lines),
    })
