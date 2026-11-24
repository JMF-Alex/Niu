import './styles.css';
import './animations.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const euro = (cents) => (cents === 0 ? 'Free' : `${(cents / 100).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`);

const here = location.pathname.replace(/\/$/, '/index.html').replace(/\.html$/, '');
document.querySelectorAll('.nav-links a, .mobile-menu a, .footer-col a').forEach((a) => {
  const url = new URL(a.href);
  if (!url.hash && url.pathname.replace(/\.html$/, '') === here) a.setAttribute('aria-current', 'page');
});

const toggle = document.querySelector('.menu-toggle');
const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
toggle?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle) setMenu(false); });

const plansEl = document.querySelector('#plan-list');
const planSelect = document.querySelector('#plan');
const wanted = new URLSearchParams(location.search).get('plan') ?? 'pro';

const skeleton = `<div class="card plan" aria-hidden="true">
  <div class="skeleton" style="height:28px;width:40%"></div>
  <div class="skeleton" style="height:36px;width:60%"></div>
  <div class="skeleton" style="height:96px"></div>
  <div class="skeleton" style="height:40px"></div></div>`;

const planCard = (p) => `
  <article class="card plan${p.slug === 'pro' ? ' featured' : ''}">
    ${p.slug === 'pro' ? '<span class="badge caption-3">Most picked</span>' : ''}
    <h3 class="heading-6">${esc(p.name)}</h3>
    <p><span class="heading-4">${euro(p.priceCents)}</span>${p.priceCents ? ' <span class="caption-2 muted">per month, VAT incl.</span>' : ''}</p>
    <p class="body-6 muted">${esc(p.blurb ?? '')}</p>
    <ul>${p.features.map((f) => `<li class="body-6"><i class="ph ph-check" aria-hidden="true"></i>${esc(f)}</li>`).join('')}</ul>
    <a class="btn ${p.slug === 'pro' ? 'btn-primary' : 'btn-secondary'} button-md" href="/index.html?plan=${esc(p.slug)}#start">${p.priceCents ? `Try ${esc(p.name)} free` : 'Start on Hobby'}</a>
  </article>`;

async function loadPlans() {
  if (plansEl) {
    plansEl.innerHTML = skeleton.repeat(3);
    plansEl.setAttribute('aria-busy', 'true');
  }
  try {
    const res = await fetch('/api/plans');
    if (!res.ok) throw new Error(res.statusText);
    const plans = await res.json();
    if (plansEl) {
      plansEl.innerHTML = plans.length
        ? plans.map(planCard).join('')
        : `<div class="card"><p class="title-2">No plans published yet</p>
           <p class="body-6 muted">The API seeds the three default plans on startup. Restart the api service to add them.</p></div>`;
      document.dispatchEvent(new CustomEvent('plans:rendered', { detail: [...plansEl.querySelectorAll('.plan')] }));
    }
    if (planSelect && plans.length) {
      planSelect.innerHTML = plans.map((p) =>
        `<option value="${esc(p.slug)}"${p.slug === wanted ? ' selected' : ''}>${esc(p.name)} · ${euro(p.priceCents)}</option>`).join('');
      planSelect.disabled = false;
    }
  } catch {
    if (plansEl) {
      plansEl.innerHTML = `<div class="card"><p class="title-2">Plans could not load</p>
        <p class="body-6 muted">The API did not answer. Check that the api service is running, then retry.</p>
        <button class="btn btn-secondary button-sm" type="button" id="retry-plans">Retry</button></div>`;
      document.querySelector('#retry-plans').addEventListener('click', loadPlans);
    }
    if (planSelect) planSelect.innerHTML = '<option value="">Plans unavailable</option>';
  } finally {
    plansEl?.removeAttribute('aria-busy');
  }
}
if (plansEl || planSelect) loadPlans();

function wireForm(form, { url, validate, payload, success, busyLabel }) {
  if (!form) return;
  const msg = form.querySelector('.form-msg');
  const btn = form.querySelector('button[type="submit"]');
  const show = (text, kind) => { msg.textContent = text; msg.className = `form-msg body-5 ${kind}`; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
    const problem = validate(form.elements);
    if (problem) {
      problem.field?.setAttribute('aria-invalid', 'true');
      problem.field?.focus();
      show(problem.text, 'error');
      return;
    }
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = busyLabel;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(form.elements)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Sending failed. Try again in a minute.');
      show(success(form.elements), 'success');
      form.reset();
      if (planSelect) planSelect.value = wanted;
    } catch (err) {
      show(err instanceof TypeError ? 'Could not reach Niu. Check your connection and try again.' : err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}

const emailProblem = (field) => {
  const v = field.value.trim();
  if (!v) return { field, text: 'Enter your email address.' };
  if (!EMAIL.test(v)) return { field, text: 'That email looks incomplete. Use the format name@example.com.' };
  return null;
};

wireForm(document.querySelector('#signup'), {
  url: '/api/signups',
  busyLabel: 'Reserving your trial',
  validate: (f) => emailProblem(f.email) ?? (!f.plan.value ? { field: f.plan, text: 'Plans are still loading. Try again in a moment.' } : null),
  payload: (f) => ({ email: f.email.value.trim(), plan: f.plan.value }),
  success: (f) => `Trial reserved for ${f.email.value.trim()} on the ${f.plan.selectedOptions[0].text.split(' ·')[0]} plan.`,
});

wireForm(document.querySelector('#contact'), {
  url: '/api/messages',
  busyLabel: 'Sending',
  validate: (f) => {
    if (!f.name.value.trim()) return { field: f.name, text: 'Enter your name.' };
    const bad = emailProblem(f.email);
    if (bad) return bad;
    if (f.message.value.trim().length < 10) return { field: f.message, text: 'Write at least 10 characters so we know how to help.' };
    return null;
  },
  payload: (f) => ({ name: f.name.value.trim(), email: f.email.value.trim(), topic: f.topic.value, message: f.message.value.trim() }),
  success: (f) => `Message sent. We will reply to ${f.email.value.trim()} within one working day.`,
});
