# Scavenger.Work

**Work is a scavenger hunt. Hunt what matters.**

A real-life RPG for ambitious people. Opportunities hidden in the real world become collectible encounters on a map. The world reveals itself as you level up.

---

## The Problem

Most career and startup platforms tell you *what to learn*. They serve you courses, checklists, and dashboards.

None of them say: "There is a founder meetup 700 meters away from you right now."

The real world is packed with high-value opportunities -- events, investors, hackathons, founder communities, accelerators. But discovery is fragmented, passive, and luck-based. People in Dhaka, Lagos, or Hanoi have no idea what is happening around them that could change their trajectory. Even people in New York miss encounters that are happening blocks away.

The problem is not effort. The problem is visibility.

---

## The Solution

Scavenger.Work turns opportunity discovery into a game mechanic borrowed directly from Pokemon GO.

Every real-world opportunity becomes a collectible encounter on a map, assigned a rarity tier based on how rare and valuable that type of opportunity is:

| Rarity | Example | XP Reward |
|---|---|---|
| Common | Read a founder essay, online webinar | +10 XP |
| Rare | Attend a startup meetup, networking event | +100 XP |
| Epic | Interview a founder, pitch competition | +300 XP |
| Legendary | Get your first customer, accelerator demo day | +1000 XP |

The map starts hidden with fog of war. As players level up by collecting encounters, rarer opportunities unlock. An AI radar scans the live web in real time, finds actual events and opportunities near the player, and generates a personalised quest line.

Instead of telling people what to learn, the system tells them what adventure to go on.

---

## How the Nimble Integration Works

Nimble is the live intelligence layer of the entire product. Without Nimble, the map shows static mock data. With Nimble, every encounter on the map is a real opportunity pulled from the web in real time.

### The Encounter Feed

When a player opens the map, the backend calls `nimble.search()` with a query constructed from the player's class, goal, and city:

```python
queries = [
    f"startup events founders {city} 2026",
    f"{goal} meetup community {city}",
    f"hackathon investor networking {city} June 2026",
]

for query in queries:
    result = nimble.search(
        query=query,
        max_results=6,
        search_depth="lite"
    )
```

Each result is parsed for rarity based on keywords in the title and description. A result containing "accelerator" or "YC" becomes Legendary. "Hackathon" becomes Epic. "Meetup" or "workshop" becomes Rare. Everything else is Common. This rarity inference is the core game mechanic -- the classification makes Nimble results feel like Pokemon spawns rather than a search results list.

The classified encounters are then scattered across the map with realistic geographic coordinates around the player's city center, placed using a polar scatter algorithm so they appear naturally distributed rather than stacked.

### The AI Radar

The AI Radar page is the centrepiece demo feature. When a player types their goal and hits Scan:

1. The backend calls `nimble.search()` with 3 targeted queries built from the goal
2. The top 6 results are passed to GPT-4o with the player's class and goal
3. GPT-4o generates a quest line of exactly 4 encounters progressing from Common to Legendary
4. Each quest includes a concrete one-sentence approach script

The scan animation on the frontend shows each step -- "Scanning live web with Nimble... Finding opportunities nearby... AI building your quest line..." -- which makes the live data pipeline visible and memorable during a demo.

### Approach Scripts

When a player taps an encounter and requests an approach script, the encounter's title and snippet are sent to the backend:

```python
result = nimble.extract(url=encounter_url, formats=["markdown"])
```

The extracted content is fed into GPT-4o to generate a personalised, class-aware approach script. A Founder gets different advice than an Engineer for the same investor event.

---

## How the Tower Integration Works

Tower is the data infrastructure layer. The Tower pipeline runs independently of the web app, feeding the backend's encounter store with fresh data on a schedule.

### The Opportunity Scraper

The first Tower app (`opportunity-scraper`) is a Python script deployed with a Towerfile that defines it as a schedulable app with parameters:

```toml
[app]
name = "opportunity-scraper"
script = "./scraper.py"
source = ["./scraper.py"]

[[parameters]]
name = "city"
default = "New York"

[[parameters]]
name = "goal_keywords"
default = "startup founder AI hackathon"
```

When run, it executes 5 Nimble search queries across different opportunity categories, deduplicates results by URL, infers rarity for each, and writes the structured data to a Tower Iceberg lakehouse table called `scavenger.opportunities`.

```python
table = catalog.load_table("scavenger.opportunities")
table.append(pa.Table.from_batches([batch]))
```

The app is scheduled to run every 6 hours:

```bash
tower orchestrate --app opportunity-scraper --cron "0 */6 * * *"
```

