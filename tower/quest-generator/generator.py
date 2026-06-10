"""
Tower App: quest-generator  (requires tower[ai] extra)
Triggered: after scraper completes, or on-demand via Tower webhook.
Reads from Iceberg table scavenger.opportunities → GPT-4o → prints quest line.

Deploy:
  cd tower/quest-generator
  tower apps create --name="quest-generator"
  tower deploy
  tower run --param player_class=Founder --param goal="become an AI founder"
"""
import os
import json
from openai import OpenAI

PLAYER_CLASS = os.environ.get("player_class", "Founder")
GOAL = os.environ.get("goal", "become an AI founder")
CITY = os.environ.get("city", "New York")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

RARITY_ICONS = {"common": "🟢", "rare": "🔵", "epic": "🟣", "legendary": "🟡"}

def read_from_iceberg() -> list[dict]:
    """Read latest scraped opportunities from Tower Iceberg lakehouse."""
    try:
        import pyiceberg.catalog
        catalog = pyiceberg.catalog.load_catalog("default")
        table = catalog.load_table("scavenger.opportunities")
        df = table.scan(limit=20).to_pandas()
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"[quest-gen] Iceberg read failed ({e}) — using defaults")
        return DEFAULT_OPPORTUNITIES

def generate_quest_line(opportunities: list[dict]) -> dict:
    if not client:
        print("[quest-gen] No OPENAI_API_KEY — returning template quest line")
        return {"quest_line": TEMPLATE_QUESTS}

    opp_text = "\n".join(
        f"- [{o['rarity'].upper()}] {o['title']}: {str(o.get('snippet',''))[:100]}"
        for o in opportunities[:6]
    )
    prompt = f"""You are the quest master for Scavenger.Work — real-life RPG for ambitious people.
Class: {PLAYER_CLASS} | Goal: {GOAL} | City: {CITY}

Live opportunities found today:
{opp_text}

Create Today's Adventure: 4 quests progressing common → rare → epic → legendary.
Each: quest_title, opportunity_title, approach (one bold actionable sentence), xp (10/100/300/1000), rarity.

Return JSON only: {{"quest_line": [{{"quest_title":"","opportunity_title":"","approach":"","xp":0,"rarity":""}}]}}"""

    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=700,
        temperature=0.8,
    )
    return json.loads(resp.choices[0].message.content)

def main():
    print(f"[quest-gen] Generating adventure for {PLAYER_CLASS} in {CITY}: '{GOAL}'")
    opportunities = read_from_iceberg()
    print(f"[quest-gen] Loaded {len(opportunities)} opportunities from lakehouse")

    result = generate_quest_line(opportunities)
    quests = result.get("quest_line", [])

    print("\n" + "="*50)
    print(f"  TODAY'S ADVENTURE — {PLAYER_CLASS.upper()}")
    print("="*50)
    for q in quests:
        icon = RARITY_ICONS.get(q.get("rarity","common"), "⚪")
        print(f"\n{icon} [{q.get('rarity','?').upper()}] {q.get('quest_title','?')} (+{q.get('xp',0)} XP)")
        print(f"   📍 {q.get('opportunity_title','')}")
        print(f"   → {q.get('approach','')}")
    print("="*50)

    # Output JSON for downstream consumption
    print("\n[quest-gen] OUTPUT_JSON:" + json.dumps(result))
    print("[quest-gen] Done ✓")

DEFAULT_OPPORTUNITIES = [
    {"title": "AI Startup Meetup NYC", "rarity": "rare", "snippet": "Monthly gathering of AI founders"},
    {"title": "YC Application Workshop", "rarity": "epic", "snippet": "How to get into YC"},
    {"title": "Angel Investor Office Hours", "rarity": "legendary", "snippet": "10 min pitch to angels"},
    {"title": "Read Paul Graham Essays", "rarity": "common", "snippet": "Do Things That Don't Scale"},
]

TEMPLATE_QUESTS = [
    {"rarity": "common",    "quest_title": "Read a Founder Story",        "opportunity_title": "Paul Graham Essays",        "approach": "Read one essay and write 3 takeaways.",        "xp": 10},
    {"rarity": "rare",      "quest_title": "Attend a Startup Meetup",     "opportunity_title": "NYC Founders Meetup",       "approach": "Go and talk to at least 3 people.",           "xp": 100},
    {"rarity": "epic",      "quest_title": "Interview a Founder",         "opportunity_title": "YC Alumni Network",         "approach": "DM one founder, ask 3 specific questions.",   "xp": 300},
    {"rarity": "legendary", "quest_title": "Get First Customer Convo",    "opportunity_title": "Your Target Market",        "approach": "Post your idea and ask who'd use it today.",  "xp": 1000},
]

if __name__ == "__main__":
    main()
