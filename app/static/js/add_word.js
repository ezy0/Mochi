/**
 * add_word.js — Handles the "Add Word" form, search, and editing.
 */

document.addEventListener("DOMContentLoaded", () => {
    const form        = document.getElementById("add-word-form");
    const romajiInput = document.getElementById("romaji");
    const previewText = document.getElementById("preview-text");
    const submitBtn   = document.getElementById("submit-btn");
    const toast       = document.getElementById("toast");
    const wordList    = document.getElementById("word-list");
    const searchInput = document.getElementById("word-search");

    let allWords = []; // To check for duplicates globally

    // --- Real-time hiragana preview ---
    romajiInput.addEventListener("input", () => {
        const value = romajiInput.value.trim();
        previewText.textContent = value ? romajiToHiragana(value) : "—";
    });

    // --- Confirmation Modal Logic ---
    const confirmModal = document.getElementById("confirm-modal");
    const confirmMsg   = document.getElementById("confirm-msg");
    const confirmOk    = document.getElementById("confirm-ok");
    const confirmCancel = document.getElementById("confirm-cancel");

    let pendingWordData = null;

    function showConfirm(msg, onOk) {
        confirmMsg.textContent = msg;
        confirmModal.classList.add("show");
        
        const handleCancel = () => {
            confirmModal.classList.remove("show");
            confirmOk.onclick = null;
            confirmCancel.onclick = null;
        };

        confirmCancel.onclick = handleCancel;
        confirmOk.onclick = () => {
            onOk();
            handleCancel();
        };
    }

    // --- Form submission (Create) ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const romaji      = document.getElementById("romaji").value.trim();
        const translation = document.getElementById("translation").value.trim();
        const note        = document.getElementById("note").value.trim() || null;

        if (!romaji || !translation) return;

        const hiraganaCheck = romajiToHiragana(romaji);
        const exists = allWords.some(w => w.hiragana === hiraganaCheck);

        const performSave = async () => {
            submitBtn.disabled = true;
            submitBtn.textContent = "Guardando...";

            try {
                const response = await fetch("/api/words/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ romaji, translation, note }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Error al guardar");
                }

                const word = await response.json();
                showToast(`「${word.hiragana}」guardada correctamente`, "success");
                form.reset();
                previewText.textContent = "—";
                
                allWords.push(word);
                addWordToList(word);
            } catch (err) {
                showToast(err.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Guardar Palabra";
            }
        };

        if (exists) {
            showConfirm(`La palabra 「${hiraganaCheck}」ya existe en tu colección. ¿Quieres añadirla de nuevo?`, performSave);
        } else {
            performSave();
        }
    });

    // --- Search logic ---
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        refreshWordList(query);
    });

    // --- Modal logic (Edit) ---
    const editModal    = document.getElementById("edit-modal");
    const editForm     = document.getElementById("edit-word-form");
    const closeModalBtn = document.getElementById("modal-close");
    const cancelModalBtn = document.getElementById("modal-cancel");

    const editId       = document.getElementById("edit-id");
    const editRomaji   = document.getElementById("edit-romaji");
    const editTrans    = document.getElementById("edit-translation");
    const editNote     = document.getElementById("edit-note");

    function openEditModal(word) {
        editId.value = word.id;
        editRomaji.value = word.romaji;
        editTrans.value = word.translation;
        editNote.value = word.note || "";
        editModal.classList.add("show");
    }

    function closeEditModal() {
        editModal.classList.remove("show");
    }

    closeModalBtn.addEventListener("click", closeEditModal);
    cancelModalBtn.addEventListener("click", closeEditModal);
    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) closeEditModal();
    });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = parseInt(editId.value);
        const data = {
            romaji: editRomaji.value.trim(),
            translation: editTrans.value.trim(),
            note: editNote.value.trim() || null
        };

        try {
            const res = await fetch(`/api/words/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Error al actualizar");

            const updatedWord = await res.json();
            showToast("Palabra actualizada", "success");
            
            const idx = allWords.findIndex(w => w.id === id);
            if (idx !== -1) allWords[idx] = updatedWord;

            const oldItem = wordList.querySelector(`.word-item[data-id="${id}"]`);
            if (oldItem) {
                const newItem = createWordItem(updatedWord);
                wordList.replaceChild(newItem, oldItem);
            }
            closeEditModal();
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // --- Word list helpers ---
    function createWordItem(word) {
        const item = document.createElement("div");
        item.className = "word-item";
        item.dataset.id = word.id;
        item.innerHTML = `
            <span class="word-hiragana">${escapeHtml(word.hiragana)}</span>
            <div class="word-details">
                <div class="word-romaji">${escapeHtml(word.romaji)}</div>
                <div class="word-translation">
                    ${escapeHtml(word.translation)}
                    ${word.note ? `<div class="word-note">${escapeHtml(word.note)}</div>` : ''}
                </div>
            </div>
            <div class="word-actions">
                <button class="word-delete" title="Eliminar">&times;</button>
            </div>
        `;

        item.querySelector(".word-details").addEventListener("click", () => openEditModal(word));
        item.querySelector(".word-hiragana").addEventListener("click", () => openEditModal(word));

        item.querySelector(".word-delete").addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = word.id;
            try {
                const res = await fetch(`/api/words/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error();
                
                allWords = allWords.filter(w => w.id !== id);
                
                item.style.opacity = "0";
                item.style.transform = "translateX(20px)";
                setTimeout(() => {
                    item.remove();
                    refreshWordList();
                }, 300);
                showToast("Palabra eliminada", "success");
            } catch {
                showToast("Error al eliminar", "error");
            }
        });

        return item;
    }

    function addWordToList(word) {
        refreshWordList();
    }

    function refreshWordList(query = "") {
        wordList.innerHTML = "";
        const sorted = [...allWords].sort((a, b) => b.id - a.id);

        let list = sorted;
        if (query) {
            list = sorted.filter((word) => {
                const haystack = `${word.hiragana} ${word.romaji} ${word.translation} ${word.note || ""}`.toLowerCase();
                return haystack.includes(query);
            });
        } else {
            list = sorted.slice(0, 5);
        }

        list.forEach((word) => {
            wordList.appendChild(createWordItem(word));
        });
    }

    function showToast(message, type = "success") {
        clearTimeout(window.toastTimer);
        toast.textContent = message;
        toast.className = `toast toast-${type} show`;
        window.toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Load existing words ---
    async function loadWords() {
        try {
            const response = await fetch("/api/words/?limit=1000");
            allWords = await response.json();
            refreshWordList();
        } catch {
            // Silently fail
        }
    }

    loadWords();
});
