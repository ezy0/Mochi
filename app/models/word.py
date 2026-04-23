"""Word model — stores vocabulary entries."""
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.category import word_categories


class Word(Base):
    """A vocabulary entry with romaji, hiragana, translation, and optional note."""

    __tablename__ = "words"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    romaji: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    hiragana: Mapped[str] = mapped_column(String(100), nullable=False)
    translation: Mapped[str] = mapped_column(String(255), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    categories: Mapped[list["Category"]] = relationship(
        "Category",
        secondary=word_categories,
        back_populates="words",
    )

    def __repr__(self) -> str:
        return f"<Word {self.romaji} → {self.hiragana} ({self.translation})>"
