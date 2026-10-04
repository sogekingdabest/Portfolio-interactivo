/* ============================================================
   EDIFICIOS
   Todos se construyen en coordenadas locales: fachada hacia +Z,
   suelo en y≈0.3. `b` = Builder estático, `g` = Builder luminoso
   en el mismo sistema de coordenadas.
   ============================================================ */
import { lerp } from '../engine/kit.js';
import { C, roof, windowAt, door, banner, barrel, crate, table, anvil, weaponRack } from './props.js';

const HALF_PI = Math.PI / 2;

/* ---------- Gremio de Ingenieros (Experiencia) ---------- */
export function guildHall(b, g) {
  const W = 10, D = 12, WH = 4.4, Y = 0.4;
  b.box(W + 0.9, 1.3, D + 0.9, 0, -0.9, 0, C.stone);
  b.box(W, WH, D, 0, Y, 0, C.wall);
  b.box(W + 0.22, 1.0, D + 0.22, 0, Y, 0, C.stoneLight);
  // entramado de madera
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.42, WH, 0.42, sx * (W / 2), Y, sz * (D / 2), C.timber);
  for (const sz of [-1, 1]) {
    b.box(W + 0.3, 0.3, 0.24, 0, Y + WH - 0.3, sz * (D / 2 + 0.03), C.timber);
    b.box(W + 0.3, 0.24, 0.22, 0, Y + 2.55, sz * (D / 2 + 0.03), C.timber);
  }
  for (const sx of [-1, 1]) {
    b.box(0.24, 0.3, D + 0.3, sx * (W / 2 + 0.03), Y + WH - 0.3, 0, C.timber);
    b.box(0.22, 0.24, D + 0.3, sx * (W / 2 + 0.03), Y + 2.55, 0, C.timber);
    for (const z of [-3, 0, 3]) b.box(0.2, WH, 0.22, sx * (W / 2 + 0.03), Y, z, C.timber);
    for (const z of [-4.5, -1.5, 1.5, 4.5]) windowAt(b, g, sx * (W / 2), Y + 1.25, z, 1.0, 1.15, sx * HALF_PI);
  }
  roof(b, W, 4.4, D, Y + WH, C.roofRed, C.wall, 0.75, 0.32, 0.7);
  // hastial frontal: entramado + óculo
  b.box(0.24, 4.2, 0.2, 0, Y + WH, D / 2 + 0.03, C.timber);
  b.box(W * 0.52, 0.22, 0.2, 0, Y + WH + 1.75, D / 2 + 0.03, C.timber);
  for (const sx of [-1, 1]) b.box(0.2, 2.6, 0.2, sx * 1.5, Y + WH - 0.1, D / 2 + 0.03, C.timber, { z: sx * 0.62 });
  g.cyl(0.55, 0.55, 0.14, 8, 0, Y + WH + 2.75, D / 2 + 0.1, C.glass, { x: HALF_PI });
  // entrada
  door(b, g, 0, Y, D / 2, 2.5, 3.1, 0, true);
  b.box(4.4, 0.24, 1.5, 0, Y - 0.5, D / 2 + 0.75, C.stoneLight);
  b.box(3.6, 0.26, 0.8, 0, Y - 0.26, D / 2 + 0.4, C.stoneLight);
  for (const sx of [-1, 1]) {
    windowAt(b, g, sx * 3.55, Y + 1.3, D / 2, 1.0, 1.25, 0);
    banner(b, sx * 2.05, Y + WH - 0.05, D / 2 + 0.3, C.banner);
  }
  // escudo sobre la puerta
  b.octa(0.5, 0.62, 0.1, 0, Y + 3.75, D / 2 + 0.16, C.gold);
  // torre del estandarte
  const t = b.frame(-W / 2 - 1.3, 0, D / 2 - 1.9);
  t.box(3.7, 1.4, 3.7, 0, -0.9, 0, C.stone);
  t.box(3.2, 8.4, 3.2, 0, Y, 0, C.stoneLight);
  t.box(3.3, 0.9, 3.3, 0, Y, 0, C.stone);
  t.box(3.7, 0.42, 3.7, 0, Y + 8.4, 0, C.stone);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.box(0.7, 0.6, 0.7, sx * 1.5, Y + 8.82, sz * 1.5, C.stone);
  t.pyramid(3.5, 3.1, 3.5, 0, Y + 8.82, 0, C.roofRedDark);
  t.cyl(0.05, 0.05, 2.0, 5, 0, Y + 11.7, 0, C.iron);
  t.box(1.1, 0.66, 0.05, 0.6, Y + 12.9, 0, C.banner);
  windowAt(t, t.into(g.batch), 0, Y + 5.4, 1.6, 0.6, 1.3, 0);
  windowAt(t, t.into(g.batch), -1.6, Y + 5.4, 0, 0.6, 1.3, -HALF_PI);
  windowAt(t, t.into(g.batch), 0, Y + 2.2, 1.6, 0.6, 1.1, 0);
  // chimenea
  b.box(1.0, 3.3, 1.0, 3.1, Y + WH + 0.8, -3.4, C.stone);
  b.box(1.25, 0.26, 1.25, 3.1, Y + WH + 4.1, -3.4, C.stoneDark);
  // tablón de misiones junto a la entrada
  const q = b.frame(4.1, 0.3, D / 2 + 2.3, -0.5);
  q.box(0.16, 2.3, 0.16, -1.0, -0.2, 0, C.woodDark);
  q.box(0.16, 2.3, 0.16, 1.0, -0.2, 0, C.woodDark);
  q.box(2.3, 1.45, 0.1, 0, 0.75, 0, C.wood);
  roof(q.frame(0, 0, 0, HALF_PI), 0.7, 0.3, 2.6, 2.2, C.roofBrown, null, 0.15, 0.1, 0.1);
  const notes = [
    [-0.7, 1.5, 0.45, 0.55, C.cloth, 0.08],
    [-0.1, 1.35, 0.5, 0.6, C.white, -0.06],
    [0.6, 1.5, 0.48, 0.5, C.cloth, 0.04],
    [-0.5, 0.92, 0.5, 0.38, C.white, -0.05],
    [0.35, 0.9, 0.62, 0.36, 0xf2dc9a, 0.07]
  ];
  for (const [x, y, w, h, c, r] of notes) q.box(w, h, 0.03, x, y, 0.07, c, { z: r });
  barrel(b, -3.9, 0.3, D / 2 + 1.0);
  crate(b, 5.9, 0.3, D / 2 - 2.0, 0.75, 0.3);
}

