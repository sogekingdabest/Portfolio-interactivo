/* ============================================================
   PARTÍCULAS
   Un único Points por tipo de mezcla (normal / aditiva) con
   tamaño y alfa por partícula. Simulación en CPU (son pocas).
   ============================================================ */
import * as THREE from 'three';

export class Particles {
  constructor(max, additive = false) {
    this.max = max;
    this.count = 0;
    this.p = new Float32Array(max * 3);
    this.c = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.data = []; // { vx, vy, vz, life, ttl, size0, size1, alpha0, gravity, drag }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.c, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.uniforms = { uScale: { value: 600 } };
    this.points = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        vertexShader: /* glsl */ `
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aAlpha;
          uniform float uScale;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vColor = aColor;
            vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale / max(0.1, -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.12, d) * vAlpha;
            if (a < 0.004) discard;
            gl_FragColor = vec4(vColor, a);
            #include <colorspace_fragment>
          }
        `
      })
    );
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  /** Ajusta el factor de escala de pantalla (tamaños en unidades de mundo). */
  resize(heightPx, fovDeg) {
    this.uniforms.uScale.value = heightPx / (2 * Math.tan((fovDeg * Math.PI) / 360));
  }

  emit(x, y, z, o) {
    if (this.count >= this.max) return;
    const i = this.count++;
    this.p[i * 3] = x;
    this.p[i * 3 + 1] = y;
    this.p[i * 3 + 2] = z;
    this.c[i * 3] = o.r;
    this.c[i * 3 + 1] = o.g;
    this.c[i * 3 + 2] = o.b;
    this.data[i] = {
      vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0,
      life: 0, ttl: o.ttl || 1,
      size0: o.size0 ?? 0.3, size1: o.size1 ?? o.size0 ?? 0.3,
      alpha0: o.alpha ?? 1, gravity: o.gravity || 0, drag: o.drag || 0, wobble: o.wobble || 0, seed: Math.random() * 100
    };
  }

  update(dt, t) {
    let i = 0;
    while (i < this.count) {
      const d = this.data[i];
      d.life += dt;
      if (d.life >= d.ttl) {
        // sustituir por la última viva
        const last = --this.count;
        if (i !== last) {
          this.p.copyWithin(i * 3, last * 3, last * 3 + 3);
          this.c.copyWithin(i * 3, last * 3, last * 3 + 3);
          this.data[i] = this.data[last];
        }
        continue;
      }
      const k = d.life / d.ttl;
      d.vy -= d.gravity * dt;
      if (d.drag) {
        const f = Math.exp(-d.drag * dt);
        d.vx *= f; d.vy *= f; d.vz *= f;
      }
      let wx = 0, wz = 0;
      if (d.wobble) {
        wx = Math.sin(t * 1.3 + d.seed) * d.wobble;
        wz = Math.cos(t * 1.1 + d.seed * 1.7) * d.wobble;
      }
      this.p[i * 3] += (d.vx + wx) * dt;
      this.p[i * 3 + 1] += d.vy * dt;
      this.p[i * 3 + 2] += (d.vz + wz) * dt;
      this.size[i] = d.size0 + (d.size1 - d.size0) * k;
      // aparece rápido, se desvanece al final
      this.alpha[i] = d.alpha0 * Math.min(1, k * 8) * (1 - k * k);
      i++;
    }
    const g = this.points.geometry;
    g.setDrawRange(0, this.count);
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
    g.attributes.aAlpha.needsUpdate = true;
  }
}
