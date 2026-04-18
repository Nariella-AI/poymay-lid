/**
 * Озвучка через Web Speech API (после пользовательского жеста).
 */

export function speakRu(text, soundEnabled, speechUnlocked) {
  if (!soundEnabled || !speechUnlocked) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

export function cancelSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* no-op */
    }
  }
}