/* ---------- Academia de Brigantia (Formación) ---------- */
export function academy(b, g) {
  const W = 11, D = 8, WH = 4.6, Y = 0.9, PORT = 3.6;
  const zc = PORT / 2 - 0.3; // centro del conjunto edificio + pórtico
  b.box(W + 2.2, 1.9, D + PORT + 1.4, 0, -1.0, zc, C.marbleDark);
  for (let i = 0; i < 3; i++) b.box(5.2, 0.3, 0.65, 0, Y - 0.3 * (i + 1), D / 2 + PORT + 0.72 + 0.6 * i, C.marble);
  b.box(W, WH, D, 0, Y, 0, C.marble);
  b.box(W + 0.16, 0.5, D + 0.16, 0, Y, 0, C.marbleDark);
  // columnata
  const cz = D / 2 + PORT - 0.7;
  for (let i = 0; i < 6; i++) {
    const x = -4.75 + i * 1.9;
    b.box(0.95, 0.26, 0.95, x, Y, cz, C.marbleDark);
    b.cyl(0.33, 0.4, WH - 0.52, 8, x, Y + 0.26, cz, C.marble);
    b.box(0.95, 0.26, 0.95, x, Y + WH - 0.26, cz, C.marbleDark);
  }
  for (const sx of [-1, 1]) {
    for (const z of [-2.5, 0, 2.5]) {
      windowAt(b, g, sx * (W / 2), Y + 1.1, z, 0.9, 2.3, sx * HALF_PI);
      b.box(0.4, WH, 0.5, sx * (W / 2), Y, z + 1.25, C.marbleDark);
    }
    windowAt(b, g, sx * 3.3, Y + 1.1, D / 2, 0.9, 2.3, 0);
    banner(b, sx * 1.9, Y + WH - 0.25, D / 2 + 0.22, C.roofBlue);
  }
  // entablamento + frontón
  b.box(W + 1.0, 0.7, D + PORT + 0.3, 0, Y + WH, zc, C.marble);
  roof(b.frame(0, 0, zc), W + 1.0, 2.5, D + PORT + 0.3, Y + WH + 0.7, C.roofBlue, C.marble, 0.5, 0.28, 0.25);
  b.cyl(0.6, 0.6, 0.12, 8, 0, Y + WH + 1.6, zc + (D + PORT + 0.3) / 2 + 0.05, C.gold, { x: HALF_PI });
  door(b, g, 0, Y, D / 2, 2.0, 3.3, 0, true);
  // cúpula del observatorio
  b.cyl(2.1, 2.1, 2.4, 10, 0, Y + WH + 0.7, -1.9, C.marble);
  b.cyl(2.3, 2.3, 0.25, 10, 0, Y + WH + 3.1, -1.9, C.marbleDark);
  b.dome(2.15, 2.15, 2.15, 10, 0, Y + WH + 3.35, -1.9, C.copper);
  b.box(0.5, 1.5, 1.6, 0, Y + WH + 3.6, -0.9, C.slate, { x: -0.5 });
  b.octa(0.16, 0.3, 0.16, 0, Y + WH + 5.7, -1.9, C.gold);
}

