/**
 * home.js — Home page: practice + history in one view.
 */

document.addEventListener("DOMContentLoaded", () => {
    const questionHiragana = document.getElementById("question-hiragana");
    const answerInput      = document.getElementById("answer-input");
    const answerHiragana   = document.getElementById("answer-hiragana");
    const checkBtn         = document.getElementById("check-btn");
    const nextBtn          = document.getElementById("next-btn");
    const feedbackInline   = document.getElementById("feedback-inline");
    const fbIcon           = document.getElementById("fb-icon");
    const fbText           = document.getElementById("fb-text");
    const answerSection    = document.getElementById("answer-section");
    const ttsBtn           = document.getElementById("tts-btn");
    const toast            = document.getElementById("toast");
    const exportBtn        = document.getElementById("export-csv-btn");
    const importBtn        = document.getElementById("import-csv-btn");
    const importFile       = document.getElementById("import-csv-file");
    const settingsToggle   = document.getElementById("settings-toggle");
    const settingsDropdown = document.getElementById("settings-dropdown");

    const correctCountEl   = document.getElementById("correct-count");
    const incorrectCountEl = document.getElementById("incorrect-count");
    const streakCountEl    = document.getElementById("streak-count");

    const historyList      = document.getElementById("history-list");
    const historyEmpty     = document.getElementById("history-empty");

    // Mode handling
    const modeToggle = document.getElementById("mode-toggle");
    
    // Guard — elements may not exist if word_count == 0
    if (!questionHiragana) return;

    let currentWord = null;
    let stats = { correct: 0, incorrect: 0, streak: 0 };

    function getMode() {
        return localStorage.getItem("mochi-practice-mode") || "jp-es";
    }

    function updateModeButton() {
        if (!modeToggle) return;
        const mode = getMode();
        modeToggle.querySelector(".mode-text").textContent = mode === "jp-es" ? "あ → ES" : "ES → あ";
        if (ttsBtn) {
            ttsBtn.hidden = mode !== "jp-es";
        }
        updateHistoryTtsButtons(mode);
    }

    function showToast(message, type = "success") {
        if (!toast) return;
        clearTimeout(window.toastTimer);
        toast.textContent = message;
        toast.className = `toast toast-${type} show`;
        window.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    if (modeToggle) {
        modeToggle.addEventListener("click", () => {
            const currentMode = getMode();
            const newMode = currentMode === "jp-es" ? "es-jp" : "jp-es";
            localStorage.setItem("mochi-practice-mode", newMode);
            updateModeButton();
            if (currentWord && feedbackInline.hidden) {
                questionHiragana.textContent = newMode === "jp-es" ? currentWord.hiragana : currentWord.translation;
            }
        });
    }
    updateModeButton();

    async function playTts() {
        if (!currentWord) return;
        try {
            const audio = new Audio(`/api/words/${currentWord.id}/tts`);
            await audio.play();
        } catch {
            // ignore playback errors
        }
    }

    if (ttsBtn) {
        ttsBtn.addEventListener("click", () => {
            ttsBtn.blur();
            playTts();
        });
    }

    if (settingsToggle && settingsDropdown) {
        settingsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle("is-open");
            settingsDropdown.setAttribute(
                "aria-hidden",
                settingsDropdown.classList.contains("is-open") ? "false" : "true"
            );
        });

        document.addEventListener("click", (e) => {
            if (!settingsDropdown.classList.contains("is-open")) return;
            if (settingsDropdown.contains(e.target) || settingsToggle.contains(e.target)) return;
            settingsDropdown.classList.remove("is-open");
            settingsDropdown.setAttribute("aria-hidden", "true");
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener("click", async () => {
            try {
                const res = await fetch("/api/words/export");
                if (!res.ok) throw new Error("Error al exportar");

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "mochi_words.csv";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (err) {
                showToast(err.message || "Error al exportar", "error");
            }
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener("click", () => {
            importFile.value = "";
            importFile.click();
        });

        importFile.addEventListener("change", async () => {
            const file = importFile.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("/api/words/import", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || "Error al importar");
                }

                const data = await res.json();
                const imported = data.imported ?? 0;
                const skipped = data.skipped ?? 0;
                showToast(`Importadas: ${imported}. Duplicadas: ${skipped}.`, "success");
            } catch (err) {
                showToast(err.message || "Error al importar", "error");
            }
        });
    }

    // --- Load a random word ---
    async function loadWord() {
        try {
            const res = await fetch("/api/words/random");
            if (!res.ok) throw new Error();
            currentWord = await res.json();
            
            const mode = getMode();
            questionHiragana.textContent = mode === "jp-es" ? currentWord.hiragana : currentWord.translation;

            // Animate in
            questionHiragana.style.opacity = "0";
            questionHiragana.style.transform = "scale(0.85)";
            requestAnimationFrame(() => {
                questionHiragana.style.transition = "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
                questionHiragana.style.opacity = "1";
                questionHiragana.style.transform = "scale(1)";
            });

            // Reset UI
            answerInput.value = "";
            answerHiragana.textContent = "";
            answerInput.disabled = false;
            answerInput.focus();
            answerSection.hidden = false;
            feedbackInline.hidden = true;
            checkBtn.disabled = false;
            updateModeButton();
        } catch {
            questionHiragana.textContent = "—";
        }
    }

    // --- Real-time hiragana preview while typing ---
    answerInput.addEventListener("input", () => {
        const val = answerInput.value.trim();
        answerHiragana.textContent = val ? romajiToHiragana(val) : "";
    });

    // --- Check answer ---
    function checkAnswer() {
        if (!currentWord || checkBtn.disabled) return;

        const val = answerInput.value.trim();
        if (!val) {
            answerInput.focus();
            return;
        }

        const userHiragana = romajiToHiragana(val);
        const isCorrect = userHiragana === currentWord.hiragana;

        // Update stats
        if (isCorrect) {
            stats.correct++;
            stats.streak++;
        } else {
            stats.incorrect++;
            stats.streak = 0;
        }
        correctCountEl.textContent = stats.correct;
        incorrectCountEl.textContent = stats.incorrect;
        streakCountEl.textContent = stats.streak;

        // Show inline feedback
        answerInput.disabled = true;
        checkBtn.disabled = true;
        feedbackInline.hidden = false;
        feedbackInline.className = `feedback-inline ${isCorrect ? "is-correct" : "is-incorrect"}`;
        fbIcon.textContent = isCorrect ? "✓" : "✗";
        
        if (isCorrect) {
            fbText.textContent = `¡Correcto! — ${currentWord.translation}`;
        } else {
            fbText.textContent = `${currentWord.romaji} (${currentWord.hiragana}) — ${currentWord.translation}`;
        }

        // Add to history
        addHistoryEntry(currentWord, val, userHiragana, isCorrect);
    }

    checkBtn.addEventListener("click", checkAnswer);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const active = document.activeElement;
            if (active && (active.classList.contains("history-tts") || active.id === "tts-btn")) {
                active.blur();
                return;
            }
            if (!feedbackInline.hidden) {
                loadWord();
            } else if (!answerInput.disabled) {
                checkAnswer();
            }
        }
    });

    nextBtn.addEventListener("click", loadWord);

    // --- History ---
    function addHistoryEntry(word, userRomaji, userHiragana, isCorrect) {
        if (historyEmpty) historyEmpty.remove();

        const row = document.createElement("div");
        row.className = `history-row ${isCorrect ? "history-correct" : "history-incorrect"}`;
        row.innerHTML = `
            <span class="history-status">${isCorrect ? "✓" : "✗"}</span>
            <span class="history-hiragana">${escapeHtml(word.hiragana)}</span>
            <span class="history-answer">${escapeHtml(userRomaji)} → ${escapeHtml(userHiragana)}</span>
            <span class="history-translation">
                ${escapeHtml(word.translation)}
                ${word.note ? `<br><small class="history-note">${escapeHtml(word.note)}</small>` : ''}
            </span>
            <button class="history-tts" type="button" aria-label="Escuchar pronunciación" data-word-id="${word.id}">
                <svg class="history-tts-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 10v4h4l5 4V6l-5 4H5z"></path>
                    <path d="M15.5 9.5a3 3 0 0 1 0 5"></path>
                    <path d="M18 7a6 6 0 0 1 0 10"></path>
                </svg>
            </button>
        `;

        const ttsButton = row.querySelector(".history-tts");
        if (ttsButton) {
            ttsButton.hidden = getMode() !== "jp-es";
            ttsButton.addEventListener("click", async () => {
                ttsButton.blur();
                try {
                    const audio = new Audio(`/api/words/${word.id}/tts`);
                    await audio.play();
                } catch {
                    // ignore playback errors
                }
            });
        }

        historyList.prepend(row);
    }

    function updateHistoryTtsButtons(mode = getMode()) {
        const buttons = historyList.querySelectorAll(".history-tts");
        buttons.forEach((button) => {
            button.hidden = mode !== "jp-es";
        });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    loadWord();
});
