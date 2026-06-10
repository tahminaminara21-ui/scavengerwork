import random
from fastapi import APIRouter, Query, Request
from services.nimble_service import search_opportunities, get_opportunity_detail
from services.openai_service import generate_approach_script

router = APIRouter()

RARITY_GATES = {1: ["common"], 5: ["common","rare"], 10: ["common","rare","epic"], 20: ["common","rare","epic","legendary"]}

def allowed_rarities(level: int) -> list[str]:
    return RARITY_GATES[max(k for k in RARITY_GATES if k <= level)]

# NYC center coords for encounters without geo
NYC = (40.7580, -73.9855)

def scatter(encounters: list[dict]) -> list[dict]:
    """Assign realistic scatter coords to encounters lacking them."""
    for i, enc in enumerate(encounters):
        if "lat" not in enc or "lng" not in enc:
            angle = (i / max(len(encounters), 1)) * 6.28
            r = random.uniform(0.005, 0.025)
            enc["lat"] = round(NYC[0] + r * __import__("math").cos(angle), 6)
            enc["lng"] = round(NYC[1] + r * __import__("math").sin(angle), 6)
    return encounters

@router.get("/")
def get_encounters(
    request: Request,
    lat: float = Query(40.7580),
    lng: float = Query(-73.9855),
    player_class: str = Query("Founder"),
    level: int = Query(1),
    city: str = Query("New York"),
    goal: str = Query("build a startup"),
):
    cache_key = f"encounters:{city}:{goal}:{level}"
    cached = request.app.state.cache_get(cache_key)
    if cached:
        return cached

    rarities = allowed_rarities(level)
    raw = search_opportunities(city, goal, max_results=12)
    filtered = [e for e in raw if e["rarity"] in rarities]
    result = {"encounters": scatter(filtered), "allowed_rarities": rarities, "total": len(filtered)}

    request.app.state.cache_set(cache_key, result, ttl=300)
    return result

@router.get("/approach")
def get_approach(
    title: str = Query(""),
    snippet: str = Query(""),
    player_class: str = Query("Founder"),
):
    script = generate_approach_script(title, snippet, player_class)
    return {"approach_script": script}

@router.get("/detail")
def get_detail(url: str = Query(...)):
    return get_opportunity_detail(url)
