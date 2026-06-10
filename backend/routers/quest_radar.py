from fastapi import APIRouter, Query, Request
from services.nimble_service import search_opportunities
from services.openai_service import generate_quest_line

router = APIRouter()

@router.get("/")
def get_quest_radar(
    request: Request,
    player_class: str = Query("Founder"),
    goal: str = Query("become an AI founder"),
    city: str = Query("New York"),
):
    cache_key = f"radar:{player_class}:{goal}:{city}"
    cached = request.app.state.cache_get(cache_key)
    if cached:
        return cached

    opportunities = search_opportunities(city, goal, max_results=8)
    result = generate_quest_line(player_class, goal, opportunities)
    result["city"] = city

    request.app.state.cache_set(cache_key, result, ttl=600)
    return result
