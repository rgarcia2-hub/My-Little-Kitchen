const fs = require('fs');
let code = fs.readFileSync('src/services/soundService.ts', 'utf8');

const classStart = `class SoundService {
  private synth: Tone.PolySynth;
  private clickSynth: Tone.MembraneSynth;
  private successSynth: Tone.PolySynth;
  private noiseSynth: Tone.NoiseSynth;`;

code = code.replace(`class SoundService {\n  private synth: Tone.PolySynth;\n  private clickSynth: Tone.MembraneSynth;\n  private successSynth: Tone.PolySynth;`, classStart);

const constructorStart = `this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.clickSynth = new Tone.MembraneSynth().toDestination();
    this.successSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 }
    }).toDestination();`;

code = code.replace(`this.synth = new Tone.PolySynth(Tone.Synth).toDestination();\n    this.clickSynth = new Tone.MembraneSynth().toDestination();\n    this.successSynth = new Tone.PolySynth(Tone.Synth).toDestination();`, constructorStart);

const newMethods = `public async playTear() {
    await this.initialize();
    this.noiseSynth.triggerAttackRelease('4n');
  }

  public async playDiscover() {`;

code = code.replace('public async playDiscover() {', newMethods);

fs.writeFileSync('src/services/soundService.ts', code);
console.log("Patched soundService.ts");
