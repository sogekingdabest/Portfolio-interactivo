/* ============================================================
   JUEGO: bucle principal, jugador, interacciones y progreso
   ============================================================ */
import * as THREE from 'three';
import { clamp, damp, dampAngle, angleDelta } from '../engine/kit.js';
import { Input } from '../engine/input.js';
import { AudioSys } from '../engine/audio.js';
import { FollowCamera } from '../engine/camera.js';
import { buildWorld, HERO_LOOK } from '../world/world.js';
import { buildEnvironment } from '../world/environment.js';
import { makeCharacter } from '../world/characters.js';
import { groundAt, shoreDist } from '../world/terrain.js';
import { POIS, PROPS, SPAWN, BUILDINGS, arrivalSpot, toWorld } from '../world/layout.js';
import { state, persist, setLang, resetProgress, progress } from './state.js';
import { Hud, Labels, Minimap, toast } from './ui.js';
import { Dialog } from './dialog.js';
import { Panels } from './panels.js';

const SPEED = 8.4;
const PLAYER_R = 0.42;
const WADE_LIMIT = -0.22; // hasta dónde se puede meter en el agua
const LABEL_HEIGHT = { hero: 5.4, quests: 9.2, skills: 8.2, education: 9.4, forge: 7.6, contact: 9.2 };
const LABEL_FRONT = { quests: 5, skills: 4, education: 5.5, forge: 3, contact: 3 };

/** Retratos del héroe renderizados con el propio motor (HUD y ficha). */
function makePortraits(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2a4686);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a4a7a, 1.7));
  const key = new THREE.DirectionalLight(0xfff2d8, 2.6);
  key.position.set(2.5, 4, 5);
  scene.add(key);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ color: 0x1b2c5c }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const hero = makeCharacter(HERO_LOOK);
  hero.group.rotation.y = 0.5;
  hero.update(0, 0.4, 0);
  scene.add(hero.group);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const shot = (w, h, pos, look) => {
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.position.set(...pos);
    cam.lookAt(...look);
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
    return renderer.domElement.toDataURL('image/png');
  };
  const ratio = renderer.getPixelRatio();
  renderer.setPixelRatio(1);
  const full = shot(440, 550, [1.5, 1.7, 5.3], [0, 1.03, 0]);
  const head = shot(168, 168, [1.0, 1.95, 2.7], [0, 1.66, 0]);
  renderer.setPixelRatio(ratio);
  return { full, head };
}

