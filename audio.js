/**
 * Celestial Romance - Romantic Audio Engine
 * Uses Web Audio API to procedurally play a gentle, dreamy romantic melody
 * Works 100% offline without external assets or CORS issues.
 */

class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.gainMaster = null;
    this.currentNoteIndex = 0;

    // Romantic Arpeggio Sequence (Ethereal Piano / Music Box Tones)
    // Notes in Hz (C4, D4, E4, G4, A4, B4, C5, D5, E5, G5, etc.)
    this.notes = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      329.63, 392.00, 523.25, 659.25, // E4, G4, C5, E5
      293.66, 369.99, 440.00, 587.33, // D4, F#4, A4, D5
      246.94, 329.63, 392.00, 493.88, // B3, E4, G4, B4
      220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      349.23, 440.00, 523.25, 698.46, // F4, A4, C5, F5
      392.00, 493.88, 587.33, 783.99  // G4, B4, D5, G5
    ];

    // Accompanying high chime sparkles
    this.chimes = [1046.50, 1318.51, 1567.98, 2093.00, 1760.00];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.gainMaster = this.ctx.createGain();
      this.gainMaster.gain.setValueAtTime(0.25, this.ctx.currentTime);

      // Reverb / Delay simulation
      this.delay = this.ctx.createDelay();
      this.delay.delayTime.value = 0.35;

      this.feedback = this.ctx.createGain();
      this.feedback.gain.value = 0.3;

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 1800; // Warm soft tone

      this.delay.connect(this.feedback);
      this.feedback.connect(this.delay);

      this.gainMaster.connect(this.filter);
      this.filter.connect(this.ctx.destination);
      this.filter.connect(this.delay);
      this.delay.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPluck(freq, time, duration = 1.6, isChime = false) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isChime ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle vibrato
    if (!isChime) {
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.value = 4.5;
      vibratoGain.gain.value = 1.5;
      vibrato.connect(osc.frequency);
      vibrato.start(time);
      vibrato.stop(time + duration);
    }

    // Envelope: quick attack, smooth romantic decay
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(isChime ? 0.08 : 0.22, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.gainMaster);

    osc.start(time);
    osc.stop(time + duration);
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const scheduleNotes = () => {
      if (!this.isPlaying) return;

      const now = this.ctx.currentTime;
      const noteFreq = this.notes[this.currentNoteIndex];
      this.playPluck(noteFreq, now, 1.8);

      // Random gentle starlight chime
      if (Math.random() < 0.35) {
        const chimeFreq = this.chimes[Math.floor(Math.random() * this.chimes.length)];
        this.playPluck(chimeFreq, now + 0.2, 1.2, true);
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.notes.length;

      // Tempo: about 360ms per arpeggio note
      this.timer = setTimeout(scheduleNotes, 380);
    };

    scheduleNotes();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  // Play a special celestial burst chord when surprise or heart is clicked
  playCelestialBurst() {
    if (!this.ctx) this.init();
    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C Major 7/9
    chord.forEach((freq, i) => {
      this.playPluck(freq, now + i * 0.08, 2.5, true);
    });
  }
}

window.romanticAudio = new RomanticAudioEngine();
