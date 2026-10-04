/* ============================================================
   TERRENO, AGUA Y CIELO
   La isla es un campo de alturas analítico (sin assets): perfil
   de playa → pradera, un promontorio para el faro y una colina
   para el molino. El agua replica la línea de costa en GLSL para
   dibujar la espuma de las olas.
   ============================================================ */
import * as THREE from 'three';
import { clamp, lerp, smoothstep, fbm, noise2, rng } from '../engine/kit.js';
import { ISLAND_R, PROM, HILL, PLAZA_R, PATHS, FLAT_ZONES, PLATFORMS } from './layout.js';

export const SIZE = 164;
const SEG = 164;
const HALF = SIZE / 2;
const CELL = SIZE / SEG;
const N = SEG + 1;
const H = new Float32Array(N * N);

const smax = (a, b, k) => {
  const h = clamp(0.5 + (0.5 * (a - b)) / k, 0, 1);
  return lerp(b, a, h) + k * h * (1 - h);
};

/** Distancia (aprox.) a la línea de costa: >0 tierra adentro, <0 mar. */
export function shoreDist(x, z) {
  const a = Math.atan2(z, x);
  const R = ISLAND_R * (1 + 0.07 * Math.sin(3 * a + 1.3) + 0.045 * Math.sin(5 * a + 0.4) + 0.025 * Math.sin(9 * a + 2.0));
  const d = R - Math.hypot(x, z);
  const dp = PROM.r - Math.hypot(x - PROM.x, z - PROM.z);
  return smax(d, dp, 4);
}

function flatness(x, z) {
  let f = 1;
  for (const zn of FLAT_ZONES) {
    f = Math.min(f, smoothstep(zn.r, zn.r + 6, Math.hypot(x - zn.x, z - zn.z)));
  }
  return f;
}

function heightFn(x, z) {
  const d = shoreDist(x, z);
  let h = -5 + 5 * smoothstep(-14, 0, d); // fondo marino → orilla
  h += 0.55 * smoothstep(0, 4, d); // playa
  h += 0.85 * smoothstep(3.5, 8, d); // talud de hierba
  const inland = smoothstep(6, 14, d);
  const coast = smoothstep(0, 6, d);
  const dProm = Math.hypot(x - PROM.x, z - PROM.z);
  const dHill = Math.hypot(x - HILL.x, z - HILL.z);
  const bumps = smoothstep(PROM.r + 1, PROM.top, dProm) + smoothstep(HILL.r, HILL.top, dHill);
  h += (fbm(x * 0.075 + 11.3, z * 0.075 + 7.1, 3) - 0.5) * 1.7 * inland * flatness(x, z) * (1 - clamp(bumps, 0, 1));
  h += PROM.h * smoothstep(PROM.r + 1, PROM.top, dProm) * coast;
  h += HILL.h * smoothstep(HILL.r, HILL.top, dHill) * coast;
  return h;
}

/** Altura exacta de la malla del terreno (misma triangulación). */
export function terrainHeight(x, z) {
  const fx = clamp((x + HALF) / CELL, 0, SEG - 1e-4);
  const fz = clamp((z + HALF) / CELL, 0, SEG - 1e-4);
  const ix = Math.floor(fx), iz = Math.floor(fz);
  const tx = fx - ix, tz = fz - iz;
  const i = iz * N + ix;
  const h00 = H[i], h10 = H[i + 1], h01 = H[i + N], h11 = H[i + N + 1];
  if (tx + tz <= 1) return h00 + (h10 - h00) * tx + (h01 - h00) * tz;
  return h11 + (h01 - h11) * (1 - tx) + (h10 - h11) * (1 - tz);
}

/** Altura pisable: terreno o plataforma (muelle). */
export function groundAt(x, z) {
  let h = terrainHeight(x, z);
  for (const p of PLATFORMS) {
    if (x >= p.x0 && x <= p.x1 && z >= p.z0 && z <= p.z1) h = Math.max(h, p.y);
  }
  return h;
}

function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz), 0, 1);
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}
/** Distancia al camino más cercano, normalizada por su medio ancho (<1 = dentro). */
export function pathFactor(x, z) {
  let best = 99;
  for (const p of PATHS) {
    for (let i = 0; i < p.pts.length - 1; i++) {
      const a = p.pts[i], b = p.pts[i + 1];
      best = Math.min(best, segDist(x, z, a[0], a[1], b[0], b[1]) / p.w);
    }
  }
  return best;
}

