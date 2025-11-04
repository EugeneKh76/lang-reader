const sentences = document.querySelectorAll('.sentence');
let synth = window.speechSynthesis;
let britishVoice = null;
let currentSelected = null;
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
// Speak function
function speak(text) {
if (synth.speaking) {
synth.cancel();
}
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-GB';
if (britishVoice) {
utterance.voice = britishVoice;
}
synth.speak(utterance);
}
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
transDisplay.style.display = transDisplay.style.display === 'none' ? 'inline-block' : 'none';
});
const ttsBtn = document.createElement('button');
ttsBtn.classList.add('icon-btn');
ttsBtn.textContent = '🔊';
ttsBtn.addEventListener('click', () => {
const enText = sentence.getAttribute('data-en');
speak(enText);
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
// Play All button
document.getElementById('play-all').addEventListener('click', () => {
resetSelection(); // Reset any selection before playing all
const enTexts = Array.from(sentences).map(s => s.getAttribute('data-en'));
let index = 0;
function speakNext() {
if (index < enTexts.length) {
const utterance = new SpeechSynthesisUtterance(enTexts[index]);
utterance.lang = 'en-GB';
if (britishVoice) {
utterance.voice = britishVoice;
}
utterance.onend = () => {
index++;
speakNext();
};
synth.speak(utterance);
}
}
speakNext();
});