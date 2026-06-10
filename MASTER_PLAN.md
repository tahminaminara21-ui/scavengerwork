# Scavenger.Work — Master Plan
## DeveloperWeek New York 2026 Hackathon

**Domain:** scavenger.work (name.com Domain Roulette)  
**Tagline:** Work is a scavenger hunt. Hunt what matters.  
**Concept:** Pokémon GO for ambitious people — a real-life RPG where career opportunities are collectibles hidden in the world around you.

---

## Prize Targets

| Track | Prize | How We Win |
|---|---|---|
| Overall Winner | Amazon Echos + All-Access Passes | Most memorable demo; solves real problem; startup-feasible |
| name.com Domain Roulette | $2,500 cash (1st) | scavenger.work IS the product — domain ↔ concept are inseparable |
| Nimble | $500 Amazon GC + $500 credits | Agentic app using Search + Extract + Crawl to find real-world opportunities |
| Tower | 6mo free + Bricks for Builders | Data pipeline: scrape → store in Iceberg lakehouse → AI quest generation |

---

## The Vision (One Sentence)

> "There is a founder quest 700m away from you right now."

Instead of telling people what to learn, Scavenger.Work tells them what adventure to go on — surfaced live from the real world, personalised to their class and level, rendered on a fantasy map.

---

## Core Mechanics

### Player Classes
Founder · Engineer · Designer · Creator · Researcher · Investor

### Opportunity Types (the "Pokémon")
| Rarity | Example | XP |
|---|---|---|
| Common ⚪ | Read a founder interview, online course | +10 |
| Rare 🔵 | Attend startup event, hackathon | +100 |
| Epic 🟣 | Interview a founder, ship side project | +300 |
| Legendary 🟡 | Get first customer, launch product | +1000 |

### Opportunity Fog (killer mechanic)
Map is hidden. Opportunities unlock with level:
- L1: Coffee Chats, Blog Posts
- L5: Startup Events, Meetups  
- L10: Founder Encounters
- L20: Investor Events
- L30: Accelerators, VC office hours

### AI Opportunity Radar (demo centrepiece)
User sets goal → system scans live web → generates personalised quest line:
```
Today's Adventure for [Rifa] — Class: Founder
🟢 Talk to one potential user       (+10 XP)
🟢 Attend AI meetup nearby          (+100 XP)
🟣 Reach out to a founder           (+300 XP)
🔴 LEGENDARY: Get first customer conversation (+1000 XP)
```

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) — React framework
- **Leaflet.js** + custom fantasy tileset (Stamen Watercolor or custom CSS filter on OSM tiles)
- **Tailwind CSS** — styling
- **Framer Motion** — encounter animations (Pokéball-style pop-in)
- **shadcn/ui** — base components

### Backend
- **FastAPI** (Python) — REST API
- **PostgreSQL + PostGIS** — geospatial opportunity storage
- **Redis** — session cache, fog-of-war state
- **OpenAI GPT-4o** — quest generation, opportunity scoring, approach scripts

### Tower (Data Pipeline Track)
- **Scraper app** — scheduled Tower job: Eventbrite, Meetup, Luma, LinkedIn events
- **Quest Generator app** — Tower job: takes raw opportunities → generates personalised quest lines via LLM
- **Iceberg lakehouse** — stores all scraped opportunities, user interactions, quest history
- **Orchestration** — Tower schedules scraper every 6 hours, quest gen on-demand via webhook

### Nimble (Agentic App Track)
- `nimble.search()` — find local startup events, hackathons, communities by user location + goal
- `nimble.extract()` — pull structured data from event pages (date, location, organiser, attendee count)
- `nimble.crawl.run()` — crawl community sites (Indie Hackers, Product Hunt, YC directory)
- `nimble.agent.run()` — LinkedIn/Eventbrite pre-built agents for founder profiles + events
- Result: real-time intelligence layer that populates the map with live opportunities

### name.com (Domain Roulette Track)
- Domain: **scavenger.work** — registered via name.com
- Philosophy embedded in product: "Work is a scavenger hunt"
- Domain = product concept, not an afterthought

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  Next.js + Leaflet Fantasy Map + Framer Motion                  │
│  Player class select → Map loads → Encounters render            │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────────┐
│                       FASTAPI BACKEND                            │
│  /quest-radar  /encounters  /profile  /level-up                 │
└──────┬────────────────────────────────────────┬─────────────────┘
       │                                        │
