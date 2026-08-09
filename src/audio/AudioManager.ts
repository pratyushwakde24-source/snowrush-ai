// ============================================================
// SnowRush — Audio System (Web Audio API Synthesis + Howler)
// ============================================================

import { Howl } from 'howler';

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicPlaying: boolean = false;
  private musicOscillators: OscillatorNode[] = [];
  private sounds: Map<string, Howl> = new Map();
  private initialized: boolean = false;

  init(): void {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.3;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  ensureResumed(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicVolume(v: number): void {
    if (this.musicGain) this.musicGain.gain.value = v * 0.4;
  }

  setSfxVolume(v: number): void {
    if (this.sfxGain) this.sfxGain.gain.value = v * 0.6;
  }

  // ─── Synthesized SFX ─────────────────────────────────────────

  playCoinCollect(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playJump(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playLand(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Noise burst for impact
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    source.start(now);
  }

  playCrash(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    source.start(now);
  }

  playTrickComplete(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  playBoost(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playMenuClick(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playPurchase(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  }

  // ─── Wind Sound (continuous) ──────────────────────────────────

  private windSource: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;

  startWind(): void {
    if (!this.ctx || !this.sfxGain || this.windSource) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = buffer;
    this.windSource.loop = true;
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.03;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.5;
    this.windSource.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.sfxGain);
    this.windSource.start();
  }

  updateWindIntensity(speed: number): void {
    if (!this.windGain) return;
    const intensity = Math.min(0.15, speed * 0.004);
    this.windGain.gain.value = intensity;
  }

  stopWind(): void {
    if (this.windSource) {
      this.windSource.stop();
      this.windSource = null;
      this.windGain = null;
    }
  }

  // ─── Music (ambient synth loop) ──────────────────────────────

  startMusic(): void {
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;
    this.musicPlaying = true;

    const createPad = (freq: number, detune: number = 0) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;

      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2 + Math.random() * 0.3;
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      const gain = this.ctx!.createGain();
      gain.gain.value = 0.06;

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      osc.start();

      this.musicOscillators.push(osc, lfo);
    };

    // Ambient chord: Cmaj7 spread out
    createPad(130.81, 0);   // C3
    createPad(164.81, 5);   // E3
    createPad(196.00, -3);  // G3
    createPad(246.94, 7);   // B3
    createPad(261.63, -5);  // C4
  }

  stopMusic(): void {
    this.musicOscillators.forEach((osc) => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    this.musicOscillators = [];
    this.musicPlaying = false;
  }

  // ─── Carving Sound ────────────────────────────────────────────

  private carvingSource: AudioBufferSourceNode | null = null;
  private carvingGain: GainNode | null = null;

  startCarving(): void {
    if (!this.ctx || !this.sfxGain || this.carvingSource) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.carvingSource = this.ctx.createBufferSource();
    this.carvingSource.buffer = buffer;
    this.carvingSource.loop = true;
    this.carvingGain = this.ctx.createGain();
    this.carvingGain.gain.value = 0;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    this.carvingSource.connect(filter);
    filter.connect(this.carvingGain);
    this.carvingGain.connect(this.sfxGain);
    this.carvingSource.start();
  }

  updateCarvingIntensity(turnAmount: number, speed: number): void {
    if (!this.carvingGain) return;
    const intensity = Math.abs(turnAmount) * Math.min(1, speed / 20) * 0.08;
    this.carvingGain.gain.value = intensity;
  }

  stopCarving(): void {
    if (this.carvingSource) {
      this.carvingSource.stop();
      this.carvingSource = null;
      this.carvingGain = null;
    }
  }

  cleanup(): void {
    this.stopMusic();
    this.stopWind();
    this.stopCarving();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}

export const audioManager = new AudioManager();
