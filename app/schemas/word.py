"""Pydantic schemas for Word validation and serialization."""
from datetime import datetime

from pydantic import BaseModel, Field


class WordCreate(BaseModel):
    """Schema for creating a new word."""

    romaji: str = Field(..., min_length=1, max_length=100, examples=["sakura"])
    translation: str = Field(..., min_length=1, max_length=255, examples=["cerezo"])
    note: str | None = Field(None, max_length=500, examples=["Flor de cerezo"])


class WordUpdate(BaseModel):
    """Schema for updating an existing word."""

    romaji: str | None = Field(None, min_length=1, max_length=100)
    translation: str | None = Field(None, min_length=1, max_length=255)
    note: str | None = Field(None, max_length=500)


class WordOut(BaseModel):
    """Schema for returning a word."""

    id: int
    romaji: str
    hiragana: str
    translation: str
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
