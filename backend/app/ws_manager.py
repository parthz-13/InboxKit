import time

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, WebSocket] = {}
        self.cooldowns: dict[str, float] = {}

    async def connect(self, session_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self.active[session_id] = ws

    def _evict(self, session_id: str, ws: WebSocket) -> None:
        if self.active.get(session_id) is ws:
            self.active.pop(session_id, None)

    async def disconnect(self, session_id: str, ws: WebSocket) -> None:
        self._evict(session_id, ws)

    @property
    def online_count(self) -> int:
        return len(self.active)

    def check_cooldown(self, session_id: str, cooldown_seconds: int) -> tuple[bool, int]:
        last = self.cooldowns.get(session_id, 0.0)
        elapsed = time.monotonic() - last
        if elapsed < cooldown_seconds:
            remaining_ms = int((cooldown_seconds - elapsed) * 1000)
            return False, remaining_ms
        return True, 0

    def record_claim(self, session_id: str) -> None:
        self.cooldowns[session_id] = time.monotonic()

    async def send_personal(self, session_id: str, data: dict) -> None:
        ws = self.active.get(session_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception:
                self._evict(session_id, ws)

    async def broadcast(self, data: dict) -> None:
        dead: list[tuple[str, WebSocket]] = []
        for sid, ws in list(self.active.items()):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append((sid, ws))
        for sid, ws in dead:
            self._evict(sid, ws)


manager = ConnectionManager()