This means the lakehouse always contains fresh, pre-classified opportunities that the backend can serve without calling Nimble on every request -- reducing latency and API usage.

### The Quest Generator

The second Tower app (`quest-generator`) uses the `tower[ai]` extra. It reads from the Iceberg table, takes a player's class and goal as parameters, and calls GPT-4o to produce a personalised quest line:

```python
df = table.scan(limit=20).to_pandas()
opportunities = df.to_dict(orient="records")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    response_format={"type": "json_object"},
)
```

The quest generator can be triggered on-demand via Tower webhooks -- for example, whenever a player opens the radar -- or run in batch to pre-generate quest lines for common class/goal combinations.

### Why Tower Fits This Use Case

The opportunity data has a natural staleness curve. Events that happened last week are worthless. Events happening in the next 30 days are valuable. Running a scheduled scrape pipeline that continuously refreshes the lakehouse means the product always has current data without hammering the Nimble API on every user request.

The separation between the scraper (writes to Iceberg) and the quest generator (reads from Iceberg) is also architecturally clean -- the web app's `/encounters` and `/quest-radar` endpoints can read from the same lakehouse without duplicating scraping logic.

---

## How the name.com Domain Works

The domain `scavenger.work` was selected from the name.com Domain Roulette list provided for the hackathon.

The creative interpretation is not superficial. The domain does not describe the product -- it encapsulates the entire philosophy:

> Work is a scavenger hunt.

This reframes how people think about career development. Instead of a linear path of credentials and applications, work becomes a world of hidden encounters waiting to be discovered. Every networking event is a rare spawn. Every investor is a legendary encounter. Every mentor is an epic find.

The domain appears in the navbar, the page title, the landing page hero, and is woven into the product's language throughout -- "Hunt It", "Encounter", "Quest", "Level Up". The entire brand vocabulary flows from the domain.

---

## Architecture

```
User opens app
  -> Next.js frontend (Vercel)
  -> FastAPI backend (Railway)
      -> nimble.search() for live encounters
      -> GPT-4o for quest lines and approach scripts
      -> In-process cache (5min TTL) to avoid repeat API calls
  -> Tower pipeline (background, every 6h)
      -> opportunity-scraper: Nimble -> Iceberg lakehouse
      -> quest-generator: Iceberg -> GPT-4o -> quest_lines table
```

---

## Running Locally

### No API keys needed (demo mode)

The backend has full mock fallback. 8 pre-defined NYC encounters and pre-written quest lines load automatically when no API keys are present.

**Terminal 1 -- Backend:**
```bash
cd backend
pip install fastapi uvicorn python-dotenv
touch .env
uvicorn main:app --reload --port 8000
```

**Terminal 2 -- Frontend:**
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm install
npm run dev
```

Open http://localhost:3000

### With API keys (live mode)

Create `backend/.env`:
```
NIMBLE_API_KEY=your_nimble_key
OPENAI_API_KEY=your_openai_key
```

Get Nimble key: hackathon2026@nimbleway.com (free hackathon credits available)

### Tower Pipeline

```bash
pip install tower
tower login
tower secrets set NIMBLE_API_KEY=your_key
tower secrets set OPENAI_API_KEY=your_key

cd tower/opportunity-scraper
tower apps create --name="opportunity-scraper"
tower deploy && tower run

cd ../quest-generator
tower apps create --name="quest-generator"
tower deploy && tower run

# Schedule scraper every 6 hours
tower orchestrate --app opportunity-scraper --cron "0 */6 * * *"
```

---

## Project Structure

```
scavenger-work/
  frontend/
    app/
      landing/page.tsx     Full scroll landing page with SVG animations
      page.tsx             Class selection onboarding (Founder, Engineer, etc)
      map/page.tsx         Fantasy map game screen with encounter markers
      radar/page.tsx       AI Opportunity Radar with scan animation
    components/
      FantasyMap.tsx       Leaflet + CartoDB tiles + animated SVG markers
      EncounterCard.tsx    Bottom sheet modal with approach script
      XPBar.tsx            Animated XP progress bar
  backend/
    main.py                FastAPI app with logging, CORS, error handling
    routers/
      encounters.py        Level gating, Nimble search, mock fallback
      quest_radar.py       Nimble + GPT-4o quest line generation
      profile.py           XP to level calculation
    services/
      nimble_service.py    All Nimble API calls + mock data fallback
      openai_service.py    Quest generation + approach scripts + fallbacks
  tower/
    opportunity-scraper/   Scheduled Tower app: Nimble to Iceberg
    quest-generator/       On-demand Tower app: Iceberg to GPT-4o
  docker-compose.yml       Postgres + Redis for local dev
```

---

## License

MIT
