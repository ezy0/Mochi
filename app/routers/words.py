"""Word CRUD API endpoints."""
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.word import Word
from app.schemas.word import WordCreate, WordOut, WordUpdate
from app.services.romaji import romaji_to_hiragana
from app.services.tts import synthesize_japanese
from app.services.word_service import WordService

router = APIRouter(prefix="/api/words", tags=["words"])


@router.post("/", response_model=WordOut, status_code=201)
def create_word(data: WordCreate, db: Session = Depends(get_db)):
    """Add a new vocabulary word."""
    return WordService.create(db, data)


@router.get("/", response_model=list[WordOut])
def list_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all words with optional pagination."""
    return WordService.get_all(db, skip=skip, limit=limit)


@router.get("/random", response_model=WordOut)
def random_word(db: Session = Depends(get_db)):
    """Get a random word for practice."""
    word = WordService.get_random(db)
    if word is None:
        raise HTTPException(status_code=404, detail="No hay palabras disponibles. Añade algunas primero.")
    return word


@router.put("/{word_id}", response_model=WordOut)
def update_word(word_id: int, data: WordUpdate, db: Session = Depends(get_db)):
    """Update a word's details."""
    word = WordService.update(db, word_id, data)
    if word is None:
        raise HTTPException(status_code=404, detail="Palabra no encontrada.")
    return word


@router.delete("/{word_id}", status_code=204)
def delete_word(word_id: int, db: Session = Depends(get_db)):
    """Delete a word by ID."""
    if not WordService.delete(db, word_id):
        raise HTTPException(status_code=404, detail="Palabra no encontrada.")


@router.get("/hiragana/tts")
def tts_hiragana(kana: str = Query(..., min_length=1, max_length=4)):
    """Generate Japanese TTS audio for a hiragana syllable."""
    kana = kana.strip()
    if not kana:
        raise HTTPException(status_code=400, detail="Sílaba inválida.")

    audio = synthesize_japanese(kana)
    return StreamingResponse(io.BytesIO(audio), media_type="audio/mpeg")


@router.get("/{word_id}/tts")
def tts_word(word_id: int, db: Session = Depends(get_db)):
    """Generate Japanese TTS audio for a word."""
    word = db.query(Word).filter(Word.id == word_id).first()
    if word is None:
        raise HTTPException(status_code=404, detail="Palabra no encontrada.")

    audio = synthesize_japanese(word.hiragana)
    return StreamingResponse(io.BytesIO(audio), media_type="audio/mpeg")


@router.get("/export", response_class=StreamingResponse)
def export_words(db: Session = Depends(get_db)):
    """Export all words as a CSV file."""
    words = WordService.get_all(db, skip=0, limit=100000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["romaji", "translation", "note"])

    for word in words:
        writer.writerow([
            word.romaji,
            word.translation,
            word.note or "",
        ])

    output.seek(0)
    filename = "mochi_words.csv"

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/import")
async def import_words(file: UploadFile, db: Session = Depends(get_db)):
    """Import words from a CSV file."""
    if file.content_type not in {"text/csv", "application/vnd.ms-excel", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="El archivo debe ser un CSV válido.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="El CSV no tiene encabezados válidos.")

    existing = {word.hiragana for word in WordService.get_all(db, skip=0, limit=100000)}
    created = 0
    skipped = 0
    for row in reader:
        romaji = (row.get("romaji") or "").strip()
        translation = (row.get("translation") or "").strip()
        note = (row.get("note") or "").strip() or None

        if not romaji or not translation:
            continue

        hiragana = romaji_to_hiragana(romaji)
        if hiragana in existing:
            skipped += 1
            continue

        WordService.create(db, WordCreate(romaji=romaji, translation=translation, note=note))
        existing.add(hiragana)
        created += 1

    return {"imported": created, "skipped": skipped}
