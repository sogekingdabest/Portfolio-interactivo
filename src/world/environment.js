/* ============================================================
   ILUMINACIÓN Y CICLO DÍA / NOCHE
   Dos "presets" (día y noche) y una mezcla suave entre ellos.
   ============================================================ */
import * as THREE from 'three';
import { damp } from '../engine/kit.js';

const hex = (h) => new THREE.Color(h);
const DAY = {
  skyTop: hex(0x3f9be6), horizon: hex(0xcdeaf8),
  sun: hex(0xfff0d2), sunI: 2.9,
  hemiSky: hex(0xdff1ff), hemiGround: hex(0x8fa672), hemiI: 1.35,
  deep: hex(0x1f6f9c), shallow: hex(0x58c9cc), orb: hex(0xfff6d8), waterLight: 1
};
const NIGHT = {
  skyTop: hex(0x060a22), horizon: hex(0x1c2852),
  sun: hex(0x8ea6ff), sunI: 0.75,
  hemiSky: hex(0x3a4a80), hemiGround: hex(0x141a2e), hemiI: 0.75,
  deep: hex(0x0b2140), shallow: hex(0x1d5170), orb: hex(0xe4ecff), waterLight: 0.5
};

export function buildEnvironment(scene, world, { lowPower = false } = {}) {
  const hemi = new THREE.HemisphereLight(DAY.hemiSky, DAY.hemiGround, DAY.hemiI);
  scene.add(hemi);

  const sunDir = new THREE.Vector3(-0.42, 0.72, 0.55).normalize();
  const sun = new THREE.DirectionalLight(DAY.sun, DAY.sunI);
  sun.position.copy(sunDir).multiplyScalar(120);
  sun.castShadow = true;
  const size = lowPower ? 2048 : 4096;
  sun.shadow.mapSize.set(size, size);
  const cam = sun.shadow.camera;
  cam.left = -70; cam.right = 70; cam.top = 70; cam.bottom = -70;
  cam.near = 20; cam.far = 240;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.045;
  scene.add(sun, sun.target);

  scene.fog = new THREE.Fog(DAY.horizon.getHex(), 75, 250);
  scene.background = DAY.horizon.clone();

  const water = world.water.material.uniforms;
  water.uSunDir.value.copy(sunDir);
  const sky = world.sky;

  let night = 0, target = 0;
  const tmp = new THREE.Color();
  const mix = (a, b, out) => out.copy(a).lerp(b, night);

  function apply() {
    mix(DAY.skyTop, NIGHT.skyTop, sky.uniforms.uTop.value);
    mix(DAY.horizon, NIGHT.horizon, sky.uniforms.uHorizon.value);
    scene.fog.color.copy(sky.uniforms.uHorizon.value);
    scene.background.copy(sky.uniforms.uHorizon.value);
    mix(DAY.sun, NIGHT.sun, sun.color);
    sun.intensity = DAY.sunI + (NIGHT.sunI - DAY.sunI) * night;
    mix(DAY.hemiSky, NIGHT.hemiSky, hemi.color);
    mix(DAY.hemiGround, NIGHT.hemiGround, hemi.groundColor);
    hemi.intensity = DAY.hemiI + (NIGHT.hemiI - DAY.hemiI) * night;
    mix(DAY.deep, NIGHT.deep, water.uDeep.value);
    mix(DAY.shallow, NIGHT.shallow, water.uShallow.value);
    water.uSunCol.value.copy(sun.color);
    water.uLight.value = DAY.waterLight + (NIGHT.waterLight - DAY.waterLight) * night;
    sky.stars.material.opacity = night;
    sky.orb.material.color.copy(mix(DAY.orb, NIGHT.orb, tmp));
    sky.orb.scale.setScalar(1 - night * 0.35);
    world.setNight(night);
  }
  apply();

  return {
    sun,
    get night() {
      return night;
    },
    get isNight() {
      return target > 0.5;
    },
    setNight(on, instant = false) {
      target = on ? 1 : 0;
      if (instant) {
        night = target;
        apply();
      }
    },
    update(dt, camera) {
      if (Math.abs(night - target) > 0.001) {
        night = damp(night, target, 2.2, dt);
        if (Math.abs(night - target) <= 0.001) night = target;
        apply();
      }
      // el cielo acompaña a la cámara
      sky.group.position.copy(camera.position);
      sky.orb.position.copy(sunDir).multiplyScalar(480);
      sky.orb.lookAt(0, 0, 0);
    }
  };
}
