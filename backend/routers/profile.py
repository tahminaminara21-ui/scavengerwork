from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

XP_THRESHOLDS = [(30, 15000), (20, 5000), (10, 1000), (5, 200), (1, 0)]

def xp_to_level(xp: int) -> int:
    for level, threshold in XP_THRESHOLDS:
        if xp >= threshold:
            return level
    return 1

def next_xp(xp: int) -> int:
    for _, threshold in reversed(XP_THRESHOLDS):
        if threshold > xp:
            return threshold
    return xp

class LevelUpRequest(BaseModel):
    xp: int
    player_class: str = "Founder"

@router.post("/level-up")
def level_up(req: LevelUpRequest):
    level = xp_to_level(req.xp)
    nxt = next_xp(req.xp)
    return {
        "level": level,
        "xp": req.xp,
        "xp_to_next": max(0, nxt - req.xp),
        "progress_pct": min(100, round((req.xp / nxt) * 100)) if nxt else 100,
    }

@router.get("/classes")
def get_classes():
    return {"classes": [
        {"name": "Founder",    "icon": "🏰", "desc": "Build something from nothing",          "color": "#f0d900"},
        {"name": "Engineer",   "icon": "⚙️",  "desc": "Create the machines of tomorrow",      "color": "#4488ff"},
        {"name": "Designer",   "icon": "🎨", "desc": "Shape how the world looks and feels",   "color": "#ff44aa"},
        {"name": "Creator",    "icon": "📡", "desc": "Tell stories that move people",         "color": "#44ffaa"},
        {"name": "Researcher", "icon": "🔬", "desc": "Discover what nobody knows yet",        "color": "#aa44ff"},
        {"name": "Investor",   "icon": "💰", "desc": "Bet on the future before it arrives",   "color": "#ff8844"},
    ]}
