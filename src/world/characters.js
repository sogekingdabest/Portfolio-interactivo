/* ============================================================
   PERSONAJES Y COFRES
   Muñecos articulados hechos con cajas (≈2 unidades de alto).
   El frente del personaje es +Z local; rotation.y = yaw.
   ============================================================ */
import * as THREE from 'three';

const matCache = new Map();
export function mat(hex) {
  let m = matCache.get(hex);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color: hex, flatShading: true });
    matCache.set(hex, m);
  }
  return m;
}
const glowCache = new Map();
function glowMat(hex) {
  let m = glowCache.get(hex);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: hex });
    glowCache.set(hex, m);
  }
  return m;
}

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CONE6 = new THREE.CylinderGeometry(0, 1, 1, 6);
const CYL8 = new THREE.CylinderGeometry(1, 1, 1, 8);
const OCTA = new THREE.OctahedronGeometry(1, 0);

function part(parent, geometry, material, sx, sy, sz, x, y, z) {
  const m = new THREE.Mesh(geometry, material);
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
const box = (parent, w, h, d, x, y, z, color) => part(parent, BOX, mat(color), w, h, d, x, y, z);
function pivot(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

const SKIN = 0xf0c8a0;
const EYE = 0x23232b;

/**
 * @param {object} o  colores y accesorios
 *   skin, hair, tunic, sleeves, pants, boots, belt, cape, beard, apron,
 *   hat: 'wizard' | 'hood' | 'band' | 'cap' | null, hatColor,
 *   prop: 'staff' | 'book' | 'mug' | 'hammer' | null, long: bool (túnica larga)
 */
export function makeCharacter(o = {}) {
  const skin = o.skin ?? SKIN;
  const tunic = o.tunic ?? 0x2f6fb0;
  const sleeves = o.sleeves ?? tunic;
  const pants = o.pants ?? 0x3b3f52;
  const boots = o.boots ?? 0x5a3a24;
  const hair = o.hair ?? 0x3a2a1e;

  const root = new THREE.Group();
  const body = pivot(root, 0, 0, 0);

  // piernas
  const legL = pivot(body, -0.17, 0.64, 0);
  const legR = pivot(body, 0.17, 0.64, 0);
  for (const leg of [legL, legR]) {
    box(leg, 0.25, 0.44, 0.27, 0, -0.22, 0, pants);
    box(leg, 0.28, 0.22, 0.36, 0, -0.53, 0.035, boots);
  }

  // torso
  box(body, 0.68, 0.74, 0.42, 0, 1.0, 0, tunic);
  box(body, 0.71, 0.11, 0.45, 0, 0.7, 0, o.belt ?? 0x4a3020);
  box(body, 0.12, 0.13, 0.03, 0, 0.7, 0.23, 0xe9c046);
  if (o.long) {
    box(body, 0.74, 0.5, 0.48, 0, 0.42, 0, tunic);
  }
  if (o.apron) {
    box(body, 0.5, 0.78, 0.04, 0, 0.78, 0.225, o.apron);
  }
  if (o.trim) {
    box(body, 0.2, 0.74, 0.03, 0, 1.0, 0.215, o.trim);
  }

  // brazos
  const armL = pivot(body, -0.45, 1.3, 0);
  const armR = pivot(body, 0.45, 1.3, 0);
  for (const arm of [armL, armR]) {
    box(arm, 0.21, 0.52, 0.23, 0, -0.24, 0, sleeves);
    box(arm, 0.19, 0.17, 0.21, 0, -0.58, 0, skin);
  }

  // cabeza
  const head = pivot(body, 0, 1.37, 0);
  box(head, 0.54, 0.52, 0.5, 0, 0.3, 0, skin);
  box(head, 0.075, 0.11, 0.03, -0.125, 0.3, 0.255, EYE);
  box(head, 0.075, 0.11, 0.03, 0.125, 0.3, 0.255, EYE);
  if (!o.bald) {
    box(head, 0.6, 0.17, 0.56, 0, 0.6, -0.01, hair);
    box(head, 0.6, 0.4, 0.15, 0, 0.38, -0.24, hair);
    box(head, 0.07, 0.26, 0.3, -0.29, 0.42, -0.06, hair);
    box(head, 0.07, 0.26, 0.3, 0.29, 0.42, -0.06, hair);
    if (o.longHair) box(head, 0.56, 0.5, 0.13, 0, 0.02, -0.25, hair);
    if (o.fringe) box(head, 0.46, 0.09, 0.05, 0, 0.5, 0.26, hair);
  }
  if (o.beard) {
    box(head, 0.44, 0.26, 0.12, 0, 0.1, 0.24, o.beard);
    box(head, 0.3, 0.2, 0.1, 0, -0.08, 0.23, o.beard);
  }
  if (o.glasses) {
    box(head, 0.2, 0.15, 0.02, -0.125, 0.3, 0.275, 0xbfe6ff);
    box(head, 0.2, 0.15, 0.02, 0.125, 0.3, 0.275, 0xbfe6ff);
    box(head, 0.5, 0.035, 0.03, 0, 0.36, 0.268, EYE);
  }

  const hatColor = o.hatColor ?? 0x5a3fa0;
  if (o.hat === 'wizard') {
    part(head, CYL8, mat(hatColor), 0.52, 0.06, 0.52, 0, 0.7, 0);
    const cone = part(head, CONE6, mat(hatColor), 0.33, 0.8, 0.33, 0, 1.12, -0.04);
    cone.rotation.x = -0.18;
    box(head, 0.68, 0.09, 0.68, 0, 0.76, 0, 0xe9c046).scale.set(0.5, 0.09, 0.5);
  } else if (o.hat === 'hood') {
    box(head, 0.66, 0.34, 0.6, 0, 0.56, -0.03, hatColor);
    box(head, 0.66, 0.5, 0.2, 0, 0.28, -0.26, hatColor);
    box(head, 0.09, 0.5, 0.4, -0.3, 0.3, -0.06, hatColor);
    box(head, 0.09, 0.5, 0.4, 0.3, 0.3, -0.06, hatColor);
  } else if (o.hat === 'band') {
    box(head, 0.58, 0.1, 0.54, 0, 0.46, 0, hatColor);
  } else if (o.hat === 'cap') {
    box(head, 0.6, 0.16, 0.56, 0, 0.66, 0, hatColor);
    box(head, 0.5, 0.05, 0.3, 0, 0.6, 0.36, hatColor);
  } else if (o.hat === 'laurel') {
    box(head, 0.6, 0.08, 0.56, 0, 0.56, 0, 0xe9c046);
  }

  // capa
  let cape = null;
  if (o.cape != null) {
    cape = pivot(body, 0, 1.36, -0.22);
    box(cape, 0.66, 0.95, 0.06, 0, -0.47, -0.02, o.cape);
    box(body, 0.74, 0.14, 0.5, 0, 1.33, 0, o.cape);
    cape.rotation.x = 0.1;
  }
  if (o.pack) {
    box(body, 0.44, 0.5, 0.22, 0, 1.0, -0.33, o.pack);
    box(body, 0.46, 0.1, 0.24, 0, 1.24, -0.33, 0x4a3020);
  }

  // objetos en la mano
  let orb = null;
  if (o.prop === 'staff') {
    const staff = pivot(body, 0.62, 0, 0.18);
    part(staff, CYL8, mat(0x6b472b), 0.04, 2.0, 0.04, 0, 1.0, 0);
    orb = part(staff, OCTA, glowMat(o.orb ?? 0x7fe6ff), 0.15, 0.22, 0.15, 0, 2.15, 0);
    orb.castShadow = false;
    armR.rotation.x = -1.15;
    armR.rotation.z = 0.12;
  } else if (o.prop === 'book') {
    box(armL, 0.3, 0.38, 0.08, 0.02, -0.62, 0.16, 0x8a2f3a);
    box(armL, 0.26, 0.34, 0.1, 0.02, -0.62, 0.16, 0xf2ead8);
    armL.rotation.x = -1.2;
    armL.rotation.z = 0.25;
  } else if (o.prop === 'mug') {
    part(armR, CYL8, mat(0xc9954a), 0.09, 0.2, 0.09, 0, -0.66, 0.14);
    armR.rotation.x = -1.05;
  } else if (o.prop === 'hammer') {
    box(armR, 0.06, 0.5, 0.06, 0, -0.66, 0.2, 0x6b472b).rotation.x = Math.PI / 2;
    box(armR, 0.2, 0.2, 0.34, 0, -0.66, 0.46, 0x5b5f68);
  }

  const base = { armRx: armR.rotation.x, armRz: armR.rotation.z, armLx: armL.rotation.x, armLz: armL.rotation.z };
  let phase = 0;
  const seed = Math.random() * 10;

  return {
    group: root,
    head,
    /**
     * @param {number} dt
     * @param {number} t      tiempo global
     * @param {number} move   0..1 (intensidad de caminar)
     * @param {string} [mode] 'wave' | 'hammer' | undefined
     */
    update(dt, t, move = 0, mode) {
      phase += dt * 11 * Math.max(move, 0.0001);
      const swing = Math.sin(phase) * 0.8 * move;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      body.position.y = Math.abs(Math.sin(phase)) * 0.07 * move + Math.sin(t * 2 + seed) * 0.012;
      body.rotation.x = move * 0.06;
      head.rotation.x = Math.sin(t * 1.3 + seed) * 0.03;
      if (cape) cape.rotation.x = 0.1 + move * 0.45 + Math.sin(phase * 2) * 0.06 * move + Math.sin(t * 1.7 + seed) * 0.03;

      const idle = Math.sin(t * 1.6 + seed) * 0.05 * (1 - move);
      armL.rotation.x = base.armLx - swing * 0.85 * (base.armLx ? 0.2 : 1) + idle;
      armL.rotation.z = base.armLz;
      if (mode === 'wave') {
        armR.rotation.x = 0;
        armR.rotation.z = 2.55 + Math.sin(t * 9) * 0.32;
      } else if (mode === 'hammer') {
        const k = (t * 1.5 + seed) % 1;
        armR.rotation.x = -2.3 + (k < 0.25 ? k / 0.25 : 1) * 1.5 - (k > 0.25 ? Math.min(1, (k - 0.25) / 0.6) * 1.5 : 0);
        armR.rotation.z = base.armRz;
      } else {
        armR.rotation.x = base.armRx + swing * 0.85 * (base.armRx ? 0.2 : 1) - idle;
        armR.rotation.z = base.armRz;
      }
      if (orb) {
        orb.rotation.y = t * 2;
        orb.position.y = 2.15 + Math.sin(t * 2.4) * 0.05;
      }
    }
  };
}

/* ---------- Cofre ---------- */
export function makeChest() {
  const root = new THREE.Group();
  const wood = 0x7a4a26, band = 0xe9c046, dark = 0x4f2f18;
  box(root, 1.1, 0.52, 0.72, 0, 0.26, 0, wood);
  box(root, 1.14, 0.1, 0.76, 0, 0.47, 0, band);
  box(root, 0.12, 0.54, 0.76, -0.42, 0.26, 0, dark);
  box(root, 0.12, 0.54, 0.76, 0.42, 0.26, 0, dark);
  const lid = pivot(root, 0, 0.52, -0.36);
  box(lid, 1.1, 0.22, 0.72, 0, 0.11, 0.36, wood);
  box(lid, 0.94, 0.14, 0.6, 0, 0.26, 0.36, wood);
  box(lid, 0.12, 0.24, 0.76, -0.42, 0.12, 0.36, dark);
  box(lid, 0.12, 0.24, 0.76, 0.42, 0.12, 0.36, dark);
  box(lid, 0.2, 0.26, 0.06, 0, 0.02, 0.74, band);
  // brillo interior (visible al abrir)
  const glow = part(root, BOX, glowMat(0xffe9a6), 0.9, 0.04, 0.54, 0, 0.5, 0);
  glow.castShadow = false;
  glow.visible = false;

  // haz de luz para localizarlo de lejos
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.34, 5, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  beam.position.y = 3.2;
  root.add(beam);

  let open = 0, target = 0;
  return {
    group: root,
    setOpen(v, instant = false) {
      target = v ? 1 : 0;
      if (instant) open = target;
      glow.visible = !!v;
      beam.visible = !v;
    },
    update(dt, t) {
      open += (target - open) * Math.min(1, dt * 6);
      lid.rotation.x = -open * 1.9;
      if (beam.visible) {
        beam.material.opacity = 0.28 + Math.sin(t * 2.2) * 0.1;
        beam.rotation.y = t * 0.6;
      }
    }
  };
}
