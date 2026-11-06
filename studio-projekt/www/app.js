(() => {
    const toggleBtn = document.getElementById('toggleBtn');
    const projectSelect = document.getElementById('projectSelect');
    const entriesTableBody = document.querySelector('#entriesTable tbody');
    const addManualBtn = document.getElementById('addManualBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    let timer = null;
    let startTime = null;

    // ----- Storage -----
    const loadEntries = () => {
        try {
            const data = localStorage.getItem('zeitracker_entries');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Load error', e);
            return [];
        }
    };
    const saveEntries = (entries) => {
        try {
            localStorage.setItem('zeitracker_entries', JSON.stringify(entries));
        } catch (e) {
            console.error('Save error', e);
        }
    };
    let entries = loadEntries();

    // ----- UI -----
    const renderEntries = () => {
        entriesTableBody.innerHTML = '';
        entries.sort((a,b)=> new Date(a.date)-new Date(b.date));
        entries.forEach(e => {
            const tr = document.createElement('tr');
            const dur = calcDuration(e.start, e.end);
            tr.innerHTML = `<td>${e.date}</td><td>${e.start}</td><td>${e.end}</td><td>${dur}</td><td>${e.project}</td>`;
            entriesTableBody.appendChild(tr);
        });
    };

    const calcDuration = (start, end) => {
        const s = new Date(`1970-01-01T${start}`);
        const e = new Date(`1970-01-01T${end}`);
        const diff = (e - s) / 60000; // minutes
        const h = Math.floor(diff/60);
        const m = Math.round(diff%60);
        return `${h}h ${m}min`;
    };

    // ----- Timer -----
    const startTracking = () => {
        startTime = new Date();
        toggleBtn.textContent = 'Stop';
        toggleBtn.classList.add('stop');
        timer = setInterval(()=>{}, 1000); // placeholder to keep reference
    };
    const stopTracking = () => {
        const endTime = new Date();
        const entry = {
            date: startTime.toISOString().slice(0,10),
            start: startTime.toTimeString().slice(0,5),
            end: endTime.toTimeString().slice(0,5),
            project: projectSelect.value
        };
        entries.push(entry);
        saveEntries(entries);
        renderEntries();
        toggleBtn.textContent = 'Start';
        toggleBtn.classList.remove('stop');
        clearInterval(timer);
        timer = null;
        startTime = null;
        notifyMissing(entry);
    };
    const notifyMissing = (entry) => {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            const now = new Date();
            const entryDate = new Date(entry.date);
            const diffDays = (now - entryDate)/(1000*60*60*24);
            if (diffDays > 1) {
                new Notification('ZeitenTracker', {
                    body: `Keine Erfassung für ${entry.date} gefunden.`
                });
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    };

    toggleBtn.addEventListener('click', () => {
        if (timer) {
            stopTracking();
        } else {
            startTracking();
        }
    });

    // ----- Manual entry -----
    addManualBtn.addEventListener('click', () => {
        const date = document.getElementById('manualDate').value;
        const start = document.getElementById('manualStart').value;
        const end = document.getElementById('manualEnd').value;
        const project = document.getElementById('manualProject').value;
        if (!date || !start || !end) return;
        entries.push({date,start,end,project});
        saveEntries(entries);
        renderEntries();
    });

    // ----- Export CSV -----
    exportCsvBtn.addEventListener('click', () => {
        const header = 'Datum,Start,Ende,Dauer,Projekt\n';
        const rows = entries.map(e => {
            const dur = calcDuration(e.start,e.end);
            return `${e.date},${e.start},${e.end},${dur},${e.project}`;
        }).join('\n');
        const csv = header + rows;
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zeiterfassung.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // initial render
    renderEntries();
})();