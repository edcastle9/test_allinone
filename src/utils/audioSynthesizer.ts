// Web Audio API based ambient sound generator for relaxation
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentMode: "off" | "rain" | "forest" | "piano" | "bowl" = "off";
  private gainNode: GainNode | null = null;
  private noiseNodes: (AudioNode | number)[] = [];
  private intervalId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNodes.length > 0) {
      this.noiseNodes.forEach((node) => {
        if (typeof node !== "number" && "stop" in node) {
          try {
            (node as any).stop();
            (node as any).disconnect();
          } catch (e) {}
        }
      });
      this.noiseNodes = [];
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
    this.currentMode = "off";
  }

  public play(mode: "rain" | "forest" | "piano" | "bowl", volume = 0.3) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentMode = mode;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.2);
    this.gainNode.connect(this.ctx.destination);

    if (mode === "rain") {
      this.startRainSound();
    } else if (mode === "forest") {
      this.startForestSound();
    } else if (mode === "piano") {
      this.startAmbientChords();
    } else if (mode === "bowl") {
      this.startSingingBowl();
    }
  }

  private startRainSound() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Pink/Brownian rain filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(150, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(highpass);
    highpass.connect(this.gainNode);

    whiteNoise.start();
    this.noiseNodes.push(whiteNoise, filter, highpass);
  }

  private startForestSound() {
    if (!this.ctx || !this.gainNode) return;
    // Wind + soft breeze
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO for wind gust
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);

    whiteNoise.start();
    lfo.start();
    this.noiseNodes.push(whiteNoise, lfo, filter, lfoGain);
  }

  private startAmbientChords() {
    if (!this.ctx || !this.gainNode) return;
    const chordFrequencies = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0], // G7
    ];

    let chordIndex = 0;
    const playChord = () => {
      if (!this.ctx || !this.gainNode || this.currentMode !== "piano") return;
      const freqs = chordFrequencies[chordIndex % chordFrequencies.length];
      chordIndex++;

      freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        noteGain.gain.setValueAtTime(0, this.ctx!.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.04, this.ctx!.currentTime + 1.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 6.0);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode!);

        osc.start();
        osc.stop(this.ctx!.currentTime + 6.0);
      });
    };

    playChord();
    this.intervalId = window.setInterval(playChord, 5500);
  }

  private startSingingBowl() {
    if (!this.ctx || !this.gainNode) return;
    const playBowl = () => {
      if (!this.ctx || !this.gainNode || this.currentMode !== "bowl") return;
      const baseFreq = 216; // A 432Hz harmonic / peaceful frequency
      const harmonics = [1, 2.76, 5.4, 8.9];

      harmonics.forEach((mult, idx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq * mult, this.ctx!.currentTime);

        const amp = 0.08 / (idx + 1);
        noteGain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
        noteGain.gain.linearRampToValueAtTime(amp, this.ctx!.currentTime + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 7.5);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode!);

        osc.start();
        osc.stop(this.ctx!.currentTime + 8.0);
      });
    };

    playBowl();
    this.intervalId = window.setInterval(playBowl, 7800);
  }

  public getCurrentMode() {
    return this.currentMode;
  }
}

export const ambientSound = new AmbientAudioEngine();
