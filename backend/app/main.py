from __future__ import annotations

import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update

from app.config import settings
from app.database import AsyncSessionLocal, get_active_match, init_db
from app.models import Match, Tile, User
from app.schemas import (
    ClaimRejectedMessage,
    InitMessage,
    LeaderboardEntry,
    MatchEndMessage,
    MatchResetMessage,
    PresenceMessage,
    TileClaimedMessage,
    TileData,
    UserData,
)
from app.ws_manager import manager

GRID_SIZE = 40
TOTAL_TILES = GRID_SIZE * GRID_SIZE


async def _get_leaderboard(session) -> list[LeaderboardEntry]:
    result = await session.execute(
        select(User.name, User.color, User.tiles_claimed)
        .where(User.tiles_claimed > 0)
        .order_by(User.tiles_claimed.desc())
        .limit(10)
    )
    return [LeaderboardEntry(name=r.name, color=r.color, count=r.tiles_claimed) for r in result]


async def _all_tiles_data(session) -> list[TileData]:
    result = await session.execute(select(Tile).order_by(Tile.id))
    return [
        TileData(id=t.id, row=t.row, col=t.col,
                 owner_name=t.owner_name, owner_color=t.owner_color, claimed_at=t.claimed_at)
        for t in result.scalars().all()
    ]


_server_empty_event: asyncio.Event


async def _reset_board_and_new_match() -> None:
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(Tile).values(owner_id=None, owner_name=None, owner_color=None, claimed_at=None)
        )
        await session.execute(update(User).values(tiles_claimed=0))
        await session.execute(update(Match).values(is_active=False))

        now = datetime.now(timezone.utc)
        new_ends_at = now + timedelta(seconds=settings.match_duration_seconds)
        new_match = Match(started_at=now, ends_at=new_ends_at, is_active=True)
        session.add(new_match)
        await session.commit()


async def match_loop() -> None:
    while True:
        match = await get_active_match()

        if match is None:
            async with AsyncSessionLocal() as session:
                now = datetime.now(timezone.utc)
                new_match = Match(
                    started_at=now,
                    ends_at=now + timedelta(seconds=settings.match_duration_seconds),
                    is_active=True,
                )
                session.add(new_match)
                await session.commit()
            continue

        now = datetime.now(timezone.utc)
        remaining = (match.ends_at - now).total_seconds()
        if remaining > 0:
            _server_empty_event.clear()
            sleep_task = asyncio.create_task(asyncio.sleep(remaining))
            empty_task = asyncio.create_task(_server_empty_event.wait())
            done, pending = await asyncio.wait(
                [sleep_task, empty_task],
                return_when=asyncio.FIRST_COMPLETED,
            )
            for t in pending:
                t.cancel()

        if manager.online_count == 0:
            await _reset_board_and_new_match()
            continue

        async with AsyncSessionLocal() as session:
            leaderboard = await _get_leaderboard(session)

        await manager.broadcast(MatchEndMessage(leaderboard=leaderboard).model_dump(mode="json"))

        await asyncio.sleep(settings.between_match_seconds)

        async with AsyncSessionLocal() as session:
            await session.execute(
                update(Tile).values(owner_id=None, owner_name=None, owner_color=None, claimed_at=None)
            )
            await session.execute(update(User).values(tiles_claimed=0))
            await session.execute(update(Match).values(is_active=False))

            now = datetime.now(timezone.utc)
            new_ends_at = now + timedelta(seconds=settings.match_duration_seconds)
            new_match = Match(started_at=now, ends_at=new_ends_at, is_active=True)
            session.add(new_match)
            await session.flush()

            tiles = await _all_tiles_data(session)
            await session.commit()

        reset_msg = MatchResetMessage(
            match_ends_at=new_ends_at.isoformat(),
            tiles=tiles,
        )
        await manager.broadcast(reset_msg.model_dump(mode="json"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _server_empty_event
    _server_empty_event = asyncio.Event()
    await init_db()
    task = asyncio.create_task(match_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    name: str = Query(default="Anonymous"),
    color: str = Query(default="#6c757d"),
):
    await manager.connect(session_id, websocket)

    async with AsyncSessionLocal() as session:
        user = await session.scalar(select(User).where(User.session_id == session_id))
        if user is None:
            user = User(session_id=session_id, name=name, color=color)
            session.add(user)
            await session.flush()
        else:
            user.name = name
            user.color = color
            user.last_seen = datetime.now(timezone.utc)

        tiles = await _all_tiles_data(session)
        leaderboard = await _get_leaderboard(session)
        await session.commit()

    match = await get_active_match()
    match_ends_at = match.ends_at.isoformat() if match else datetime.now(timezone.utc).isoformat()

    init_msg = InitMessage(
        user=UserData(session_id=session_id, name=user.name, color=user.color),
        tiles=tiles,
        leaderboard=leaderboard,
        online_count=manager.online_count,
        match_ends_at=match_ends_at,
        cooldown_ms=settings.cooldown_seconds * 1000,
    )
    await manager.send_personal(session_id, init_msg.model_dump(mode="json"))

    presence_msg = PresenceMessage(online_count=manager.online_count)
    await manager.broadcast(presence_msg.model_dump())

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await manager.send_personal(session_id, {"type": "pong"})
                continue

            if msg_type != "claim":
                continue

            tile_id = data.get("tile_id")
            if not isinstance(tile_id, int) or not (0 <= tile_id < TOTAL_TILES):
                continue

            allowed, remaining_ms = manager.check_cooldown(session_id, settings.cooldown_seconds)
            if not allowed:
                reject = ClaimRejectedMessage(
                    tile_id=tile_id, reason="cooldown", cooldown_remaining_ms=remaining_ms
                )
                await manager.send_personal(session_id, reject.model_dump())
                continue

            async with AsyncSessionLocal() as session:
                tile = await session.get(Tile, tile_id)
                if tile is None:
                    continue

                claimant = await session.scalar(select(User).where(User.session_id == session_id))
                if claimant is None:
                    continue

                if tile.owner_id == claimant.id:
                    reject = ClaimRejectedMessage(tile_id=tile_id, reason="already_yours")
                    await manager.send_personal(session_id, reject.model_dump())
                    continue

                prev_owner_id = tile.owner_id
                now = datetime.now(timezone.utc)
                tile.owner_id = claimant.id
                tile.owner_name = claimant.name
                tile.owner_color = claimant.color
                tile.claimed_at = now

                await session.execute(
                    update(User).where(User.id == claimant.id).values(tiles_claimed=User.tiles_claimed + 1)
                )
                if prev_owner_id is not None:
                    await session.execute(
                        update(User)
                        .where(User.id == prev_owner_id)
                        .values(tiles_claimed=User.tiles_claimed - 1)
                    )

                leaderboard = await _get_leaderboard(session)
                await session.commit()

            manager.record_claim(session_id)

            claimed_msg = TileClaimedMessage(
                tile_id=tile_id,
                row=tile.row,
                col=tile.col,
                owner_name=claimant.name,
                owner_color=claimant.color,
                claimed_at=now,
                leaderboard=leaderboard,
            )
            await manager.broadcast(claimed_msg.model_dump(mode="json"))

    except (WebSocketDisconnect, RuntimeError):
        await manager.disconnect(session_id, websocket)
        if manager.online_count == 0:
            _server_empty_event.set()
        else:
            presence_msg = PresenceMessage(online_count=manager.online_count)
            await manager.broadcast(presence_msg.model_dump())
