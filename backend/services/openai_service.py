import os, json, logging

log = logging.getLogger("scavenger.openai")

try:
    from openai import OpenAI
    _has_openai = True
except ImportError:
    _has_openai = False

_client = None

def get_client():
    global _client
    if not _has_openai:
        return None
    if _client is None and os.getenv("OPENAI_API_KEY"):
        _client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client

FALLBACK_QUESTS = {
    "Founder": [
        {"rarity": "common",    "quest_title": "Read a Founder Story",         "opportunity_title": "Paul Graham Essays",           "approach": "Read 'Do Things That Don't Scale' and note 3 actionable takeaways.", "xp": 10},
        {"rarity": "rare",      "quest_title": "Attend a Startup Meetup",       "opportunity_title": "NYC Founders Meetup",          "approach": "Show up, introduce yourself, ask one person what their biggest problem is.", "xp": 100},
        {"rarity": "epic",      "quest_title": "Interview a Real Founder",      "opportunity_title": "YC Alumni Network",            "approach": "DM a founder: 'I'm building X. Can I ask 3 questions in 10 mins?'", "xp": 300},
        {"rarity": "legendary", "quest_title": "Get Your First Customer Chat",  "opportunity_title": "Your Target Market",           "approach": "Post in one Slack community: describe your idea and ask who'd use it today.", "xp": 1000},
    ]
}

def generate_quest_line(player_class: str, goal: str, opportunities: list[dict]) -> dict:
    if not os.getenv("OPENAI_API_KEY"):
        log.warning("No OPENAI_API_KEY — returning fallback quests")
        return {"player_class": player_class, "goal": goal, "quest_line": FALLBACK_QUESTS.get(player_class, FALLBACK_QUESTS["Founder"])}

    opp_text = "\n".join(
        f"- [{o['rarity'].upper()}] {o['title']}: {o.get('snippet','')[:100]}"
        for o in opportunities[:6]
    )
    prompt = f"""You are the quest master for Scavenger.Work — real-life RPG for ambitious people.
Player class: {player_class} | Goal: {goal}

Real opportunities available:
{opp_text}

Create Today's Adventure: exactly 4 quests (common→rare→epic→legendary).
Each has: quest_title, opportunity_title, approach (1 bold sentence), xp (10/100/300/1000), rarity.

Return only JSON: {{"quest_line": [{{"quest_title":"","opportunity_title":"","approach":"","xp":0,"rarity":""}}]}}"""

    try:
        resp = get_client().chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=700,
            temperature=0.8,
        )
        data = json.loads(resp.choices[0].message.content)
        return {"player_class": player_class, "goal": goal, "quest_line": data.get("quest_line", [])}
    except Exception as e:
        log.error(f"OpenAI quest generation failed: {e}")
        return {"player_class": player_class, "goal": goal, "quest_line": FALLBACK_QUESTS.get(player_class, FALLBACK_QUESTS["Founder"])}

def generate_approach_script(title: str, snippet: str, player_class: str) -> str:
    if not os.getenv("OPENAI_API_KEY"):
        return f"As a {player_class}: show up, be direct about what you're building, and ask one specific question."
    try:
        resp = get_client().chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content":
                f"For a {player_class}, write a 2-sentence approach script for: '{title}'. {snippet}\nBe concrete and confident."}],
            max_tokens=120,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        log.error(f"Approach script failed: {e}")
        return f"Walk in with intention. Introduce what you're building and ask one sharp question."
