"""Business logic for word operations."""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.word import Word
from app.schemas.word import WordCreate, WordUpdate
from app.services.category_service import CategoryService
from app.services.romaji import romaji_to_hiragana


class WordService:
    """Encapsulates CRUD and practice operations for words."""

    @staticmethod
    def create(db: Session, data: WordCreate) -> Word:
        """Add a new word, auto-generating hiragana from romaji."""
        word = Word(
            romaji=data.romaji.strip().lower(),
            hiragana=romaji_to_hiragana(data.romaji),
            translation=data.translation.strip(),
            note=data.note.strip() if data.note else None,
        )
        db.add(word)
        db.flush()

        if data.categories:
            categories = [CategoryService.get_or_create(db, name) for name in data.categories]
            word.categories = categories

        db.commit()
        db.refresh(word)
        return word

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, category: str | None = None) -> list[Word]:
        """Return all words with optional pagination and category filter."""
        query = db.query(Word)
        if category:
            query = query.join(Word.categories).filter(Word.categories.any(name=category.strip().lower()))
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_random(db: Session, categories: list[str] | None = None) -> Word | None:
        """Return a single random word, optionally filtered by categories."""
        query = db.query(Word)
        if categories:
            normalized = [c.strip().lower() for c in categories if c.strip()]
            if normalized:
                query = query.join(Word.categories).filter(
                    Category.name.in_(normalized)
                )
        return query.order_by(func.random()).first()

    @staticmethod
    def count(db: Session) -> int:
        """Return total number of words."""
        return db.query(func.count(Word.id)).scalar() or 0

    @staticmethod
    def update(db: Session, word_id: int, data: WordUpdate) -> Word | None:
        """Update a word by ID."""
        word = db.query(Word).filter(Word.id == word_id).first()
        if word is None:
            return None

        update_data = data.model_dump(exclude_unset=True)

        if "romaji" in update_data:
            word.romaji = update_data["romaji"].strip().lower()
            word.hiragana = romaji_to_hiragana(word.romaji)

        if "translation" in update_data:
            word.translation = update_data["translation"].strip()

        if "note" in update_data:
            word.note = update_data["note"].strip() if update_data["note"] else None

        if "categories" in update_data and update_data["categories"] is not None:
            categories = [CategoryService.get_or_create(db, name) for name in update_data["categories"]]
            word.categories = categories

        db.commit()
        db.refresh(word)
        return word

    @staticmethod
    def delete(db: Session, word_id: int) -> bool:
        """Delete a word by ID. Returns True if deleted."""
        word = db.query(Word).filter(Word.id == word_id).first()
        if word is None:
            return False
        db.delete(word)
        db.commit()
        return True
