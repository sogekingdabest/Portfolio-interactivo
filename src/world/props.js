/* ============================================================
   DECORADO LOW-POLY
   Cada función dibuja un objeto en el Builder `b` (ya situado en
   su sitio). `g` es el Builder del batch luminoso (ventanas,
   faroles, fuego): se ve tenue de día y brilla de noche.
   ============================================================ */
import { vary } from '../engine/kit.js';

export const C = {
  stone: 0x9b9a9e,
  stoneDark: 0x75747b,
  stoneLight: 0xbcb8b0,
  marble: 0xe9e5dc,
  marbleDark: 0xcfc9bd,
  sandstone: 0xdccaa0,
  sandstoneDark: 0xbfa97c,
  wall: 0xefe4cb,
  wallWarm: 0xe8cf9f,
  timber: 0x553823,
  wood: 0x8d5b36,
  woodDark: 0x5f3b22,
  woodLight: 0xb98454,
  roofRed: 0xb8442e,
  roofRedDark: 0x8f3323,
  roofBlue: 0x3d5f92,
  roofGreen: 0x4c7d55,
  roofBrown: 0x7b4d2c,
  thatch: 0xcda348,
  slate: 0x4b5466,
  iron: 0x474a52,
  steel: 0xaab2bd,
  gold: 0xe9c046,
  copper: 0x58b09a,
  white: 0xf4f0e6,
  cloth: 0xe8e0cc,
  banner: 0x2d5fae,
  bannerRed: 0xb23a3a,
  glass: 0xffdf8a,
  lamp: 0xffe9a6,
  fire: 0xff9a3c,
  water: 0x58b9d6,
  pine: 0x2f7352,
  pineDark: 0x245c45,
  leaf: 0x56a449,
  leafDark: 0x3f8a45,
  leafLight: 0x86c257,
  autumn: 0xd98a3a,
  trunk: 0x6b472b,
  hay: 0xd9b95a
};

const HALF_PI = Math.PI / 2;

/* ---------- Vegetación ---------- */
export function pine(b, rand) {
  const h = 3.4 + rand() * 2.4;
  const r = 1.15 + rand() * 0.5;
  b.cyl(0.14, 0.22, h * 0.34, 5, 0, -0.1, 0, C.trunk);
  const base = rand() < 0.5 ? C.pine : C.pineDark;
  for (let i = 0; i < 3; i++) {
    b.cone(r * (1 - 0.26 * i), h * 0.44, 6, 0, h * (0.2 + i * 0.24), 0, vary(base, rand, 0.05), { y: rand() * 6 });
  }
}

export function oak(b, rand) {
  const h = 1.5 + rand() * 0.9;
  b.cyl(0.17, 0.27, h + 0.5, 5, 0, -0.1, 0, C.trunk);
  const tone = rand();
  const base = tone < 0.1 ? C.autumn : tone < 0.55 ? C.leaf : tone < 0.85 ? C.leafDark : C.leafLight;
  const R = 1.15 + rand() * 0.5;
  b.ico(R, R * 0.9, R, 0, h + R * 0.7, 0, vary(base, rand, 0.05), { y: rand() * 6, x: rand() });
  const n = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, rr = R * (0.55 + rand() * 0.25);
    b.ico(rr, rr * 0.85, rr, Math.cos(a) * R * 0.7, h + R * (0.35 + rand() * 0.5), Math.sin(a) * R * 0.7, vary(base, rand, 0.07), {
      y: rand() * 6,
      z: rand()
    });
  }
}

export function bush(b, rand) {
  const base = rand() < 0.5 ? C.leafDark : C.leaf;
  const n = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < n; i++) {
    const r = 0.38 + rand() * 0.3;
    b.ico(r, r * 0.8, r, (rand() - 0.5) * 0.7, r * 0.55, (rand() - 0.5) * 0.7, vary(base, rand, 0.06), { y: rand() * 6 });
  }
}

export function rock(b, rand, size = 1) {
  const r = (0.45 + rand() * 0.7) * size;
  b.ico(r * (0.8 + rand() * 0.5), r * (0.55 + rand() * 0.35), r * (0.8 + rand() * 0.5), 0, r * 0.2, 0, vary(C.stone, rand, 0.07), {
    x: rand() * 0.6,
    y: rand() * 6,
    z: rand() * 0.6
  });
  if (rand() < 0.5) {
    const r2 = r * 0.55;
    b.ico(r2, r2 * 0.7, r2, r * 0.8, r2 * 0.2, r * 0.3, vary(C.stoneDark, rand, 0.06), { y: rand() * 6 });
  }
}

