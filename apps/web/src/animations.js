import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, ScrambleTextPlugin);
gsap.defaults({ ease: 'power4.out', duration: 0.8 });

const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]);
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

function splitLines(el, animate) {
  const gradient = el.classList.contains('gradient-text');
  el.querySelectorAll('br').forEach((br) => getComputedStyle(br).display === 'none' && br.replaceWith(' '));
  el.classList.remove('gradient-text');
  const split = SplitText.create(el, {
    type: 'lines', mask: 'lines', autoSplit: true,
    ...(gradient && { linesClass: 'gradient-text' }),
    onSplit: (self) => animate(self.lines),
  });
  return () => { split.revert(); if (gradient) el.classList.add('gradient-text'); };
}

function onPointer(el, handlers, cleanups) {
  Object.entries(handlers).forEach(([type, fn]) => el.addEventListener(type, fn));
  cleanups.push(() => Object.entries(handlers).forEach(([type, fn]) => el.removeEventListener(type, fn)));
}

function setCountersFinal() {
  $$('[data-count]').forEach((el) => {
    const d = Number(el.dataset.decimals ?? 0);
    el.textContent = Number(el.dataset.count).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  });
}

$$('.process-step').forEach((step) => {
  ScrollTrigger.create({ trigger: step, start: 'top 60%', end: 'bottom 60%', toggleClass: 'is-active' });
});

const mm = gsap.matchMedia();