/* ---------- Colores ---------- */
const COL = {
  grassA: new THREE.Color(0x7dbb55),
  grassB: new THREE.Color(0x559c47),
  grassDry: new THREE.Color(0x9cc45c),
  sand: new THREE.Color(0xe9d8a8),
  sandWet: new THREE.Color(0xcdbd8c),
  seabed: new THREE.Color(0x2f6f86),
  deep: new THREE.Color(0x173e5c),
  rock: new THREE.Color(0x8f8c88),
  rockDark: new THREE.Color(0x74716f),
  dirt: new THREE.Color(0xc9a878),
  cobbleA: new THREE.Color(0xb9b2a6),
  cobbleB: new THREE.Color(0xa59e93)
};
const _col = new THREE.Color();

function faceColor(x, z, h, ny, rand) {
  const j = rand();
  if (h < 0.02) {
    const t = smoothstep(0, -3.6, h);
    _col.copy(COL.sandWet).lerp(COL.seabed, smoothstep(0, 0.45, t)).lerp(COL.deep, smoothstep(0.4, 1, t));
  } else if (h < 0.6 + (noise2(x * 0.4, z * 0.4) - 0.5) * 0.25) {
    _col.copy(COL.sand).lerp(COL.sandWet, smoothstep(0.22, 0.02, h));
    _col.offsetHSL(0, 0, (j - 0.5) * 0.03);
  } else {
    const pf = pathFactor(x, z);
    const inPlaza = Math.hypot(x, z) < PLAZA_R + (noise2(x * 0.9, z * 0.9) - 0.5) * 0.8;
    if (inPlaza) {
      const k = (Math.floor(x / 1.5) + Math.floor(z / 1.5)) & 1;
      _col.copy(k ? COL.cobbleA : COL.cobbleB).offsetHSL(0, 0, (j - 0.5) * 0.05);
    } else if (pf < 0.82 + noise2(x * 0.7, z * 0.7) * 0.36) {
      _col.copy(COL.dirt).offsetHSL(0, 0, (j - 0.5) * 0.05);
    } else if (ny < 0.86) {
      _col.copy(COL.rock).lerp(COL.rockDark, j);
    } else {
      const n = fbm(x * 0.09 + 3.7, z * 0.09 + 9.2, 2);
      _col.copy(COL.grassA).lerp(COL.grassB, smoothstep(0.35, 0.65, n));
      _col.lerp(COL.grassDry, smoothstep(0.62, 0.8, noise2(x * 0.21 + 40, z * 0.21 + 17)) * 0.6);
      _col.offsetHSL(0, 0, (j - 0.5) * 0.035);
    }
  }
  return _col;
}