const FLOWER = [0xf4d35e, 0xee6c8a, 0xf7f2e8, 0x9d7be0, 0xf28c38];
export function flowers(b, rand) {
  const n = 4 + Math.floor(rand() * 4);
  const color = FLOWER[Math.floor(rand() * FLOWER.length)];
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * 1.4, z = (rand() - 0.5) * 1.4;
    b.box(0.04, 0.22, 0.04, x, 0, z, C.leafDark);
    b.octa(0.1, 0.07, 0.1, x, 0.26, z, color);
  }
}

/* ---------- Piezas reutilizables de edificio ---------- */
/** Tejado a dos aguas con alero. Cumbrera a lo largo de Z local. */
export function roof(b, w, h, d, y, color, wallColor, over = 0.6, t = 0.28, overZ = 0.5) {
  if (wallColor != null) b.gable(w, h, d, 0, y, 0, wallColor);
  const a = Math.atan2(h, w / 2);
  const L = Math.hypot(w / 2, h) + over;
  const cx = (Math.cos(a) * L) / 2, cy = y + h - (Math.sin(a) * L) / 2;
  b.box(L, t, d + overZ * 2, cx, cy, 0, color, { z: -a });
  b.box(L, t, d + overZ * 2, -cx, cy, 0, color, { z: a });
  b.box(0.36, 0.2, d + overZ * 2 + 0.1, 0, y + h + t * 0.75, 0, C.timber);
}

/** Ventana sobre un muro: origen en la superficie, +Z local hacia fuera. */
export function windowAt(b, g, x, y, z, w, h, ry = 0) {
  const f = b.frame(x, y, z, ry);
  f.box(w + 0.26, h + 0.26, 0.12, 0, -0.13, 0, C.timber);
  f.into(g.batch).box(w, h, 0.1, 0, 0, 0.05, C.glass);
  f.box(0.07, h, 0.1, 0, 0, 0.1, C.timber);
  f.box(w, 0.07, 0.1, 0, h / 2 - 0.035, 0.1, C.timber);
  f.box(w + 0.46, 0.1, 0.3, 0, -0.22, 0.08, C.wood);
}

export function door(b, g, x, y, z, w, h, ry = 0, double = false) {
  const f = b.frame(x, y, z, ry);
  f.box(w + 0.5, h + 0.25, 0.2, 0, 0, -0.02, C.timber);
  f.box(w, h, 0.14, 0, 0, 0.08, C.woodDark);
  // tablones
  const planks = Math.max(2, Math.round(w / 0.45));
  for (let i = 1; i < planks; i++) f.box(0.04, h, 0.02, -w / 2 + (w * i) / planks, 0, 0.16, C.timber);
  f.box(w, 0.12, 0.03, 0, h * 0.25, 0.16, C.iron);
  f.box(w, 0.12, 0.03, 0, h * 0.75, 0.16, C.iron);
  if (double) {
    f.box(0.06, h, 0.04, 0, 0, 0.16, C.timber);
    f.ico(0.09, 0.09, 0.06, -0.2, h * 0.48, 0.2, C.gold);
    f.ico(0.09, 0.09, 0.06, 0.2, h * 0.48, 0.2, C.gold);
  } else {
    f.ico(0.08, 0.08, 0.06, w * 0.32, h * 0.48, 0.2, C.gold);
  }
  // farolillo sobre la puerta
  f.into(g.batch).box(0.22, 0.28, 0.22, w / 2 + 0.55, h - 0.1, 0.28, C.lamp);
  f.box(0.28, 0.07, 0.28, w / 2 + 0.55, h + 0.18, 0.28, C.iron);
  f.box(0.06, 0.06, 0.3, w / 2 + 0.55, h + 0.2, 0.1, C.iron);
}

