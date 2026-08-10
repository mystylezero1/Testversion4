// Voice Greeting and Random Hochzeits-Sprüche
const ANNOUNCEMENTS = [
  "Ab auf die Tanzfläche!",
  "Zeit für ein Kaltgetränk an der Bar!",
  "Bitte einmal fürs Hochzeitsfoto lächeln!",
  "Der Kuchen wartet schon auf dich!",
  "Wir freuen uns riesig, dass du mit uns feierst!",
  "Lass uns diesen Tag unvergesslich machen!"
];

export function speakGreeting(guestName, tableName, seatNumber) {
  if (!('speechSynthesis' in window)) return;

  const randomQuote = ANNOUNCEMENTS[Math.floor(Math.random() * ANNOUNCEMENTS.length)];
  const text = `Willkommen ${guestName}! Dein Sitzplatz ist an ${tableName}, Platz ${seatNumber}. ${randomQuote}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.cancel(); // Stop current speech
  window.speechSynthesis.speak(utterance);
}

export function getRandomSpeech() {
  return ANNOUNCEMENTS[Math.floor(Math.random() * ANNOUNCEMENTS.length)];
}
