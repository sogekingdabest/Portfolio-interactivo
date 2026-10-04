/* ============================================================
   KIT LOW-POLY
   Utilidades para construir todo el mundo por código: RNG con
   semilla, ruido, y un "Builder" que fusiona primitivas en una
   sola geometría con colores por vértice (1 draw call).
   ============================================================ */
import * as THREE from 'three';

/* ---------- Matemáticas ---------- */
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** smoothstep que también acepta bordes invertidos (e0 > e1). */
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Suavizado exponencial independiente del framerate. */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
/** Diferencia angular más corta en [-PI, PI]. */
export const angleDelta = (from, to) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};
export const dampAngle = (a, b, lambda, dt) => a + angleDelta(a, b) * (1 - Math.exp(-lambda * dt));

/* ---------- RNG con semilla (mulberry32) ---------- */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Ruido de valor 2D + fbm ---------- */
function hash2(ix, iz) {
  let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function noise2(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, z, octaves = 3) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

/* ---------- Geometrías base cacheadas (siempre no indexadas) ---------- */
const geoCache = new Map();
function cached(key, make) {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    if (g.index) g = g.toNonIndexed();
    geoCache.set(key, g);
  }
  return g;
}

function makeGable() {
  // Prisma triangular unitario: x∈[-.5,.5], y∈[0,1], z∈[-.5,.5], cumbrera a lo largo de Z.
  const A = [-0.5, 0, -0.5], B = [0.5, 0, -0.5], C = [0, 1, -0.5];
  const D = [-0.5, 0, 0.5], E = [0.5, 0, 0.5], F = [0, 1, 0.5];
  const tris = [A, C, B, D, E, F, A, D, F, A, F, C, B, C, F, B, F, E, A, B, E, A, E, D];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  return g;
}

export const geo = {
  box: () => cached('box', () => new THREE.BoxGeometry(1, 1, 1)),
  /** Cilindro/tronco de cono de altura 1 centrado en el origen. */
  cyl: (rt, rb, seg) => cached(`cyl:${rt}:${rb}:${seg}`, () => new THREE.CylinderGeometry(rt, rb, 1, seg)),
  cone: (seg) => cached(`cone:${seg}`, () => new THREE.CylinderGeometry(0, 1, 1, seg)),
  ico: (detail = 0) => cached(`ico:${detail}`, () => new THREE.IcosahedronGeometry(1, detail)),
  octa: () => cached('octa', () => new THREE.OctahedronGeometry(1, 0)),
  gable: () => cached('gable', makeGable),
  /** Pirámide de base cuadrada unitaria alineada con los ejes. */
  pyramid: () => cached('pyr', () => new THREE.CylinderGeometry(0, Math.SQRT1_2, 1, 4, 1, false, Math.PI / 4)),
  /** Tronco de pirámide (torre que se estrecha): `top` = lado superior relativo al inferior. */
  frustum: (top) => cached(`fru:${top}`, () => new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2, 1, 4, 1, false, Math.PI / 4)),
  dome: (seg = 8) => cached(`dome:${seg}`, () => new THREE.SphereGeometry(1, seg, 4, 0, Math.PI * 2, 0, Math.PI / 2))
};

/* ---------- Batch: acumula triángulos con color ---------- */
const _v = new THREE.Vector3();
const _c = new THREE.Color();

export class Batch {
  constructor() {
    this.pos = [];
    this.col = [];
  }
  add(geometry, matrix, color) {
    const p = geometry.attributes.position;
    _c.set(color);
    for (let i = 0; i < p.count; i++) {
      _v.fromBufferAttribute(p, i).applyMatrix4(matrix);
      this.pos.push(_v.x, _v.y, _v.z);
      this.col.push(_c.r, _c.g, _c.b);
    }
  }
  get empty() {
    return this.pos.length === 0;
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals(); // no indexada → normales por cara (flat)
    g.computeBoundingSphere();
    return g;
  }
}

/* ---------- Builder: primitivas con transformaciones encadenadas ---------- */
const _rot = new THREE.Matrix4();
const _tmp = new THREE.Matrix4();
const _local = new THREE.Matrix4();
const _euler = new THREE.Euler();

/** T(x,y,z) · R(rot) · T(0,offY,0) · S(sx,sy,sz) */
function compose(out, x, y, z, rot, offY, sx, sy, sz) {
  out.makeTranslation(x, y, z);
  if (rot) {
    _euler.set(rot.x || 0, rot.y || 0, rot.z || 0, 'YXZ');
    out.multiply(_rot.makeRotationFromEuler(_euler));
  }
  if (offY) out.multiply(_tmp.makeTranslation(0, offY, 0));
  out.multiply(_tmp.makeScale(sx, sy, sz));
  return out;
}

export class Builder {
  constructor(batch, matrix) {
    this.batch = batch;
    this.m = matrix ? matrix.clone() : new THREE.Matrix4();
  }
  /** Sub-sistema de coordenadas (posición + giro en Y + escala uniforme). */
  frame(x, y, z, ry = 0, s = 1) {
    const b = new Builder(this.batch, this.m);
    b.m.multiply(compose(_local, x, y, z, { y: ry }, 0, s, s, s));
    return b;
  }
  /** Igual que frame() pero volcando a otro batch (p. ej. el de luces). */
  into(batch) {
    return new Builder(batch, this.m);
  }
  _add(g, color) {
    _tmp.multiplyMatrices(this.m, _local);
    this.batch.add(g, _tmp, color);
    return this;
  }
  /** Caja apoyada en (x,y,z): el punto es el centro de su base. */
  box(w, h, d, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, h / 2, w, h, d);
    return this._add(geo.box(), color);
  }
  /** Cilindro apoyado en su base. */
  cyl(rt, rb, h, seg, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, h / 2, 1, h, 1);
    return this._add(geo.cyl(rt, rb, seg), color);
  }
  cone(r, h, seg, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, h / 2, r, h, r);
    return this._add(geo.cone(seg), color);
  }
  /** Icosaedro centrado en (x,y,z) con radios por eje. */
  ico(rx, ry, rz, x, y, z, color, rot, detail = 0) {
    compose(_local, x, y, z, rot, 0, rx, ry, rz);
    return this._add(geo.ico(detail), color);
  }
  octa(rx, ry, rz, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, 0, rx, ry, rz);
    return this._add(geo.octa(), color);
  }
  /** Tejado a dos aguas apoyado en su base; cumbrera a lo largo de Z local. */
  gable(w, h, d, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, 0, w, h, d);
    return this._add(geo.gable(), color);
  }
  pyramid(w, h, d, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, h / 2, w, h, d);
    return this._add(geo.pyramid(), color);
  }
  frustum(w, h, d, top, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, h / 2, w, h, d);
    return this._add(geo.frustum(top), color);
  }
  dome(rx, ry, rz, seg, x, y, z, color, rot) {
    compose(_local, x, y, z, rot, 0, rx, ry, rz);
    return this._add(geo.dome(seg), color);
  }
}

/* ---------- Color con variación ---------- */
const _hsl = new THREE.Color();
/** Devuelve el color `hex` con una pequeña variación de luminosidad/tono. */
export function vary(hex, rand, amount = 0.05) {
  _hsl.set(hex).offsetHSL((rand() - 0.5) * amount * 0.4, 0, (rand() - 0.5) * amount * 2);
  return _hsl.getHex();
}
