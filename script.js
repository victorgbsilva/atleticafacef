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

const MANAGEMENT_ALLOWED_USERS = [
];

const authenticatedEmail = window.XX_MARCO_AUTH?.user?.email?.trim().toLowerCase();
const managementTab = document.querySelector('[data-management-tab]');
if (managementTab) {
  const hasAccess = Boolean(authenticatedEmail) && MANAGEMENT_ALLOWED_USERS
    .some(email => email.trim().toLowerCase() === authenticatedEmail);
  managementTab.hidden = !hasAccess;
}

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

const gameDialog = document.querySelector('#viking-game');
const gameCanvas = document.querySelector('[data-game-canvas]');
if (gameDialog && gameCanvas) {
  const context = gameCanvas.getContext('2d');
  const gameOverlay = gameDialog.querySelector('[data-game-overlay]');
  const gameResult = gameDialog.querySelector('[data-game-result]');
  const finalScore = gameDialog.querySelector('[data-game-final-score]');
  const scoreLabel = gameDialog.querySelector('[data-game-score]');
  const spriteFiles = [
    'codex-clipboard-6ebb7e50-99ca-48f0-8eda-ff20f812bd4c.png',
    'codex-clipboard-7491e59b-3923-4cf5-9711-b75101ed2db7.png',
    'codex-clipboard-b0b1e2ed-738a-43fa-8cab-ad80aefbcd87.png',
    'codex-clipboard-5f7f99f8-2707-4091-b5d3-a25ce9ecc34b.png',
    'codex-clipboard-cd989814-9c33-43f0-a1b3-d725831fe2df.png',
    'codex-clipboard-f5a40169-5215-4e61-86f7-1daad591f670.png',
    'codex-clipboard-5c2a3605-341c-4a4b-a435-dfb45ab3625b.png',
    'codex-clipboard-1e7111f2-552f-4a9b-9f3b-a5528b64c4a1.png',
    'codex-clipboard-4f5de4b5-9af8-4e8b-97ce-b5791d32db2f.png',
    'codex-clipboard-13fb544c-de4a-4df3-8357-5582297c9a6c.png',
    'codex-clipboard-8b7fb2b7-3eea-47e7-afef-d7228dc79ae1.png',
    'codex-clipboard-36027f4d-7f58-4b92-97de-f932897e9b52.png'
  ];
  const spriteFrameBounds = [
    [18, 10, 159, 225], [6, 12, 170, 225], [12, 1, 156, 225], [2, 1, 166, 225],
    [27, 7, 174, 223], [10, 0, 180, 224], [9, 0, 184, 226], [0, 8, 141, 165],
    [7, 0, 157, 175], [4, 3, 143, 177], [16, 17, 212, 249], [25, 24, 210, 213]
  ];
  const sprites = spriteFiles.map((name, index) => {
    const image = new Image();
    const [x, y, width, height] = spriteFrameBounds[index];
    image.spriteBounds = { x, y, width, height };
    image.src = `assets/${name}`;
    return image;
  });
  const world = { width: 960, height: 360, ground: 294, playerX: 126 };
  let animationFrame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let score = 0;
  let speed = 360;
  let jumpVelocity = 0;
  let playerY = 0;
  let duckUntil = 0;
  let fastFallUntil = 0;
  let duckProgress = 0;
  let duckKeyHeld = false;
  let fastFallKeyHeld = false;
  let obstacles = [];
  let nextObstacle = 0;
  let gameOver = false;
  let touchTimer;
  let lastTouch = 0;

  function drawWorld(time) {
    const { width, height, ground } = world;
    context.clearRect(0, 0, width, height);
    const backdrop = context.createLinearGradient(0, 0, 0, height);
    backdrop.addColorStop(0, '#0a457d');
    backdrop.addColorStop(1, '#052344');
    context.fillStyle = backdrop;
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#0b3760';
    for (let i = 0; i < 11; i++) {
      const x = i * 105 - (time * 12 % 105);
      context.fillRect(x, 74 + (i % 3) * 8, 4, ground - 74);
    }
    context.fillStyle = '#0d3155';
    context.fillRect(0, ground, width, height - ground);
    context.fillStyle = '#ffd000';
    context.fillRect(0, ground, width, 4);
    context.fillStyle = '#ffffff32';
    const stripeOffset = (time * speed * .65) % 120;
    for (let x = -120 + stripeOffset; x < width; x += 120) context.fillRect(x, ground + 36, 58, 3);
    context.fillStyle = '#ffffff16';
    context.fillRect(0, ground + 62, width, 1);
  }

  function drawPlayer(time) {
    const grounded = playerY === 0 && jumpVelocity === 0;
    let spriteIndex = 0;
    if (!grounded) spriteIndex = 7 + Math.min(2, Math.floor((elapsed % .36) / .12));
    else if (duckProgress > .08) spriteIndex = duckProgress > .75 ? 11 : 10;
    else if (score > 140) spriteIndex = 4 + Math.floor(elapsed * 13) % 3;
    else if (score > 12) spriteIndex = 1 + Math.floor(elapsed * 8) % 3;
    const image = sprites[spriteIndex];
    const bounds = image.spriteBounds;
    const duckAmount = grounded ? duckProgress : 0;
    const drawHeight = 100 - duckAmount * 34;
    const ratio = bounds.width / bounds.height || .76;
    const normalIndex = score > 140 ? 4 + Math.floor(elapsed * 13) % 3 : score > 12 ? 1 + Math.floor(elapsed * 8) % 3 : 0;
    const normalBounds = sprites[normalIndex].spriteBounds;
    const normalRatio = normalBounds.width / normalBounds.height || .8;
    const normalWidth = 100 * normalRatio;
    const drawWidth = duckAmount > .08 ? normalWidth * (1 + duckAmount * .08) : drawHeight * ratio;
    const drawX = world.playerX - 9 + (normalWidth - drawWidth) / 2;
    const drawY = world.ground - drawHeight - playerY;
    if (image.complete && image.naturalWidth) {
      context.imageSmoothingEnabled = false;
      context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, drawX, drawY, drawWidth, drawHeight);
    } else {
      context.fillStyle = '#ffd000';
      context.fillRect(world.playerX, drawY + 20, 46, 56);
    }
    return { x: drawX + 12, y: drawY + 18, width: drawWidth - 22, height: drawHeight - 24 };
  }

  function drawObstacle(obstacle) {
    context.fillStyle = obstacle.type === 'high' ? '#ffd000' : '#f2b844';
    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    context.fillStyle = '#073868';
    context.fillRect(obstacle.x + 8, obstacle.y + 8, obstacle.width - 16, Math.max(4, obstacle.height - 16));
    context.fillStyle = '#ffffff88';
    context.fillRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, 3);
  }

  function finishGame() {
    gameOver = true;
    gameResult.textContent = 'Fim de jogo';
    finalScore.textContent = String(Math.floor(score)).padStart(4, '0');
    gameOverlay.hidden = false;
  }

  function frame(timestamp) {
    if (!gameDialog.open) return;
    const delta = Math.min((timestamp - (previousTime || timestamp)) / 1000, .04);
    previousTime = timestamp;
    if (!gameOver) {
      elapsed += delta;
      score += delta * 10;
      speed = Math.min(900, 360 + score * 1.8);
      const now = timestamp / 1000;
      const fastFalling = fastFallKeyHeld || fastFallUntil > now;
      if (playerY > 0 || jumpVelocity > 0) {
        playerY += jumpVelocity * delta;
        jumpVelocity -= (fastFalling ? 4200 : 2250) * delta;
        if (playerY <= 0) { playerY = 0; jumpVelocity = 0; }
      }
      const duckTarget = playerY === 0 && jumpVelocity === 0 && (duckKeyHeld || duckUntil > now) ? 1 : 0;
      const duckRate = duckTarget ? 8 : 12;
      duckProgress += Math.sign(duckTarget - duckProgress) * Math.min(Math.abs(duckTarget - duckProgress), delta * duckRate);
      if (elapsed >= nextObstacle) {
        const type = Math.random() < .7 ? 'ground' : 'high';
        const height = type === 'ground' ? 48 : 36;
        obstacles.push({ x: world.width + 20, y: type === 'ground' ? world.ground - height : world.ground - 96, width: type === 'ground' ? 42 : 72, height, type });
        nextObstacle = elapsed + Math.max(.82, 1.35 - score / 900) + Math.random() * .85;
      }
      obstacles.forEach(obstacle => { obstacle.x -= speed * delta; });
      obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > -20);
      scoreLabel.innerHTML = `PONTOS&nbsp; ${String(Math.floor(score)).padStart(4, '0')}`;
    }
    drawWorld(elapsed);
    obstacles.forEach(drawObstacle);
    const player = drawPlayer(timestamp / 1000);
    if (!gameOver) {
      for (const obstacle of obstacles) {
        const insetX = 6;
        const insetY = 5;
        const overlaps = player.x < obstacle.x + obstacle.width - insetX && player.x + player.width > obstacle.x + insetX && player.y < obstacle.y + obstacle.height - insetY && player.y + player.height > obstacle.y + insetY;
        if (overlaps) { finishGame(); break; }
      }
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function resizeCanvas() {
    const bounds = gameCanvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    world.height = world.width * bounds.height / bounds.width;
    world.ground = world.height - 66;
    gameCanvas.width = Math.max(1, Math.round(bounds.width * scale));
    gameCanvas.height = Math.max(1, Math.round(bounds.height * scale));
    context.setTransform(gameCanvas.width / world.width, 0, 0, gameCanvas.height / world.height, 0, 0);
  }

  function resetGame() {
    cancelAnimationFrame(animationFrame);
    clearTimeout(touchTimer);
    lastTouch = 0;
    previousTime = 0;
    elapsed = 0;
    score = 0;
    speed = 360;
    jumpVelocity = 0;
    playerY = 0;
    duckUntil = 0;
    fastFallUntil = 0;
    duckProgress = 0;
    duckKeyHeld = false;
    fastFallKeyHeld = false;
    obstacles = [];
    nextObstacle = 1.3;
    gameOver = false;
    gameOverlay.hidden = true;
    resizeCanvas();
    animationFrame = requestAnimationFrame(frame);
  }

  function jump() {
    if (gameOver || !gameDialog.open) return;
    if (playerY === 0) jumpVelocity = 780;
  }

  function duck(duration = 650) {
    if (gameOver || !gameDialog.open) return;
    const now = performance.now() / 1000;
    if (playerY > 0 || jumpVelocity > 0) {
      fastFallUntil = now + duration / 1000;
      jumpVelocity = Math.min(jumpVelocity, -260);
    } else {
      duckUntil = now + duration / 1000;
    }
  }

  function closeGame() {
    if (gameDialog.open) gameDialog.close();
  }

  document.querySelector('[data-game-open]')?.addEventListener('click', () => {
    gameDialog.showModal();
    resetGame();
  });
  gameDialog.querySelector('[data-game-close]')?.addEventListener('click', closeGame);
  gameDialog.querySelector('[data-game-restart]')?.addEventListener('click', resetGame);
  gameDialog.addEventListener('close', () => {
    cancelAnimationFrame(animationFrame);
    clearTimeout(touchTimer);
    lastTouch = 0;
    duckKeyHeld = false;
    fastFallKeyHeld = false;
    fastFallUntil = 0;
    previousTime = 0;
  });
  gameDialog.addEventListener('click', event => { if (event.target === gameDialog) closeGame(); });
  window.addEventListener('resize', () => { if (gameDialog.open) resizeCanvas(); });
  document.addEventListener('keydown', event => {
    if (!gameDialog.open) return;
    if (event.key === 'ArrowUp') { event.preventDefault(); jump(); }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (playerY > 0 || jumpVelocity > 0) {
        fastFallKeyHeld = true;
        duck(1000);
      } else {
        duckKeyHeld = true;
        duck(1000);
      }
    }
  });
  document.addEventListener('keyup', event => {
    if (!gameDialog.open || event.key !== 'ArrowDown') return;
    duckKeyHeld = false;
    fastFallKeyHeld = false;
    fastFallUntil = 0;
    duckUntil = 0;
  });
  gameCanvas.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault();
    const now = Date.now();
    if (now - lastTouch < 300) {
      clearTimeout(touchTimer);
      duck(700);
      lastTouch = 0;
    } else {
      lastTouch = now;
      touchTimer = window.setTimeout(() => {
        jump();
        lastTouch = 0;
      }, 300);
    }
  }, { passive: false });
}


