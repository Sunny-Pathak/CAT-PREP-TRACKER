/**
 * Web Audio API synthesized retro gaming achievement & jump sound effect.
 * Zero external audio files required, zero latency, ultra-lightweight.
 * Tuned with 75% volume attenuation and low-pass filtering to be gentle on the ears.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Audio cues have been removed as per user preference.
 * Functions are exported as silent no-ops for backward compatibility.
 */
export function playGamingAchievementSound() {}
export function playObjectiveCompleteGameSound() {}
export function playSoftZenChime() {}
export function playSoftClick() {}
export function playHankoStampSound() {}

/**
 * Continuous Web Audio Ambient Focus Sound Generators
 * Pure math synthesis, zero external media, zero bandwidth.
 */
let currentAmbientType = null;
let currentAmbientSource = null;
let currentAmbientGain = null;
let ambientInterval = null;
let currentAmbientAudio = null;
let currentAmbientVolume = 0.5;

// Audio sources configured to read from public directory
const AMBIENT_TRACK_URLS = {
  rain: ['/audio/rain.wav', '/rain.wav'],
  brown: ['/audio/brown-noise.wav', '/brown noise.wav', '/brown-noise.wav']
};

export function getCurrentAmbientType() {
  return currentAmbientType;
}

export function stopAmbientAudio() {
  try {
    if (currentAmbientAudio) {
      try {
        currentAmbientAudio.pause();
        currentAmbientAudio.currentTime = 0;
        currentAmbientAudio.src = '';
      } catch (e) {}
      currentAmbientAudio = null;
    }
    if (ambientInterval) {
      clearInterval(ambientInterval);
      ambientInterval = null;
    }
    if (currentAmbientGain && audioCtx) {
      const now = audioCtx.currentTime;
      currentAmbientGain.gain.setValueAtTime(currentAmbientGain.gain.value, now);
      currentAmbientGain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
    }
    setTimeout(() => {
      if (currentAmbientSource) {
        try {
          if (currentAmbientSource.stop) currentAmbientSource.stop();
          if (currentAmbientSource.disconnect) currentAmbientSource.disconnect();
        } catch (e) {}
        currentAmbientSource = null;
      }
      currentAmbientGain = null;
      currentAmbientType = null;
    }, 90);
  } catch (err) {
    currentAmbientSource = null;
    currentAmbientGain = null;
    currentAmbientAudio = null;
    currentAmbientType = null;
  }
}

export function setAmbientAudioVolume(volume = 0.5) {
  currentAmbientVolume = Math.max(0.01, Math.min(1.0, volume));
  if (currentAmbientAudio) {
    try {
      currentAmbientAudio.volume = currentAmbientVolume;
    } catch (e) {}
  }
  if (currentAmbientGain && audioCtx) {
    try {
      const vol = currentAmbientVolume * 0.15;
      currentAmbientGain.gain.setValueAtTime(vol, audioCtx.currentTime);
    } catch (e) {}
  }
}

export function playAmbientFile(trackKey, volume = 0.5) {
  stopAmbientAudio();
  currentAmbientVolume = Math.max(0.01, Math.min(1.0, volume));
  currentAmbientType = trackKey;

  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return true;
  }

  const urls = AMBIENT_TRACK_URLS[trackKey];
  if (!urls || urls.length === 0) return false;

  try {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = currentAmbientVolume;
    let urlIdx = 0;
    audio.src = urls[urlIdx];

    audio.addEventListener('error', () => {
      urlIdx++;
      if (urlIdx < urls.length) {
        audio.src = urls[urlIdx];
        audio.play().catch(() => {});
      }
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Audio playback notice (waiting for interaction):', err);
      });
    }

    currentAmbientAudio = audio;
    return true;
  } catch (err) {
    console.warn('HTML5 audio load notice:', err);
    return false;
  }
}

export function startRainAudio(volume = 0.5) {
  return playAmbientFile('rain', volume);
}

export function startBrownNoiseAudio(volume = 0.5) {
  return playAmbientFile('brown', volume);
}

export function startZenBowlAudio(volume = 0.25) {
  stopAmbientAudio();
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    currentAmbientType = 'bowl';
    const effectiveVol = Math.max(0.01, Math.min(1.0, volume)) * 0.12;

    const playSingingChime = () => {
      try {
        if (currentAmbientType !== 'bowl') return;
        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(effectiveVol, now + 0.06);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.8);
        masterGain.connect(ctx.destination);

        const partials = [
          { freq: 432, gain: 0.65 },
          { freq: 864, gain: 0.35 },
          { freq: 1296, gain: 0.15 }
        ];

        partials.forEach(p => {
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.freq, now);
          pGain.gain.setValueAtTime(p.gain, now);
          osc.connect(pGain);
          pGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 6.0);
        });
      } catch (e) {}
    };

    playSingingChime();
    ambientInterval = setInterval(playSingingChime, 6800);
    return true;
  } catch (err) {
    console.warn('Zen bowl synthesis notice:', err);
    return false;
  }
}

export const audioEngine = {
  playGamingAchievementSound,
  playObjectiveCompleteGameSound,
  playSoftZenChime,
  playSoftClick,
  playHankoStampSound,
  playAmbientFile,
  startRainAudio,
  startBrownNoiseAudio,
  startZenBowlAudio,
  stopAmbientAudio,
  setAmbientAudioVolume,
  getCurrentAmbientType
};
