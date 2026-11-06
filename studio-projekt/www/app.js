(() => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const timeList = document.getElementById('timeList');

    let startTime = null;
    let intervalId = null;
    const STORAGE_KEY = 'zeiterfassung_entries';

    // ---- Hilfsfunktionen ----
    function formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function loadEntries() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Laden fehlgeschlagen', e);
            return [];
        }
    }

    function saveEntries(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            console.error('Speichern fehlgeschlagen', e);
        }
    }

    function renderList() {
        const entries = loadEntries();
        timeList.innerHTML = '';
        entries.forEach((entry, idx) => {
            const li = document.createElement('li');
            li.className = 'timeEntry';
            const span = document.createElement('span');
            span.textContent = entry;
            const del = document.createElement('button');
            del.className = 'delBtn';
            del.innerHTML = '&times;';
            del.title = 'Eintrag löschen';
            del.addEventListener('click', () => {
                entries.splice(idx, 1);
                saveEntries(entries);
                renderList();
            });
            li.appendChild(span);
            li.appendChild(del);
            timeList.appendChild(li);
        });
    }

    // ---- Button-Logik ----
    startBtn.addEventListener('click', () => {
        startTime = Date.now();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            timerDisplay.textContent = formatTime(elapsed);
        }, 500);
    });

    stopBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        const elapsed = Date.now() - startTime;
        const formatted = formatTime(elapsed);
        const entries = loadEntries();
        entries.push(formatted);
        saveEntries(entries);
        renderList();
        timerDisplay.textContent = '00:00:00';
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });

    // ---- Init ----
    renderList();
})();