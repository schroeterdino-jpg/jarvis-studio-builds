(() => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const translationEl = document.getElementById('translation');
    const playback = document.getElementById('playback');
    const historyList = document.getElementById('historyList');

    let mediaRecorder;
    let chunks = [];

    const dummyMap = [
        {min:0, max:1000, text:'Bellen – Aufmerksamkeitsruf'},
        {min:1001, max:3000, text:'Knurren – Warnung'},
        {min:3001, max:5000, text:'Jaulen – Unbehagen'},
        {min:5001, max:8000, text:'Miauen – Begrüßung'},
        {min:8001, max:12000, text:'Kratzen – Spielaufforderung'}
    ];

    function loadHistory(){
        try{
            const data = localStorage.getItem('tst_history');
            if(data){
                const items = JSON.parse(data);
                items.forEach(addHistoryItem);
            }
        }catch(e){}
    }

    function saveHistory(item){
        try{
            const data = localStorage.getItem('tst_history');
            const list = data ? JSON.parse(data) : [];
            list.unshift(item);
            localStorage.setItem('tst_history', JSON.stringify(list));
        }catch(e){}
    }

    function addHistoryItem(item){
        const li = document.createElement('li');
        li.textContent = `${item.time} – ${item.text}`;
        historyList.appendChild(li);
    }

    function analyse(blob){
        // very simple: use duration as proxy
        const tempAudio = new Audio();
        tempAudio.src = URL.createObjectURL(blob);
        tempAudio.addEventListener('loadedmetadata', () => {
            const durationMs = Math.round(tempAudio.duration * 1000);
            const match = dummyMap.find(m=>durationMs>=m.min && durationMs<=m.max);
            const result = match ? match.text : 'Unbekanntes Geräusch';
            translationEl.textContent = result;
            playback.src = tempAudio.src;
            playback.style.display = 'block';

            const historyItem = {
                time:new Date().toLocaleTimeString(),
                text:result,
                audio:tempAudio.src
            };
            addHistoryItem(historyItem);
            saveHistory(historyItem);
        });
    }

    startBtn.addEventListener('click', async () => {
        try{
            const stream = await navigator.mediaDevices.getUserMedia({audio:true});
            mediaRecorder = new MediaRecorder(stream);
            chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, {type:'audio/webm'});
                analyse(blob);
            };
            mediaRecorder.start();
            startBtn.disabled = true;
            stopBtn.disabled = false;
        }catch(e){
            alert('Kein Mikrofon verfügbar.');
        }
    });

    stopBtn.addEventListener('click', () => {
        if(mediaRecorder && mediaRecorder.state !== 'inactive'){
            mediaRecorder.stop();
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    });

    loadHistory();
})();