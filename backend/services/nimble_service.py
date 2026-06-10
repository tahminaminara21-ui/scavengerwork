import os
import logging

log = logging.getLogger("scavenger.nimble")

try:
    from nimble_python import Nimble
    nimble = Nimble(api_key=os.getenv("NIMBLE_API_KEY", "")) if os.getenv("NIMBLE_API_KEY") else None
except ImportError:
    nimble = None

RARITY_KEYWORDS = {
    "legendary": ["accelerator", "investor", "vc ", "demo day", "yc ", "a16z", "sequoia", "seed round"],
    "epic":      ["hackathon", "pitch competition", "incubator", "fellowship", "residency"],
    "rare":      ["meetup", "workshop", "conference", "summit", "networking", "bootcamp"],
}

def infer_rarity(text: str) -> str:
    t = text.lower()
    for rarity, kws in RARITY_KEYWORDS.items():
        if any(k in t for k in kws):
            return rarity
    return "common"

XP = {"common": 10, "rare": 100, "epic": 300, "legendary": 1000}

MOCK_OPPORTUNITIES = [
    {"id": "m1", "title": "NYC AI Founders Meetup", "rarity": "rare", "xp": 100, "lat": 40.7580, "lng": -73.9855, "snippet": "Monthly gathering of AI startup founders in NYC", "url": "#", "source": "demo"},
    {"id": "m2", "title": "YC Alumni Coffee Chat", "rarity": "epic", "xp": 300, "lat": 40.7489, "lng": -73.9680, "snippet": "1:1 with a YC-backed founder — get real advice", "url": "#", "source": "demo"},
    {"id": "m3", "title": "Angel Investor Open Office Hours", "rarity": "legendary", "xp": 1000, "lat": 40.7614, "lng": -73.9776, "snippet": "Pitch your idea to an active angel in 10 minutes", "url": "#", "source": "demo"},
    {"id": "m4", "title": "Read Paul Graham's Essays", "rarity": "common", "xp": 10, "lat": 40.7550, "lng": -73.9800, "snippet": "Do Things That Don't Scale — essential reading", "url": "https://paulgraham.com/ds.html", "source": "demo"},
    {"id": "m5", "title": "AI Startup Hackathon", "rarity": "epic", "xp": 300, "lat": 40.7420, "lng": -73.9900, "snippet": "48-hour build competition — ship something real", "url": "#", "source": "demo"},
    {"id": "m6", "title": "Indie Hackers NYC Meetup", "rarity": "rare", "xp": 100, "lat": 40.7530, "lng": -73.9750, "snippet": "Connect with bootstrapped founders in your city", "url": "#", "source": "demo"},
    {"id": "m7", "title": "Product Hunt Launch Party", "rarity": "rare", "xp": 100, "lat": 40.7600, "lng": -73.9820, "snippet": "Meet makers and early adopters face to face", "url": "#", "source": "demo"},
    {"id": "m8", "title": "Subscribe to a Founder Newsletter", "rarity": "common", "xp": 10, "lat": 40.7460, "lng": -73.9860, "snippet": "Lenny's Newsletter or First Round Review weekly reads", "url": "#", "source": "demo"},
]

def search_opportunities(city: str, goal: str, max_results: int = 10) -> list[dict]:
    if not os.getenv("NIMBLE_API_KEY"):
        log.warning("No NIMBLE_API_KEY — returning mock data")
        return MOCK_OPPORTUNITIES

    queries = [
        f"startup events founders {city} 2026",
        f"{goal} meetup community {city}",
        f"hackathon investor networking {city} June 2026",
    ]
    seen, results = set(), []
    for query in queries:
        try:
            res = nimble.search(query=query, max_results=max_results // len(queries) + 2, search_depth="lite")
            for item in res.results:
                if item.url in seen:
                    continue
                seen.add(item.url)
                rarity = infer_rarity(item.title + " " + (item.description or ""))
                results.append({
                    "id": str(hash(item.url)),
                    "title": item.title,
                    "snippet": (item.description or "")[:150],
                    "url": item.url,
                    "rarity": rarity,
                    "xp": XP[rarity],
                    "source": "nimble",
                })
        except Exception as e:
            log.error(f"Nimble search failed for '{query}': {e}")

    return results or MOCK_OPPORTUNITIES

def get_opportunity_detail(url: str) -> dict:
    try:
        res = nimble.extract(url=url, formats=["markdown"])
        return {"url": url, "content": (res.data.get("markdown") or "")[:2000]}
    except Exception as e:
        log.error(f"Nimble extract failed for {url}: {e}")
        return {"url": url, "content": ""}
