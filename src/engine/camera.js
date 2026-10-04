/* ============================================================
   CÁMARA EN TERCERA PERSONA
   Órbita (yaw / pitch / distancia) alrededor de un foco. Todos
   los parámetros se suavizan, así que cambiar de modo (título →
   juego → diálogo) produce una transición de cámara gratis.
   ============================================================ */
import * as THREE from 'three';
import { clamp, damp, dampAngle } from './kit.js';
import { groundAt } from '../world/terrain.js';

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    // valores elegidos por el jugador
    this.yaw = 0;
    this.pitch = 0.5;
    this.dist = 19;
    // valores actuales (suavizados)
    this.cYaw = 0.9;
    this.cPitch = 0.5;
    this.cDist = 86;
    this.focus = new THREE.Vector3(2, 3, -2);
    this._want = new THREE.Vector3();
  }

  rotate(dx, dy) {
    this.yaw -= dx * 0.0052;
    this.pitch = clamp(this.pitch + dy * 0.004, 0.16, 1.3);
  }

  zoom(delta) {
    this.dist = clamp(this.dist + delta * 1.6, 6.5, 36);
  }

  /** Vector "adelante" (alejándose de la cámara) en el plano XZ. */
  forward() {
    return { x: -Math.sin(this.cYaw), z: -Math.cos(this.cYaw) };
  }

  /**
   * @param {number} dt
   * @param {THREE.Vector3} focus  punto a mirar
   * @param {object} [o] { yaw, pitch, dist, speed } para forzar una toma concreta
   */
  update(dt, focus, o = {}) {
    const speed = o.speed ?? 5;
    this.cYaw = dampAngle(this.cYaw, o.yaw ?? this.yaw, speed, dt);
    this.cPitch = damp(this.cPitch, o.pitch ?? this.pitch, speed, dt);
    this.cDist = damp(this.cDist, o.dist ?? this.dist, speed * 0.8, dt);
    this.focus.x = damp(this.focus.x, focus.x, speed * 1.6, dt);
    this.focus.y = damp(this.focus.y, focus.y, speed * 1.1, dt);
    this.focus.z = damp(this.focus.z, focus.z, speed * 1.6, dt);

    const cp = Math.cos(this.cPitch);
    const p = this._want.set(
      this.focus.x + Math.sin(this.cYaw) * cp * this.cDist,
      this.focus.y + Math.sin(this.cPitch) * this.cDist,
      this.focus.z + Math.cos(this.cYaw) * cp * this.cDist
    );
    // no atravesar el suelo ni meterse bajo el agua
    p.y = Math.max(p.y, groundAt(p.x, p.z) + 1.2, 1.0);
    this.camera.position.copy(p);
    this.camera.lookAt(this.focus);
  }
}