┌──────▼──────────┐                   ┌─────────▼───────────────┐
│   TOWER PIPELINE │                   │     NIMBLE AGENT LAYER  │
│                  │                   │                          │
│  [Scraper App]   │                   │  nimble.search()        │
│  Runs every 6h   │                   │  → find local events    │
│  Sources:        │                   │                          │
│  Eventbrite      │                   │  nimble.extract()       │
│  Meetup/Luma     │                   │  → structured event data│
│  YC/PH/IH        │                   │                          │
│        ↓         │                   │  nimble.crawl.run()     │
│  [Quest Gen App] │                   │  → founder profiles     │
│  GPT-4o via      │                   │                          │
│  Tower[ai]       │                   │  nimble.agent.run()     │
│        ↓         │                   │  → LinkedIn/EB agents   │
│  Iceberg Tables  │                   └─────────────────────────┘
│  (S3 Lakehouse)  │                            │
│  opportunities   │◄───────────────────────────┘
│  quest_lines     │    Nimble results stored
│  user_actions    │    back to Iceberg
└──────────────────┘
       │
┌──────▼──────────────────────┐
│  PostgreSQL + PostGIS        │
│  User profiles, fog state,  │
│  geospatial encounter data  │
└──────────────────────────────┘
```

---

## Build Order (Strict Sequence)

### Hour 0–2: Foundation
1. `npx create-next-app scavenger-work-frontend`
2. `pip install fastapi uvicorn tower nimble_python openai`
3. Register **scavenger.work** on name.com
4. PostgreSQL + PostGIS Docker container up
5. FastAPI skeleton with 3 endpoints: `/encounters`, `/quest-radar`, `/profile`

### Hour 2–4: The Map (Visual Hook)
6. Leaflet in Next.js with fantasy CSS filter on OSM tiles
7. Hard-code 5–10 mock encounters on the map (NYC coords)
8. Encounter pop-up card component: rarity badge, icon, XP value, AI description
9. Player class selection screen (Founder/Engineer/Designer...)
10. Fog of war: grey overlay, encounters unlock on click/level

### Hour 4–6: Tower Pipeline
11. Create Tower account + `tower login`
12. **App 1 — `opportunity-scraper`**: Towerfile + scraper.py
    - Nimble search for "startup events NYC", "founder meetups", "hackathons"
    - Store results to Tower Iceberg table `opportunities`
13. `tower deploy && tower run` — verify data flows to lakehouse
14. **App 2 — `quest-generator`**: Towerfile + generator.py
    - Reads from `opportunities` Iceberg table
    - Calls GPT-4o to create personalised quest lines per user class
    - Writes to `quest_lines` table
15. Schedule scraper: `tower orchestrate --cron "0 */6 * * *"`

### Hour 6–8: Nimble Integration
16. Wire `nimble.search()` to `/quest-radar` endpoint
    - Query: f"startup events {user.city} {user.goal}"
    - focus="general", search_depth="lite", include_answer=True
17. `nimble.extract()` on top event URLs → structured data
18. `nimble.agent.run()` for Eventbrite agent on relevant events
19. Merge Nimble live results + Tower Iceberg stored results → unified opportunity feed
20. Map now shows LIVE opportunities from Nimble + stored from Tower

### Hour 8–10: Game Mechanics
21. XP system: localStorage for demo, track encounter → xp → level
22. Level gating: fog lifts at level thresholds (reveal higher-rarity encounters)
23. Encounter animation: Framer Motion slide-in card with rarity glow
24. "Hunt It" button → AI approach script via GPT-4o
25. Quest log sidebar: today's adventure quest line from Tower quest-generator

### Hour 10–12: Polish + Demo Prep
26. Fantasy map aesthetic: custom CSS filter (sepia + hue-rotate), vintage border overlay
27. Onboarding flow: "Choose your class" → map loads with personalised encounters
28. AI Opportunity Radar result page (the demo centrepiece)
29. Deploy frontend to Vercel (`scavenger.work` domain pointed via name.com DNS)
30. Deploy backend to Railway / Render
31. Rehearse 3-minute demo script (see below)

---

## Demo Script (3 Minutes)

**0:00 — Hook**
> "Most career platforms tell you what to learn. Scavenger.Work tells you what adventure to go on."

**0:15 — Choose Class**
> Open app at scavenger.work. Select "Founder". Fantasy map loads.

**0:30 — The Map**
> "The world around you is full of opportunities. You just can't see them yet."
> Show fog of war lifting as level increases.

**0:45 — Live Encounter**
> Click a rare encounter: "Startup Meetup — 700m away."
> Card shows: rarity badge, event details, AI-generated approach script.
> "This data is live. Pulled right now by Nimble from the real web."

**1:15 — AI Opportunity Radar**
> "I want to become an AI founder." → Hit scan.
> Tower quest-generator fires → returns today's quest line in 3 seconds.
> "This quest was generated from real opportunities Tower scraped and stored in its lakehouse."

**1:45 — The Sponsor Story**
> "Tower powers the data pipeline — scraping, storing in Iceberg, generating quests."
> "Nimble powers the live web intelligence — every encounter is real-time."
> "And the domain? scavenger.work. Work IS a scavenger hunt."

**2:15 — The Vision**
> "This is a real business. Charge founders $9/mo. Partner with accelerators. License to universities."
> Show XP progression, level unlock animation.

**2:45 — Close**
> "Pokémon GO made the world magical by hiding monsters in it. We hide opportunities."

---

## Judging Criteria Mapping

### Round 1 (Overall Winner)
| Criterion | How We Score |
|---|---|
| PROGRESS | Working map, live data from Nimble, Tower pipeline running, XP system functional |
| CONCEPT | "Work is a scavenger hunt" — solves real career discovery problem memorably |
| FEASIBILITY | $9/mo SaaS, B2B with accelerators/bootcamps, network effects via user encounters |

### Round 2 — Sponsor Judging

**Tower:** Show `tower apps list`, live Iceberg table with scraped opportunities, scheduled run history, quest-generator app using `tower[ai]`

**Nimble:** Show `nimble.search()` call live in terminal, structured event data returned, agentic workflow from user goal → web search → encounter placement

**name.com:** Domain name IS the product philosophy. Judges love when domain = concept. Brief name.com logo on footer + "Registered via name.com Domain Roulette"

---

## File Structure

```
scavenger-work/
├── MASTER_PLAN.md              ← this file
├── frontend/                   ← Next.js app
│   ├── app/
│   │   ├── page.tsx            ← class selection + map
│   │   ├── map/page.tsx        ← fantasy map + encounters
│   │   └── radar/page.tsx      ← AI opportunity radar
│   ├── components/
│   │   ├── FantasyMap.tsx
│   │   ├── EncounterCard.tsx
│   │   ├── QuestLog.tsx
│   │   └── ClassSelector.tsx
│   └── package.json
├── backend/                    ← FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── encounters.py
│   │   ├── quest_radar.py
│   │   └── profile.py
│   ├── services/
│   │   ├── nimble_service.py   ← all Nimble API calls
│   │   └── openai_service.py   ← GPT-4o quest generation
│   └── requirements.txt
├── tower/                      ← Tower apps
│   ├── opportunity-scraper/
│   │   ├── Towerfile
│   │   └── scraper.py          ← Nimble → Iceberg
│   └── quest-generator/
│       ├── Towerfile
│       └── generator.py        ← Iceberg → GPT-4o → quest_lines
└── docker-compose.yml          ← postgres+postgis, redis
```

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Nimble API rate limit | Cache results in Redis, use `search_depth="lite"` by default |
| Tower Iceberg slow for demo | Pre-populate Iceberg table before demo, show logs not live waits |
| Map looks generic | Apply CSS filter immediately in hour 2 — visual hook is critical |
| Demo internet unreliable | Hard-code 10 mock encounters as fallback for demo mode |
| GPT-4o slow | Stream responses, show typing animation — looks intentional |

---

## Why This Wins

1. **Most memorable concept in the room.** Every other project will be an AI dashboard or chatbot. Nobody else will have a fantasy map with rarity encounters and fog of war.

2. **Domain and product are one.** scavenger.work doesn't describe the product — it IS the product philosophy. Name.com judges will love this.

3. **Three sponsors, one coherent story.** Tower = data infrastructure, Nimble = live intelligence, name.com = brand/domain. Not bolted on — architecturally integrated.

4. **Feasibility is obvious.** $9/mo SaaS, B2B accelerator licensing, network effects. Judges can immediately see the path to a business.

5. **Emotionally resonant demo.** "There is a founder quest 700m away from you right now." That line will land in the room.