export function banner(b, x, y, z, color, emblem = C.gold) {
  b.box(1.0, 0.08, 0.08, x, y, z, C.iron);
  b.box(0.8, 2.0, 0.05, x, y - 2.0, z, color);
  b.pyramid(0.8, 0.45, 0.05, x, y - 2.0, z, color, { z: Math.PI });
  b.octa(0.2, 0.26, 0.04, x, y - 0.95, z + 0.04, emblem);
}

/* ---------- Mobiliario ---------- */
export function lamp(b, g) {
  b.cyl(0.12, 0.16, 0.3, 6, 0, 0, 0, C.stoneDark);
  b.cyl(0.05, 0.07, 2.7, 5, 0, 0.2, 0, C.iron);
  b.box(0.5, 0.06, 0.06, 0.2, 2.75, 0, C.iron);
  b.box(0.34, 0.07, 0.34, 0.42, 2.66, 0, C.iron);
  g.box(0.26, 0.34, 0.26, 0.42, 2.32, 0, C.lamp);
  b.box(0.3, 0.05, 0.3, 0.42, 2.28, 0, C.iron);
}

export function bench(b) {
  b.box(1.6, 0.1, 0.5, 0, 0.42, 0, C.woodLight);
  b.box(1.6, 0.42, 0.08, 0, 0.6, -0.24, C.woodLight);
  b.box(0.12, 0.42, 0.46, -0.65, 0, 0, C.woodDark);
  b.box(0.12, 0.42, 0.46, 0.65, 0, 0, C.woodDark);
}

export function barrel(b, x = 0, y = 0, z = 0) {
  b.cyl(0.34, 0.34, 0.8, 8, x, y, z, C.wood);
  b.cyl(0.365, 0.365, 0.07, 8, x, y + 0.14, z, C.iron);
  b.cyl(0.365, 0.365, 0.07, 8, x, y + 0.6, z, C.iron);
}

export function crate(b, x, y, z, s = 0.7, ry = 0) {
  b.box(s, s, s, x, y, z, C.woodLight, { y: ry });
  b.box(s + 0.04, 0.08, s + 0.04, x, y + s - 0.08, z, C.wood, { y: ry });
  b.box(s + 0.04, 0.08, s + 0.04, x, y, z, C.wood, { y: ry });
}

export function table(b) {
  b.cyl(0.75, 0.75, 0.09, 8, 0, 0.72, 0, C.woodLight);
  b.cyl(0.1, 0.16, 0.72, 6, 0, 0, 0, C.woodDark);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    b.cyl(0.22, 0.22, 0.42, 6, Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15, C.wood);
  }
  // jarra
  b.cyl(0.09, 0.08, 0.2, 6, 0.2, 0.81, 0.1, C.gold);
}

export function fountain(b) {
  b.cyl(2.75, 2.9, 0.35, 12, 0, -0.1, 0, C.stoneDark);
  b.cyl(2.55, 2.6, 0.75, 12, 0, 0, 0, C.stoneLight);
  b.cyl(2.2, 2.2, 0.1, 12, 0, 0.62, 0, C.water);
  b.cyl(0.42, 0.55, 1.5, 8, 0, 0.3, 0, C.stone);
  b.cyl(1.15, 0.5, 0.35, 10, 0, 1.75, 0, C.stoneLight);
  b.cyl(0.95, 0.95, 0.06, 10, 0, 2.06, 0, C.water);
  b.cyl(0.18, 0.26, 0.8, 6, 0, 2.05, 0, C.stone);
  b.octa(0.3, 0.42, 0.3, 0, 3.15, 0, C.gold);
}

export function well(b) {
  b.cyl(1.05, 1.15, 0.95, 10, 0, -0.1, 0, C.stone);
  b.cyl(0.8, 0.8, 0.05, 10, 0, 0.72, 0, 0x2b4a5c);
  b.box(0.16, 2.1, 0.16, -0.95, 0.5, 0, C.timber);
  b.box(0.16, 2.1, 0.16, 0.95, 0.5, 0, C.timber);
  b.cyl(0.07, 0.07, 2.0, 5, 0, 2.2, 0, C.wood, { z: HALF_PI });
  roof(b.frame(0, 0, 0, HALF_PI), 1.9, 0.8, 2.5, 2.55, C.roofBrown, null, 0.25, 0.12, 0.15);
  b.box(0.03, 0.9, 0.03, 0.2, 1.3, 0, C.timber);
  b.cyl(0.16, 0.13, 0.28, 6, 0.2, 1.05, 0, C.wood);
}

