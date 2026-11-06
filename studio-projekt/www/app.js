(() => {
    const counterEl = document.getElementById('counter');
    const increaseBtn = document.getElementById('increase');
    const decreaseBtn = document.getElementById('decrease');
    const resetBtn = document.getElementById('reset');

    const STORAGE_KEY = 'einfacher-zaehler-wert';

    const load = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored !== null ? parseInt(stored, 10) : 0;
        } catch (e) {
            return 0;
        }
    };

    const save = (value) => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
            // ignore storage errors
        }
    };

    let count = load();
    const render = () => {
        counterEl.textContent = count;
    };

    increaseBtn.addEventListener('click', () => {
        count++;
        render();
        save(count);
    });

    decreaseBtn.addEventListener('click', () => {
        count--;
        render();
        save(count);
    });

    resetBtn.addEventListener('click', () => {
        count = 0;
        render();
        save(count);
    });

    render();
})();