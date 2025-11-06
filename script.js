const sentences = document.querySelectorAll('.sentence');  
let currentAudio = null;  
let speechRate = 1;  // Default speed  
let activePlayButton = null;  // Track the current playing button  
let currentSelected = null;  // Fixed: Declare currentSelected  
  
// Reset play button to default state  
function resetPlayButton(btn) {  
    if (btn.classList.contains('play-para')) {  
        btn.textContent = 'Play Paragraph';  
    } else if (btn.id === 'play-all') {  
        btn.textContent = 'Play All';  
    } else if (btn.getAttribute('data-type') === 'tts') {  
        btn.textContent = '🔊';  
    }  
    btn.classList.remove('stop-btn');  
}  
  
// Play single MP3  
function playSingle(mp3Path, btn) {  
    stopAudio();  // Stop previous if any  
    const audio = new Audio(mp3Path);  
    audio.playbackRate = speechRate;  
    audio.onended = () => {  
        resetPlayButton(btn);  
        activePlayButton = null;  
    };  
    audio.onerror = () => {  
        alert('Отсутствует нужный аудио файл');  
        resetSelection();  
        stopAudio();  
    };  
    audio.play();  
    currentAudio = audio;  
    activePlayButton = btn;  
}  
  
// Play sequence of MP3s  
function playSequence(mp3Paths, btn) {  
    stopAudio();  // Stop previous if any  
    let index = 0;  
    function playNext() {  
        if (index < mp3Paths.length) {  
            const audio = new Audio(mp3Paths[index]);  
            audio.playbackRate = speechRate;  
            audio.onended = () => {  
                index++;  
                playNext();  
            };  
            audio.onerror = () => {  
                alert('Отсутствует нужный аудио файл');  
                resetSelection();  
                stopAudio();  
            };  
            audio.play();  
            currentAudio = audio;  
        } else {  
            resetPlayButton(btn);  
            activePlayButton = null;  
        }  
    }  
    playNext();  
    activePlayButton = btn;  
}  
  
// Stop function  
function stopAudio() {  
    if (currentAudio) {  
        currentAudio.pause();  
        currentAudio.currentTime = 0;  // Reset to start  
        currentAudio = null;  
    }  
    if (activePlayButton) {  
        resetPlayButton(activePlayButton);  
        activePlayButton = null;  
    }  
}  
  
// Handle speed change  
document.getElementById('speed-select').addEventListener('change', (e) => {  
    speechRate = parseFloat(e.target.value);  
    if (currentAudio) {  
        currentAudio.playbackRate = speechRate;  // Apply to current if playing  
    }  
});  
  
// Handle sentence click  
sentences.forEach(sentence => {  
    sentence.addEventListener('click', () => {  
        if (currentSelected && currentSelected.sentence === sentence) {  
            // Deselect  
            resetSelection();  
            currentSelected = null;  
        } else {  
            // Reset previous  
            resetSelection();  
  
            // Fade others  
            sentences.forEach(s => s.classList.add('faded'));  
            sentence.classList.remove('faded');  
  
            // Create translation display  
            const transDisplay = document.createElement('div');  
            transDisplay.classList.add('trans-display');  
            transDisplay.textContent = sentence.getAttribute('data-en');  
  
            // Create buttons  
            const transBtn = document.createElement('button');  
            transBtn.classList.add('icon-btn');  
            transBtn.textContent = '🇬🇧';  
            transBtn.addEventListener('click', () => {  
                transDisplay.style.display = transDisplay.style.display === 'none' ? 'block' : 'none';  
            });  
  
            const ttsBtn = document.createElement('button');  
            ttsBtn.classList.add('icon-btn');  
            ttsBtn.setAttribute('data-type', 'tts');  // For reset  
            ttsBtn.textContent = '🔊';  
            ttsBtn.addEventListener('click', () => {  
                if (ttsBtn.textContent === '■') {  
                    stopAudio();  
                } else {  
                    stopAudio();  // Stop previous if any  
                    const mp3Path = sentence.getAttribute('data-mp3');  
                    playSingle(mp3Path, ttsBtn);  
                    ttsBtn.textContent = '■';  
                    ttsBtn.classList.add('stop-btn');  
                }  
            });  
  
            // Append after sentence  
            sentence.after(transDisplay);  
            sentence.after(ttsBtn);  
            sentence.after(transBtn);  
  
            currentSelected = { sentence, transBtn, ttsBtn, transDisplay };  
        }  
    });  
});  
  
// Fixed: Add resetSelection function  
function resetSelection() {  
    if (currentSelected) {  
        currentSelected.transBtn.remove();  
        currentSelected.ttsBtn.remove();  
        currentSelected.transDisplay.remove();  
        sentences.forEach(s => s.classList.remove('faded'));  
    }  
}  
  
// Reset on click outside  
document.addEventListener('click', (e) => {  
    if (!e.target.closest('.sentence') && !e.target.closest('.icon-btn') && !e.target.closest('.trans-display') && !e.target.closest('#play-all') && !e.target.closest('.play-para') && !e.target.closest('.controls')) {  
        resetSelection();  
    }  
});  
  
// Play Paragraph buttons  
document.querySelectorAll('.play-para').forEach(btn => {  
    btn.addEventListener('click', () => {  
        if (btn.textContent === 'Stop') {  
            stopAudio();  
        } else {  
            stopAudio();  // Stop previous if any  
            const para = btn.closest('.paragraph');  
            const sentencesInPara = para.querySelectorAll('.sentence');  
            const mp3Paths = Array.from(sentencesInPara).map(s => s.getAttribute('data-mp3'));  
            playSequence(mp3Paths, btn);  
            btn.textContent = 'Stop';  
            btn.classList.add('stop-btn');  
        }  
    });  
});  
  
// Play All button  
document.getElementById('play-all').addEventListener('click', () => {  
    const btn = document.getElementById('play-all');  
    if (btn.textContent === 'Stop') {  
        stopAudio();  
    } else {  
        stopAudio();  // Stop previous if any  
        resetSelection(); // Reset any selection before playing all  
        const mp3Paths = Array.from(sentences).map(s => s.getAttribute('data-mp3'));  
        playSequence(mp3Paths, btn);  
        btn.textContent = 'Stop';  
        btn.classList.add('stop-btn');  
    }  
});  
  
// Handle Watch Paragraph buttons  
document.querySelectorAll('.watch-para').forEach(btn => {  
    btn.addEventListener('click', () => {  
        if (btn.textContent === 'Watch Paragraph') {  
            btn.textContent = 'Back';  
            btn.classList.add('back-btn');  
        } else {  
            btn.textContent = 'Watch Paragraph';  
            btn.classList.remove('back-btn');  
        }  
    });  
});  