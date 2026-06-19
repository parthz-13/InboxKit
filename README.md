# Gridy

A real-time multiplayer tile-claiming game. Players compete on a 40×40 grid, claiming tiles to hold the most territory before the match timer runs out.

![Game Preview](frontend/src/assets/hero.png)

## How it works

- Every player gets a unique color and joins the same live session
- Click any tile to claim it — tiles you already own can't be claimed again
- A 3-second cooldown applies between claims, so placement matters
- The live leaderboard updates instantly as tiles change hands
- Matches run for 10 minutes, then the board resets and a new match starts
- If the server empties mid-match, the board resets immediately when the next player joins

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — async Python web framework
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/) — async ORM
- [PostgreSQL](https://www.postgresql.org/) via [asyncpg](https://github.com/MagicStack/asyncpg)
- [Pydantic](https://docs.pydantic.dev/) — schema validation for WebSocket messages
- [uv](https://github.com/astral-sh/uv) — Python package manager

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Zustand](https://zustand-demo.pmnd.rs/) — global state
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Framer Motion](https://www.framer.com/motion/) — tile claim animations
- [lucide-react](https://lucide.dev/) — icons

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── config.py        # Settings loaded from .env
│   │   ├── models.py        # SQLAlchemy models (User, Tile, Match)
│   │   ├── database.py      # Engine, session factory, DB init
│   │   ├── schemas.py       # Pydantic schemas for WS messages
│   │   ├── ws_manager.py    # WebSocket connection + cooldown manager
│   │   └── main.py          # FastAPI app, routes, match loop
│   └── pyproject.toml
│
└── frontend/
    ├── src/
    │   ├── components/      # UI components
    │   ├── hooks/           # useWebSocket
    │   ├── store/           # Zustand grid store
    │   ├── lib/             # Session helpers
    │   ├── types.ts
    │   └── App.tsx
    └── vite.config.ts
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A PostgreSQL database (local or hosted — [Neon](https://neon.tech) works out of the box)

### Backend

```bash
cd backend

# Install uv if you don't have it
pip install uv

# Create virtualenv and install deps
uv sync

# Create .env file
cp .env.example .env
# Set DATABASE_URL=postgresql+asyncpg://user:password@host/dbname

# Run the server
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env file (optional — only needed for production WS URL)
# VITE_WS_URL=wss://your-backend.com

npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/ws` to `localhost:8000` automatically.

## Environment Variables

**Backend (`backend/.env`)**

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed origins |
| `COOLDOWN_SECONDS` | `3` | Seconds between tile claims per player |
| `MATCH_DURATION_SECONDS` | `600` | Length of each match in seconds |
| `BETWEEN_MATCH_SECONDS` | `5` | Pause between match end and board reset |

**Frontend (`frontend/.env`)**

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `` (empty) | WebSocket base URL — leave empty to use the Vite proxy in dev |

## WebSocket Protocol

All communication happens over a single WebSocket connection per player at `/ws/{session_id}`.

**Server → Client**

| Message | Description |
|---|---|
| `init` | Full board state, leaderboard, match timer, and cooldown on connect |
| `tile_claimed` | A tile changed owner — includes updated leaderboard |
| `claim_rejected` | Claim denied (`cooldown` or `already_yours`) |
| `presence` | Current online player count |
| `match_end` | Match finished — final leaderboard |
| `match_reset` | New match started — fresh board and new timer |

**Client → Server**

| Message | Description |
|---|---|
| `claim` | Claim a tile by `tile_id` |
| `ping` | Keepalive — server responds with `pong` |