/* ---------- Taberna del Token (Contacto) ---------- */
export function tavern(b, g, rand) {
  const W = 9.5, D = 7.5, Y = 0.4;
  b.box(W + 0.7, 1.3, D + 0.7, 0, -0.9, 0, C.stone);
  b.box(W, 2.9, D, 0, Y, 0, C.stoneLight);
  b.box(W + 0.75, 0.3, D + 0.75, 0, Y + 2.9, 0, C.timber);
  b.box(W + 0.6, 2.5, D + 0.6, 0, Y + 3.2, 0, C.wallWarm);
  const UW = W + 0.6, UD = D + 0.6;
  for (const sz of [-1, 1]) {
    for (const x of [-UW / 2, -2.5, 0, 2.5, UW / 2]) b.box(0.22, 2.5, 0.22, x, Y + 3.2, sz * (UD / 2 + 0.02), C.timber);
    b.box(UW + 0.1, 0.22, 0.2, 0, Y + 5.48, sz * (UD / 2 + 0.02), C.timber);
  }
  for (const sx of [-1, 1]) {
    for (const z of [-UD / 2, 0, UD / 2]) b.box(0.22, 2.5, 0.22, sx * (UW / 2 + 0.02), Y + 3.2, z, C.timber);
    for (const z of [-1.9, 1.9]) windowAt(b, g, sx * (UW / 2), Y + 3.9, z, 1.0, 1.05, sx * HALF_PI);
  }
  roof(b.frame(0, 0, 0, HALF_PI), UD, 3.3, UW, Y + 5.7, C.thatch, C.wallWarm, 0.8, 0.42, 0.55);
  door(b, g, -1.7, Y, D / 2, 1.5, 2.4);
  b.box(2.4, 0.22, 1.0, -1.7, Y - 0.3, D / 2 + 0.5, C.stoneLight);
  windowAt(b, g, 1.2, Y + 1.15, D / 2, 1.3, 1.15, 0);
  windowAt(b, g, 3.4, Y + 1.15, D / 2, 1.0, 1.15, 0);
  for (const x of [-3.1, 0, 3.1]) windowAt(b, g, x, Y + 3.9, UD / 2, 1.0, 1.05, 0);
  // cartel colgante (perpendicular a la fachada)
  b.box(0.1, 0.1, 1.7, -3.7, Y + 3.0, D / 2 + 0.85, C.iron);
  b.box(0.1, 1.0, 1.25, -3.7, Y + 1.85, D / 2 + 0.3 + 0.62, C.woodDark);
  for (const sx of [-1, 1]) {
    b.cyl(0.16, 0.14, 0.34, 6, -3.7 + sx * 0.08, Y + 2.15, D / 2 + 0.92, C.gold);
    b.box(0.04, 0.2, 0.14, -3.7 + sx * 0.08, Y + 2.2, D / 2 + 1.14, C.gold);
  }
  // chimenea lateral
  b.box(1.35, 9.0, 1.35, W / 2 + 0.35, -0.6, -1.4, C.stone);
  b.box(1.6, 0.28, 1.6, W / 2 + 0.35, 8.4, -1.4, C.stoneDark);
  // terraza
  table(b.frame(2.6, 0.3, D / 2 + 2.6, 0.4));
  table(b.frame(-4.6, 0.3, D / 2 + 3.4, 1.3));
  barrel(b, 4.3, 0.3, D / 2 + 0.7);
  barrel(b, 3.55, 0.3, D / 2 + 0.6);
  barrel(b, 3.95, 1.1, D / 2 + 0.65);
  crate(b, -W / 2 - 0.9, 0.3, 1.2, 0.8, rand());
  crate(b, -W / 2 - 0.9, 0.3, 0.2, 0.6, rand());
}

