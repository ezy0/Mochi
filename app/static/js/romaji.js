/**
 * romaji.js — Client-side romaji → hiragana conversion (real-time).
 *
 * Mirrors the backend Python implementation for instant feedback
 * without network round-trips.
 */

const ROMAJI_MAP = [
    // Four-char
    ["xtsu", "っ"],
    // Three-char digraphs
    ["sha", "しゃ"], ["shi", "し"], ["shu", "しゅ"], ["sho", "しょ"],
    ["chi", "ち"], ["tsu", "つ"],
    ["cha", "ちゃ"], ["chu", "ちゅ"], ["cho", "ちょ"],
    ["tya", "ちゃ"], ["tyi", "ちぃ"], ["tyu", "ちゅ"], ["tye", "ちぇ"], ["tyo", "ちょ"],
    ["nya", "にゃ"], ["nyi", "にぃ"], ["nyu", "にゅ"], ["nye", "にぇ"], ["nyo", "にょ"],
    ["hya", "ひゃ"], ["hyi", "ひぃ"], ["hyu", "ひゅ"], ["hye", "ひぇ"], ["hyo", "ひょ"],
    ["mya", "みゃ"], ["myi", "みぃ"], ["myu", "みゅ"], ["mye", "みぇ"], ["myo", "みょ"],
    ["rya", "りゃ"], ["ryi", "りぃ"], ["ryu", "りゅ"], ["rye", "りぇ"], ["ryo", "りょ"],
    ["kya", "きゃ"], ["kyi", "きぃ"], ["kyu", "きゅ"], ["kye", "きぇ"], ["kyo", "きょ"],
    ["gya", "ぎゃ"], ["gyi", "ぎぃ"], ["gyu", "ぎゅ"], ["gye", "ぎぇ"], ["gyo", "ぎょ"],
    ["bya", "びゃ"], ["byi", "びぃ"], ["byu", "びゅ"], ["bye", "びぇ"], ["byo", "びょ"],
    ["pya", "ぴゃ"], ["pyi", "ぴぃ"], ["pyu", "ぴゅ"], ["pye", "ぴぇ"], ["pyo", "ぴょ"],
    ["jya", "じゃ"], ["jyi", "じぃ"], ["jyu", "じゅ"], ["jye", "じぇ"], ["jyo", "じょ"],
    ["dya", "ぢゃ"], ["dyi", "ぢぃ"], ["dyu", "ぢゅ"], ["dye", "ぢぇ"], ["dyo", "ぢょ"],
    // Two-char
    ["ka", "か"], ["ki", "き"], ["ku", "く"], ["ke", "け"], ["ko", "こ"],
    ["sa", "さ"], ["si", "し"], ["su", "す"], ["se", "せ"], ["so", "そ"],
    ["ta", "た"], ["ti", "ち"], ["tu", "つ"], ["te", "て"], ["to", "と"],
    ["na", "な"], ["ni", "に"], ["nu", "ぬ"], ["ne", "ね"], ["no", "の"],
    ["ha", "は"], ["hi", "ひ"], ["hu", "ふ"], ["he", "へ"], ["ho", "ほ"],
    ["ma", "ま"], ["mi", "み"], ["mu", "む"], ["me", "め"], ["mo", "も"],
    ["ra", "ら"], ["ri", "り"], ["ru", "る"], ["re", "れ"], ["ro", "ろ"],
    ["ya", "や"], ["yi", "い"], ["yu", "ゆ"], ["ye", "いぇ"], ["yo", "よ"],
    ["wa", "わ"], ["wi", "ゐ"], ["we", "ゑ"], ["wo", "を"],
    ["ga", "が"], ["gi", "ぎ"], ["gu", "ぐ"], ["ge", "げ"], ["go", "ご"],
    ["za", "ざ"], ["zi", "じ"], ["zu", "ず"], ["ze", "ぜ"], ["zo", "ぞ"],
    ["da", "だ"], ["di", "ぢ"], ["du", "づ"], ["de", "で"], ["do", "ど"],
    ["ba", "ば"], ["bi", "び"], ["bu", "ぶ"], ["be", "べ"], ["bo", "ぼ"],
    ["pa", "ぱ"], ["pi", "ぴ"], ["pu", "ぷ"], ["pe", "ぺ"], ["po", "ぽ"],
    ["fa", "ふぁ"], ["fi", "ふぃ"], ["fu", "ふ"], ["fe", "ふぇ"], ["fo", "ふぉ"],
    ["ja", "じゃ"], ["ji", "じ"], ["ju", "じゅ"], ["je", "じぇ"], ["jo", "じょ"],
    // Single vowels
    ["a", "あ"], ["i", "い"], ["u", "う"], ["e", "え"], ["o", "お"],
    // N
    ["n", "ん"],
];

const MAP_DICT = Object.fromEntries(ROMAJI_MAP);
const MAX_LEN = Math.max(...ROMAJI_MAP.map(([k]) => k.length));
const GEMINATE = new Set("bcdfghjklmpqrstvwxyz");

/**
 * Convert a romaji string to hiragana.
 * @param {string} text
 * @returns {string}
 */
