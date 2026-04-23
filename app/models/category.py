"""Category model and association table."""
from sqlalchemy import Table, Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Many-to-many association table between words and categories
word_categories = Table(
    "word_categories",
    Base.metadata,
    Column("word_id", Integer, ForeignKey("words.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)


class Category(Base):
    """A category tag for vocabulary words."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)

    # Relationship back to words
    words: Mapped[list["Word"]] = relationship(
        "Word",
        secondary=word_categories,
        back_populates="categories",
    )

    def __repr__(self) -> str:
        return f"<Category {self.name}>"
