/* ============================================================
   CAJA DE DIÁLOGO con efecto máquina de escribir
   ============================================================ */

const CPS = 55; // caracteres por segundo

export class Dialog {
  constructor(audio) {
    this.audio = audio;
    this.el = document.getElementById('dialog');
    this.nameEl = document.getElementById('dialogName');
    this.textEl = document.getElementById('dialogText');
    this.active = false;
    this.lines = [];
    this.index = 0;
    this.shown = 0;
    this.onDone = null;
    this.el.addEventListener('click', () => this.advance());
  }

  open(name, lines, onDone) {
    this.active = true;
    this.lines = lines;
    this.index = 0;
    this.onDone = onDone;
    this.nameEl.textContent = name;
    this.el.hidden = false;
    document.body.classList.add('dialog');
    this._start();
  }

  _start() {
    this.shown = 0;
    this._last = 0;
    this.textEl.textContent = '';
    this.el.classList.remove('waiting');
  }

  get typing() {
    return this.shown < this.lines[this.index].length;
  }

  advance() {
    if (!this.active) return;
    if (this.typing) {
      this.shown = this.lines[this.index].length;
      this.textEl.textContent = this.lines[this.index];
      this.el.classList.add('waiting');
      return;
    }
    this.audio.select();
    if (++this.index < this.lines.length) {
      this._start();
      return;
    }
    this.active = false;
    this.el.hidden = true;
    document.body.classList.remove('dialog');
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }

  update(dt) {
    if (!this.active || !this.typing) return;
    const line = this.lines[this.index];
    this.shown = Math.min(line.length, this.shown + dt * CPS);
    const n = Math.floor(this.shown);
    if (n !== this._last) {
      this.textEl.textContent = line.slice(0, n);
      if (n % 3 === 0 && line[n - 1] !== ' ') this.audio.blip();
      this._last = n;
      if (n >= line.length) this.el.classList.add('waiting');
    }
  }
}
