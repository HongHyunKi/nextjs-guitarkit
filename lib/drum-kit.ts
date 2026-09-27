import * as Tone from 'tone'

// Shared voices for jam tracks and call-and-response lick practice.
export function createDrumKit(output: Tone.ToneAudioNode) {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    volume: -6,
  }).connect(output)
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    volume: -10,
  }).connect(output)
  const hihat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
    volume: -18,
  }).connect(output)
  return { kick, snare, hihat }
}
