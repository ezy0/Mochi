"""Pydantic schemas for Category validation and serialization."""
from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    """Schema for returning a category."""

    id: int
    name: str = Field(..., min_length=1, max_length=50)

    model_config = {"from_attributes": True}
