/* ============================================================
   AUDIO PROCEDURAL (WebAudio, sin ficheros)
   Efectos sintetizados + música ambiental generativa: un colchón
   de acordes lentos y notas de arpa en escala pentatónica.
   ============================================================ */

const NOTE = (semitonesFromA4) => 440 * Math.pow(2, semitonesFromA4 / 12);
// Re menor pentatónica alrededor de D4
const SCALE = [-7, -4, -2, 0, 3, 5, 8, 10, 12, 15];
const CHORDS = [
  [-19, -12, -7, -4], // Dm
  [-23, -16, -11, -7], // Bb
  [-21, -14, -9, -5], // C
  [-24, -12, -9, -5] // Am
];

export class AudioSys {
  constructor() {
    this.ctx = null;
    this.sfxOn = true;
    this.musicOn = true;
    this._timer = null;
    this._bar = 0;
  }

  /** Debe llamarse desde un gesto del usuario. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = this.sfxOn ? 0.5 : 0;
    this.sfx.connect(this.master);
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.master);
    // eco suave para la música
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.34;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 1800;
    this.musicBus = ctx.createGain();
    this.musicBus.connect(this.music);
    this.musicBus.connect(delay);
    delay.connect(damp).connect(fb).connect(delay);
    damp.connect(this.music);
    this._startSea();
    if (this.musicOn) this.startMusic();
  }

  setSfx(on) {
    this.sfxOn = on;
    if (this.ctx) this.sfx.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.05);
  }

  setMusic(on) {
    this.musicOn = on;
    if (!this.ctx) return;
    if (on) this.startMusic();
    else {
      this.music.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  /* ---------- Efectos ---------- */
  _tone(freq, dur, { type = 'triangle', vol = 0.3, at = 0, slide = 0, dest } = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime + at;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest || this.sfx);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  _noise(dur, { vol = 0.2, freq = 1200, q = 0.8, at = 0, type = 'bandpass' } = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime + at;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer();
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t, Math.random() * 1.5, dur + 0.05);
  }

  _noiseBuffer() {
    if (!this._nb) {
      const len = this.ctx.sampleRate * 2;
      this._nb = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this._nb.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return this._nb;
  }

  step() {
    this._noise(0.07, { vol: 0.07, freq: 500 + Math.random() * 300, q: 1.2 });
  }
  blip() {
    this._tone(620 + Math.random() * 90, 0.045, { type: 'square', vol: 0.045 });
  }
  select() {
    this._tone(660, 0.07, { vol: 0.16 });
    this._tone(990, 0.1, { vol: 0.14, at: 0.05 });
  }
  open() {
    [0, 3, 7, 12].forEach((n, i) => this._tone(NOTE(n - 2), 0.16, { vol: 0.13, at: i * 0.045 }));
  }
  close() {
    this._tone(520, 0.1, { vol: 0.12, slide: 0.6 });
  }
  discover() {
    [0, 4, 7, 12, 16].forEach((n, i) => this._tone(NOTE(n + 3), 0.42, { vol: 0.14, at: i * 0.075, type: 'sine' }));
  }
  chest() {
    this._noise(0.25, { vol: 0.14, freq: 320, q: 2 });
    [0, 5, 9, 12, 17, 21].forEach((n, i) => this._tone(NOTE(n - 2), 0.5, { vol: 0.15, at: 0.12 + i * 0.07 }));
  }
  fanfare() {
    const seq = [[5, 0], [5, 0.14], [5, 0.28], [10, 0.42], [8, 0.7], [10, 0.84], [12, 0.98], [17, 1.2]];
    for (const [n, at] of seq) {
      this._tone(NOTE(n - 2), n === 17 ? 0.9 : 0.24, { vol: 0.17, at, type: 'triangle' });
      this._tone(NOTE(n - 14), n === 17 ? 0.9 : 0.24, { vol: 0.09, at, type: 'sawtooth' });
    }
  }
  whoosh() {
    this._noise(0.5, { vol: 0.2, freq: 900, q: 0.6 });
    this._tone(300, 0.45, { type: 'sine', vol: 0.1, slide: 3 });
  }
  meow() {
    this._tone(700, 0.32, { type: 'sawtooth', vol: 0.07, slide: 0.62 });
    this._tone(1050, 0.3, { type: 'sine', vol: 0.09, slide: 0.6 });
  }

  /* ---------- Ambiente: mar ---------- */
  _startSea() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 520;
    this.seaGain = ctx.createGain();
    this.seaGain.gain.value = 0.0;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.11;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(this.seaGain.gain);
    src.connect(f).connect(this.seaGain).connect(this.sfx);
    src.start();
    lfo.start();
  }
  /** 0..1 según lo cerca que esté el jugador de la costa. */
  setSea(amount) {
    if (this.seaGain) this.seaGain.gain.setTargetAtTime(0.02 + amount * 0.075, this.ctx.currentTime, 0.6);
  }

  /* ---------- Música generativa ---------- */
  startMusic() {
    if (!this.ctx || this._timer) return;
    this.music.gain.setTargetAtTime(0.34, this.ctx.currentTime, 1.5);
    const BAR = 4.8;
    let nextBar = this.ctx.currentTime + 0.3;
    const schedule = () => {
      while (nextBar < this.ctx.currentTime + 1.2) {
        this._playBar(nextBar, BAR);
        nextBar += BAR;
      }
    };
    schedule();
    this._timer = setInterval(schedule, 400);
  }

  _playBar(t, len) {
    const ctx = this.ctx;
    const chord = CHORDS[this._bar % CHORDS.length];
    this._bar++;
    // colchón
    for (const n of chord) {
      for (const detune of [-5, 6]) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = NOTE(n);
        o.detune.value = detune;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.05, t + len * 0.4);
        g.gain.linearRampToValueAtTime(0.0001, t + len * 1.15);
        o.connect(g).connect(this.musicBus);
        o.start(t);
        o.stop(t + len * 1.2);
      }
    }
    // arpa: notas dispersas
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      if (Math.random() > (i % 2 === 0 ? 0.62 : 0.3)) continue;
      const n = SCALE[Math.floor(Math.random() * SCALE.length)];
      const at = t + (i / steps) * len + (Math.random() - 0.5) * 0.03;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = NOTE(n);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.11, at + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
      o.connect(g).connect(this.musicBus);
      o.start(at);
      o.stop(at + 1.7);
    }
  }
}
