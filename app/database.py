"""Database engine, session, and base model configuration."""
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import BASE_DIR, DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all models."""
    pass


def get_db():
    """Dependency that yields a database session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables (idempotent)."""
    db_path = Path(BASE_DIR / "mochi.db")
    is_new_db = not db_path.exists()

    Base.metadata.create_all(bind=engine)

    if is_new_db:
        from seed import seed_words

        with SessionLocal() as db:
            seed_words(db)
