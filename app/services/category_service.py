"""Business logic for category operations."""
from sqlalchemy.orm import Session

from app.models.category import Category


class CategoryService:
    """Encapsulates CRUD for categories."""

    @staticmethod
    def get_all(db: Session) -> list[Category]:
        """Return all categories ordered by name."""
        return db.query(Category).order_by(Category.name).all()

    @staticmethod
    def get_or_create(db: Session, name: str) -> Category:
        """Get an existing category by name or create it."""
        name = name.strip().lower()
        category = db.query(Category).filter(Category.name == name).first()
        if category is None:
            category = Category(name=name)
            db.add(category)
            db.flush()
        return category

    @staticmethod
    def get_by_names(db: Session, names: list[str]) -> list[Category]:
        """Return categories whose names are in the given list."""
        normalized = [n.strip().lower() for n in names if n.strip()]
        if not normalized:
            return []
        return db.query(Category).filter(Category.name.in_(normalized)).all()
