/* ============================================================
   ESTADO GLOBAL: idioma, datos del CV y progreso guardado
   ============================================================ */
import cvEs from '../data/cv.es.js';
import cvEn from '../data/cv.en.js';
import { I18N } from '../data/i18n.js';
import { POIS, CHESTS } from '../world/layout.js';

const KEY = 'dani-rpg3d:v1';
const DEFAULT_LANG = 'es';
const CVS = { es: cvEs, en: cvEn };

const defaults = () => ({ talked: {}, chests: {}, ach: {}, sfx: true, music: true, ending: false, lang: null, langChosen: false });

function load() {
  try {
    return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return defaults();
  }
}

export const state = {
  save: load(),
  lang: 'es',
  cv: cvEs,
  t: I18N.es,
  portrait: '',
  portraitFull: ''
};

export function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.save));
  } catch {
    /* almacenamiento no disponible (modo privado): el juego funciona igual */
  }
}

/** @param {boolean} chosen  true si lo ha elegido el visitante (entonces se recuerda) */
export function setLang(lang, chosen = false) {
  state.lang = CVS[lang] ? lang : DEFAULT_LANG;
  state.cv = CVS[state.lang];
  state.t = I18N[state.lang];
  document.documentElement.lang = state.lang;
  if (chosen) {
    state.save.lang = state.lang;
    state.save.langChosen = true;
    persist();
  }
}

export function resetProgress() {
  const { sfx, music, lang, langChosen } = state.save;
  state.save = { ...defaults(), sfx, music, lang, langChosen };
  persist();
}

setLang(state.save.langChosen ? state.save.lang : DEFAULT_LANG);

/** Nivel del héroe = años completos de experiencia; xp = fracción del año en curso. */
export function heroLevel(now = new Date()) {
  const s = new Date(state.cv.hero.startDate);
  let months = (now.getFullYear() - s.getFullYear()) * 12 + now.getMonth() - s.getMonth();
  if (now.getDate() < s.getDate()) months--;
  months = Math.max(0, months);
  return { level: Math.floor(months / 12), years: Math.floor(months / 12), months: months % 12, xp: (months % 12) / 12 };
}

export function progress() {
  const talked = POIS.filter((p) => state.save.talked[p.id]).length;
  const chests = CHESTS.filter((c) => state.save.chests[c.id]).length;
  return {
    talked,
    chests,
    totalTalk: POIS.length,
    totalChests: CHESTS.length,
    pct: Math.round(((talked + chests) / (POIS.length + CHESTS.length)) * 100)
  };
}

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
