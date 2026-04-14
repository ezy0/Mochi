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

    while (i < text.length) {
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

// Export for use in other scripts
window.romajiToHiragana = romajiToHiragana;
