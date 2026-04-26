"""Page-serving routes (HTML templates)."""
from fastapi import APIRouter, Depends, Request
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.word_service import WordService

router = APIRouter(tags=["pages"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/")
def home(request: Request, db: Session = Depends(get_db)):
    """Landing / home page."""
    count = WordService.count(db)
    return templates.TemplateResponse("index.html", {"request": request, "word_count": count})


@router.get("/katakana")
def katakana_home(request: Request, db: Session = Depends(get_db)):
    """Katakana practice page."""
    count = WordService.count(db)
    return templates.TemplateResponse("katakana.html", {"request": request, "word_count": count})


@router.get("/add")
def add_word_page(request: Request):
    """Form to add a new word."""
    return templates.TemplateResponse("add_word.html", {"request": request})


