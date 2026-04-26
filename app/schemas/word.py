"""Pydantic schemas for Word validation and serialization."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class WordCreate(BaseModel):
    """Schema for creating a new word."""

    romaji: str = Field(..., min_length=1, max_length=100, examples=["sakura"])
    translation: str = Field(..., min_length=1, max_length=255, examples=["cerezo"])
    note: str | None = Field(None, max_length=500, examples=["Flor de cerezo"])
    categories: list[str] = Field(default_factory=list, examples=[["naturaleza"]])
    script: Literal["hiragana", "katakana"] = Field("hiragana", examples=["hiragana"])


class WordUpdate(BaseModel):
    """Schema for updating an existing word."""

    romaji: str | None = Field(None, min_length=1, max_length=100)
    translation: str | None = Field(None, min_length=1, max_length=255)
    note: str | None = Field(None, max_length=500)
    categories: list[str] | None = Field(None)
    script: Literal["hiragana", "katakana"] | None = Field(None)


class WordOut(BaseModel):
    """Schema for returning a word."""

    id: int
    romaji: str
    hiragana: str
    translation: str
    note: str | None
    categories: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("categories", mode="before")
    @classmethod
    def _extract_category_names(cls, v):
        if v and isinstance(v, list):
            return [getattr(item, "name", item) for item in v]
        return v or []
