"""Text-to-Speech (TTS) utilities for Japanese audio."""
from __future__ import annotations

import io
from functools import lru_cache

from gtts import gTTS


def _normalize_tts_text(text: str) -> str:
    return text.strip().lower()


@lru_cache(maxsize=512)
def _synthesize_cached(text: str) -> bytes:
    tts = gTTS(text=text, lang="ja", slow=False)
    buffer = io.BytesIO()
    tts.write_to_fp(buffer)
    buffer.seek(0)
    return buffer.read()


def synthesize_japanese(text: str) -> bytes:
    """Return MP3 bytes for a Japanese text string."""
    normalized = _normalize_tts_text(text)
    return _synthesize_cached(normalized)
