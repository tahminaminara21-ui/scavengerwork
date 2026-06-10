"""
Tower App: opportunity-scraper
Schedule: every 6 hours via Tower orchestration
Uses Nimble to scrape live opportunities and writes to Tower Iceberg lakehouse.

Deploy:
  cd tower/opportunity-scraper
  tower apps create --name="opportunity-scraper"
  tower deploy
  tower run

Schedule (every 6h):
  tower orchestrate --app opportunity-scraper --cron "0 */6 * * *"
"""
import os
import json
import hashlib
from datetime import datetime, timezone
from nimble_python import Nimble

# Config from Tower parameters
CITY = os.environ.get("city", "New York")
GOAL_KEYWORDS = os.environ.get("goal_keywords", "startup founder AI hackathon investor")
NIMBLE_API_KEY = os.environ.get("NIMBLE_API_KEY", "")

nimble = Nimble(api_key=NIMBLE_API_KEY) if NIMBLE_API_KEY else None

RARITY_KEYWORDS = {
    "legendary": ["accelerator", "investor", "vc ", "demo day", "yc ", "a16z", "sequoia", "seed round", "pitch day"],
    "epic":      ["hackathon", "pitch competition", "incubator", "fellowship", "residency", "grant"],
    "rare":      ["meetup", "workshop", "conference", "summit", "networking", "bootcamp", "office hours"],
}
XP = {"legendary": 1000, "epic": 300, "rare": 100, "common": 10}

QUERIES = [
    "startup events founders {city} June 2026",
    "{keywords} meetup community {city}",
    "hackathon investor networking {city} 2026",
    "accelerator program {city} applications open",
    "YC alumni founder {city} networking",
]

def infer_rarity(text: str) -> str:
    t = text.lower()
    for rarity, kws in RARITY_KEYWORDS.items():
        if any(k in t for k in kws):
            return rarity
    return "common"

def scrape() -> list[dict]:
    if not nimble:
        print("[scraper] No NIMBLE_API_KEY — skipping live scrape")
        return []

    seen, results = set(), []
    for tpl in QUERIES:
        query = tpl.format(city=CITY, keywords=GOAL_KEYWORDS)
        try:
            res = nimble.search(query=query, max_results=6, search_depth="lite")
            for item in res.results:
                if item.url in seen:
                    continue
                seen.add(item.url)
                rarity = infer_rarity(item.title + " " + (item.description or ""))
                opp_id = hashlib.md5(item.url.encode()).hexdigest()[:12]
                results.append({
                    "id": opp_id,
                    "title": item.title,
                    "url": item.url,
                    "snippet": (item.description or "")[:200],
                    "rarity": rarity,
                    "xp": XP[rarity],
                    "city": CITY,
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                    "source": "nimble",
                })
            print(f"[scraper] Query '{query[:40]}...' → {len(res.results)} results")
        except Exception as e:
            print(f"[scraper] WARN: query failed — {e}")

    return results

def write_to_iceberg(opportunities: list[dict]):
    """
    Write to Tower Iceberg lakehouse.
    In Tower[iceberg] environment, use pyiceberg:
      pip install tower[iceberg]
    Table: scavenger.opportunities
    """
    try:
        import pyiceberg.catalog  # available via tower[iceberg]
        catalog = pyiceberg.catalog.load_catalog("default")
        table = catalog.load_table("scavenger.opportunities")
        import pyarrow as pa
        schema = pa.schema([
            pa.field("id", pa.string()),
            pa.field("title", pa.string()),
            pa.field("url", pa.string()),
            pa.field("snippet", pa.string()),
            pa.field("rarity", pa.string()),
            pa.field("xp", pa.int32()),
            pa.field("city", pa.string()),
            pa.field("scraped_at", pa.string()),
            pa.field("source", pa.string()),
        ])
        batch = pa.record_batch([
            pa.array([o[f] for o in opportunities], type=t)
            for f, t in zip(
                ["id","title","url","snippet","rarity","xp","city","scraped_at","source"],
                [pa.string(), pa.string(), pa.string(), pa.string(), pa.string(),
                 pa.int32(), pa.string(), pa.string(), pa.string()]
            )
        ], schema=schema)
        table.append(pa.Table.from_batches([batch]))
        print(f"[scraper] Wrote {len(opportunities)} rows to Iceberg table scavenger.opportunities")
    except ImportError:
        # Fallback: print JSON so Tower logs capture it
        print("[scraper] pyiceberg not available — printing results to logs:")
        for opp in opportunities:
            print(json.dumps(opp))
    except Exception as e:
        print(f"[scraper] Iceberg write failed: {e}")
        for opp in opportunities:
            print(json.dumps(opp))

def main():
    print(f"[scraper] Starting — city={CITY}, keywords={GOAL_KEYWORDS}")
    opportunities = scrape()
    print(f"[scraper] Scraped {len(opportunities)} unique opportunities")

    if opportunities:
        write_to_iceberg(opportunities)

    # Summary
    by_rarity: dict[str, int] = {}
    for o in opportunities:
        by_rarity[o["rarity"]] = by_rarity.get(o["rarity"], 0) + 1
    print(f"[scraper] Summary: {by_rarity}")
    print(f"[scraper] Done ✓")

if __name__ == "__main__":
    main()
