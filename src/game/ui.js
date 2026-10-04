/* ============================================================
   HUD: tarjeta del héroe, misión, minimapa, etiquetas, avisos
   ============================================================ */
import * as THREE from 'three';
import { state, esc, heroLevel, progress } from './state.js';
import { POIS, CHESTS, BUILDINGS, PATHS, DOCK, toWorld } from '../world/layout.js';
import { terrainHeight } from '../world/terrain.js';

const $ = (id) => document.getElementById(id);

const SVG = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  sound:
    SVG('<path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><g class="on"><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></g><g class="off"><path d="m17 9 5 6M22 9l-5 6"/></g>'),
  music: SVG('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/><g class="off"><path d="M3 3l18 18"/></g>'),
  night:
    SVG('<g class="off"><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g><g class="on"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="currentColor"/></g>')
};

/* ---------- Avisos (logros, descubrimientos) ---------- */
export function toast(kicker, title, desc = '', medal = '★', ms = 4200) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="medal">${esc(medal)}</span><div><small>${esc(kicker)}</small><b>${esc(title)}</b>${desc ? `<span>${esc(desc)}</span>` : ''}</div>`;
  const box = $('toasts');
  box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 450);
  }, ms);
}

/* ---------- Etiquetas HTML proyectadas desde el mundo 3D ---------- */
const _v = new THREE.Vector3();
export class Labels {
  constructor(camera) {
    this.camera = camera;
    this.box = $('labels');
    this.items = [];
  }
  /** @returns {{el: HTMLElement, pos: THREE.Vector3, show: boolean}} */
  add(pos, cls, html, { near = 0, far = 60, fade = 12 } = {}) {
    const el = document.createElement('div');
    el.className = `label ${cls}`;
    el.innerHTML = html;
    this.box.appendChild(el);
    const item = { el, pos, near, far, fade, show: true, _on: null };
    this.items.push(item);
    return item;
  }
  update(w, h, enabled) {
    for (const it of this.items) {
      let alpha = 0;
      if (enabled && it.show) {
        const dist = this.camera.position.distanceTo(it.pos);
        _v.copy(it.pos).project(this.camera);
        if (_v.z < 1 && Math.abs(_v.x) < 1.15 && Math.abs(_v.y) < 1.15 && dist > it.near) {
          alpha = Math.min(1, Math.max(0, (it.far - dist) / it.fade));
          if (alpha > 0) {
            const x = (_v.x * 0.5 + 0.5) * w, y = (-_v.y * 0.5 + 0.5) * h;
            it.el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          }
        }
      }
      const on = alpha > 0.01;
      if (on) it.el.style.opacity = alpha.toFixed(2);
      if (on !== it._on) {
        it._on = on;
        it.el.style.display = on ? '' : 'none';
      }
    }
  }
}

/* ---------- Minimapa ---------- */
const MAP_R = 64; // radio de mundo visible
export class Minimap {
  constructor() {
    this.cv = $('minimap');
    this.ctx = this.cv.getContext('2d');
    this.size = this.cv.width;
    this.scale = this.size / (MAP_R * 2);
    this.base = this._drawBase();
  }
  _px(x, z) {
    return [(x + MAP_R) * this.scale, (z + MAP_R) * this.scale];
  }
  _drawBase() {
    const c = document.createElement('canvas');
    const S = (c.width = c.height = this.size);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(S, S);
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const x = px / this.scale - MAP_R, z = py / this.scale - MAP_R;
        const h = terrainHeight(x, z);
        let r, g, b;
        if (h < -1.2) [r, g, b] = [22, 58, 96];
        else if (h < 0.02) [r, g, b] = [44, 104, 146];
        else if (h < 0.6) [r, g, b] = [224, 207, 160];
        else if (h < 3.2) [r, g, b] = [86, 150, 78];
        else [r, g, b] = [116, 172, 92];
        const i = (py * S + px) * 4;
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // caminos
    ctx.strokeStyle = 'rgba(214,184,132,0.95)';
    ctx.lineCap = ctx.lineJoin = 'round';
    for (const p of PATHS) {
      ctx.lineWidth = p.w * 2 * this.scale;
      ctx.beginPath();
      p.pts.forEach(([x, z], i) => (i ? ctx.lineTo(...this._px(x, z)) : ctx.moveTo(...this._px(x, z))));
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(190,182,168,1)';
    ctx.beginPath();
    ctx.arc(...this._px(0, 0), 9 * this.scale, 0, Math.PI * 2);
    ctx.fill();
    // muelle
    ctx.fillStyle = '#9a6a40';
    const [dx, dz] = this._px(DOCK.x0, DOCK.z0);
    ctx.fillRect(dx, dz, (DOCK.x1 - DOCK.x0) * this.scale, (DOCK.z1 - DOCK.z0) * this.scale);
    // edificios
    for (const b of Object.values(BUILDINGS)) {
      for (const [cx, cz, hw, hd] of b.boxes) {
        const w = toWorld(b, cx, cz);
        const [x, y] = this._px(w.x, w.z);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-b.ry);
        ctx.fillStyle = '#5a4634';
        ctx.fillRect(-hw * this.scale, -hd * this.scale, hw * 2 * this.scale, hd * 2 * this.scale);
        ctx.restore();
      }
    }
    return c;
  }
  draw(player, camYaw) {
    const { ctx, size: S } = this;
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(this.base, 0, 0);
    // cofres encontrados
    for (const ch of CHESTS) {
      if (!state.save.chests[ch.id]) continue;
      const [x, y] = this._px(ch.x, ch.z);
      ctx.fillStyle = '#f2d36b';
      ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
    }
    // puntos de interés
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 15px Inter, sans-serif';
    for (const poi of POIS) {
      const [x, y] = this._px(poi.pos.x, poi.pos.z);
      const done = state.save.talked[poi.id];
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = done ? '#2e6b45' : '#14162b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = done ? '#7ad68a' : '#e8c66a';
      ctx.stroke();
      ctx.fillStyle = done ? '#d6f5dc' : '#f8e7ae';
      ctx.fillText(done ? '✓' : poi.icon, x, y + 1);
    }
    // jugador: cono de visión + flecha
    const [px, py] = this._px(player.x, player.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-camYaw);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 46);
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 46, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI - player.yaw);
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(8, 9);
    ctx.lineTo(0, 4.5);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#14162b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    ctx.restore();
    // norte
    ctx.fillStyle = '#f8e7ae';
    ctx.font = '900 17px Cinzel, serif';
    ctx.fillText('N', S / 2, 17);
  }
}

/* ---------- HUD ---------- */
export class Hud {
  /** @param {object} h { onMenu, onLang, onSound, onMusic, onNight, onTravel(poiId), onPrompt } */
  constructor(h) {
    this.h = h;
    this.root = $('hud');
    this.prompt = $('prompt');
    this.promptText = this.prompt.querySelector('span');
    this.banner = $('zoneBanner');
    this.help = $('help');
    this.quest = $('questLog');
    this._bannerTimer = 0;

    $('btnSound').innerHTML = ICON.sound;
    $('btnMusic').innerHTML = ICON.music;
    $('btnNight').innerHTML = ICON.night;
    $('btnMenu').addEventListener('click', () => h.onMenu());
    $('btnLang').addEventListener('click', () => h.onLang());
    $('titleLang').addEventListener('click', () => h.onLang());
    $('btnSound').addEventListener('click', () => h.onSound());
    $('btnMusic').addEventListener('click', () => h.onMusic());
    $('btnNight').addEventListener('click', () => h.onNight());
    $('heroCard').addEventListener('click', () => h.onMenu('hero'));
    this.prompt.addEventListener('click', () => h.onPrompt());
    $('btnAct').addEventListener('click', () => h.onPrompt());
    $('questToggle').addEventListener('click', () => {
      const collapsed = this.quest.classList.toggle('collapsed');
      $('questToggle').setAttribute('aria-expanded', String(!collapsed));
    });
    $('questList').addEventListener('click', (e) => {
      const b = e.target.closest('[data-poi]');
      if (b) h.onTravel(b.dataset.poi);
    });
    if (innerWidth < 760) this.quest.classList.add('collapsed');
    // los botones no deben robar el foco del teclado al juego
    this.root.addEventListener('click', (e) => e.target.closest('button')?.blur());
  }

  show() {
    this.root.hidden = false;
    clearTimeout(this._helpTimer);
    this.help.classList.remove('fade');
    this._helpTimer = setTimeout(() => this.help.classList.add('fade'), 14000);
  }

  /** Vuelve a pintar todos los textos (idioma / progreso). */
  refresh() {
    const { t, cv } = state;
    const lv = heroLevel(), p = progress();
    const touch = matchMedia('(pointer: coarse)').matches;
    $('heroPortrait').src = state.portrait;
    $('heroName').textContent = cv.hero.shortName;
    $('heroLevel').textContent = `${t.hud.level} ${lv.level}`;
    $('heroClass').textContent = `${cv.hero.klass} · ${cv.hero.title}`;
    $('exploreLabel').textContent = t.hud.explored;
    $('explorePct').textContent = `${p.pct}%`;
    $('exploreFill').style.width = `${p.pct}%`;
    $('questKicker').textContent = t.hud.quest;
    $('questTitle').textContent = t.hud.questTitle;
    $('questList').innerHTML = POIS.map((poi) => {
      const done = state.save.talked[poi.id];
      return `<li><button class="quest-step${done ? ' done' : ''}" type="button" data-poi="${poi.id}" title="${esc(t.hud.travel)}: ${esc(t.zones[poi.id][0])}"><span class="box"></span><span>${esc(t.questSteps[poi.id])}</span><span class="go">${esc(t.hud.travel)} ➤</span></button></li>`;
    }).join('');
    $('questRelics').innerHTML = `<span>${esc(t.hud.relics)}</span><b>${p.chests} / ${p.totalChests}</b>`;
    $('btnMenu').textContent = `☰ ${t.hud.menu}`;
    const langs = ['es', 'en'].map((l) => `<span class="lang-opt${l === state.lang ? ' on' : ''}">${l.toUpperCase()}</span>`).join('');
    for (const id of ['btnLang', 'titleLang']) {
      $(id).innerHTML = langs;
      $(id).title = t.hud.lang;
      $(id).setAttribute('aria-label', t.hud.lang);
    }
    for (const [id, key] of [['btnSound', 'sound'], ['btnMusic', 'music'], ['btnNight', 'night'], ['btnMenu', 'menu']]) {
      $(id).title = t.hud[key];
      $(id).setAttribute('aria-label', t.hud[key]);
    }
    this.help.textContent = touch ? t.hud.helpTouch : t.hud.help;
    // pantalla de título
    $('titleKicker').textContent = t.title.kicker;
    $('titleRole').textContent = t.title.role;
    $('titleGame').textContent = t.title.game;
    $('btnPlay').textContent = t.title.play;
    $('btnQuick').textContent = t.title.quick;
    $('titleHint').textContent = touch ? t.title.hintTouch : t.title.hintDesktop;
  }

  setToggles({ sfx, music, night }) {
    $('btnSound').setAttribute('aria-pressed', String(sfx));
    $('btnMusic').setAttribute('aria-pressed', String(music));
    $('btnNight').setAttribute('aria-pressed', String(night));
  }

  setPrompt(text) {
    if (text === this._prompt) return;
    this._prompt = text;
    this.prompt.hidden = !text;
    $('btnAct').classList.toggle('ready', !!text);
    if (text) this.promptText.textContent = text;
  }

  showZone(name, sub) {
    this.banner.querySelector('.zone-name').textContent = name;
    this.banner.querySelector('.zone-sub').textContent = sub;
    this.banner.classList.add('show');
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => this.banner.classList.remove('show'), 2800);
  }
}
