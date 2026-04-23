"""Seed initial vocabulary data when database is created for the first time."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.word import Word
from app.schemas.word import WordCreate
from app.services.romaji import romaji_to_hiragana
from app.services.word_service import WordService

SEED_WORDS: list[dict[str, str | list[str]]] = [
    {"romaji": "sakura", "translation": "cerezo", "note": "Flor de cerezo", "categories": ["naturaleza"]},
    {"romaji": "konnichiwa", "translation": "hola", "note": "Saludo informal", "categories": ["saludos"]},
    {"romaji": "arigatou", "translation": "gracias", "note": "Forma informal", "categories": ["cortesía"]},
    {"romaji": "neko", "translation": "gato", "note": None, "categories": ["animales"]},
    {"romaji": "inu", "translation": "perro", "note": None, "categories": ["animales"]},
    {"romaji": "mizu", "translation": "agua", "note": None, "categories": ["naturaleza", "comida"]},
    {"romaji": "tabemasu", "translation": "comer", "note": "Forma educada", "categories": ["verbos", "comida"]},
]


def seed_words(db: Session) -> int:
    """Insert seed words if the table is empty. Returns count inserted."""
    exists = db.query(Word.id).first()
    if exists:
        return 0

    for item in SEED_WORDS:
        data = WordCreate(
            romaji=item["romaji"],
            translation=item["translation"],
            note=item.get("note"),
            categories=item.get("categories", []),
        )
        WordService.create(db, data)

    return len(SEED_WORDS)
