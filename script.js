const toggle = document.querySelector('.menu-toggle');
const drawer = document.querySelector('.account-menu');
const backdrop = document.querySelector('.menu-backdrop');
const closeButton = document.querySelector('.menu-close');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
  drawer.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  backdrop.hidden = !open;
  requestAnimationFrame(() => backdrop.classList.toggle('visible', open));
  if (open) closeButton.focus();
  else toggle.focus();
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
closeButton.addEventListener('click', () => setMenu(false));
backdrop.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
});
drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const nav = document.querySelector('.main-nav');
const navAxe = document.querySelector('.nav-axe');

navLinks.forEach(link => link.addEventListener('click', event => {
  const navBounds = nav.getBoundingClientRect();
  const linkBounds = link.getBoundingClientRect();
  navAxe.style.left = `${linkBounds.left - navBounds.left + linkBounds.width / 2}px`;
  navAxe.classList.remove('swing');
  void navAxe.offsetWidth;
  navAxe.classList.add('swing');
  const target = new URL(link.href, window.location.href);
  if (target.pathname !== window.location.pathname) {
    event.preventDefault();
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520;
    window.setTimeout(() => window.location.assign(target.href), delay);
  }
}));

navAxe.addEventListener('animationend', () => navAxe.classList.remove('swing'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(section => observer.observe(section));

// Carrosséis de eventos e conquistas: destaque central, laterais em profundidade.
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const cards = [...carousel.querySelectorAll('.event-card')];
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('.carousel-status');
  if (!cards.length || !previous || !next || !status) return;

  let activeIndex = 0;
  let timer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const show = index => {
    activeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const offset = (i - activeIndex + cards.length) % cards.length;
      const position = offset === 0 ? 'active' : offset === 1 ? 'next' : offset === cards.length - 1 ? 'previous' : 'hidden';
      card.dataset.position = position;
      card.setAttribute('aria-hidden', String(position !== 'active'));
    });
    status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  };
  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (!reducedMotion) timer = window.setInterval(() => show(activeIndex + 1), 5200);
  };

  previous.addEventListener('click', () => { show(activeIndex - 1); start(); });
  next.addEventListener('click', () => { show(activeIndex + 1); start(); });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) start(); });

  let touchStartX = 0;
  carousel.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) { show(activeIndex + (delta < 0 ? 1 : -1)); start(); }
  }, { passive: true });

  show(0);
  start();
});

// A aba Gestão só aparece quando houver identidade vinda de um sistema de login.
// Em um site estático, esta checagem controla apenas a interface. Proteja dados e páginas
// administrativas no servidor antes de disponibilizar informações restritas.
const MANAGEMENT_ALLOWED_USERS = [
  // Adicione até 15 e-mails autorizados entre aspas, separados por vírgula:
  // "usuario1@exemplo.com",
  // "usuario2@exemplo.com",
  // "usuario3@exemplo.com",
  // "usuario4@exemplo.com",
  // "usuario5@exemplo.com",
  // "usuario6@exemplo.com",
  // "usuario7@exemplo.com",
  // "usuario8@exemplo.com",
  // "usuario9@exemplo.com",
  // "usuario10@exemplo.com",
  // "usuario11@exemplo.com",
  // "usuario12@exemplo.com",
  // "usuario13@exemplo.com",
  // "usuario14@exemplo.com",
  // "usuario15@exemplo.com",
];

// O sistema de autenticação deve preencher window.XX_MARCO_AUTH.user.email após login.
const authenticatedEmail = window.XX_MARCO_AUTH?.user?.email?.trim().toLowerCase();
const managementTab = document.querySelector('[data-management-tab]');
if (managementTab) {
  const hasAccess = Boolean(authenticatedEmail) && MANAGEMENT_ALLOWED_USERS
    .some(email => email.trim().toLowerCase() === authenticatedEmail);
  managementTab.hidden = !hasAccess;
}

// Integração futura: clique sinaliza que o provedor de login deve iniciar o acesso.
const athleteLoginButton = document.querySelector('[data-login-button]');
const athleteGreeting = document.querySelector('[data-user-greeting]');
const athleteName = document.querySelector('[data-user-name]');
const athleteProfileLink = document.querySelector('[data-profile-link]');

function setXXMarcoAthleteUser(user) {
  const name = String(user?.name || user?.email || '').trim();
  const email = String(user?.email || '').trim().toLowerCase();
  const loggedIn = Boolean(name);
  if (athleteLoginButton) athleteLoginButton.hidden = loggedIn;
  if (athleteGreeting) athleteGreeting.hidden = !loggedIn;
  if (athleteName) athleteName.textContent = loggedIn ? name : '';
  if (athleteProfileLink) athleteProfileLink.href = loggedIn ? athleteProfileLink.dataset.authenticatedHref : 'login.html';
  if (user) window.XX_MARCO_AUTH = { ...window.XX_MARCO_AUTH, user: { ...user, email } };
  else if (window.XX_MARCO_AUTH) delete window.XX_MARCO_AUTH.user;
  if (managementTab) {
    managementTab.hidden = !email || !MANAGEMENT_ALLOWED_USERS.some(allowed => allowed.trim().toLowerCase() === email);
  }
}

window.setXXMarcoAthleteUser = setXXMarcoAthleteUser;
athleteLoginButton?.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('xxmarco:login-request'));
  window.location.assign('login.html');
});
window.addEventListener('xxmarco:login-success', event => setXXMarcoAthleteUser(event.detail));
window.addEventListener('xxmarco:logout', () => setXXMarcoAthleteUser(null));
if (window.XX_MARCO_AUTH?.user) setXXMarcoAthleteUser(window.XX_MARCO_AUTH.user);
else if (athleteProfileLink) athleteProfileLink.href = 'login.html';


