"""Romaji → Hiragana conversion.

Uses a greedy longest-match algorithm over a mapping table.
Handles digraphs (sha, chi, tsu …) and long vowels correctly.
"""

# Ordered from longest to shortest so the greedy matcher works.
_ROMAJI_MAP: list[tuple[str, str]] = [
    # Four-character combinations
    ("xtsu", "っ"),
    # Three-character combinations (digraphs with y-row)
    ("sha", "しゃ"), ("shi", "し"), ("shu", "しゅ"), ("sho", "しょ"),
    ("chi", "ち"), ("tsu", "つ"),
    ("cha", "ちゃ"), ("chu", "ちゅ"), ("cho", "ちょ"),
    ("tya", "ちゃ"), ("tyi", "ちぃ"), ("tyu", "ちゅ"), ("tye", "ちぇ"), ("tyo", "ちょ"),
    ("nya", "にゃ"), ("nyi", "にぃ"), ("nyu", "にゅ"), ("nye", "にぇ"), ("nyo", "にょ"),
    ("hya", "ひゃ"), ("hyi", "ひぃ"), ("hyu", "ひゅ"), ("hye", "ひぇ"), ("hyo", "ひょ"),
    ("mya", "みゃ"), ("myi", "みぃ"), ("myu", "みゅ"), ("mye", "みぇ"), ("myo", "みょ"),
    ("rya", "りゃ"), ("ryi", "りぃ"), ("ryu", "りゅ"), ("rye", "りぇ"), ("ryo", "りょ"),
    ("kya", "きゃ"), ("kyi", "きぃ"), ("kyu", "きゅ"), ("kye", "きぇ"), ("kyo", "きょ"),
    ("gya", "ぎゃ"), ("gyi", "ぎぃ"), ("gyu", "ぎゅ"), ("gye", "ぎぇ"), ("gyo", "ぎょ"),
    ("bya", "びゃ"), ("byi", "びぃ"), ("byu", "びゅ"), ("bye", "びぇ"), ("byo", "びょ"),
    ("pya", "ぴゃ"), ("pyi", "ぴぃ"), ("pyu", "ぴゅ"), ("pye", "ぴぇ"), ("pyo", "ぴょ"),
    ("jya", "じゃ"), ("jyi", "じぃ"), ("jyu", "じゅ"), ("jye", "じぇ"), ("jyo", "じょ"),
    ("dya", "ぢゃ"), ("dyi", "ぢぃ"), ("dyu", "ぢゅ"), ("dye", "ぢぇ"), ("dyo", "ぢょ"),
    # Two-character combinations
    ("ka", "か"), ("ki", "き"), ("ku", "く"), ("ke", "け"), ("ko", "こ"),
    ("sa", "さ"), ("si", "し"), ("su", "す"), ("se", "せ"), ("so", "そ"),
    ("ta", "た"), ("ti", "ち"), ("tu", "つ"), ("te", "て"), ("to", "と"),
    ("na", "な"), ("ni", "に"), ("nu", "ぬ"), ("ne", "ね"), ("no", "の"),
    ("ha", "は"), ("hi", "ひ"), ("hu", "ふ"), ("he", "へ"), ("ho", "ほ"),
    ("ma", "ま"), ("mi", "み"), ("mu", "む"), ("me", "め"), ("mo", "も"),
    ("ra", "ら"), ("ri", "り"), ("ru", "る"), ("re", "れ"), ("ro", "ろ"),
    ("ya", "や"), ("yi", "い"), ("yu", "ゆ"), ("ye", "いぇ"), ("yo", "よ"),
    ("wa", "わ"), ("wi", "ゐ"), ("we", "ゑ"), ("wo", "を"),
    ("ga", "が"), ("gi", "ぎ"), ("gu", "ぐ"), ("ge", "げ"), ("go", "ご"),
    ("za", "ざ"), ("zi", "じ"), ("zu", "ず"), ("ze", "ぜ"), ("zo", "ぞ"),
    ("da", "だ"), ("di", "ぢ"), ("du", "づ"), ("de", "で"), ("do", "ど"),
    ("ba", "ば"), ("bi", "び"), ("bu", "ぶ"), ("be", "べ"), ("bo", "ぼ"),
    ("pa", "ぱ"), ("pi", "ぴ"), ("pu", "ぷ"), ("pe", "ぺ"), ("po", "ぽ"),
    ("fa", "ふぁ"), ("fi", "ふぃ"), ("fu", "ふ"), ("fe", "ふぇ"), ("fo", "ふぉ"),
    ("ja", "じゃ"), ("ji", "じ"), ("ju", "じゅ"), ("je", "じぇ"), ("jo", "じょ"),
    # Single vowels
    ("a", "あ"), ("i", "い"), ("u", "う"), ("e", "え"), ("o", "お"),
    # N before consonant or end of string
    ("n", "ん"),
    # Small tsu (っ) — geminate consonants handled below
]

# Build a dict for quick lookup and find max key length.
_MAP_DICT: dict[str, str] = {k: v for k, v in _ROMAJI_MAP}
_MAX_LEN = max(len(k) for k in _MAP_DICT)

# Consonants that trigger gemination (っ) when doubled.
_GEMINATE_CONSONANTS = set("bcdfghjklmpqrstvwxyz")


def romaji_to_hiragana(text: str) -> str:
    """Convert a romaji string to hiragana.

    Examples
    --------
    >>> romaji_to_hiragana("sakura")
    'さくら'
    >>> romaji_to_hiragana("konnichiwa")
    'こんにちわ'
    >>> romaji_to_hiragana("gakkou")
    'がっこう'
    """
    text = text.lower().strip()
    result: list[str] = []
    i = 0
    length = len(text)

    while i < length:
        # --- Geminate consonant (っ): same consonant repeated ---
        if (
            i + 1 < length
            and text[i] == text[i + 1]
            and text[i] in _GEMINATE_CONSONANTS
        ):
            result.append("っ")
            i += 1  # skip one of the pair, next iteration will consume the syllable
            continue

        # --- 'n' before a consonant (not 'y') or end → ん ---
        if text[i] == "n" and i + 1 < length:
            next_ch = text[i + 1]
            if next_ch not in "aiueoy" and next_ch != "n":
                result.append("ん")
                i += 1
                continue

        # --- Greedy longest match ---
        matched = False
        for size in range(min(_MAX_LEN, length - i), 0, -1):
            chunk = text[i : i + size]
            if chunk in _MAP_DICT:
                result.append(_MAP_DICT[chunk])
                i += size
                matched = True
                break

        if not matched:
            # Keep unrecognised characters as-is (spaces, punctuation, etc.)
            result.append(text[i])
            i += 1

    return "".join(result)
