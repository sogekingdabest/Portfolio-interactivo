/* ============================================================
   LAYOUT DE LA ISLA DE BRIGANTIA
   Única fuente de verdad de "qué hay dónde": la usan el terreno,
   el mundo, el minimapa y la lógica de juego.
   Ejes: +X = este, +Z = sur. Un edificio con ry mira hacia
   (sin ry, cos ry); todos miran a la plaza (0,0).
   ============================================================ */

export const ISLAND_R = 45;
/** Promontorio del faro (sobresale de la costa este). */
export const PROM = { x: 38, z: -12, r: 15, top: 7.5, h: 3.2 };
/** Colina del molino. */
export const HILL = { x: -27, z: -25, r: 12, top: 4.6, h: 2.8 };
export const PLAZA_R = 9;

export const SPAWN = { x: 0, z: 9.5, yaw: Math.PI };

const facePlaza = (x, z) => Math.atan2(-x, -z);
/** boxes: [cx, cz, hw, hd] y circles: [cx, cz, r], en coordenadas locales del edificio. */
const B = (id, x, z, boxes, circles = []) => ({ id, x, z, ry: facePlaza(x, z), boxes, circles });

/** Coordenadas locales de un edificio → mundo. */
export function toWorld(b, lx, lz) {
  const c = Math.cos(b.ry), s = Math.sin(b.ry);
  return { x: b.x + lx * c + lz * s, z: b.z - lx * s + lz * c };
}

/* ---------- Edificios y sus colisiones ---------- */
const COTTAGE = [[0, 0, 2.95, 2.65]];
export const BUILDINGS = {
  guild: B('guild', 0, -28, [[0, 0, 5.4, 6.4], [-6.3, 4.1, 2.0, 2.0], [0, 6.9, 2.3, 0.8]], [[4.1, 8.3, 1.2], [-3.9, 7.0, 0.5]]),
  academy: B('academy', -27, -6, [[0, 1.5, 6.7, 6.6], [0, 8.9, 2.7, 1.0]]),
  tavern: B('tavern', -20, 21, [[0.3, 0, 5.6, 4.2]], [[2.6, 6.35, 1.45], [-4.6, 7.15, 1.45], [4.0, 4.5, 0.85], [-5.65, 0.8, 0.8]]),
  forge: B('forge', 21, 20, [[0, 0, 4.95, 3.95]], [[2.4, 5.2, 0.75], [-2.0, 5.4, 1.05], [0.6, 4.6, 0.6], [4.2, 4.4, 0.5]]),
  lighthouse: B('lighthouse', PROM.x, PROM.z, [[0, 0, 4.6, 4.6], [0, 4.9, 1.9, 0.6]], [[2.5, 5.2, 0.55], [-2.5, 5.2, 0.55]]),
  mill: B('mill', HILL.x, HILL.z, [], [[0, 0, 2.95]]),
  cottage1: B('cottage1', -8.5, -15.5, COTTAGE),
  cottage2: B('cottage2', 10.5, -15.5, COTTAGE),
  cottage3: B('cottage3', 10.5, 26, COTTAGE),
  cottage4: B('cottage4', -10, 27.5, COTTAGE)
};

/* ---------- Puntos de interés: NPC + pestaña del CV que abren ---------- */
const npcAt = (building, lx, lz) => toWorld(BUILDINGS[building], lx, lz);

export const POIS = [
  { id: 'hero', npc: 'guide', icon: '✦', pos: { x: 3.4, z: 3.0 }, zone: { x: 0, z: 0, r: 10 } },
  { id: 'quests', npc: 'guildmaster', icon: '⚔', building: 'guild', pos: npcAt('guild', -3.0, 9.3), zone: { ...npcAt('guild', 0, 8), r: 9 } },
  { id: 'skills', npc: 'mage', icon: '✧', building: 'lighthouse', pos: npcAt('lighthouse', 2.1, 6.5), zone: { ...npcAt('lighthouse', 0, 4), r: 9 } },
  { id: 'education', npc: 'scholar', icon: '❖', building: 'academy', pos: npcAt('academy', 3.9, 9.4), zone: { ...npcAt('academy', 0, 7), r: 8.5 } },
  { id: 'forge', npc: 'smith', icon: '⚒', building: 'forge', pos: npcAt('forge', 0.9, 6.5), zone: { ...npcAt('forge', 0, 5), r: 8.5 } },
  { id: 'contact', npc: 'innkeeper', icon: '✉', building: 'tavern', pos: npcAt('tavern', 0.1, 6.7), zone: { ...npcAt('tavern', 0, 5), r: 8.5 } }
];

