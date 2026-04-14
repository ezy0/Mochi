"""Text-to-Speech (TTS) utilities for Japanese audio."""
from __future__ import annotations

import io

from gtts import gTTS


def synthesize_japanese(text: str) -> bytes:
    """Return MP3 bytes for a Japanese text string."""
    tts = gTTS(text=text, lang="ja", slow=False)
    buffer = io.BytesIO()
    tts.write_to_fp(buffer)
    buffer.seek(0)
    return buffer.read()