export function stall(b, rand) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.12, 2.3, 0.12, sx * 1.5, 0, sz * 0.9, C.woodDark);
  b.box(3.3, 0.14, 2.0, 0, 0.85, 0, C.woodLight);
  b.box(3.3, 0.7, 0.1, 0, 0.15, 0.95, C.wood);
  // toldo a rayas
  for (let i = 0; i < 6; i++) {
    b.box(0.6, 0.08, 2.6, -1.5 + i * 0.6, 2.42 - 0.0, 0.1, i % 2 ? C.cloth : C.bannerRed, { x: 0.22 });
  }
  // mercancía
  const goods = [0xd9482b, 0xf0b63c, 0x7fb24a, 0xb5651d];
  for (let i = 0; i < 9; i++) {
    b.ico(0.13, 0.13, 0.13, -1.25 + (i % 5) * 0.6 + rand() * 0.1, 1.08, -0.35 + Math.floor(i / 5) * 0.55, goods[i % goods.length]);
  }
  crate(b, 2.1, 0, 0.3, 0.6, 0.3);
}

export function signpost(b) {
  b.cyl(0.08, 0.1, 2.6, 5, 0, -0.1, 0, C.woodDark);
  const arms = [
    [0.1, 2.15, 0],
    [2.2, 1.78, 0.02],
    [-1.4, 1.42, -0.02],
    [3.6, 1.06, 0]
  ];
  for (const [ry, y, tilt] of arms) {
    const f = b.frame(0, y, 0, ry);
    f.box(1.15, 0.26, 0.07, 0.55, 0, 0, C.woodLight, { z: tilt });
    f.pyramid(0.26, 0.26, 0.07, 1.2, 0.13, 0, C.woodLight, { z: -HALF_PI });
  }
}

export function campfire(b, g, rand) {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.ico(0.22, 0.16, 0.22, Math.cos(a) * 0.7, 0.08, Math.sin(a) * 0.7, vary(C.stone, rand, 0.08), { y: a });
  }
  for (let i = 0; i < 4; i++) {
    b.cyl(0.08, 0.08, 0.95, 5, 0, 0.12, 0, C.woodDark, { y: (i / 4) * Math.PI * 2, x: 0.95 });
  }
  g.cone(0.3, 0.75, 5, 0, 0.12, 0, C.fire);
  g.cone(0.18, 0.5, 5, 0.12, 0.12, 0.08, 0xffd35c);
  // troncos para sentarse
  b.cyl(0.26, 0.26, 1.7, 6, 0, 0.26, 1.9, C.wood, { z: HALF_PI });
  b.cyl(0.26, 0.26, 1.7, 6, -1.8, 0.26, -0.5, C.wood, { z: HALF_PI, y: 1.1 });
}

export function haystack(b, rand) {
  b.cyl(0.9, 1.05, 0.9, 8, 0, 0, 0, vary(C.hay, rand, 0.05));
  b.cone(1.0, 0.9, 8, 0, 0.9, 0, vary(C.hay, rand, 0.05));
}

export function fence(b, len) {
  const n = Math.max(2, Math.round(len / 1.6));
  for (let i = 0; i <= n; i++) b.box(0.13, 0.95, 0.13, -len / 2 + (len * i) / n, -0.1, 0, C.woodDark);
  b.box(len, 0.1, 0.07, 0, 0.6, 0, C.wood);
  b.box(len, 0.1, 0.07, 0, 0.3, 0, C.wood);
}

export function anvil(b) {
  b.cyl(0.42, 0.48, 0.55, 8, 0, 0, 0, C.wood);
  b.box(0.42, 0.16, 0.34, 0, 0.55, 0, C.iron);
  b.box(0.26, 0.2, 0.24, 0, 0.71, 0, C.iron);
  b.box(0.8, 0.2, 0.36, 0, 0.91, 0, C.iron);
  b.cone(0.17, 0.42, 5, 0.6, 1.01, 0, C.iron, { z: -HALF_PI });
}

