/**
 * add_word.js — Handles the "Add Word" form, search, and editing.
 */

document.addEventListener("DOMContentLoaded", () => {
    const form        = document.getElementById("add-word-form");
    const romajiInput = document.getElementById("romaji");
    const previewText = document.getElementById("preview-text");
    const previewLabel = document.getElementById("preview-label");
    const submitBtn   = document.getElementById("submit-btn");
    const toast       = document.getElementById("toast");
    const wordList    = document.getElementById("word-list");
    const searchInput = document.getElementById("word-search");
    const exportBtn   = document.getElementById("export-csv-btn");
    const importBtn   = document.getElementById("import-csv-btn");
    const importFile  = document.getElementById("import-csv-file");
    const settingsToggle = document.getElementById("settings-toggle");
    const settingsDropdown = document.getElementById("settings-dropdown");
    const toggleViewBtn = document.getElementById("toggle-view-btn");
    const listScriptToggleBtn = document.getElementById("list-script-toggle-btn");
    const listCategoryFilterToggle = document.getElementById("list-category-filter-toggle");
    const listCategoryFilterDropdown = document.getElementById("list-category-filter-dropdown");
    const listCategorySearchInput = document.getElementById("list-category-search");
    const listCategoryFilterList = document.getElementById("list-category-filter-list");
    const listCategoryClearBtn = document.getElementById("list-category-clear-btn");
    
    const mobileExportBtn  = document.getElementById("mobile-export-csv-btn");
    const mobileImportBtn  = document.getElementById("mobile-import-csv-btn");
    if (mobileExportBtn && exportBtn) {
        mobileExportBtn.addEventListener("click", () => exportBtn.click());
    }
    if (mobileImportBtn && importBtn) {
        mobileImportBtn.addEventListener("click", () => importBtn.click());
    }

    const categorySelector = document.getElementById("category-selector");
    const editCategorySelector = document.getElementById("edit-category-selector");
    const scriptHiraganaBtn = document.getElementById("script-hiragana-btn");
    const scriptKatakanaBtn = document.getElementById("script-katakana-btn");

    let allWords = []; // To check for duplicates globally
    let showAllWords = false;
    let allCategories = [];
    let selectedFilterCategories = new Set();

    function getListKanaScript() {
        const script = localStorage.getItem("mochi-list-kana-script");
        return script === "katakana" ? "katakana" : "hiragana";
    }

    function renderListKanaToggle() {
        if (!listScriptToggleBtn) return;
        const script = getListKanaScript();
        listScriptToggleBtn.textContent = script === "katakana" ? "Katakana" : "Hiragana";
    }

    function toggleListKanaScript() {
        const current = getListKanaScript();
        const next = current === "hiragana" ? "katakana" : "hiragana";
        localStorage.setItem("mochi-list-kana-script", next);
        renderListKanaToggle();
        refreshWordList();
    }

    function getKanaScript() {
        const script = localStorage.getItem("mochi-add-kana-script");
        return script === "katakana" ? "katakana" : "hiragana";
    }

    function toSelectedKana(text) {
        return toKanaScript(text || "", getListKanaScript());
    }

    function renderKanaScriptSelector() {
        const script = getKanaScript();
        if (scriptHiraganaBtn) scriptHiraganaBtn.classList.toggle("active", script === "hiragana");
        if (scriptKatakanaBtn) scriptKatakanaBtn.classList.toggle("active", script === "katakana");
        if (previewLabel) previewLabel.textContent = script === "katakana" ? "Katakana:" : "Hiragana:";
    }

    function setKanaScript(script) {
        const value = script === "katakana" ? "katakana" : "hiragana";
        localStorage.setItem("mochi-add-kana-script", value);
        renderKanaScriptSelector();
        const valueRomaji = romajiInput.value.trim();
        previewText.textContent = valueRomaji
            ? (value === "katakana" ? romajiToKatakana(valueRomaji) : romajiToHiragana(valueRomaji))
            : "—";
        refreshWordList();
    }

    // --- Real-time hiragana preview ---
    romajiInput.addEventListener("input", () => {
        const value = romajiInput.value.trim();
        previewText.textContent = value
            ? (getKanaScript() === "katakana" ? romajiToKatakana(value) : romajiToHiragana(value))
            : "—";
    });

    if (scriptHiraganaBtn) {
        scriptHiraganaBtn.addEventListener("click", () => setKanaScript("hiragana"));
    }
    if (scriptKatakanaBtn) {
        scriptKatakanaBtn.addEventListener("click", () => setKanaScript("katakana"));
    }

    // --- Load categories ---
    async function loadCategories() {
        try {
            const res = await fetch("/api/categories/");
            if (!res.ok) throw new Error();
            allCategories = await res.json();
            renderCategorySelector(categorySelector);
            renderCategorySelector(editCategorySelector);
            renderListCategoryFilter();
        } catch {
            if (categorySelector) categorySelector.innerHTML = "<p class='category-loading'>Error cargando categorías</p>";
        }
    }

    function renderListCategoryFilter(searchQuery = "") {
        if (!listCategoryFilterList) return;
        listCategoryFilterList.innerHTML = "";

        const query = searchQuery.trim().toLowerCase();
        const filtered = query
            ? allCategories.filter((cat) => cat.name.toLowerCase().includes(query))
            : allCategories;

        if (filtered.length === 0) {
            const empty = document.createElement("p");
            empty.className = "category-loading";
            empty.textContent = allCategories.length === 0 ? "Sin categorías" : "Sin coincidencias";
            listCategoryFilterList.appendChild(empty);
            return;
        }

        filtered.forEach((cat) => {
            const label = document.createElement("label");
            label.className = "category-filter-item";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = cat.name;
            checkbox.checked = selectedFilterCategories.has(cat.name);
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedFilterCategories.add(cat.name);
                } else {
                    selectedFilterCategories.delete(cat.name);
                }
                refreshWordList();
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + cat.name));
            listCategoryFilterList.appendChild(label);
        });
    }

    function renderCategorySelector(container, selectedNames = []) {
        if (!container) return;
        container.innerHTML = "";
        if (allCategories.length === 0) {
            container.innerHTML = "<p class='category-loading'>No hay categorías</p>";
            return;
        }
        allCategories.forEach((cat) => {
            const label = document.createElement("label");
            label.className = "category-checkbox";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = cat.name;
            checkbox.checked = selectedNames.includes(cat.name);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + cat.name));
            container.appendChild(label);
        });
    }

    function getSelectedCategories(container) {
        if (!container) return [];
        const checked = container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checked).map((cb) => cb.value);
    }

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
        const categories  = getSelectedCategories(categorySelector);

        if (!romaji || !translation) return;

        const kanaScript = getKanaScript();
        const kanaCheck = kanaScript === "katakana" ? romajiToKatakana(romaji) : romajiToHiragana(romaji);
        const exists = allWords.some((w) => toKanaScript(w.hiragana, kanaScript) === kanaCheck);

        const performSave = async () => {
            submitBtn.disabled = true;
            submitBtn.textContent = "Guardando...";

            try {
                const response = await fetch("/api/words/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ romaji, translation, note, categories, script: kanaScript }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Error al guardar");
                }

                const word = await response.json();
                showToast(`「${word.hiragana}」guardada correctamente`, "success");
                form.reset();
                previewText.textContent = "—";
                renderCategorySelector(categorySelector);
                
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
            showConfirm(`La palabra 「${kanaCheck}」ya existe en tu colección. ¿Quieres añadirla de nuevo?`, performSave);
        } else {
            performSave();
        }
    });

    // --- Search logic ---
    searchInput.addEventListener("input", () => {
        refreshWordList();
    });

    if (listScriptToggleBtn) {
        listScriptToggleBtn.addEventListener("click", toggleListKanaScript);
    }

    if (listCategoryFilterToggle && listCategoryFilterDropdown) {
        listCategoryFilterToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            listCategoryFilterDropdown.classList.toggle("is-open");
            listCategoryFilterDropdown.setAttribute(
                "aria-hidden",
                listCategoryFilterDropdown.classList.contains("is-open") ? "false" : "true"
            );
        });
    }

    if (listCategoryClearBtn) {
        listCategoryClearBtn.addEventListener("click", () => {
            selectedFilterCategories = new Set();
            if (listCategorySearchInput) listCategorySearchInput.value = "";
            renderListCategoryFilter("");
            refreshWordList();
        });
    }

    if (listCategorySearchInput) {
        listCategorySearchInput.addEventListener("input", (e) => {
            renderListCategoryFilter(e.target.value);
        });
    }


    // --- Settings dropdown ---
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

    document.addEventListener("click", (e) => {
        if (!listCategoryFilterDropdown || !listCategoryFilterToggle) return;
        if (!listCategoryFilterDropdown.classList.contains("is-open")) return;
        if (listCategoryFilterDropdown.contains(e.target) || listCategoryFilterToggle.contains(e.target)) return;
        listCategoryFilterDropdown.classList.remove("is-open");
        listCategoryFilterDropdown.setAttribute("aria-hidden", "true");
    });

    // --- Toggle view all ---
    toggleViewBtn.addEventListener("click", () => {
        showAllWords = !showAllWords;
        toggleViewBtn.textContent = showAllWords ? "Ver recientes" : "Ver todas";
        const query = searchInput.value.trim().toLowerCase();
        refreshWordList(query);
    });

    // --- Export CSV ---
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

    // --- Import CSV ---
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

            await loadWords();
            await loadCategories();
        } catch (err) {
            showToast(err.message || "Error al importar", "error");
        }
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
        renderCategorySelector(editCategorySelector, word.categories || []);
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
            note: editNote.value.trim() || null,
            categories: getSelectedCategories(editCategorySelector),
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
        const categoriesHtml = word.categories && word.categories.length
            ? `<div class="word-categories">${word.categories.map(c => `<span class="word-category">${escapeHtml(c)}</span>`).join('')}</div>`
            : '';
        const displayKana = escapeHtml(toSelectedKana(word.hiragana));
        item.innerHTML = `
            <span class="word-hiragana">${displayKana}</span>
            <div class="word-details">
                <div class="word-romaji">${escapeHtml(word.romaji)}</div>
                <div class="word-translation">
                    ${escapeHtml(word.translation)}
                    ${word.note ? `<div class="word-note">${escapeHtml(word.note)}</div>` : ''}
                    ${categoriesHtml}
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

    function refreshWordList() {
        wordList.innerHTML = "";
        const sorted = [...allWords].sort((a, b) => b.id - a.id);

        const query = searchInput.value.trim().toLowerCase();
        const hasCategoryFilters = selectedFilterCategories.size > 0;

        let list = sorted;

        // Filter by search query
        if (query) {
            list = list.filter((word) => {
                const hira = toKanaScript(word.hiragana, "hiragana");
                const kata = toKanaScript(word.hiragana, "katakana");
                const haystack = `${hira} ${kata} ${word.romaji} ${word.translation} ${word.note || ""} ${word.categories?.join(" ") || ""}`.toLowerCase();
                return haystack.includes(query);
            });
        }

        // Filter by categories (OR logic: word must belong to at least one selected category)
        if (hasCategoryFilters) {
            list = list.filter((word) => {
                if (!word.categories || word.categories.length === 0) return false;
                return word.categories.some((c) => selectedFilterCategories.has(c));
            });
        }

        // Apply "recent" limit only when no filters are active
        if (!query && !hasCategoryFilters && !showAllWords) {
            list = list.slice(0, 5);
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

    loadCategories();
    renderKanaScriptSelector();
    setKanaScript(getKanaScript());
    renderListKanaToggle();
    loadWords();
});