export class Game {
  constructor(canvas) {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const lowPower = coarse || (navigator.hardwareConcurrency || 8) <= 4;
    this.lowPower = lowPower;

    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    try {
      const shots = makePortraits(renderer);
      state.portrait = shots.head;
      state.portraitFull = shots.full;
    } catch (err) {
      console.warn('No se pudo generar el retrato', err);
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.3, 1400);
    this.world = buildWorld(this.scene, { lowPower });
    this.env = buildEnvironment(this.scene, this.world, { lowPower });
    this.cam = new FollowCamera(this.camera);

    this.mode = 'title';
    this.time = 0;
    this._last = performance.now();
    this.zone = null;
    this.focus = null;
    this.talkTarget = null;
    this._frame = 0;
    this._stepTimer = 0;
    this._seaTimer = 0;
    this._focusPos = new THREE.Vector3();
    this._v = new THREE.Vector3();

    /* jugador */
    const char = makeCharacter(HERO_LOOK);
    this.scene.add(char.group);
    this.player = { char, x: SPAWN.x, z: SPAWN.z, y: groundAt(SPAWN.x, SPAWN.z), yaw: SPAWN.yaw, move: 0, target: null, stuck: 0 };

    /* marcador de destino (clic para caminar) */
    this.marker = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.5, 28),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })
    );
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.visible = false;
    this.marker.renderOrder = 3;
    this.scene.add(this.marker);

    /* sistemas */
    this.audio = new AudioSys();
    this.audio.sfxOn = state.save.sfx;
    this.audio.musicOn = state.save.music;
    this.dialog = new Dialog(this.audio);
    this.panels = new Panels({
      audio: this.audio,
      onClose: () => this.onWindowClosed(),
      onContact: () => this.unlock('contact'),
      onReset: () => this.reset()
    });
    this.hud = new Hud({
      onMenu: (tab) => this.mode === 'play' && this.openWindow(tab),
      onLang: () => this.toggleLang(),
      onSound: () => this.toggleSound(),
      onMusic: () => this.toggleMusic(),
      onNight: () => this.toggleNight(),
      onTravel: (id) => this.travel(id),
      onPrompt: () => this.action()
    });
    this.labels = new Labels(this.camera);
    this.minimap = new Minimap();
    this.buildInteractables();
    this.buildLabels();

    this.input = new Input(canvas, {
      onAnyKey: () => this.audio.unlock(),
      onAction: () => this.action(),
      onCancel: () => (this.panels.isOpen ? this.panels.close() : this.dialog.advance()),
      onMenu: () => (this.panels.isOpen ? this.panels.close() : this.mode === 'play' && this.openWindow()),
      onNight: () => this.mode === 'play' && this.toggleNight(),
      onDigit: (n) => this.panels.isOpen && this.panels.showIndex(n - 1),
      onRotate: (dx, dy) => this.mode !== 'title' && this.cam.rotate(dx, dy),
      onZoom: (d) => this.mode !== 'title' && this.cam.zoom(d),
      onTap: (x, y) => this.tap(x, y)
    });
    this.input.bindJoystick(document.getElementById('joy'), document.getElementById('joyKnob'));

    /* estado guardado */
    for (const c of this.world.chests) c.chest.setOpen(!!state.save.chests[c.id], true);
    this.hud.refresh();
    this.hud.setToggles({ sfx: state.save.sfx, music: state.save.music, night: false });

    /* pantalla de título */
    const play = document.getElementById('btnPlay'), quick = document.getElementById('btnQuick');
    play.addEventListener('click', () => this.start(false));
    quick.addEventListener('click', () => this.start(true));
    play.disabled = quick.disabled = false;
    play.focus({ preventScroll: true });

    addEventListener('resize', () => this.resize());
    this.resize();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.audio.ctx?.suspend();
      else if (this.mode !== 'title') this.audio.ctx?.resume();
    });
    renderer.setAnimationLoop(() => this.tick());
  }

  /* ---------- montaje ---------- */
  buildInteractables() {
    const cat = PROPS.cat, sign = PROPS.signpost;
    this.interactables = [
      ...this.world.npcs.map((npc) => ({ type: 'npc', npc, x: npc.x, y: npc.y, z: npc.z, r: 3.1 })),
      ...this.world.chests.map((chest) => ({ type: 'chest', chest, x: chest.x, y: chest.y, z: chest.z, r: 2.4 })),
      { type: 'cat', x: cat.x, y: groundAt(cat.x, cat.z), z: cat.z, r: 2.1 },
      { type: 'sign', x: sign.x, y: groundAt(sign.x, sign.z), z: sign.z, r: 2.1 }
    ];
  }

  buildLabels() {
    this.poiLabels = {};
    this.npcMarks = {};
    this.npcNames = {};
    for (const npc of this.world.npcs) {
      const { poi } = npc;
      let p;
      if (poi.building) {
        const b = BUILDINGS[poi.building];
        const w = toWorld(b, 0, LABEL_FRONT[poi.id]);
        p = new THREE.Vector3(w.x, groundAt(b.x, b.z) + LABEL_HEIGHT[poi.id], w.z);
      } else {
        p = new THREE.Vector3(0, groundAt(0, 0) + LABEL_HEIGHT.hero, 0);
      }
      this.poiLabels[poi.id] = this.labels.add(p, 'label-poi', '', { near: 13, far: 95, fade: 30 });
      this.npcMarks[poi.id] = this.labels.add(new THREE.Vector3(npc.x, npc.y + 2.9, npc.z), 'label-mark', '!', { far: 46, fade: 10 });
      this.npcNames[poi.id] = this.labels.add(new THREE.Vector3(npc.x, npc.y + 2.3, npc.z), 'label-npc', '', { far: 15, fade: 4 });
    }
    this.refreshLabels();
  }

  refreshLabels() {
    const { t, save } = state;
    for (const poi of POIS) {
      const done = !!save.talked[poi.id];
      const plate = this.poiLabels[poi.id];
      plate.el.innerHTML = `<b>${t.zones[poi.id][0]}</b><small>${t.zones[poi.id][1]}</small>`;
      plate.el.classList.toggle('done', done);
      this.npcMarks[poi.id].show = !done;
      this.npcNames[poi.id].el.textContent = t.npcs[poi.npc];
    }
  }

  refreshAll() {
    this.hud.refresh();
    this.refreshLabels();
    this.panels.refresh();
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 64 : 50;
    this.camera.updateProjectionMatrix();
    for (const fx of this.world.fx) fx.resize(h * this.renderer.getPixelRatio(), this.camera.fov);
  }

  /* ---------- flujo ---------- */
  start(quick) {
    if (this.mode !== 'title') return;
    this.audio.unlock();
    this.audio.select();
    this.mode = 'play';
    this.zone = 'hero'; // ya estamos en la plaza: no repetir su rótulo
    document.getElementById('title').classList.add('gone');
    document.activeElement?.blur();
    this.hud.show();
    setTimeout(() => this.unlock('first_steps'), 2600);
    if (quick) this.openWindow('hero');
    else setTimeout(() => this.mode === 'play' && this.hud.showZone(state.t.meta.island, state.cv.hero.name), 900);
  }

  openWindow(tab) {
    this.player.target = null;
    this.mode = 'window';
    this.panels.open(tab);
  }

  onWindowClosed() {
    this.mode = 'play';
    const p = progress();
    if (p.talked === p.totalTalk && !state.save.ending) setTimeout(() => this.ending(), 500);
  }

  ending() {
    if (this.mode !== 'play' || state.save.ending) return;
    state.save.ending = true;
    persist();
    this.audio.fanfare();
    this.world.burst(this.player.x, this.player.y + 2.4, this.player.z, 60);
    toast(state.t.toast.questDone, state.t.hud.questTitle, '', '✦', 5200);
    this.unlock('talk_all', true);
    this.mode = 'dialog';
    this.talkTarget = null;
    this.dialog.open(state.t.npcs.narrator, state.t.dialogs.ending, () => this.openWindow('contact'));
  }

  unlock(id, silent = false) {
    if (state.save.ach[id] || !state.t.achievements[id]) return;
    state.save.ach[id] = true;
    persist();
    const [name, desc] = state.t.achievements[id];
    toast(state.t.toast.achievement, name, desc);
    if (!silent) this.audio.discover();
    this.panels.refresh();
  }

  toggleLang() {
    setLang(state.lang === 'es' ? 'en' : 'es', true);
    this.refreshAll();
    if (this.mode !== 'title') this.unlock('polyglot');
  }
  toggleSound() {
    state.save.sfx = !state.save.sfx;
    this.audio.unlock();
    this.audio.setSfx(state.save.sfx);
    this.syncToggles();
  }
  toggleMusic() {
    state.save.music = !state.save.music;
    this.audio.unlock();
    this.audio.setMusic(state.save.music);
    this.syncToggles();
  }
  toggleNight() {
    this.env.setNight(!this.env.isNight);
    if (this.env.isNight) this.unlock('night');
    this.syncToggles();
  }
  syncToggles() {
    persist();
    this.hud.setToggles({ sfx: state.save.sfx, music: state.save.music, night: this.env.isNight });
  }

  reset() {
    resetProgress();
    for (const c of this.world.chests) c.chest.setOpen(false, true);
    this.panels.close();
    this.placePlayer(SPAWN.x, SPAWN.z, SPAWN.yaw);
    this.refreshAll();
  }

  /* ---------- interacción ---------- */
  action() {
    if (this.mode === 'title') this.start(false);
    else if (this.mode === 'dialog') this.dialog.advance();
    else if (this.mode === 'play') {
      this.updateFocus(); // el foco puede haber cambiado desde el último frame
      if (this.focus) this.interact(this.focus);
    }
  }

  promptFor(it) {
    const { t } = state;
    switch (it.type) {
      case 'npc': return `${t.hud.talk} ${t.npcs[it.npc.id]}`;
      case 'chest': return t.hud.open;
      case 'cat': return `${t.hud.pet} ${t.npcs.cat}`;
      default: return t.hud.read;
    }
  }

  interact(it) {
    const p = this.player, { t } = state;
    p.target = null;
    this.marker.visible = false;
    p.yaw = Math.atan2(it.x - p.x, it.z - p.z);
    this.mode = 'dialog';
    this.talkTarget = it;
    this.hud.setPrompt('');

    if (it.type === 'npc') {
      const { npc } = it, { poi } = npc;
      const first = !state.save.talked[poi.id];
      this.dialog.open(t.npcs[npc.id], t.dialogs[first ? npc.id : `${npc.id}Again`], () => {
        if (first) {
          state.save.talked[poi.id] = true;
          persist();
          this.world.burst(npc.x, npc.y + 2.3, npc.z, 30);
          this.audio.discover();
          toast(state.t.toast.discovered, state.t.zones[poi.id][0], state.t.zones[poi.id][1], poi.icon);
          this.refreshAll();
        }
        this.openWindow(poi.id);
      });
    } else if (it.type === 'chest') {
      const c = it.chest, relic = state.cv.relics[c.id];
      state.save.chests[c.id] = true;
      persist();
      c.chest.setOpen(true);
      this.audio.chest();
      this.world.burst(c.x, c.y + 0.9, c.z, 44);
      this.dialog.open(t.npcs.relic, [t.dialogs.relicFound(relic.name), relic.desc], () => {
        this.mode = 'play';
        this.refreshAll();
        const pr = progress();
        if (pr.chests === pr.totalChests) this.unlock('chests_all');
      });
    } else if (it.type === 'cat') {
      this.audio.meow();
      this.dialog.open(t.npcs.cat, t.dialogs.cat, () => {
        this.mode = 'play';
        this.unlock('cat');
      });
    } else {
      this.dialog.open(t.npcs.signpost, t.dialogs.signpost, () => (this.mode = 'play'));
    }
  }

  travel(poiId) {
    if (this.mode !== 'play') return;
    const poi = POIS.find((p) => p.id === poiId);
    if (!poi) return;
    const fade = document.getElementById('fade');
    fade.classList.add('on');
    this.audio.whoosh();
    this.mode = 'travel';
    setTimeout(() => {
      const spot = arrivalSpot(poi);
      this.placePlayer(spot.x, spot.z, Math.atan2(poi.pos.x - spot.x, poi.pos.z - spot.z));
      this.mode = 'play';
      fade.classList.remove('on');
      this.unlock('fast');
    }, 320);
  }

  placePlayer(x, z, yaw) {
    const p = this.player;
    const pos = this.collide(x, z);
    p.x = pos.x;
    p.z = pos.z;
    p.y = groundAt(p.x, p.z);
    p.yaw = yaw;
    p.target = null;
    this.marker.visible = false;
    // cámara detrás del jugador, sin barrido largo
    this.cam.yaw = this.cam.cYaw = yaw + Math.PI;
    this.cam.focus.set(p.x, p.y + 1.6, p.z);
    this.zone = null;
  }

  /** Clic / toque sobre el mundo: caminar hasta ahí o hasta un interactuable. */
  tap(sx, sy) {
    this.audio.unlock();
    if (this.mode === 'dialog') return this.dialog.advance();
    if (this.mode !== 'play') return;
    const w = innerWidth, h = innerHeight;
    let best = null, bestD = 54;
    for (const it of this.interactables) {
      if (it.type === 'chest' && state.save.chests[it.chest.id]) continue;
      this._v.set(it.x, it.y + 1.1, it.z).project(this.camera);
      if (this._v.z > 1) continue;
      const d = Math.hypot((this._v.x * 0.5 + 0.5) * w - sx, (-this._v.y * 0.5 + 0.5) * h - sy);
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    }
    if (best) {
      this.setTarget(best.x, best.z, best);
      return;
    }
    const hit = this.pickGround(sx, sy);
    if (hit) this.setTarget(hit.x, hit.z, null);
  }

  setTarget(x, z, it) {
    this.player.target = { x, z, it };
    this.player.stuck = 0;
    this.marker.position.set(x, groundAt(x, z) + 0.08, z);
    this.marker.visible = true;
  }

  /** Intersección rayo-terreno por "ray marching" sobre el campo de alturas. */
  pickGround(sx, sy) {
    const o = this.camera.position;
    const d = this._v.set((sx / innerWidth) * 2 - 1, -(sy / innerHeight) * 2 + 1, 0.5).unproject(this.camera).sub(o).normalize();
    let prev = 0;
    for (let t = 1; t < 260; t += 0.7) {
      const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
      if (y <= groundAt(x, z)) {
        let a = prev, b = t;
        for (let i = 0; i < 8; i++) {
          const m = (a + b) / 2;
          if (o.y + d.y * m <= groundAt(o.x + d.x * m, o.z + d.z * m)) b = m;
          else a = m;
        }
        const hx = o.x + d.x * b, hz = o.z + d.z * b;
        return groundAt(hx, hz) > WADE_LIMIT ? { x: hx, z: hz } : null;
      }
      prev = t;
    }
    return null;
  }

  /* ---------- física del jugador ---------- */
  collide(x, z) {
    const { circles, boxes } = this.world;
    for (let pass = 0; pass < 2; pass++) {
      for (const c of circles) {
        const dx = x - c.x, dz = z - c.z, min = c.r + PLAYER_R;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 0.001;
          x = c.x + (dx / d) * min;
          z = c.z + (dz / d) * min;
        }
      }
      for (const b of boxes) {
        const dx = x - b.x, dz = z - b.z;
        if (Math.abs(dx) + Math.abs(dz) > (b.hw + b.hd + PLAYER_R) * 1.5) continue;
        const c = Math.cos(b.rot), s = Math.sin(b.rot);
        let lx = dx * c - dz * s, lz = dx * s + dz * c;
        const qx = clamp(lx, -b.hw, b.hw), qz = clamp(lz, -b.hd, b.hd);
        const ox = lx - qx, oz = lz - qz;
        const d = Math.hypot(ox, oz);
        if (d >= PLAYER_R) continue;
        if (d > 1e-5) {
          lx = qx + (ox / d) * PLAYER_R;
          lz = qz + (oz / d) * PLAYER_R;
        } else if (b.hw - Math.abs(lx) < b.hd - Math.abs(lz)) {
          lx = Math.sign(lx || 1) * (b.hw + PLAYER_R);
        } else {
          lz = Math.sign(lz || 1) * (b.hd + PLAYER_R);
        }
        x = b.x + lx * c + lz * s;
        z = b.z - lx * s + lz * c;
      }
    }
    return { x, z };
  }

  updatePlayer(dt) {
    const p = this.player;
    const mv = this.input.moveVector();
    let dx = 0, dz = 0, amount = 0;
    if (mv.len > 0.08) {
      p.target = null;
      this.marker.visible = false;
      const f = this.cam.forward();
      dx = -f.z * mv.x + f.x * mv.y;
      dz = f.x * mv.x + f.z * mv.y;
      amount = mv.len;
    } else if (p.target) {
      const tx = p.target.x - p.x, tz = p.target.z - p.z;
      const dist = Math.hypot(tx, tz);
      const reach = p.target.it ? p.target.it.r - 0.7 : 0.3;
      if (dist < reach) {
        const it = p.target.it;
        p.target = null;
        this.marker.visible = false;
        if (it) this.interact(it);
      } else {
        dx = tx / dist;
        dz = tz / dist;
        amount = 1;
      }
    }

    if (amount > 0) {
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      p.yaw = dampAngle(p.yaw, Math.atan2(dx, dz), 14, dt);
      const step = SPEED * amount * dt;
      const from = { x: p.x, z: p.z };
      let next = this.collide(p.x + dx * step, p.z + dz * step);
      if (groundAt(next.x, next.z) < WADE_LIMIT) {
        // deslizar a lo largo de la orilla
        const ax = this.collide(p.x + dx * step, p.z), az = this.collide(p.x, p.z + dz * step);
        if (groundAt(ax.x, ax.z) >= WADE_LIMIT) next = ax;
        else if (groundAt(az.x, az.z) >= WADE_LIMIT) next = az;
        else next = from;
      }
      p.x = next.x;
      p.z = next.z;
      const moved = Math.hypot(p.x - from.x, p.z - from.z);
      if (p.target) {
        p.stuck = moved < step * 0.25 ? p.stuck + dt : 0;
        if (p.stuck > 0.6) {
          const it = p.target.it;
          p.target = null;
          this.marker.visible = false;
          if (it && Math.hypot(it.x - p.x, it.z - p.z) < it.r) this.interact(it);
        }
      }
      amount *= clamp(moved / (step || 1), 0.25, 1);
      this._stepTimer -= dt * amount;
      if (this._stepTimer <= 0) {
        this._stepTimer = 0.29;
        this.audio.step();
      }
    }
    p.move = damp(p.move, amount, 12, dt);
    p.y = damp(p.y, groundAt(p.x, p.z), 18, dt);
  }

  updateFocus() {
    const p = this.player;
    let best = null, bestD = Infinity;
    for (const it of this.interactables) {
      if (it.type === 'chest' && state.save.chests[it.chest.id]) continue;
      const d = Math.hypot(it.x - p.x, it.z - p.z);
      if (d < it.r && d < bestD) {
        bestD = d;
        best = it;
      }
    }
    this.focus = best;
    this.hud.setPrompt(best ? this.promptFor(best) : '');
  }

  updateZone() {
    const p = this.player;
    let found = null;
    for (const poi of POIS) {
      if (Math.hypot(p.x - poi.zone.x, p.z - poi.zone.z) < poi.zone.r) {
        found = poi.id;
        break;
      }
    }
    if (found !== this.zone) {
      this.zone = found;
      if (found) this.hud.showZone(...state.t.zones[found]);
    }
    // dentro de una zona su rótulo flotante sobra (ya lo dice el banner)
    for (const poi of POIS) this.poiLabels[poi.id].show = poi.id !== found;
  }

  /* ---------- bucle ---------- */
  tick() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this._last) / 1000);
    this._last = now;
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  /** Avanza la simulación dt segundos (sin dibujar). */
  update(dt) {
    const t = (this.time += dt);
    const p = this.player;
    const playing = this.mode === 'play';

    if (playing) {
      this.updatePlayer(dt);
      // updatePlayer puede iniciar un diálogo al llegar a su destino
      if (this.mode === 'play') {
        this.updateFocus();
        this.updateZone();
      }
    } else {
      p.move = damp(p.move, 0, 12, dt);
    }
    p.char.group.position.set(p.x, p.y, p.z);
    p.char.group.rotation.y = p.yaw;
    p.char.update(dt, t, p.move);

    for (const n of this.world.npcs) {
      const dist = Math.hypot(p.x - n.x, p.z - n.z);
      const near = dist < 8 && this.mode !== 'title';
      n.yaw = dampAngle(n.yaw, near ? Math.atan2(p.x - n.x, p.z - n.z) : n.home, 6, dt);
      n.char.group.rotation.y = n.yaw;
      let anim;
      if (near && playing && !state.save.talked[n.poi.id] && dist > 3.4) anim = 'wave';
      else if (n.id === 'smith' && !near) anim = 'hammer';
      n.char.update(dt, t, 0, anim);
    }
    for (const c of this.world.chests) c.chest.update(dt, t);

    if (this.marker.visible) {
      const s = 1 + Math.sin(t * 7) * 0.14;
      this.marker.scale.set(s, s, 1);
    }

    this.world.update(dt, t);
    this.dialog.update(dt);

    /* cámara */
    const focus = this._focusPos;
    if (this.mode === 'title') {
      this.cam.update(dt, focus.set(3, 3.5, -3), { yaw: 0.9 + t * 0.07, pitch: 0.44, dist: 84, speed: 2.5 });
    } else if (this.mode === 'dialog' && this.talkTarget) {
      const it = this.talkTarget;
      const a = Math.atan2(it.x - p.x, it.z - p.z);
      // plano por encima del hombro, por el lado que menos obligue a girar la cámara
      const back = a + Math.PI;
      const side = Math.abs(angleDelta(this.cam.cYaw, back + 0.8)) < Math.abs(angleDelta(this.cam.cYaw, back - 0.8)) ? 0.8 : -0.8;
      focus.set((p.x + it.x) / 2, (p.y + it.y) / 2 + 1.55, (p.z + it.z) / 2);
      this.cam.update(dt, focus, { yaw: back + side, pitch: 0.34, dist: Math.min(this.cam.dist, 10.5), speed: 3.2 });
    } else {
      this.cam.update(dt, focus.set(p.x, p.y + 1.6, p.z));
    }
    this.env.update(dt, this.camera);

    this.labels.update(innerWidth, innerHeight, this.mode !== 'title');
    if (++this._frame % 3 === 0 && this.mode !== 'title') this.minimap.draw(p, this.cam.cYaw);

    this._seaTimer -= dt;
    if (this._seaTimer <= 0) {
      this._seaTimer = 0.5;
      this.audio.setSea(clamp(1 - shoreDist(p.x, p.z) / 20, 0, 1));
    }
  }
}
