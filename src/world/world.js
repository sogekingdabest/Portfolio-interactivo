/* ============================================================
   MUNDO: monta la Isla de Brigantia
   Todo el decorado estático se fusiona en dos mallas (opaca y
   luminosa). Solo lo que se mueve tiene malla propia.
   ============================================================ */
import * as THREE from 'three';
import { Batch, Builder, rng, fbm } from '../engine/kit.js';
import { Particles } from '../engine/particles.js';
import { buildTerrain, buildWater, buildSky, terrainHeight, groundAt, shoreDist, pathFactor } from './terrain.js';
import { BUILDINGS, POIS, CHESTS, PATHS, FLAT_ZONES, PROPS, DOCK, PLAZA_R, toWorld } from './layout.js';
import * as P from './props.js';
import { guildHall, academy, tavern, forge, lighthouse, cottage, windmill, windmillBlades, LIGHT_Y, MILL_HUB } from './buildings.js';
import { makeCharacter, makeChest } from './characters.js';

const { C } = P;

/* Aspecto de cada NPC */
const NPC_LOOKS = {
  guide: { tunic: 0x3f7f5a, cape: 0x2c5a41, hair: 0xd4d4dc, beard: 0xd4d4dc, hat: 'laurel', pants: 0x4a3a2a, prop: 'staff', orb: 0xffe08a, longHair: true },
  guildmaster: { tunic: 0x54688a, sleeves: 0x8a94a6, cape: 0xa83232, hair: 0x5a3a22, beard: 0x5a3a22, trim: 0xe9c046, pants: 0x2f3444 },
  mage: { tunic: 0x6a4bb8, long: true, hat: 'wizard', hatColor: 0x4f3696, hair: 0xe6e2f2, longHair: true, prop: 'staff', orb: 0x7fe6ff, trim: 0xe9c046, skin: 0xe8b98f },
  scholar: { tunic: 0x39598c, long: true, hair: 0x9a9aa6, glasses: true, prop: 'book', trim: 0xf2ead8, skin: 0xf2d0ae },
  smith: { tunic: 0xb5553a, apron: 0x5c4030, hair: 0xb0472a, longHair: true, hat: 'band', hatColor: 0x2f3444, prop: 'hammer', pants: 0x3a3028, skin: 0xe6b58c },
  innkeeper: { tunic: 0x4c7d55, apron: 0xf0ead8, hair: 0x2e2018, beard: 0x2e2018, hat: 'cap', hatColor: 0x7b4d2c, prop: 'mug', pants: 0x4a3a2a }
};
export const HERO_LOOK = { tunic: 0x2d6fd0, sleeves: 0x2459aa, cape: 0xc8413b, hair: 0x2e2018, fringe: true, pants: 0x2c3040, boots: 0x6b4426, pack: 0x8d5b36, trim: 0xe9c046 };

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,240,200,0.55)');
  grad.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildWorld(scene, { lowPower = false } = {}) {
  const rand = rng(20261004);
  const solid = new Batch(), glow = new Batch();
  const root = new Builder(solid), rootG = new Builder(glow);
  const circles = []; // { x, z, r }
  const boxes = []; // { x, z, hw, hd, rot }
  const lampPoints = [];
  const animated = [];

  /** Builders (estático + luminoso) apoyados en el terreno en (x,z). */
  const place = (x, z, ry = 0, s = 1) => {
    const y = terrainHeight(x, z);
    return [root.frame(x, y, z, ry, s), rootG.frame(x, y, z, ry, s), y];
  };

  /* ---------- Terreno, agua, cielo ---------- */
  const terrain = buildTerrain();
  const water = buildWater();
  const sky = buildSky();
  scene.add(terrain, water, sky.group);

  /* ---------- Edificios ---------- */
  const builders = {
    guild: guildHall,
    academy,
    tavern: (b, g) => tavern(b, g, rand),
    forge,
    lighthouse,
    mill: windmill,
    cottage1: (b, g) => cottage(b, g, { roofColor: C.roofBlue }),
    cottage2: (b, g) => cottage(b, g, { roofColor: C.roofGreen, wall: C.wallWarm }),
    cottage3: (b, g) => cottage(b, g, { roofColor: C.roofRed, wall: C.wallWarm }),
    cottage4: (b, g) => cottage(b, g, { roofColor: C.roofBrown })
  };
  const groundY = {};
  for (const def of Object.values(BUILDINGS)) {
    const [b, g, y] = place(def.x, def.z, def.ry);
    groundY[def.id] = y;
    builders[def.id](b, g);
    for (const [cx, cz, hw, hd] of def.boxes) {
      const w = toWorld(def, cx, cz);
      boxes.push({ x: w.x, z: w.z, hw, hd, rot: def.ry });
    }
    for (const [cx, cz, r] of def.circles) {
      const w = toWorld(def, cx, cz);
      circles.push({ x: w.x, z: w.z, r });
    }
  }

  /* ---------- Plaza y mobiliario ---------- */
  {
    const [b] = place(0, 0);
    P.fountain(b);
    circles.push({ x: 0, z: 0, r: PROPS.fountain.r });

    const [w] = place(PROPS.well.x, PROPS.well.z, 0.5);
    P.well(w);
    circles.push({ ...PROPS.well });

    const st = PROPS.stall;
    const [s] = place(st.x, st.z, st.ry);
    P.stall(s, rand);
    boxes.push({ x: st.x, z: st.z, hw: st.hw + 0.5, hd: st.hd, rot: st.ry });

    const [sp] = place(PROPS.signpost.x, PROPS.signpost.z, 0.4);
    P.signpost(sp);
    circles.push({ ...PROPS.signpost });

    // bancos mirando a la fuente
    for (const deg of [-52, 68, 156, -128]) {
      const a = (deg * Math.PI) / 180;
      const x = Math.cos(a) * 6.3, z = Math.sin(a) * 6.3;
      const [bn] = place(x, z, Math.atan2(-x, -z));
      P.bench(bn);
      circles.push({ x, z, r: 0.75 });
    }
    // faroles alrededor de la plaza (el brazo apunta a la fuente)
    for (const deg of [-50, -130, 158, 20, 68, 112]) {
      const a = (deg * Math.PI) / 180;
      addLamp(Math.cos(a) * (PLAZA_R + 0.7), Math.sin(a) * (PLAZA_R + 0.7), Math.PI - a);
    }
  }

  function addLamp(x, z, ry) {
    const [b, g, y] = place(x, z, ry);
    P.lamp(b, g);
    circles.push({ x, z, r: 0.3 });
    lampPoints.push(x + Math.cos(ry) * 0.42, y + 2.5, z - Math.sin(ry) * 0.42);
  }

  // faroles a lo largo de los caminos, alternando lados
  for (const path of PATHS) {
    let travelled = 0, next = 14, side = 1;
    for (let i = 0; i < path.pts.length - 1; i++) {
      const [ax, az] = path.pts[i], [bx, bz] = path.pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const dx = (bx - ax) / len, dz = (bz - az) / len;
      while (next < travelled + len) {
        const t = next - travelled;
        const px = ax + dx * t, pz = az + dz * t;
        const lx = px - dz * 2.1 * side, lz = pz + dx * 2.1 * side;
        const free = !boxes.some((o) => Math.hypot(o.x - lx, o.z - lz) < Math.max(o.hw, o.hd) + 2.5) && shoreDist(lx, lz) > 3;
        if (free) addLamp(lx, lz, Math.atan2(-(pz - lz), px - lx));
        side = -side;
        next += 10;
      }
      travelled += len;
    }
  }

  // muelle
  P.dock(root, DOCK);
  for (const sx of [-1, 1]) {
    const x = sx * 1.75, z = DOCK.z1 - 0.3;
    root.cyl(0.05, 0.07, 2.4, 5, x, DOCK.y - 0.2, z, C.iron);
    rootG.box(0.26, 0.34, 0.26, x, DOCK.y + 2.2, z, C.lamp);
    lampPoints.push(x, DOCK.y + 2.4, z);
  }

  // hoguera en la playa
  {
    const cf = PROPS.campfire;
    const [b, g] = place(cf.x, cf.z, 0.6);
    P.campfire(b, g, rand);
    circles.push({ ...cf });
  }
  // pajares y valla junto al molino
  for (const [dx, dz] of [[5.2, 1.5], [6.3, -0.6], [4.4, -2.2]]) {
    const x = BUILDINGS.mill.x + dx, z = BUILDINGS.mill.z + dz;
    const [b] = place(x, z, rand() * 6);
    P.haystack(b, rand);
    circles.push({ x, z, r: 1.05 });
  }
  for (const [id, lx, lz, ry, len] of [
    ['cottage1', 4.6, 1.5, Math.PI / 2, 4.6],
    ['cottage2', -4.6, 1.5, Math.PI / 2, 4.6],
    ['cottage3', 4.4, 1.2, Math.PI / 2, 4.2],
    ['cottage4', -4.4, 1.2, Math.PI / 2, 4.2]
  ]) {
    const def = BUILDINGS[id];
    const w = toWorld(def, lx, lz);
    const [b] = place(w.x, w.z, def.ry + ry);
    P.fence(b, len);
    boxes.push({ x: w.x, z: w.z, hw: len / 2, hd: 0.25, rot: def.ry + ry });
  }

  /* ---------- Vegetación y rocas ---------- */
  const blocked = (x, z, margin) => {
    for (const zn of FLAT_ZONES) if (Math.hypot(x - zn.x, z - zn.z) < zn.r - 1.5 + margin) return true;
    for (const o of circles) if (Math.hypot(x - o.x, z - o.z) < o.r + margin + 0.6) return true;
    for (const o of boxes) if (Math.hypot(x - o.x, z - o.z) < Math.max(o.hw, o.hd) + margin + 0.8) return true;
    for (const ch of CHESTS) if (Math.hypot(x - ch.x, z - ch.z) < 2.6 + margin) return true;
    for (const poi of POIS) if (Math.hypot(x - poi.pos.x, z - poi.pos.z) < 3 + margin) return true;
    return false;
  };
  const trees = [];
  for (let i = 0; i < 1500 && trees.length < 190; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 56;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const density = fbm(x * 0.06 + 31, z * 0.06 + 5, 2);
    if (density < 0.43 + rand() * 0.12) continue;
    if (shoreDist(x, z) < 6.5 || pathFactor(x, z) < 2.6 || blocked(x, z, 0.6)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.5)) continue;
    const s = 0.85 + rand() * 0.45;
    const [b] = place(x, z, rand() * 6, s);
    if (density > 0.6 || rand() < 0.3) P.pine(b, rand);
    else P.oak(b, rand);
    trees.push({ x, z });
    circles.push({ x, z, r: 0.42 * s });
  }
  for (let i = 0, n = 0; i < 600 && n < 70; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 54;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (shoreDist(x, z) < 5.5 || pathFactor(x, z) < 1.7 || blocked(x, z, -0.4)) continue;
    const [b] = place(x, z, rand() * 6);
    P.bush(b, rand);
    n++;
  }
  for (let i = 0, n = 0; i < 700 && n < 95; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 54;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (shoreDist(x, z) < 6 || pathFactor(x, z) < 1.4 || Math.hypot(x, z) < PLAZA_R + 1) continue;
    if (circles.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.6) || boxes.some((o) => Math.hypot(x - o.x, z - o.z) < Math.max(o.hw, o.hd) + 0.5)) continue;
    const [b] = place(x, z, rand() * 6);
    P.flowers(b, rand);
    n++;
  }
  // rocas: en tierra, en la playa y como islotes en el mar
  for (let i = 0, n = 0; i < 900 && n < 62; i++) {
    const a = rand() * Math.PI * 2, r = 20 + rand() * 46;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const d = shoreDist(x, z);
    if (d < -9 || pathFactor(x, z) < 2 || blocked(x, z, 0.3)) continue;
    if (Math.abs(x) < 6 && z > 38) continue; // despejar el muelle
    const sea = d < 0.5;
    const size = sea ? 1.5 + rand() * 1.6 : d < 5 ? 0.9 + rand() * 0.8 : 0.6 + rand() * 0.7;
    const y = sea ? Math.max(terrainHeight(x, z), -0.9) : terrainHeight(x, z);
    P.rock(root.frame(x, y, z, rand() * 6), rand, size);
    if (!sea) circles.push({ x, z, r: 0.55 * size });
    n++;
  }

  /* ---------- Mallas estáticas ---------- */
  const solidMesh = new THREE.Mesh(solid.build(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  solidMesh.castShadow = true;
  solidMesh.receiveShadow = true;
  const glowMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
  const glowMesh = new THREE.Mesh(glow.build(), glowMaterial);
  scene.add(solidMesh, glowMesh);

  /* ---------- Piezas animadas ---------- */
  const meshOf = (fn, material) => {
    const batch = new Batch();
    fn(new Builder(batch));
    const m = new THREE.Mesh(batch.build(), material || new THREE.MeshLambertMaterial({ vertexColors: true }));
    m.castShadow = true;
    return m;
  };

  // aspas del molino
  {
    const def = BUILDINGS.mill;
    const hub = new THREE.Group();
    const w = toWorld(def, 0, MILL_HUB.z);
    hub.position.set(w.x, groundY.mill + MILL_HUB.y, w.z);
    hub.rotation.y = def.ry;
    const blades = meshOf(windmillBlades);
    hub.add(blades);
    scene.add(hub);
    animated.push((dt, t) => (blades.rotation.z = t * 0.45));
  }

  // barca meciéndose
  {
    const bt = meshOf(P.boat);
    bt.position.set(PROPS.boat.x, 0.05, PROPS.boat.z);
    bt.rotation.order = 'YXZ';
    bt.rotation.y = PROPS.boat.ry;
    scene.add(bt);
    animated.push((dt, t) => {
      bt.position.y = 0.06 + Math.sin(t * 1.1) * 0.09;
      bt.rotation.z = Math.sin(t * 0.9) * 0.07;
      bt.rotation.x = Math.sin(t * 0.7 + 1) * 0.04;
    });
  }

  // haz del faro + cristales arcanos
  const lightTop = new THREE.Vector3(BUILDINGS.lighthouse.x, groundY.lighthouse + LIGHT_Y, BUILDINGS.lighthouse.z);
  const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  {
    const beams = new THREE.Group();
    beams.position.copy(lightTop);
    for (const dir of [1, -1]) {
      const g = new THREE.CylinderGeometry(0.25, 3.4, 34, 14, 1, true);
      g.translate(0, -17, 0);
      g.rotateZ((dir * Math.PI) / 2);
      beams.add(new THREE.Mesh(g, beamMaterial));
    }
    scene.add(beams);
    const crystalMat = new THREE.MeshBasicMaterial({ color: 0x8fe9ff });
    const crystals = [];
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), crystalMat);
      m.scale.y = 1.7;
      scene.add(m);
      crystals.push(m);
    }
    animated.push((dt, t) => {
      beams.rotation.y = t * 0.35;
      crystals.forEach((m, i) => {
        const a = t * 0.5 + (i / crystals.length) * Math.PI * 2;
        m.position.set(lightTop.x + Math.cos(a) * 3.3, lightTop.y - 3.6 + Math.sin(t * 1.4 + i * 1.3) * 0.5, lightTop.z + Math.sin(a) * 3.3);
        m.rotation.y = t * 1.6 + i;
      });
    });
  }

  // nubes
  {
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, fog: false });
    const cr = rng(5);
    for (let i = 0; i < (lowPower ? 7 : 12); i++) {
      const batch = new Batch();
      const b = new Builder(batch);
      const n = 4 + Math.floor(cr() * 4);
      for (let k = 0; k < n; k++) {
        const r = 3 + cr() * 3.5;
        b.ico(r * 1.5, r * 0.75, r, (k - n / 2) * 4 + cr() * 2, cr() * 1.6, (cr() - 0.5) * 5, 0xffffff, { y: cr() * 6 });
      }
      const m = new THREE.Mesh(batch.build(), cloudMat);
      m.position.set(-190 + cr() * 380, 40 + cr() * 22, -170 + cr() * 340);
      const speed = 0.7 + cr() * 0.9;
      scene.add(m);
      animated.push((dt) => {
        m.position.x += speed * dt;
        if (m.position.x > 200) m.position.x = -200;
      });
    }
  }

  // gaviotas sobrevolando la costa
  {
    const birdMat = new THREE.MeshLambertMaterial({ color: 0xf6f6f2, flatShading: true });
    const wingGeo = new THREE.BoxGeometry(0.9, 0.04, 0.34);
    wingGeo.translate(0.45, 0, 0);
    for (let i = 0; i < (lowPower ? 3 : 6); i++) {
      const bird = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.6), birdMat);
      const wl = new THREE.Mesh(wingGeo, birdMat), wr = new THREE.Mesh(wingGeo, birdMat);
      wr.scale.x = -1;
      bird.add(body, wl, wr);
      scene.add(bird);
      const cx = i < 3 ? 30 : -6, cz = i < 3 ? -4 : 40;
      const R = 13 + i * 3.2, h = 15 + (i % 3) * 3, sp = (0.22 + i * 0.03) * (i % 2 ? 1 : -1), ph = i * 2.1;
      animated.push((dt, t) => {
        const a = t * sp + ph;
        bird.position.set(cx + Math.cos(a) * R, h + Math.sin(t * 0.6 + ph) * 1.4, cz + Math.sin(a) * R);
        bird.rotation.y = -a + (sp > 0 ? Math.PI : 0);
        const flap = Math.sin(t * 7 + ph) * 0.55;
        wl.rotation.z = flap;
        wr.rotation.z = -flap;
      });
    }
  }

  // gato Null
  {
    const ct = meshOf(P.cat);
    ct.position.set(PROPS.cat.x, terrainHeight(PROPS.cat.x, PROPS.cat.z), PROPS.cat.z);
    ct.rotation.y = PROPS.cat.yaw;
    ct.scale.setScalar(1.25);
    scene.add(ct);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.5).translate(0, 0, -0.25), new THREE.MeshLambertMaterial({ color: 0x2b2b33, flatShading: true }));
    tail.position.set(0, 0.14, -0.24);
    ct.add(tail);
    circles.push({ x: PROPS.cat.x, z: PROPS.cat.z, r: 0.45 });
    animated.push((dt, t) => {
      tail.rotation.y = Math.sin(t * 2.2) * 0.7;
      tail.rotation.x = -0.5 + Math.sin(t * 1.3) * 0.15;
    });
  }

  /* ---------- NPCs ---------- */
  const npcs = POIS.map((poi) => {
    const ch = makeCharacter(NPC_LOOKS[poi.npc]);
    const y = terrainHeight(poi.pos.x, poi.pos.z);
    ch.group.position.set(poi.pos.x, y, poi.pos.z);
    const home = Math.atan2(-poi.pos.x, -poi.pos.z); // mirando a la plaza
    ch.group.rotation.y = home;
    scene.add(ch.group);
    circles.push({ x: poi.pos.x, z: poi.pos.z, r: 0.55 });
    return { poi, id: poi.npc, char: ch, x: poi.pos.x, y, z: poi.pos.z, home, yaw: home };
  });

  /* ---------- Cofres ---------- */
  const chests = CHESTS.map((def) => {
    const chest = makeChest();
    const y = groundAt(def.x, def.z);
    chest.group.position.set(def.x, y, def.z);
    chest.group.rotation.y = def.yaw;
    scene.add(chest.group);
    circles.push({ x: def.x, z: def.z, r: 0.75 });
    return { ...def, y, chest };
  });

  /* ---------- Halos de farol y luces puntuales ---------- */
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute('position', new THREE.Float32BufferAttribute(lampPoints, 3));
  const haloMat = new THREE.PointsMaterial({ map: glowTexture(), color: 0xffd58a, size: 4.2, sizeAttenuation: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const halos = new THREE.Points(haloGeo, haloMat);
  halos.renderOrder = 4;
  scene.add(halos);

  const mkLight = (color, x, y, z, dist) => {
    const l = new THREE.PointLight(color, 0, dist, 1.6);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  };
  const forgeFire = toWorld(BUILDINGS.forge, 2.6, -1.3);
  const tavernDoor = toWorld(BUILDINGS.tavern, -0.5, 6.2);
  const guildDoor = toWorld(BUILDINGS.guild, 0, 8.2);
  const lights = {
    plaza: mkLight(0xffc878, 0, terrainHeight(0, 0) + 5, 0, 30),
    forge: mkLight(0xff8a3c, forgeFire.x, groundY.forge + 1.6, forgeFire.z, 20),
    tavern: mkLight(0xffb866, tavernDoor.x, groundY.tavern + 3, tavernDoor.z, 22),
    guild: mkLight(0xffc878, guildDoor.x, groundY.guild + 3.2, guildDoor.z, 22),
    tower: mkLight(0xbfe6ff, lightTop.x, lightTop.y - 15, lightTop.z + 4, 26),
    campfire: mkLight(0xff8a3c, PROPS.campfire.x, terrainHeight(PROPS.campfire.x, PROPS.campfire.z) + 1.2, PROPS.campfire.z, 16)
  };

  /* ---------- Partículas ---------- */
  const fxSoft = new Particles(260, false);
  const fxAdd = new Particles(320, true);
  scene.add(fxSoft.points, fxAdd.points);

  const chimneys = [
    { ...toWorld(BUILDINGS.forge, 2.6, -2.55), y: groundY.forge + 8.8, rate: 5 },
    { ...toWorld(BUILDINGS.tavern, 5.1, -1.4), y: groundY.tavern + 8.9, rate: 3.2 },
    { ...toWorld(BUILDINGS.guild, 3.1, -3.4), y: groundY.guild + 9.4, rate: 2.2 }
  ];
  const fireflyRand = rng(3);
  let acc = { smoke: 0, ember: 0, fly: 0, fountain: 0, fire: 0 };
  let night = 0;
  const plazaY = terrainHeight(0, 0);
  const camp = { ...PROPS.campfire, y: terrainHeight(PROPS.campfire.x, PROPS.campfire.z) };

  function updateFx(dt, t) {
    acc.smoke += dt;
    if (acc.smoke > 0.11) {
      acc.smoke = 0;
      for (const c of chimneys) {
        if (Math.random() < c.rate * 0.11) {
          fxSoft.emit(c.x + (Math.random() - 0.5) * 0.4, c.y, c.z + (Math.random() - 0.5) * 0.4, {
            r: 0.62, g: 0.62, b: 0.66, vx: 0.45 + Math.random() * 0.3, vy: 1.0 + Math.random() * 0.4, vz: 0.1,
            ttl: 4.5, size0: 0.7, size1: 2.6, alpha: 0.34, drag: 0.15
          });
        }
      }
    }
    acc.ember += dt;
    if (acc.ember > 0.07) {
      acc.ember = 0;
      fxAdd.emit(forgeFire.x + (Math.random() - 0.5) * 0.8, groundY.forge + 1.0, forgeFire.z + (Math.random() - 0.5) * 0.4, {
        r: 1, g: 0.45 + Math.random() * 0.3, b: 0.1, vx: (Math.random() - 0.5) * 0.8, vy: 1.2 + Math.random() * 1.4, vz: (Math.random() - 0.5) * 0.8,
        ttl: 1.1 + Math.random() * 0.6, size0: 0.16, size1: 0.04, alpha: 0.95, gravity: -0.3, wobble: 0.5
      });
      fxAdd.emit(camp.x + (Math.random() - 0.5) * 0.4, camp.y + 0.5, camp.z + (Math.random() - 0.5) * 0.4, {
        r: 1, g: 0.5 + Math.random() * 0.3, b: 0.12, vx: (Math.random() - 0.5) * 0.4, vy: 1.0 + Math.random() * 1.2, vz: (Math.random() - 0.5) * 0.4,
        ttl: 1.2, size0: 0.22, size1: 0.04, alpha: 0.9, wobble: 0.4
      });
    }
    acc.fountain += dt;
    if (acc.fountain > 0.05) {
      acc.fountain = 0;
      const a = Math.random() * Math.PI * 2;
      fxSoft.emit(0, plazaY + 3.0, 0, {
        r: 0.75, g: 0.92, b: 1, vx: Math.cos(a) * 1.1, vy: 1.6 + Math.random() * 0.6, vz: Math.sin(a) * 1.1,
        ttl: 0.95, size0: 0.16, size1: 0.1, alpha: 0.85, gravity: 6.5
      });
    }
    // luciérnagas (solo de noche)
    acc.fly += dt * night;
    if (acc.fly > 0.12) {
      acc.fly = 0;
      const a = fireflyRand() * Math.PI * 2, r = 6 + fireflyRand() * 36;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (shoreDist(x, z) > 4) {
        fxAdd.emit(x, terrainHeight(x, z) + 0.6 + Math.random() * 1.8, z, {
          r: 0.85, g: 1, b: 0.35, vy: 0.1, ttl: 5 + Math.random() * 3, size0: 0.2, size1: 0.2, alpha: 0.9, wobble: 0.7
        });
      }
    }
    fxSoft.update(dt, t);
    fxAdd.update(dt, t);

    // parpadeo del fuego
    const flick = 0.85 + Math.sin(t * 11) * 0.08 + Math.sin(t * 23.7) * 0.07;
    lights.forge.intensity = (14 + night * 30) * flick;
    lights.campfire.intensity = (8 + night * 26) * flick;
  }

  /** Estallido de chispas doradas (cofres, descubrimientos). */
  function burst(x, y, z, n = 28, color = [1, 0.82, 0.3]) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2.6;
      fxAdd.emit(x, y, z, {
        r: color[0], g: color[1], b: color[2], vx: Math.cos(a) * s, vy: 2.5 + Math.random() * 3, vz: Math.sin(a) * s,
        ttl: 0.9 + Math.random() * 0.7, size0: 0.26, size1: 0.03, alpha: 1, gravity: 5, drag: 0.6
      });
    }
  }

  return {
    terrain, water, sky, npcs, chests, circles, boxes, lights, lightTop,
    fx: [fxSoft, fxAdd],
    burst,
    /** n: 0 = día, 1 = noche */
    setNight(n) {
      night = n;
      glowMaterial.color.setScalar(0.5 + 0.5 * n);
      haloMat.opacity = n * 0.85;
      beamMaterial.opacity = 0.035 + n * 0.15;
      lights.plaza.intensity = n * 55;
      lights.tavern.intensity = n * 38;
      lights.guild.intensity = n * 34;
      lights.tower.intensity = n * 40;
    },
    update(dt, t) {
      water.material.uniforms.uTime.value = t;
      for (const fn of animated) fn(dt, t);
      updateFx(dt, t);
    }
  };
}
