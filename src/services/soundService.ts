import * as Tone from 'tone';

class SoundService {
  private synth: Tone.PolySynth;
  private clickSynth: Tone.MembraneSynth;
  private successSynth: Tone.PolySynth;
  private noiseSynth: Tone.NoiseSynth;
  private isInitialized: boolean = false;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.clickSynth = new Tone.MembraneSynth().toDestination();
    this.successSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 }
    }).toDestination();
    
    // Set some retro characteristics
    this.synth.set({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    });

    this.successSynth.set({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 1 }
    });
  }

  private async initialize() {
    if (this.isInitialized) return;
    await Tone.start();
    this.isInitialized = true;
  }

  public async playClick() {
    await this.initialize();
    this.clickSynth.triggerAttackRelease('C1', '16n');
  }

  public async playType() {
    await this.initialize();
    this.synth.triggerAttackRelease('E5', '32n', undefined, 0.1);
  }

  public async playSuccess() {
    await this.initialize();
    const now = Tone.now();
    this.successSynth.triggerAttackRelease('C4', '8n', now);
    this.successSynth.triggerAttackRelease('E4', '8n', now + 0.1);
    this.successSynth.triggerAttackRelease('G4', '4n', now + 0.2);
    this.successSynth.triggerAttackRelease('C5', '2n', now + 0.4);
  }

  public async playError() {
    await this.initialize();
    const now = Tone.now();
    this.synth.triggerAttackRelease('G2', '8n', now);
    this.synth.triggerAttackRelease('F#2', '8n', now + 0.1);
  }

  public async playLevelUp() {
    await this.initialize();
    const now = Tone.now();
    const notes = ['C4', 'E4', 'G4', 'B4', 'C5', 'E5', 'G5'];
    notes.forEach((note, i) => {
      this.successSynth.triggerAttackRelease(note, '8n', now + (i * 0.1));
    });
  }
  
  public async playTear() {
    await this.initialize();
    this.noiseSynth.triggerAttackRelease('8n');
    const now = Tone.now();
    this.synth.triggerAttackRelease('E2', '32n', now, 0.15);
    this.synth.triggerAttackRelease('G2', '32n', now + 0.04, 0.15);
  }

  public async playDiscover() {
    await this.initialize();
    const now = Tone.now();
    this.successSynth.triggerAttackRelease('A4', '16n', now);
    this.successSynth.triggerAttackRelease('C5', '8n', now + 0.1);
  }
}

export const soundService = new SoundService();
