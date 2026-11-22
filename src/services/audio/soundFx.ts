/**
 * HEART Studio Acoustic Sound Engine
 * Provides ultra-satisfying, mathematically tuned acoustic sound effects
 * using the Web Audio API with zero latency and zero external dependencies.
 */

class SoundFxEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: number = 0.75;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("HEART_SOUND_MUTED");
      if (savedMute !== null) {
        this.isMuted = savedMute === "true";
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("HEART_SOUND_MUTED", String(muted));
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(volume: number): void {
    this.masterGain = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.masterGain;
  }

  /**
   * The Signature HEART "Sweet Serenity" Harmonic Chime
   * Staggered celestial 4-tone chord (E Major 9th: E5, G#5, B5, E6)
   * with silky exponential decay and lowpass warmth.
   */
  public playSweetChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const chord = [
      { freq: 659.25, delay: 0.0, dur: 1.4, gain: 0.22 }, // E5
      { freq: 830.61, delay: 0.06, dur: 1.3, gain: 0.18 }, // G#5
      { freq: 987.77, delay: 0.12, dur: 1.5, gain: 0.16 }, // B5
      { freq: 1318.51, delay: 0.18, dur: 1.8, gain: 0.14 }, // E6
    ];

    chord.forEach(({ freq, delay, dur, gain }) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Warm acoustic filter
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, startTime);
      filter.frequency.exponentialRampToValueAtTime(800, startTime + dur);

      // Silky envelope: instant soft rise, sweet lingering decay
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gain * this.masterGain, startTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  /**
   * Ultra-Satisfying Tactile "Dewdrop Pop"
   * Played on sending messages, mic toggle, or responsive UI interactions.
   */
  public playSatisfyingPop(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // Rapid acoustic pitch swoop from 380Hz to 880Hz mimics a delightful water droplet
    osc.frequency.setValueAtTime(380, startTime);
    osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.045);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25 * this.masterGain, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.085);
  }

  /**
   * Organic Dual-Thump Biometric Heartbeat ("Lub-Dub")
   * Deep, warm sub-bass acoustic pulse for ECG and sensor feedback.
   */
  public playHeartbeatPulse(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // "Lub" (First heart sound, ~60Hz)
    const playThump = (time: number, freq: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, time + duration);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, time);

      gainNode.gain.setValueAtTime(0.0001, time);
      gainNode.gain.exponentialRampToValueAtTime(vol * this.masterGain, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    };

    playThump(now, 68, 0.09, 0.28);
    // "Dub" (Second heart sound, slightly higher and crisper, 140ms later)
    playThump(now + 0.14, 82, 0.07, 0.20);
  }

  /**
   * Sparkling "Clinical Serenity" Success Chime
   * 3-note ascending harmonic flourish when reports or analyses complete.
   */
  public playSuccessChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, time: 0.0 }, // C5
      { freq: 659.25, time: 0.08 }, // E5
      { freq: 783.99, time: 0.16 }, // G5
      { freq: 1046.5, time: 0.24 }, // C6
    ];

    notes.forEach(({ freq, time }) => {
      const startTime = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18 * this.masterGain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  }

  /**
   * Gentle Welcome Chime
   * Soft dual-bell greeting when opening the AI Copilot.
   */
  public playGreetingChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [
      { freq: 587.33, delay: 0.0, dur: 0.8, gain: 0.18 }, // D5
      { freq: 880.0, delay: 0.08, dur: 1.2, gain: 0.16 }, // A5
    ].forEach(({ freq, delay, dur, gain }) => {
      const startTime = now + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gain * this.masterGain, startTime + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }
}

export const soundFx = new SoundFxEngine();
