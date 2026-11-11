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
