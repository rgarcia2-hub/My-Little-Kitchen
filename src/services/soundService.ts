import * as Tone from 'tone';

class SoundService {
  private isInitialized: boolean = false;
  private masterGain: Tone.Gain | null = null;
  private clickSynth: Tone.Synth | null = null;
  private tabSynth: Tone.Synth | null = null;
  private modalSynth: Tone.PolySynth | null = null;
  private successSynth: Tone.PolySynth | null = null;
  private retroSynth: Tone.PolySynth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;

  private async initialize() {
    if (this.isInitialized) return;
    try {
      await Tone.start();

      // Master output with soft limiter/gain for gentle acoustics
      this.masterGain = new Tone.Gain(0.45).toDestination();

      // Subtle, tactile click synth (soft acoustic micro-click)
      this.clickSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.002,
          decay: 0.035,
          sustain: 0,
          release: 0.02
        }
      }).connect(this.masterGain);

      // Smooth tab switch synth (soft harmonic tick)
      this.tabSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.005,
          decay: 0.06,
          sustain: 0,
          release: 0.03
        }
      }).connect(this.masterGain);

      // Gentle floating modal synth (soft chime)
      this.modalSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.015,
          decay: 0.15,
          sustain: 0.05,
          release: 0.18
        }
      }).connect(this.masterGain);

      // Warm success melodic synth
      this.successSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.18,
          sustain: 0.15,
          release: 0.35
        }
      }).connect(this.masterGain);

      // Retro game synth (softer than before)
      this.retroSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.08,
          sustain: 0.05,
          release: 0.08
        }
      }).connect(this.masterGain);

      // Soft paper/cooking noise synth
      this.noiseSynth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: {
          attack: 0.01,
          decay: 0.12,
          sustain: 0,
          release: 0.08
        }
      }).connect(this.masterGain);

      this.isInitialized = true;
    } catch {
      // Audio context may require explicit user gesture
    }
  }

  /**
   * Gentle, subtle and satisfying tactile click for general buttons
   */
  public async playClick() {
    await this.initialize();
    if (!this.clickSynth) return;
    const now = Tone.now();
    this.clickSynth.triggerAttackRelease('A4', '32n', now, 0.25);
  }

  /**
   * Soft, buttery feedback when switching tabs or view modes
   */
  public async playTabSwitch() {
    await this.initialize();
    if (!this.tabSynth) return;
    const now = Tone.now();
    this.tabSynth.triggerAttackRelease('E5', '32n', now, 0.18);
    this.tabSynth.triggerAttackRelease('A5', '32n', now + 0.035, 0.22);
  }

  /**
   * Smooth, airy popup sound when opening modals or floating drawers
   */
  public async playModalOpen() {
    await this.initialize();
    if (!this.modalSynth) return;
    const now = Tone.now();
    this.modalSynth.triggerAttackRelease('D5', '16n', now, 0.15);
    this.modalSynth.triggerAttackRelease('F#5', '16n', now + 0.04, 0.18);
    this.modalSynth.triggerAttackRelease('A5', '16n', now + 0.08, 0.22);
  }

  /**
   * Gentle dismissal sound when closing modals
   */
  public async playModalClose() {
    await this.initialize();
    if (!this.modalSynth) return;
    const now = Tone.now();
    this.modalSynth.triggerAttackRelease('A5', '32n', now, 0.15);
    this.modalSynth.triggerAttackRelease('D5', '32n', now + 0.04, 0.12);
  }

  /**
   * Subtle keystroke feedback
   */
  public async playType() {
    await this.initialize();
    if (!this.clickSynth) return;
    const now = Tone.now();
    this.clickSynth.triggerAttackRelease('F5', '64n', now, 0.08);
  }

  /**
   * Pleasant success chime
   */
  public async playSuccess() {
    await this.initialize();
    if (!this.successSynth) return;
    const now = Tone.now();
    this.successSynth.triggerAttackRelease('C5', '16n', now, 0.25);
    this.successSynth.triggerAttackRelease('E5', '16n', now + 0.06, 0.25);
    this.successSynth.triggerAttackRelease('G5', '16n', now + 0.12, 0.3);
    this.successSynth.triggerAttackRelease('C6', '8n', now + 0.18, 0.35);
  }

  /**
   * Soft error chime (non-harsh)
   */
  public async playError() {
    await this.initialize();
    if (!this.retroSynth) return;
    const now = Tone.now();
    this.retroSynth.triggerAttackRelease('Eb3', '16n', now, 0.2);
    this.retroSynth.triggerAttackRelease('B2', '16n', now + 0.06, 0.18);
  }

  /**
   * Level up fanfare
   */
  public async playLevelUp() {
    await this.initialize();
    if (!this.successSynth) return;
    const now = Tone.now();
    const notes = ['C5', 'E5', 'G5', 'B5', 'C6'];
    notes.forEach((note, i) => {
      this.successSynth?.triggerAttackRelease(note, '16n', now + (i * 0.06), 0.3);
    });
  }
  
  /**
   * Recipe paper tear sound
   */
  public async playTear() {
    await this.initialize();
    if (!this.noiseSynth) return;
    this.noiseSynth.triggerAttackRelease('16n', undefined, 0.25);
  }

  /**
   * Recipe discovery chime
   */
  public async playDiscover() {
    await this.initialize();
    if (!this.successSynth) return;
    const now = Tone.now();
    this.successSynth.triggerAttackRelease('A4', '16n', now, 0.22);
    this.successSynth.triggerAttackRelease('C#5', '16n', now + 0.06, 0.25);
    this.successSynth.triggerAttackRelease('E5', '8n', now + 0.12, 0.3);
  }
}

export const soundService = new SoundService();
