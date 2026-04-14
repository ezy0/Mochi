"""Seed initial vocabulary data when database is created for the first time."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.word import Word
from app.services.romaji import romaji_to_hiragana

SEED_WORDS: list[dict[str, str]] = [
    {"romaji": "sakura", "translation": "cerezo", "note": "Flor de cerezo"},
    {"romaji": "konnichiwa", "translation": "hola", "note": "Saludo informal"},
    {"romaji": "arigatou", "translation": "gracias", "note": "Forma informal"},
    {"romaji": "neko", "translation": "gato", "note": None},
    {"romaji": "inu", "translation": "perro", "note": None},
    {"romaji": "mizu", "translation": "agua", "note": None},
    {"romaji": "tabemasu", "translation": "comer", "note": "Forma educada"},
]


def seed_words(db: Session) -> int:
    """Insert seed words if the table is empty. Returns count inserted."""
    exists = db.query(Word.id).first()
    if exists:
        return 0

    words: list[Word] = []
    for item in SEED_WORDS:
        romaji = item["romaji"].strip().lower()
        words.append(
            Word(
                romaji=romaji,
                hiragana=romaji_to_hiragana(romaji),
                translation=item["translation"].strip(),
                note=item["note"].strip() if item["note"] else None,
            )
        )

    db.add_all(words)
    db.commit()
    return len(words)
