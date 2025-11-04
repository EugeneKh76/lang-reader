const sentences = document.querySelectorAll('.sentence');
let synth = window.speechSynthesis;
let britishVoice = null;
let currentSelected = null;
let speechRate = 1;  // Default speed
let activePlayButton = null;  // Track the current playing button

// Load voices and select British female if possible
function loadVoices() {
    const voices = synth.getVoices();
    britishVoice = voices.find(voice => voice.lang === 'en-GB' && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.gender === 'female' || true)); // Fallback to any en-GB
    if (!britishVoice) {
        britishVoice = voices.find(voice => voice.lang === 'en-GB');
    }
}

if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}
loadVoices(); // Initial load

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

// Speak function for single text
function speakSingle(text, btn) {
    synth.cancel();  // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = speechRate;
    if (britishVoice) {
        utterance.voice = britishVoice;
    }
    utterance.onend = () => {
        resetPlayButton(btn);
        activePlayButton = null;
    };
    synth.speak(utterance);
    activePlayButton = btn;
}

// Speak sequence for multiple texts
function speakSequence(enTexts, btn) {
    synth.cancel();  // Stop any ongoing speech
    let index = 0;
    function speakNext() {
        if (index < enTexts.length) {
            const utterance = new SpeechSynthesisUtterance(enTexts[index]);
            utterance.lang = 'en-GB';
            utterance.rate = speechRate;
            if (britishVoice) {
                utterance.voice = britishVoice;
            }
            utterance.onend = () => {
                index++;
                speakNext();
            };
            synth.speak(utterance);
        } else {
            resetPlayButton(btn);
            activePlayButton = null;
        }
    }
    speakNext();
    activePlayButton = btn;
}

// Stop function
function stopSpeech() {
    synth.cancel();
    if (activePlayButton) {
        resetPlayButton(activePlayButton);
        activePlayButton = null;
    }
}

// Handle speed change
document.getElementById('speed-select').addEventListener('change', (e) => {
    speechRate = parseFloat(e.target.value);
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
                    stopSpeech();
                } else {
                    stopSpeech();  // Stop previous if any
                    const enText = sentence.getAttribute('data-en');
                    speakSingle(enText, ttsBtn);
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
            stopSpeech();
        } else {
            stopSpeech();  // Stop previous if any
            const para = btn.closest('.paragraph');
            const sentencesInPara = para.querySelectorAll('.sentence');
            const enTexts = Array.from(sentencesInPara).map(s => s.getAttribute('data-en'));
            speakSequence(enTexts, btn);
            btn.textContent = 'Stop';
            btn.classList.add('stop-btn');
        }
    });
});

// Play All button
document.getElementById('play-all').addEventListener('click', () => {
    const btn = document.getElementById('play-all');
    if (btn.textContent === 'Stop') {
        stopSpeech();
    } else {
        stopSpeech();  // Stop previous if any
        resetSelection(); // Reset any selection before playing all
        const enTexts = Array.from(sentences).map(s => s.getAttribute('data-en'));
        speakSequence(enTexts, btn);
        btn.textContent = 'Stop';
        btn.classList.add('stop-btn');
    }
});