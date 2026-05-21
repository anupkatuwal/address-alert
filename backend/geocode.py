import httpx

CENSUS_URL = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"


async def geocode_address(address: str) -> list[dict]:
    """Query the US Census one-line address geocoder.

    Returns the list of address matches (empty if none found).
    """
    params = {
        "address": address,
        "benchmark": "Public_AR_Current",
        "format": "json",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(CENSUS_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    return data.get("result", {}).get("addressMatches", [])
