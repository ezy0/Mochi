"""Category API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.category import CategoryOut
from app.services.category_service import CategoryService

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """List all available categories."""
    return CategoryService.get_all(db)
