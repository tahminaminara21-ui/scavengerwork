# Scavenger.Work

**Work is a scavenger hunt. Hunt what matters.**

A real-life RPG for ambitious people -- inspired by Pokemon GO but built for career and startup discovery. Opportunities hidden in the real world become collectible encounters on a fantasy map. The world reveals itself as you level up.

**Live:** https://scavenger.work
**Hackathon:** DeveloperWeek New York 2026

---

## The Problem

Most career and startup platforms tell you *what to learn*. They give you courses, checklists, and dashboards.

None of them say: "There is a founder meetup 700 meters away from you right now."

The real world is packed with high-value opportunities -- events, investors, hackathons, founder communities, accelerators -- but they are invisible to most people. Discovery is fragmented, passive, and luck-based.

**The result:** ambitious people miss the encounters that would actually change their trajectory.

---

## The Solution

Scavenger.Work turns career opportunity discovery into a game.

Every real-world opportunity becomes a collectible encounter with a rarity tier:

| Rarity | Example | XP |
|---|---|---|
| Common | Read a founder interview | +10 |
| Rare | Attend a startup meetup | +100 |
| Epic | Interview a founder | +300 |
| Legendary | Get your first customer | +1000 |

The map starts hidden -- fog of war. As you level up, rarer encounters unlock. An AI radar scans the live web to surface real opportunities near you and generates a personalised quest line.

Instead of telling people what to learn, we tell them what adventure to go on.

---

## How It Works

1. Choose your class (Founder, Engineer, Designer, Creator, Researcher, Investor)
2. State your goal
3. The AI Opportunity Radar scans the live web with Nimble and generates a quest line
4. Encounters appear on the map -- tap to get an AI approach script
5. Complete encounters to earn XP and level up
6. Higher levels reveal rarer, more powerful opportunities

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Leaflet.js with CartoDB Voyager tiles
- Framer Motion for animations
- Tailwind CSS
- Custom SVG encounter markers with animated pulse rings

### Backend
- FastAPI (Python)
- In-process caching for demo performance
- Full mock fallback -- works without API keys

### Nimble (Agentic App Track)
- `nimble.search()` -- scans live web for real events, meetups, hackathons by user goal and city
- `nimble.extract()` -- pulls structured data from event pages
- Powers both the map encounters and the AI Radar

### Tower (Data Pipeline Track)
- `opportunity-scraper` -- scheduled Tower app, runs every 6 hours, queries Nimble and writes to Iceberg lakehouse
- `quest-generator` -- Tower[ai] app, reads from Iceberg, calls GPT-4o, outputs personalised quest lines
- Demonstrates: orchestration, Iceberg lakehouse storage, Python-native serverless compute

### name.com (Domain Roulette Track)
- Domain: **scavenger.work** -- selected from the name.com Domain Roulette list
- The domain is the product philosophy: "Work IS a scavenger hunt"
- Not bolted on -- it is the entire brand concept

---

## Project Structure

```
scavenger-work/
  frontend/                   Next.js app
    app/
      landing/page.tsx        Full scroll landing page with SVG animations
      page.tsx                Class selection onboarding
      map/page.tsx            Fantasy map game screen
      radar/page.tsx          AI Opportunity Radar
    components/
      FantasyMap.tsx          Leaflet map with animated encounter markers
      EncounterCard.tsx       Bottom sheet encounter modal
      XPBar.tsx               Animated XP progress bar
  backend/                    FastAPI
    main.py                   App with logging, CORS, error handling
    routers/
      encounters.py           GET /encounters/ with level gating
      quest_radar.py          GET /quest-radar/ with Nimble + GPT-4o
      profile.py              POST /profile/level-up
    services/
      nimble_service.py       All Nimble API calls with mock fallback
      openai_service.py       Quest generation and approach scripts
  tower/
    opportunity-scraper/      Towerfile + scraper.py (Nimble to Iceberg)
    quest-generator/          Towerfile + generator.py (Iceberg to GPT-4o)
  docker-compose.yml          Postgres + Redis for local dev
```

---

## Running Locally

### Without API keys (demo mode)

The app uses built-in mock data with 8 NYC encounters and pre-written quest lines. No keys needed to see the full UI and game flow.

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

```bash
# backend/.env
NIMBLE_API_KEY=your_nimble_key
OPENAI_API_KEY=your_openai_key
```

Get Nimble key: hackathon2026@nimbleway.com (free hackathon credits)

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

## Deployment

**Frontend to Vercel:**
```bash
cd frontend && npx vercel
# Set NEXT_PUBLIC_API_URL to your Railway backend URL
```

**Backend to Railway:**
Push repo to GitHub, connect to Railway, add env vars.

---

## Prize Track Strategy

### Overall Winner
- Most memorable demo in the room
- Solves a real, universal problem (career opportunity discovery)
- Clear path to a business: $9/mo SaaS, B2B with accelerators and bootcamps
- "Pokemon GO made the world magical by hiding monsters. We hide opportunities."

### name.com Domain Roulette -- $2,500
- Domain: scavenger.work (in their official list)
- The domain does not describe the product -- it IS the product philosophy
- Creative interpretation: Work is a scavenger hunt

### Nimble -- $750
- Agentic app using search + extract + crawl
- Every map encounter is a live Nimble web search result
- Radar feature demos real-time agentic web intelligence

### Tower -- 6 months free
- Two deployed Tower apps with Towerfiles
- opportunity-scraper runs on schedule, writes to Iceberg lakehouse
- quest-generator uses tower[ai] to call GPT-4o from stored data
- Shows: orchestration, scheduling, lakehouse storage, MCP integration

---

## The Demo (3 minutes)

1. Open scavenger.work -- animated tagline intro plays
2. Select Founder class -- gradient class card, floating emoji
3. Map loads -- CartoDB Voyager tiles, colorful encounter bubbles with pulse rings
4. Click Legendary marker -- "Angel Investor Open Hours" -- bottom sheet slides up
5. Hit "How to Approach" -- GPT-4o generates personalised script
6. Navigate to Radar -- type goal -- watch scan animation (Nimble scanning + AI steps)
7. Quest line reveals with spring animation, rarity colors, XP values
8. "This data is live. Nimble pulled it from the web. Tower stored it. AI shaped it."
9. "The domain is scavenger.work. Work IS a scavenger hunt."

---

## Team

Built at DeveloperWeek New York Hackathon 2026.

---

## License

MIT