mm.add({
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 721px)',
  fine: '(pointer: fine)',
}, (ctx) => {
  const { motion, desktop, fine } = ctx.conditions;
  if (!motion) { setCountersFinal(); return; }

  const cleanups = [];

  gsap.to('main', { opacity: 1, duration: 0.6 });

  const bar = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'scroll-progress' }));
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  cleanups.push(() => bar.remove());

  const hero = $('[data-hero]');
  if (hero) {
    const h1 = $('h1', hero);
    const rest = [...hero.children].filter((el) => el !== h1);
    gsap.set(hero.children, { visibility: 'visible' });
    gsap.set(rest, { autoAlpha: 0, y: 24 });
    fontsReady.then(() => {
      cleanups.push(splitLines(h1, (lines) => gsap.from(lines, { yPercent: 110, duration: 1.1, stagger: 0.12 })));
      gsap.to(rest, { autoAlpha: 1, y: 0, stagger: 0.08, delay: 0.35 });
    });
  }

  const terminal = $('.terminal');
  if (terminal) {
    const cmd = $('.cmd', terminal);
    const full = cmd.textContent;
    const lines = $$('.line:not(.cmd)', terminal);
    const caret = Object.assign(document.createElement('span'), { className: 'caret' });
    gsap.set(lines, { autoAlpha: 0, x: -8 });
    cmd.textContent = '$ ';
    cmd.after(caret);
    gsap.timeline({ delay: 0.7 })
      .from(terminal, { autoAlpha: 0, y: 48, duration: 1.2 })
      .to(cmd, { text: { value: full }, duration: 0.9, ease: 'none' }, '-=0.6')
      .add(() => caret.remove())
      .to(lines, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.3 }, '+=0.15')
      .fromTo($('.ok', terminal), { scale: 0.98 }, { scale: 1, duration: 0.6 });
    cleanups.push(() => { caret.remove(); cmd.textContent = full; });

    if (desktop) {
      gsap.fromTo(terminal, { rotateX: 16, scale: 0.94, transformPerspective: 1200, transformOrigin: '50% 0%' }, {
        rotateX: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: terminal, start: 'top bottom', end: 'top 30%', scrub: 0.6 },
      });
    }
  }

  $$('.section-head h2, .cta-band h2, .cta-box h2, .process-aside h2').forEach((el) => {
    cleanups.push(splitLines(el, (lines) => gsap.from(lines, {
      yPercent: 110, duration: 1, stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })));
  });

  $$('.section-head .eyebrow, .process-aside .eyebrow').forEach((el) => {
    const text = el.textContent;
    gsap.to(el, {
      scrambleText: { text, chars: 'lowerCase', speed: 0.5, revealDelay: 0.2 },
      duration: 1,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  gsap.set('.reveal', { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }),
  });

  $$('[data-stagger]').forEach((group) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: group, start: 'top 85%', once: true } });
    tl.from(group.children, { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.07 });
    const icons = $$('.icon, .avatar', group);
    if (icons.length) {
      tl.from(icons, { scale: 0.4, rotate: -20, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'back.out(2.2)' }, 0.15);
    }
  });

  const tagline = $('.tagline p');
  if (tagline) {
    const split = SplitText.create(tagline, { type: 'words', wordsClass: 'word' });
    const accent = split.words.slice(-3);
    gsap.timeline({ scrollTrigger: { trigger: tagline, start: 'top 75%', end: 'bottom 40%', scrub: 0.6 } })
      .to(split.words, { color: '#EDEDED', stagger: 0.12, duration: 0.5 })
      .to(accent, { color: '#FFFFFF', stagger: 0.12, duration: 0.5 }, '-=0.2');
    cleanups.push(() => split.revert());
  }

  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals ?? 0);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.8,
      onUpdate: () => { el.textContent = obj.v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  const steps = $('.process-steps');
  if (steps) {
    gsap.to('.progress span', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: steps, start: 'top 60%', end: 'bottom 60%', scrub: true },
    });
  }

  const pipe = $('.pipeline');
  if (pipe) {
    const nodes = $$('.pipe-node', pipe);
    const fills = $$('.wire-fill', pipe);
    const pulses = $$('.pulse', pipe);
    const axis = desktop ? 'x' : 'y';
    const scale = desktop ? 'scaleX' : 'scaleY';

    const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
    pulses.forEach((p, i) => {
      const wire = p.parentElement;
      loop.fromTo(p, { [axis]: 0, autoAlpha: 0 }, {
        [axis]: () => (desktop ? wire.offsetWidth : wire.offsetHeight) - 5,
        autoAlpha: 1, duration: 0.9, ease: 'power3.inOut',
      }, i * 0.45).to(p, { autoAlpha: 0, duration: 0.25 }, '>-0.25');
    });

    const build = gsap.timeline({ scrollTrigger: { trigger: pipe, start: 'top 75%', once: true } });
    build.from(nodes, { autoAlpha: 0, y: 16, scale: 0.94, stagger: 0.08, duration: 0.6 });
    nodes.forEach((node, i) => {
      build.add(() => node.classList.add('on'));
      if (fills[i]) build.to(fills[i], { [scale]: 1, duration: 0.45, ease: 'power3.inOut' });
    });
    build.add(() => loop.play());

    ScrollTrigger.create({
      trigger: pipe, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => (self.isActive && build.progress() === 1 ? loop.play() : loop.pause()),
    });
    cleanups.push(() => nodes.forEach((n) => n.classList.remove('on')));
  }

  const mark = $('.footer-mark');
  if (mark) {
    const word = $('.footer-word', mark);
    const split = SplitText.create(word, { type: 'chars', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: mark, start: 'top 95%', once: true } })
      .from($('svg', mark), { yPercent: 60, autoAlpha: 0, rotate: -12, duration: 1.1 })
      .from(split.chars, { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.1);
    cleanups.push(() => split.revert());
  }

  const nav = $('.nav-wrap');
  if (nav) {
    let hidden = false;
    const show = (h) => {
      if (h === hidden) return;
      hidden = h;
      gsap.to(nav, { yPercent: h ? -160 : 0, duration: 0.5, overwrite: true });
    };
    ScrollTrigger.create({
      start: 120, end: 'max',
      onUpdate: (self) => show(self.direction === 1 && !document.body.classList.contains('menu-open')),
      onLeaveBack: () => show(false),
    });
  }

  if (fine) {
    $$('.btn-primary.button-md').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.6 });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.6 });
      onPointer(btn, {
        pointermove: (e) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.2);
          yTo((e.clientY - r.top - r.height / 2) * 0.3);
        },
        pointerleave: () => { xTo(0); yTo(0); gsap.to(btn, { scale: 1, duration: 0.3 }); },
        pointerdown: () => gsap.to(btn, { scale: 0.98, duration: 0.2 }),
        pointerup: () => gsap.to(btn, { scale: 1, duration: 0.3 }),
      }, cleanups);
    });
  }

  const onPlans = (e) => {
    const cards = e.detail;
    gsap.from(cards, { autoAlpha: 0, y: 40, rotateX: -10, transformPerspective: 900, stagger: 0.1, duration: 1 });
    if (!fine) return;
    cards.forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6 });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6 });
      onPointer(card, {
        pointermove: (ev) => {
          const r = card.getBoundingClientRect();
          ry(((ev.clientX - r.left) / r.width - 0.5) * 6);
          rx(-((ev.clientY - r.top) / r.height - 0.5) * 6);
        },
        pointerleave: () => { rx(0); ry(0); },
      }, cleanups);
    });
  };
  document.addEventListener('plans:rendered', onPlans);
  cleanups.push(() => document.removeEventListener('plans:rendered', onPlans));

  const leave = (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    const norm = (p) => p.replace(/\/$/, '/index.html').replace(/\.html$/, '');
    if (url.origin !== location.origin) return;
    if (norm(url.pathname) === norm(location.pathname) && url.hash) return;
    e.preventDefault();
    gsap.to(['main', '.footer'], {
      autoAlpha: 0, y: -12, duration: 0.35, ease: 'power2.in', overwrite: true,
      onComplete: () => { location.href = url.href; },
    });
  };
  const restore = (e) => { if (e.persisted) gsap.set(['main', '.footer'], { autoAlpha: 1, y: 0 }); };
  document.addEventListener('click', leave);
  addEventListener('pageshow', restore);
  cleanups.push(() => { document.removeEventListener('click', leave); removeEventListener('pageshow', restore); });

  return () => cleanups.forEach((fn) => fn());
});