/* ---------- Cofres (reliquias = proyectos antiguos de GitHub) ---------- */
export const CHESTS = [
  { id: 'uno', x: 0, z: 56.4, yaw: Math.PI },
  { id: 'lambda', x: -23.6, z: -28.4, yaw: 1.2 },
  { id: 'lightsout', x: 5.5, z: -36.8, yaw: 0.3 },
  { id: 'lung', x: 35.5, z: 23, yaw: -2.2 },
  { id: 'unreal', x: 44.3, z: -14.0, yaw: -1.3 },
  { id: 'k8s', x: -36, z: 10, yaw: 1.6 }
];

/* ---------- Caminos: [puntos], medio ancho ---------- */
const doorOf = (id, lz) => {
  const p = toWorld(BUILDINGS[id], 0, lz);
  return [p.x, p.z];
};
export const PATHS = [
  { pts: [[0, 0], doorOf('guild', 7.2)], w: 1.35 },
  { pts: [[0, 0], [-9, -1.5], doorOf('academy', 8.2)], w: 1.3 },
  { pts: [[0, 0], [-7.5, 7.5], doorOf('tavern', 5.2)], w: 1.3 },
  { pts: [[0, 0], [7.5, 7.5], doorOf('forge', 5.0)], w: 1.3 },
  { pts: [[0, 0], [11, -2.5], [22, -5.5], doorOf('lighthouse', 5.4)], w: 1.3 },
  { pts: [[0, 0], [0, 18], [0.5, 34], [0, 44.5]], w: 1.35 },
  { pts: [[-9, -1.5], [-16, -12], [-23.2, -21.4]], w: 1.05 }
];

/* ---------- Zonas llanas (sin ruido de terreno) ---------- */
export const FLAT_ZONES = [
  { x: 0, z: 0, r: 11 },
  { x: 0, z: -27, r: 10 },
  { x: -26, z: -6, r: 10 },
  { x: -20, z: 21, r: 9.5 },
  { x: 21, z: 20, r: 9.5 },
  { x: -8.5, z: -15.5, r: 5 },
  { x: 10.5, z: -15.5, r: 5 },
  { x: 10.5, z: 26, r: 5 },
  { x: -10, z: 27.5, r: 5 },
  { x: 0, z: 41, r: 5 }
];

/* ---------- Plataformas pisables sobre el agua ---------- */
export const DOCK = { x0: -1.6, x1: 1.6, z0: 42.5, z1: 58, y: 0.62 };
export const PLATFORMS = [DOCK];

/* ---------- Decorado fijo ---------- */
export const PROPS = {
  fountain: { x: 0, z: 0, r: 2.7 },
  well: { x: -6.4, z: -6.6, r: 1.25 },
  stall: { x: 6.8, z: -6.4, ry: -0.82, hw: 1.7, hd: 1.1 },
  campfire: { x: -31.5, z: 27.5, r: 1.0 },
  boat: { x: -4.4, z: 48.2, ry: -0.15 },
  cat: { x: -3.6, z: 3.9, yaw: 1.9 },
  signpost: { x: -3.0, z: 6.6, r: 0.35 }
};

/** Dónde aparece el jugador al usar el viaje rápido hacia un POI. */
export function arrivalSpot(poi) {
  if (!poi.building) return { x: poi.pos.x - 2.2, z: poi.pos.z + 2.2 };
  // un par de pasos hacia la plaza desde el NPC
  const d = Math.hypot(poi.pos.x, poi.pos.z) || 1;
  return { x: poi.pos.x - (poi.pos.x / d) * 2.6, z: poi.pos.z - (poi.pos.z / d) * 2.6 };
}
