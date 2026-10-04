/* ============================================================
   VENTANA RPG: pestañas con el contenido del CV
   ============================================================ */
import { state, esc, heroLevel, progress } from './state.js';
import { CHESTS } from '../world/layout.js';

export const TABS = [
  ['hero', '✦'],
  ['quests', '⚔'],
  ['skills', '✧'],
  ['education', '❖'],
  ['forge', '⚒'],
  ['contact', '✉'],
  ['log', '★']
];

export const ICONS = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.82-1.8 3.75-1.8 4 0 4.39 2.4 4.39 5.6v5.7h-4v-5.05c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.94 1.3-1.94 2.66v5.14h-4v-11Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
  external: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>'
};

const chips = (list) => (list.length ? `<div class="chips">${list.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : '');
const rank = (r) => `<span class="rank">${esc(state.t.ranks[r])}</span>`;
const mod = (score) => {
  const m = Math.floor((score - 10) / 2);
  return (m >= 0 ? '+' : '') + m;
};

const render = {
  hero() {
    const { cv, t } = state;
    const h = cv.hero, lv = heroLevel();
    return `
      <div class="sheet">
        <aside class="sheet-side">
          <img class="portrait" src="${state.portraitFull}" alt="${esc(h.name)}">
          <div class="sheet-name">${esc(h.name)}</div>
          <div class="sheet-title">${esc(h.title)} · ${esc(h.tagline)}</div>
          <div class="sheet-level">
            <span class="lvl">${esc(t.hud.level)} ${lv.level}</span>
            <span class="bar"><span style="width:${Math.round(lv.xp * 100)}%"></span></span>
          </div>
          <div class="sheet-xp">${esc(t.panel.experience(lv.years, lv.months))}</div>
          <dl class="facts">${h.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </aside>
        <div>
          <h3>${esc(t.panel.background)}</h3>
          <div class="bio">${h.bio.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          <h3>${esc(t.panel.abilities)}</h3>
          <div class="abilities">
            ${h.abilities
              .map(
                (a) => `<div class="ability">
                  <div class="abbr">${esc(a.abbr)}</div>
                  <div class="score">${a.score}</div>
                  <span class="mod">${mod(a.score)}</span>
                  <div class="nm">${esc(a.name)}</div>
                  <div class="dt">${esc(a.detail)}</div>
                </div>`
              )
              .join('')}
          </div>
          <h3>${esc(t.panel.passives)}</h3>
          <ul class="traits">${h.passives.map(([k, v]) => `<li><b>${esc(k)}</b>${esc(v)}</li>`).join('')}</ul>
        </div>
      </div>`;
  },

  quests() {
    const { cv, t } = state;
    return `<p class="intro">${esc(t.panel.questsIntro)}</p>${cv.quests
      .map(
        (q) => `<article class="quest r-${q.rank}${q.current ? ' current' : ''}">
          <div class="quest-top">
            <h4>${esc(q.name)}</h4>
            ${q.current ? `<span class="state">${esc(t.panel.current)}</span>` : ''}
            ${rank(q.rank)}
          </div>
          <div class="quest-meta"><b>${esc(q.role)}</b> · ${esc(q.company)}${q.client ? ` · ${esc(t.panel.client)}: ${esc(q.client)}` : ''} · ${esc(q.period)}</div>
          <p class="quest-sum">${esc(q.summary)}</p>
          ${q.points.length ? `<ul>${q.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
          ${q.levelUp ? `<div class="levelup">${esc(q.levelUp)}</div>` : ''}
          ${chips(q.tech)}
        </article>`
      )
      .join('')}`;
  },

  skills() {
    const { cv, t } = state;
    return `<p class="intro">${esc(t.panel.skillsIntro)}</p><div class="schools">${cv.skills
      .map(
        (s) => `<section class="school">
          <header><h4>${esc(s.category)}</h4><span>${esc(s.school)}</span></header>
          ${s.items
            .map(
              ([name, lvl]) => `<div class="skill">
                <span>${esc(name)}</span>
                <span class="pips" role="img" aria-label="${lvl}/5">${[1, 2, 3, 4, 5].map((i) => `<i class="pip${i <= lvl ? ' on' : ''}"></i>`).join('')}</span>
                <small>${esc(cv.skillRanks[lvl])}</small>
              </div>`
            )
            .join('')}
        </section>`
      )
      .join('')}</div>`;
  },

  education() {
    const { cv, t } = state;
    return `<p class="intro">${esc(t.panel.educationIntro)}</p><div class="scrolls">${cv.education
      .map(
        (e) => `<article class="scroll">
          <span class="when">${esc(e.period)}</span>
          <h4>${esc(e.degree)}</h4>
          <div class="where">${esc(e.school)}</div>
          ${e.note ? `<p>${esc(e.note)}</p>` : ''}
        </article>`
      )
      .join('')}</div>`;
  },

  forge() {
    const { cv, t } = state;
    return `<p class="intro">${esc(t.panel.forgeIntro)}</p><div class="projects">${cv.projects
      .map(
        (p) => `<article class="project r-${p.rank}">
          <div class="project-top"><h4>${esc(p.name)}</h4>${rank(p.rank)}</div>
          <div class="status">${esc(p.status)}</div>
          <p class="tagline">${esc(p.tagline)}</p>
          <p class="desc">${esc(p.desc)}</p>
          ${p.highlights.length ? `<ul>${p.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${chips(p.tech)}
          <div class="actions">${p.links
            .map(([label, url]) => `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener" data-contact="github">${ICONS.github.replace('<svg', '<svg width="15" height="15"')}${esc(label)}</a>`)
            .join('')}</div>
        </article>`
      )
      .join('')}</div>`;
  },

  contact() {
    const { cv, t } = state;
    const c = cv.contact;
    const card = (icon, label, value, actions) => `<div class="contact-card">
        <div class="ic">${ICONS[icon]}</div>
        <div><div class="lbl">${esc(label)}</div><div class="val">${esc(value)}</div><div class="acts">${actions}</div></div>
      </div>`;
    const link = (url, text, cls = '') => `<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener" data-contact="1">${esc(text)} ${ICONS.external}</a>`;
    return `<p class="intro">${esc(t.panel.contactIntro)}</p>
      <div class="contact-grid">
        ${card('mail', t.panel.email, c.email, `<a class="btn solid" href="mailto:${esc(c.email)}" data-contact="1">${esc(t.panel.write)}</a><button class="btn" type="button" data-copy="${esc(c.email)}">${esc(t.panel.copy)}</button>`)}
        ${card('linkedin', 'LinkedIn', c.linkedinLabel, link(encodeURI(c.linkedin), t.panel.openLink))}
        ${card('github', 'GitHub', c.githubLabel, link(c.github, t.panel.openLink))}
        ${c.phone ? card('phone', t.panel.phone, c.phone, `<a class="btn" href="tel:${esc(c.phone.replace(/\s/g, ''))}" data-contact="1">${esc(t.panel.call)}</a><button class="btn" type="button" data-copy="${esc(c.phone)}">${esc(t.panel.copy)}</button>`) : ''}
      </div>
      ${c.cvPdf ? `<p style="text-align:center;margin-top:18px"><a class="btn solid" href="${esc(c.cvPdf)}" target="_blank" rel="noopener" data-contact="1">${esc(t.panel.downloadCv)}</a></p>` : ''}
      <p class="contact-note">${esc(c.note)}</p>`;
  },

  log() {
    const { cv, t, save } = state;
    const p = progress();
    const achs = Object.entries(t.achievements)
      .map(([id, [name, desc]]) => {
        const on = !!save.ach[id];
        return `<div class="ach${on ? '' : ' locked'}"><span class="medal">${on ? '★' : '?'}</span><div><b>${esc(on ? name : t.panel.locked)}</b><span>${esc(on ? desc : '···')}</span></div></div>`;
      })
      .join('');
    const relics = CHESTS.map(({ id }) => {
      const r = cv.relics[id];
      if (!save.chests[id]) return `<div class="relic locked"><h4>${esc(t.panel.relicLocked)}</h4><p>${esc(r.hint)}</p></div>`;
      return `<div class="relic"><h4>${esc(r.name)}<small>${esc(r.year)}</small></h4><p>${esc(r.desc)}</p>${chips(r.tech)}
        <div class="chips"><a class="btn" href="${esc(r.link)}" target="_blank" rel="noopener">${esc(t.panel.viewCode)} ${ICONS.external}</a></div></div>`;
    }).join('');
    return `<h3>${esc(t.panel.progress)}</h3>
      <div class="progress-row">
        <div class="stat"><b>${p.pct}%</b><span>${esc(t.hud.explored)}</span></div>
        <div class="stat"><b>${p.talked}/${p.totalTalk}</b><span>${esc(t.panel.visited)}</span></div>
        <div class="stat"><b>${p.chests}/${p.totalChests}</b><span>${esc(t.panel.found)}</span></div>
      </div>
      <h3>${esc(t.panel.achievements)}</h3><div class="ach-grid">${achs}</div>
      <h3>${esc(t.panel.relicsTitle)}</h3>${relics}
      <div class="reset-row"><button class="btn danger" type="button" data-reset="1">${esc(t.panel.reset)}</button></div>`;
  }
};

export class Panels {
  /** @param {object} hooks { onOpen(tab), onClose(), onContact(), onReset(), audio } */
  constructor(hooks) {
    this.hooks = hooks;
    this.root = document.getElementById('window');
    this.tabsEl = document.getElementById('winTabs');
    this.body = document.getElementById('winBody');
    this.title = document.getElementById('winTitle');
    this.tab = 'hero';
    this.isOpen = false;

    document.getElementById('winClose').addEventListener('click', () => this.close());
    this.root.addEventListener('pointerdown', (e) => {
      if (e.target === this.root) this.close();
    });
    this.tabsEl.addEventListener('click', (e) => {
      const b = e.target.closest('.tab');
      if (b) this.show(b.dataset.tab);
    });
    this.body.addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        navigator.clipboard?.writeText(copy.dataset.copy).catch(() => {});
        const prev = copy.textContent;
        copy.textContent = state.t.panel.copied;
        setTimeout(() => (copy.textContent = prev), 1400);
        this.hooks.onContact?.();
      } else if (e.target.closest('[data-contact="1"]')) {
        this.hooks.onContact?.();
      } else if (e.target.closest('[data-reset]')) {
        if (confirm(state.t.panel.resetConfirm)) this.hooks.onReset?.();
      }
    });
  }

  renderTabs() {
    this.tabsEl.innerHTML = TABS.map(
      ([id, ico], i) =>
        `<button class="tab" role="tab" type="button" data-tab="${id}" aria-selected="${id === this.tab}"><span class="ico">${ico}</span>${esc(state.t.tabs[id])}<span class="num">${i + 1}</span></button>`
    ).join('');
  }

  show(tab) {
    if (!render[tab]) return;
    const changed = tab !== this.tab;
    this.tab = tab;
    this.renderTabs();
    this.title.textContent = state.t.panel[`${tab}Title`];
    this.body.innerHTML = render[tab]();
    this.body.scrollTop = 0;
    if (changed && this.isOpen) this.hooks.audio?.select();
    this.tabsEl.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    this.hooks.onOpen?.(tab);
  }

  showIndex(i) {
    if (TABS[i]) this.show(TABS[i][0]);
  }

  open(tab = this.tab) {
    this.isOpen = true;
    this.root.hidden = false;
    document.body.classList.add('win-open');
    this.show(tab);
    this.hooks.audio?.open();
    document.getElementById('winClose').focus({ preventScroll: true });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.root.hidden = true;
    document.body.classList.remove('win-open');
    this.hooks.audio?.close();
    this.hooks.onClose?.();
  }

  /** Re-renderiza (cambio de idioma o de progreso). */
  refresh() {
    if (this.isOpen) {
      const y = this.body.scrollTop;
      this.show(this.tab);
      this.body.scrollTop = y;
    }
  }
}
