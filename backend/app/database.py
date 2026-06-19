from datetime import datetime, timezone, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.models import Base, Match, Tile

GRID_SIZE = 40
TOTAL_TILES = GRID_SIZE * GRID_SIZE

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    connect_args={"statement_cache_size": 0},
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        count = await session.scalar(select(func.count()).select_from(Tile))
        if count == 0:
            tiles = [
                Tile(id=row * GRID_SIZE + col, row=row, col=col)
                for row in range(GRID_SIZE)
                for col in range(GRID_SIZE)
            ]
            session.add_all(tiles)

        active = await session.scalar(select(Match).where(Match.is_active == True))
        if active is None:
            now = datetime.now(timezone.utc)
            match = Match(
                started_at=now,
                ends_at=now + timedelta(seconds=settings.match_duration_seconds),
                is_active=True,
            )
            session.add(match)

        await session.commit()


async def get_active_match() -> Match | None:
    async with AsyncSessionLocal() as session:
        return await session.scalar(select(Match).where(Match.is_active == True))
