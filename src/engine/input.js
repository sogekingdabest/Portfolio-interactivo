/* ============================================================
   ENTRADA: teclado, ratón, táctil (joystick virtual + gestos)
   ============================================================ */

const MOVE_KEYS = {
  KeyW: [0, 1], ArrowUp: [0, 1],
  KeyS: [0, -1], ArrowDown: [0, -1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0]
};

export class Input {
  /**
   * @param {HTMLElement} canvas
   * @param {object} handlers { onAction, onCancel, onMenu, onTap(x,y), onRotate(dx,dy), onZoom(delta), onAnyKey }
   */
  constructor(canvas, handlers) {
    this.h = handlers;
    this.keys = new Set();
    this.joy = { x: 0, y: 0, active: false };
    this.touch = matchMedia('(pointer: coarse)').matches;
    this.run = false;

    addEventListener('keydown', (e) => this._keydown(e));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    this._bindPointer(canvas);
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.h.onZoom?.(Math.sign(e.deltaY) * Math.min(3, Math.abs(e.deltaY) / 60 + 0.6));
    }, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _keydown(e) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    this.h.onAnyKey?.(e);
    if (MOVE_KEYS[e.code]) {
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow')) e.preventDefault();
      return;
    }
    if (e.repeat) return;
    switch (e.code) {
      case 'KeyE':
      case 'Space':
      case 'Enter':
      case 'NumpadEnter':
        // dejar que Enter/Espacio activen el botón o enlace que tenga el foco
        if (e.code !== 'KeyE' && e.target instanceof HTMLElement && e.target.closest('button, a, [role="tab"], summary')) return;
        e.preventDefault();
        this.h.onAction?.();
        break;
      case 'Escape':
        this.h.onCancel?.();
        break;
      case 'KeyM':
      case 'Tab':
        e.preventDefault();
        this.h.onMenu?.();
        break;
      case 'KeyN':
        this.h.onNight?.();
        break;
      default:
        if (/^Digit[1-7]$/.test(e.code)) this.h.onDigit?.(Number(e.code.slice(5)));
    }
  }

  _bindPointer(canvas) {
    const pts = new Map();
    let moved = 0, pinch = 0, downAt = 0;
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture?.(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
      if (pts.size === 1) {
        moved = 0;
        downAt = performance.now();
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        moved = 99;
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) this.h.onZoom?.((pinch - d) * 0.03);
        pinch = d;
        return;
      }
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6) this.h.onRotate?.(dx, dy);
    });
    const end = (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      pts.delete(e.pointerId);
      if (pts.size === 0 && moved <= 6 && performance.now() - downAt < 450 && e.type === 'pointerup') {
        this.h.onTap?.(e.clientX, e.clientY);
      }
      if (pts.size < 2) pinch = 0;
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  /** Conecta el joystick virtual (zona + pomo). */
  bindJoystick(zone, knob) {
    let id = null, cx = 0, cy = 0;
    const R = 46;
    const set = (x, y) => {
      const len = Math.hypot(x, y);
      if (len > R) {
        x = (x / len) * R;
        y = (y / len) * R;
      }
      knob.style.transform = `translate(${x}px, ${y}px)`;
      this.joy.x = x / R;
      this.joy.y = -y / R;
    };
    zone.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      id = e.pointerId;
      zone.setPointerCapture(id);
      const r = zone.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      this.joy.active = true;
      set(e.clientX - cx, e.clientY - cy);
    });
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId === id) set(e.clientX - cx, e.clientY - cy);
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      this.joy.active = false;
      set(0, 0);
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
  }

  /** Vector de movimiento en espacio de cámara: x = derecha, y = adelante. */
  moveVector() {
    let x = 0, y = 0;
    for (const code of this.keys) {
      const v = MOVE_KEYS[code];
      if (v) {
        x += v[0];
        y += v[1];
      }
    }
    if (this.joy.active) {
      x += this.joy.x;
      y += this.joy.y;
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y, len: Math.min(1, len) };
  }
}