export function buildTerrain() {
  for (let iz = 0; iz < N; iz++) {
    for (let ix = 0; ix < N; ix++) {
      H[iz * N + ix] = heightFn(-HALF + ix * CELL, -HALF + iz * CELL);
    }
  }
  const rand = rng(7);
  const pos = new Float32Array(SEG * SEG * 18);
  const col = new Float32Array(SEG * SEG * 18);
  let o = 0;
  const tri = (ax, ay, az, bx, by, bz, cx, cy, cz) => {
    // normal.y de la cara para detectar pendientes
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const nyN = ny / Math.hypot(nx, ny, nz);
    const c = faceColor((ax + bx + cx) / 3, (az + bz + cz) / 3, (ay + by + cy) / 3, nyN, rand);
    pos.set([ax, ay, az, bx, by, bz, cx, cy, cz], o);
    col.set([c.r, c.g, c.b, c.r, c.g, c.b, c.r, c.g, c.b], o);
    o += 9;
  };
  for (let iz = 0; iz < SEG; iz++) {
    for (let ix = 0; ix < SEG; ix++) {
      const x0 = -HALF + ix * CELL, z0 = -HALF + iz * CELL, x1 = x0 + CELL, z1 = z0 + CELL;
      const i = iz * N + ix;
      const h00 = H[i], h10 = H[i + 1], h01 = H[i + N], h11 = H[i + N + 1];
      tri(x0, h00, z0, x0, h01, z1, x1, h10, z0);
      tri(x1, h10, z0, x0, h01, z1, x1, h11, z1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  return mesh;
}

/* ---------- Agua ---------- */
const SHORE_GLSL = /* glsl */ `
  float smaxf(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
    return mix(b, a, h) + k * h * (1.0 - h);
  }
  float shoreDist(vec2 p) {
    float a = atan(p.y, p.x);
    float R = ${ISLAND_R.toFixed(1)} * (1.0 + 0.07 * sin(3.0 * a + 1.3) + 0.045 * sin(5.0 * a + 0.4) + 0.025 * sin(9.0 * a + 2.0));
    float d = R - length(p);
    float dp = ${PROM.r.toFixed(1)} - length(p - vec2(${PROM.x.toFixed(1)}, ${PROM.z.toFixed(1)}));
    return smaxf(d, dp, 4.0);
  }
`;

export function buildWater() {
  const geometry = new THREE.PlaneGeometry(600, 600, 150, 150);
  geometry.rotateX(-Math.PI / 2);
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x1f6f9c) },
      uShallow: { value: new THREE.Color(0x4fc3c8) },
      uFoam: { value: new THREE.Color(0xffffff) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.4) },
      uSunCol: { value: new THREE.Color(0xfff2cc) },
      uLight: { value: 1 }
    }
  ]);
  const material = new THREE.ShaderMaterial({
    uniforms,
    fog: true,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      #include <common>
      #include <fog_pars_vertex>
      uniform float uTime;
      varying vec3 vWorld;
      ${SHORE_GLSL}
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        float d = shoreDist(wp.xz);
        float amp = mix(0.3, 1.0, smoothstep(-1.0, -12.0, d));
        wp.y += amp * (sin(wp.x * 0.23 + uTime * 0.9) * 0.10
                     + sin(wp.z * 0.31 - uTime * 1.1) * 0.08
                     + sin((wp.x + wp.z) * 0.14 + uTime * 0.6) * 0.10);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <fog_pars_fragment>
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uFoam;
      uniform vec3 uSunDir;
      uniform vec3 uSunCol;
      uniform float uLight;
      varying vec3 vWorld;
      ${SHORE_GLSL}
      void main() {
        vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        if (n.y < 0.0) n = -n;
        float d = shoreDist(vWorld.xz);
        float depth = clamp(-d / 14.0, 0.0, 1.0);
        vec3 col = mix(uShallow, uDeep, smoothstep(0.0, 0.75, depth));
        float diff = clamp(dot(n, uSunDir), 0.0, 1.0);
        col *= 0.62 + 0.5 * diff;
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float spec = pow(max(dot(n, normalize(viewDir + uSunDir)), 0.0), 70.0);
        col += uSunCol * spec * 0.55;
        // espuma: bandas que avanzan hacia la orilla + línea fija en la costa
        float band = sin(d * 1.7 - uTime * 1.3) * 0.5 + 0.5;
        float foam = smoothstep(-3.4, -0.3, d) * smoothstep(0.62, 0.96, band) * 0.75;
        foam += smoothstep(-0.8, 0.15, d) * 0.9;
        foam = clamp(foam, 0.0, 1.0);
        col = mix(col, uFoam * uLight, foam);
        float alpha = mix(0.62, 0.9, smoothstep(0.0, 0.45, depth));
        gl_FragColor = vec4(col, max(alpha, foam));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'water';
  mesh.renderOrder = 2;
  return mesh;
}

/* ---------- Cielo ---------- */
export function buildSky() {
  const group = new THREE.Group();
  const uniforms = {
    uTop: { value: new THREE.Color(0x4aa3e8) },
    uHorizon: { value: new THREE.Color(0xcfeaf7) }
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(520, 24, 12),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        varying vec3 vDir;
        void main() {
          float t = pow(clamp(vDir.y, 0.0, 1.0), 0.55);
          gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0);
          #include <colorspace_fragment>
        }
      `
    })
  );
  dome.renderOrder = -10;
  group.add(dome);

  // estrellas (solo de noche)
  const rand = rng(99);
  const starPos = [];
  for (let i = 0; i < 420; i++) {
    const a = rand() * Math.PI * 2, y = 0.08 + rand() * 0.92, r = Math.sqrt(1 - y * y);
    starPos.push(Math.cos(a) * r * 500, y * 500, Math.sin(a) * r * 500);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })
  );
  stars.renderOrder = -9;
  group.add(stars);

  // sol / luna
  const orb = new THREE.Mesh(
    new THREE.CircleGeometry(22, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false, depthWrite: false })
  );
  orb.renderOrder = -8;
  group.add(orb);

  return { group, uniforms, stars, orb };
}