/* ---------- La Forja (Proyectos personales) ---------- */
export function forge(b, g) {
  const W = 9, D = 7, Y = 0.3, WH = 3.6;
  b.box(W + 0.8, 1.3, D + 0.8, 0, -1.0, 0, C.stoneDark);
  // taller cerrado (izquierda) + cobertizo abierto (derecha)
  b.box(5.0, WH, D, -2.0, Y, 0, C.stone);
  b.box(5.1, 0.8, D + 0.1, -2.0, Y, 0, C.stoneDark);
  b.box(4.0, WH, 0.5, 2.5, Y, -D / 2 + 0.25, C.stone);
  b.box(0.5, WH, 2.6, 4.25, Y, -D / 2 + 1.3, C.stone);
  b.box(0.38, WH, 0.38, 4.25, Y, D / 2 - 0.2, C.timber);
  b.box(4.4, 0.3, 0.3, 2.3, Y + WH - 0.3, D / 2 - 0.2, C.timber);
  roof(b.frame(0, 0, 0, HALF_PI), D + 0.3, 2.7, W + 0.3, Y + WH, C.slate, C.stone, 0.7, 0.3, 0.5);
  door(b, g, -2.6, Y, D / 2, 1.5, 2.4);
  windowAt(b, g, -0.55, Y + 1.25, D / 2, 0.9, 1.0, 0);
  windowAt(b, g, -W / 2, Y + 1.25, 0.8, 1.0, 1.0, -HALF_PI);
  // fragua y chimenea
  b.box(2.4, 1.9, 1.5, 2.6, Y, -D / 2 + 1.25, C.stoneDark);
  g.box(1.3, 0.75, 0.1, 2.6, Y + 0.55, -D / 2 + 2.02, C.fire);
  g.box(0.9, 0.4, 0.06, 2.6, Y + 0.68, -D / 2 + 2.06, 0xffd35c);
  b.box(1.5, 8.0, 1.5, 2.6, Y, -D / 2 + 0.95, C.stoneDark);
  b.box(1.85, 0.3, 1.85, 2.6, Y + 8.0, -D / 2 + 0.95, C.stone);
  // herramientas
  anvil(b.frame(2.4, Y, D / 2 + 1.7, 0.5));
  weaponRack(b.frame(-2.0, Y, D / 2 + 0.9 + 1.0, 0.0));
  barrel(b, 4.2, Y, D / 2 + 0.9);
  b.cyl(0.3, 0.3, 0.03, 8, 4.2, Y + 0.78, D / 2 + 0.9, C.water);
  // piedra de afilar
  b.box(0.9, 0.5, 0.14, 0.6, Y, D / 2 + 1.1, C.woodDark);
  b.cyl(0.42, 0.42, 0.16, 10, 0.6, Y + 0.62, D / 2 + 1.1, C.stoneLight, { x: HALF_PI });
  // cartel: yunque dorado
  b.box(1.4, 0.9, 0.1, -2.6, Y + 2.75, D / 2 + 0.12, C.woodDark);
  b.box(0.7, 0.16, 0.06, -2.6, Y + 3.25, D / 2 + 0.2, C.gold);
  b.box(0.3, 0.28, 0.06, -2.6, Y + 2.97, D / 2 + 0.2, C.gold);
}

