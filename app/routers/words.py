"""Word CRUD API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.word import WordCreate, WordOut, WordUpdate
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
