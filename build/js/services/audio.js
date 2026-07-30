/**
 * Audio Service
 * Web Speech API for English pronunciation & Web Audio API synth sounds for gamification effects.
 */

let synth = null;
let currentUtterance = null;
let audioCtx = null;

if ('speechSynthesis' in window) {
  synth = window.speechSynthesis;
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Speak text in English using Web Speech API
 */
export function speakText(text, rate = 1.0) {
  if (!synth) return;

  // Cancel any ongoing speech
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = 'en-US';

  // Try to find a good English voice
  const voices = synth.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  currentUtterance = utterance;
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (synth) {
    synth.cancel();
  }
}

/**
 * Play a synthesized sound effect using Web Audio API
 */
export function playSoundEffect(type = 'correct') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'correct') {
      // Pleasant dual tone chime (C5 -> G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.5);
    } else if (type === 'incorrect') {
      // Soft low tone buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(140, now + 0.3); // Drop pitch

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'click') {
      // Crisp click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.warn('Audio effect playback blocked or unsupported', e);
  }
}
