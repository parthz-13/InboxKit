from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class TileData(BaseModel):
    id: int
    row: int
    col: int
    owner_name: str | None
    owner_color: str | None
    claimed_at: datetime | None


class LeaderboardEntry(BaseModel):
    name: str
    color: str
    count: int


class UserData(BaseModel):
    session_id: str
    name: str
    color: str


class InitMessage(BaseModel):
    type: Literal["init"] = "init"
    user: UserData
    tiles: list[TileData]
    leaderboard: list[LeaderboardEntry]
    online_count: int
    match_ends_at: str
    cooldown_ms: int


class TileClaimedMessage(BaseModel):
    type: Literal["tile_claimed"] = "tile_claimed"
    tile_id: int
    row: int
    col: int
    owner_name: str
    owner_color: str
    claimed_at: datetime
    leaderboard: list[LeaderboardEntry]


class ClaimRejectedMessage(BaseModel):
    type: Literal["claim_rejected"] = "claim_rejected"
    tile_id: int
    reason: Literal["cooldown", "already_yours"]
    cooldown_remaining_ms: int | None = None


class PresenceMessage(BaseModel):
    type: Literal["presence"] = "presence"
    online_count: int


class MatchEndMessage(BaseModel):
    type: Literal["match_end"] = "match_end"
    leaderboard: list[LeaderboardEntry]


class MatchResetMessage(BaseModel):
    type: Literal["match_reset"] = "match_reset"
    match_ends_at: str
    tiles: list[TileData]


class ClaimMessage(BaseModel):
    type: Literal["claim"]
    tile_id: int


class PingMessage(BaseModel):
    type: Literal["ping"]