/* ---------- Faro Arcano (Habilidades) — guiño a la Torre de Hércules ---------- */
export const LIGHT_Y = 19.2;
export function lighthouse(b, g) {
  const Y = 0.4;
  b.box(9, 1.6, 9, 0, -1.1, 0, C.stone);
  b.box(7.0, 2.7, 7.0, 0, Y, 0, C.sandstone);
  b.box(7.2, 0.6, 7.2, 0, Y, 0, C.sandstoneDark);
  b.box(7.5, 0.36, 7.5, 0, Y + 2.7, 0, C.stoneLight);
  const S0 = 5.4, TOP = 0.8, SH = 11, Y1 = Y + 3.06;
  b.frustum(S0, SH, S0, TOP, 0, Y1, 0, C.sandstone);
  for (let i = 1; i <= 3; i++) {
    const yy = Y1 + i * 2.75;
    const s = lerp(S0, S0 * TOP, (yy - Y1) / SH) + 0.18;
    b.box(s, 0.24, s, 0, yy, 0, C.sandstoneDark);
  }
  // ventanas en las cuatro caras
  for (let lvl = 0; lvl < 4; lvl++) {
    const yy = Y1 + 1.0 + lvl * 2.75;
    const half = lerp(S0, S0 * TOP, (yy + 0.5 - Y1) / SH) / 2 + 0.02;
    for (let f = 0; f < 4; f++) {
      const a = f * HALF_PI;
      if ((lvl + f) % 2 === 0) windowAt(b, g, Math.sin(a) * half, yy, Math.cos(a) * half, 0.5, 1.0, a);
    }
  }
  b.box(5.0, 0.46, 5.0, 0, Y1 + SH, 0, C.stoneLight);
  const Y2 = Y1 + SH + 0.46;
  b.cyl(1.75, 1.95, 3.0, 8, 0, Y2, 0, C.sandstone);
  b.cyl(2.5, 2.25, 0.32, 8, 0, Y2 + 3.0, 0, C.stoneLight);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.box(0.1, 0.7, 0.1, Math.cos(a) * 2.3, Y2 + 3.32, Math.sin(a) * 2.3, C.iron);
    b.box(0.1, 1.75, 0.1, Math.cos(a) * 1.3, Y2 + 3.32, Math.sin(a) * 1.3, C.iron);
  }
  b.cyl(2.36, 2.36, 0.07, 8, 0, Y2 + 3.95, 0, C.iron);
  g.cyl(1.22, 1.22, 1.75, 8, 0, Y2 + 3.32, 0, C.lamp);
  b.cone(1.75, 1.5, 8, 0, Y2 + 5.07, 0, C.roofRed);
  b.octa(0.2, 0.42, 0.2, 0, Y2 + 6.85, 0, C.gold);
  // entrada
  door(b, g, 0, Y, 3.5, 1.7, 2.6, 0);
  b.box(3.0, 0.3, 1.3, 0, Y - 0.3, 4.15, C.stoneLight);
  b.box(3.6, 0.3, 1.3, 0, Y - 0.6, 4.75, C.stoneLight);
  // braseros arcanos a los lados
  for (const sx of [-1, 1]) {
    b.cyl(0.3, 0.4, 1.3, 6, sx * 2.5, Y - 0.6, 5.2, C.stoneDark);
    g.octa(0.3, 0.46, 0.3, sx * 2.5, Y + 1.25, 5.2, 0x8fe3ff);
  }
}

