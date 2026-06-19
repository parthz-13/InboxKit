import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False)
    tiles_claimed: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tiles: Mapped[list["Tile"]] = relationship("Tile", back_populates="owner")

    __table_args__ = (
        Index("idx_users_leaderboard", "tiles_claimed"),
    )


class Tile(Base):
    __tablename__ = "tiles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    row: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    col: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    owner_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped["User | None"] = relationship("User", back_populates="tiles")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