function romajiToHiragana(text) {
    text = text.toLowerCase().trim();
    const result = [];
    let i = 0;
    const IGNORE_CHARS = new Set([" ", "'", "-"]);

    while (i < text.length) {
        if (IGNORE_CHARS.has(text[i])) {
            i++;
            continue;
        }
        // Geminate consonant → っ
        if (
            i + 1 < text.length &&
            text[i] === text[i + 1] &&
            GEMINATE.has(text[i])
        ) {
            result.push("っ");
            i++;
            continue;
        }

        // n before consonant (not y) → ん
        if (text[i] === "n" && i + 1 < text.length) {
            const next = text[i + 1];
            if (!"aiueoy".includes(next) && next !== "n") {
                result.push("ん");
                i++;
                continue;
            }
        }

        // Greedy longest match
        let matched = false;
        for (let size = Math.min(MAX_LEN, text.length - i); size > 0; size--) {
            const chunk = text.substring(i, i + size);
            if (MAP_DICT[chunk] !== undefined) {
                result.push(MAP_DICT[chunk]);
                i += size;
                matched = true;
                break;
            }
        }

        if (!matched) {
            result.push(text[i]);
            i++;
        }
    }

    return result.join("");
}

/**
 * Map hiragana characters to their inherent vowel (a/i/u/e/o).
 */
const HIRAGANA_VOWEL_MAP = {
    "あ":"a","い":"i","う":"u","え":"e","お":"o",
    "か":"a","き":"i","く":"u","け":"e","こ":"o",
    "が":"a","ぎ":"i","ぐ":"u","げ":"e","ご":"o",
    "さ":"a","し":"i","す":"u","せ":"e","そ":"o",
    "ざ":"a","じ":"i","ず":"u","ぜ":"e","ぞ":"o",
    "た":"a","ち":"i","つ":"u","て":"e","と":"o",
    "だ":"a","ぢ":"i","づ":"u","で":"e","ど":"o",
    "な":"a","に":"i","ぬ":"u","ね":"e","の":"o",
    "は":"a","ひ":"i","ふ":"u","へ":"e","ほ":"o",
    "ば":"a","び":"i","ぶ":"u","べ":"e","ぼ":"o",
    "ぱ":"a","ぴ":"i","ぷ":"u","ぺ":"e","ぽ":"o",
    "ま":"a","み":"i","む":"u","め":"e","も":"o",
    "や":"a","ゆ":"u","よ":"o",
    "ら":"a","り":"i","る":"u","れ":"e","ろ":"o",
    "わ":"a","ゐ":"i","ゑ":"e","を":"o",
    "ゃ":"a","ゅ":"u","ょ":"o",
    "ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o",
};

const HIRAGANA_VOWELS = {"あ":"a","い":"i","う":"u","え":"e","お":"o"};

/**
 * Convert hiragana text to katakana.
 * Long vowels are replaced with ー (chōon mark) as is standard in katakana.
 * @param {string} text
 * @returns {string}
 */
function hiraganaToKatakana(text) {
    const result = [];
    let prevVowel = null;

    for (const ch of text) {
        const code = ch.charCodeAt(0);

        if (HIRAGANA_VOWELS[ch] !== undefined) {
            const vowel = HIRAGANA_VOWELS[ch];
            if (prevVowel === vowel) {
                // This vowel extends the previous syllable → use chōon
                result.push("ー");
                // prevVowel stays the same
            } else {
                // Standalone vowel starting a new syllable
                result.push(String.fromCharCode(code + 0x60));
                prevVowel = vowel;
            }
        } else if (code >= 0x3041 && code <= 0x3096) {
            // Regular hiragana → convert to katakana
            result.push(String.fromCharCode(code + 0x60));
            prevVowel = HIRAGANA_VOWEL_MAP[ch] || null;
        } else {
            // Non-hiragana character
            result.push(ch);
            prevVowel = null;
        }
    }

    return result.join("");
}

const VOWEL_TO_HIRAGANA = {"a":"あ","i":"い","u":"う","e":"え","o":"お"};

/**
 * Convert katakana text to hiragana.
 * The chōon mark ー is expanded back to the appropriate vowel.
 * @param {string} text
 * @returns {string}
 */
function katakanaToHiragana(text) {
    const result = [];
    for (const ch of text) {
        const code = ch.charCodeAt(0);
        if (ch === "ー") {
            // Expand chōon to the vowel of the previous hiragana character
            if (result.length > 0) {
                const last = result[result.length - 1];
                const v = HIRAGANA_VOWEL_MAP[last];
                result.push(v ? VOWEL_TO_HIRAGANA[v] : "ー");
            } else {
                result.push("ー");
            }
        } else if (code >= 0x30A1 && code <= 0x30F6) {
            result.push(String.fromCharCode(code - 0x60));
        } else {
            result.push(ch);
        }
    }
    return result.join("");
}

/**
 * Convert romaji directly to katakana.
 * @param {string} text
 * @returns {string}
 */
function romajiToKatakana(text) {
    return hiraganaToKatakana(romajiToHiragana(text));
}

/**
 * Normalize kana to the requested script.
 * @param {string} text
 * @param {"hiragana"|"katakana"} script
 * @returns {string}
 */
function toKanaScript(text, script = "hiragana") {
    const hira = katakanaToHiragana(text || "");
    return script === "katakana" ? hiraganaToKatakana(hira) : hira;
}

// Export for use in other scripts
window.romajiToHiragana = romajiToHiragana;
window.hiraganaToKatakana = hiraganaToKatakana;
window.romajiToKatakana = romajiToKatakana;
window.katakanaToHiragana = katakanaToHiragana;
window.toKanaScript = toKanaScript;