/* ---------- Casitas del pueblo ---------- */
export function cottage(b, g, { wall = C.wall, roofColor = C.roofRed, w = 5.2, d = 4.6 } = {}) {
  const Y = 0.3, WH = 2.7;
  b.box(w + 0.5, 1.3, d + 0.5, 0, -1.0, 0, C.stone);
  b.box(w, WH, d, 0, Y, 0, wall);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.3, WH, 0.3, sx * (w / 2), Y, sz * (d / 2), C.timber);
  b.box(w + 0.2, 0.22, 0.2, 0, Y + WH - 0.22, d / 2 + 0.02, C.timber);
  roof(b, w, 2.3, d, Y + WH, roofColor, wall, 0.55, 0.26, 0.45);
  door(b, g, -1.0, Y, d / 2, 1.1, 2.0);
  windowAt(b, g, 1.2, Y + 1.0, d / 2, 0.9, 0.9, 0);
  windowAt(b, g, w / 2, Y + 1.0, 0, 0.9, 0.9, HALF_PI);
  windowAt(b, g, -w / 2, Y + 1.0, 0, 0.9, 0.9, -HALF_PI);
  g.cyl(0.32, 0.32, 0.12, 6, 0, Y + WH + 1.0, d / 2 + 0.08, C.glass, { x: HALF_PI });
  b.box(0.7, 2.2, 0.7, w / 4, Y + WH + 0.5, -d / 4, C.stone);
  b.box(0.9, 0.2, 0.9, w / 4, Y + WH + 2.7, -d / 4, C.stoneDark);
}

/* ---------- Molino ---------- */
export const MILL_HUB = { y: 5.3, z: 2.2 };
export function windmill(b, g) {
  b.cyl(2.75, 2.9, 1.0, 8, 0, -0.6, 0, C.stone);
  b.cyl(1.65, 2.5, 6.4, 8, 0, 0.2, 0, C.white);
  b.cyl(1.72, 1.8, 0.3, 8, 0, 6.3, 0, C.woodDark);
  b.cone(2.15, 2.3, 8, 0, 6.6, 0, C.roofBrown);
  door(b, g, 0, 0.3, 2.42, 1.1, 2.0, 0);
  windowAt(b, g, 0, 3.6, 2.02, 0.6, 0.8, 0);
  b.cyl(0.14, 0.14, 1.4, 6, 0, MILL_HUB.y, 1.2, C.woodDark, { x: HALF_PI });
}

/** Aspas del molino (malla independiente que gira sobre Z). */
export function windmillBlades(b) {
  b.cyl(0.3, 0.3, 0.3, 8, 0, 0, -0.15, C.woodDark, { x: HALF_PI });
  for (let i = 0; i < 4; i++) {
    const th = (i * Math.PI) / 2, f = { z: th };
    const ux = -Math.sin(th), uy = Math.cos(th); // dirección del aspa
    const px = Math.cos(th) * 0.55, py = Math.sin(th) * 0.55; // desplazamiento lateral de la vela
    b.box(0.16, 4.7, 0.12, 0, 0, 0, C.woodDark, f);
    b.box(0.95, 3.3, 0.06, px + ux * 1.25, py + uy * 1.25, 0.02, C.cloth, f);
    for (let k = 0; k <= 3; k++) b.box(1.0, 0.07, 0.1, px + ux * (1.25 + k * 1.08), py + uy * (1.25 + k * 1.08), 0.03, C.wood, f);
  }
}
