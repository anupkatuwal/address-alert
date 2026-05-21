import smtplib
import ssl
from email.message import EmailMessage

from config import settings

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def send_alert(address: str, matched: str, coordinates: dict | None, recipients: list[str]) -> None:
    """Send a Gmail SMTP alert that an address was found."""
    msg = EmailMessage()
    msg["Subject"] = f"Address Alert: match found for '{address}'"
    msg["From"] = settings.gmail_address
    msg["To"] = ", ".join(recipients)

    lines = [
        "An address you searched for was found by the US Census geocoder.",
        "",
        f"Searched:  {address}",
        f"Matched:   {matched}",
    ]
    if coordinates:
        lines.append(f"Longitude: {coordinates.get('x')}")
        lines.append(f"Latitude:  {coordinates.get('y')}")
    msg.set_content("\n".join(lines))

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(settings.gmail_address, settings.gmail_app_password)
        server.send_message(msg)