export function weaponRack(b) {
  b.box(0.12, 1.5, 0.12, -0.9, 0, 0, C.woodDark);
  b.box(0.12, 1.5, 0.12, 0.9, 0, 0, C.woodDark);
  b.box(1.9, 0.1, 0.1, 0, 1.3, 0, C.wood);
  b.box(1.9, 0.1, 0.1, 0, 0.35, 0, C.wood);
  for (let i = 0; i < 3; i++) {
    const x = -0.55 + i * 0.55;
    b.box(0.1, 1.15, 0.03, x, 0.4, 0.09, C.steel);
    b.box(0.3, 0.06, 0.06, x, 0.36, 0.09, C.gold);
    b.box(0.07, 0.26, 0.06, x, 0.1, 0.09, C.woodDark);
  }
}

export function dock(b, d) {
  const len = d.z1 - d.z0, cx = (d.x0 + d.x1) / 2, cz = (d.z0 + d.z1) / 2, w = d.x1 - d.x0;
  const n = Math.round(len / 0.62);
  for (let i = 0; i < n; i++) {
    b.box(w + 0.3, 0.14, 0.54, cx, d.y - 0.14, d.z0 + (i + 0.5) * (len / n), i % 3 === 1 ? C.wood : C.woodLight);
  }
  for (let z = d.z0 + 1; z <= d.z1; z += 3.6) {
    for (const sx of [-1, 1]) b.cyl(0.16, 0.18, 4.2, 6, cx + sx * (w / 2 + 0.05), -3.2, z, C.woodDark);
  }
  b.box(0.12, 0.12, len, cx - w / 2, d.y - 0.3, cz, C.woodDark);
  b.box(0.12, 0.12, len, cx + w / 2, d.y - 0.3, cz, C.woodDark);
  barrel(b, cx - 1.0, d.y, d.z0 + 3.2);
  crate(b, cx + 0.95, d.y, d.z0 + 5.4, 0.62, 0.2);
  // noray con cuerda
  b.cyl(0.13, 0.15, 0.6, 6, cx + 1.25, d.y, d.z1 - 5.2, C.woodDark);
}

/** Barca (malla independiente: se mece). Proa hacia +Z. */
export function boat(b) {
  b.box(1.5, 0.22, 3.4, 0, 0, 0, C.woodDark);
  b.box(0.16, 0.62, 3.5, -0.76, 0.1, 0, C.wood, { z: 0.22 });
  b.box(0.16, 0.62, 3.5, 0.76, 0.1, 0, C.wood, { z: -0.22 });
  b.box(1.5, 0.62, 0.16, 0, 0.1, -1.72, C.wood);
  b.pyramid(1.56, 1.5, 0.66, 0, 0.12, 1.7, C.wood, { x: HALF_PI });
  b.box(1.35, 0.08, 0.4, 0, 0.42, -0.5, C.woodLight);
  b.box(1.35, 0.08, 0.4, 0, 0.42, 0.7, C.woodLight);
  b.cyl(0.06, 0.07, 3.3, 5, 0, 0.2, 0.15, C.woodDark);
  b.box(0.05, 1.9, 1.5, 0, 1.25, -0.72, C.white);
  b.pyramid(0.05, 0.5, 1.5, 0, 3.15, -0.72, C.white);
  b.box(0.05, 0.06, 1.6, 0, 1.2, -0.72, C.woodDark);
}

/** Gato "Null" (malla independiente). Mira hacia +Z. */
export function cat(b) {
  const fur = 0x2b2b33, belly = 0xe9e3d6;
  b.box(0.3, 0.3, 0.5, 0, 0.05, 0, fur);
  b.box(0.2, 0.3, 0.12, 0, 0.08, 0.2, belly);
  b.box(0.3, 0.26, 0.26, 0, 0.36, 0.2, fur);
  b.cone(0.07, 0.14, 4, -0.09, 0.6, 0.22, fur);
  b.cone(0.07, 0.14, 4, 0.09, 0.6, 0.22, fur);
  b.box(0.05, 0.05, 0.02, -0.07, 0.5, 0.335, 0x9be07a);
  b.box(0.05, 0.05, 0.02, 0.07, 0.5, 0.335, 0x9be07a);
  b.box(0.09, 0.3, 0.1, -0.09, 0, 0.2, fur);
  b.box(0.09, 0.3, 0.1, 0.09, 0, 0.2, fur);
}
