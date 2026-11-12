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
    image.src = `assets/game/${name}`;
    return image;
  });
  const loadGameImage = name => {
    const image = new Image();
    image.src = `assets/game/${name}`;
    return image;
  };
  const scenery = loadGameImage('Panorama Urbano Pixel Art_ Uni-FACEF à Unifran.png');
  const francaScenery = loadGameImage('Panorama urbano pixelado de Franca-corrigido.png');
  let sceneryRoute = null;
  const buildSceneryRoute = () => {
    if (!scenery.naturalWidth || !francaScenery.naturalWidth) return;
    const routeHeight = Math.min(scenery.naturalHeight, francaScenery.naturalHeight);
    const originalWidth = Math.round(Math.min(1810, scenery.naturalWidth) * routeHeight / scenery.naturalHeight);
    const cityWidth = Math.round(francaScenery.naturalWidth * routeHeight / francaScenery.naturalHeight);
    const blendWidth = 120;
    const cityLayer = document.createElement('canvas');
    cityLayer.width = cityWidth;
    cityLayer.height = routeHeight;
    const cityContext = cityLayer.getContext('2d');
    cityContext.imageSmoothingEnabled = false;
    cityContext.drawImage(francaScenery, 0, 0, cityWidth, routeHeight);
    const mask = document.createElement('canvas');
    mask.width = cityWidth;
    mask.height = routeHeight;
    const maskContext = mask.getContext('2d');
    const blend = maskContext.createLinearGradient(0, 0, blendWidth, 0);
    blend.addColorStop(0, 'rgba(255,255,255,0)');
    blend.addColorStop(1, 'rgba(255,255,255,1)');
    maskContext.fillStyle = blend;
    maskContext.fillRect(0, 0, blendWidth, routeHeight);
    maskContext.fillStyle = '#fff';
    maskContext.fillRect(blendWidth, 0, cityWidth - blendWidth, routeHeight);
    cityContext.globalCompositeOperation = 'destination-in';
    cityContext.drawImage(mask, 0, 0);
    const route = document.createElement('canvas');
    route.width = originalWidth + cityWidth - blendWidth;
    route.height = routeHeight;
    const routeContext = route.getContext('2d');
    routeContext.imageSmoothingEnabled = false;
    routeContext.drawImage(scenery, 0, 0, originalWidth, routeHeight);
    routeContext.drawImage(cityLayer, originalWidth - blendWidth, 0);
    sceneryRoute = route;
  };
  scenery.addEventListener('load', buildSceneryRoute);
  francaScenery.addEventListener('load', buildSceneryRoute);
  buildSceneryRoute();
  const props = {
    beer: loadGameImage('obstacle-beer.png'),
    books: loadGameImage('obstacle-books.png'),
    cone: loadGameImage('obstacle-cone.png')
  };
  const cerberusRun = ['cerbero-run-1.png', 'cerbero-run-2.png', 'cerbero-run-3.png'].map(loadGameImage);
  const cerberusAttack = ['cerbero-attack-1.png', 'cerbero-attack-2.png', 'cerbero-attack-3.png'].map(loadGameImage);
  const fireballSprite = loadGameImage('fireball-2.png');
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
  let fireballs = [];
  let cerberus = null;
  let nextCerberusAt = 8;
  let nextObstacle = 0;
  let gameOver = false;
  let touchTimer;
  let lastTouch = 0;

  function drawWorld(time) {
    const { width, height, ground } = world;
    context.clearRect(0, 0, width, height);
    if (sceneryRoute) {
      const routeWidth = height * sceneryRoute.width / sceneryRoute.height;
      const offset = (time * speed * .24) % routeWidth;
      context.drawImage(sceneryRoute, -offset, 0, routeWidth, height);
      context.drawImage(sceneryRoute, routeWidth - offset, 0, routeWidth, height);
      context.fillStyle = '#052d5940';
      context.fillRect(0, 0, width, height);
    } else {
      const backdrop = context.createLinearGradient(0, 0, 0, height);
      backdrop.addColorStop(0, '#0a457d');
      backdrop.addColorStop(1, '#052344');
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);
    }
    context.fillStyle = '#05234428';
    context.fillRect(0, ground, width, height - ground);
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
    const image = props[obstacle.type];
    if (image?.complete && image.naturalWidth) {
      context.imageSmoothingEnabled = false;
      context.drawImage(image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      return;
    }
    context.fillStyle = '#ffd000';
    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    context.fillStyle = '#073868';
    context.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
  }

  function drawCerberus(time) {
    if (!cerberus) return;
    const entrance = Math.max(0, Math.min(1, (time - cerberus.spawnedAt) / .8));
    const easedEntrance = 1 - (1 - entrance) ** 3;
    const leaving = Number.isFinite(cerberus.exitStart);
    const exitProgress = leaving ? Math.max(0, Math.min(1, (time - cerberus.exitStart) / .75)) : 0;
    const easedExit = 1 - (1 - exitProgress) ** 3;
    const drawX = cerberus.x + (1 - easedEntrance) * 96 + easedExit * 84;
    const drawY = cerberus.y + (1 - easedEntrance) * 18 - easedExit * 14;
    const portalProgress = leaving ? easedExit : 1 - entrance;
    if (portalProgress > 0) {
      const pulse = 1 + Math.sin(time * 24) * .06;
      const centerX = cerberus.x + cerberus.width / 2;
      const centerY = cerberus.y + cerberus.height / 2;
      context.save();
      context.globalAlpha = portalProgress * .9;
      context.translate(centerX, centerY);
      context.scale(1 - easedExit * .32, 1 - easedExit * .24);
      context.translate(-centerX, -centerY);
      context.fillStyle = '#1686cf36';
      context.strokeStyle = '#ffd000';
      context.lineWidth = 5;
      context.beginPath();
      context.ellipse(centerX, centerY, cerberus.width * .52 * pulse, cerberus.height * .56 * pulse, 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.strokeStyle = '#8ee5ff';
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(centerX, centerY, cerberus.width * .4 * pulse, cerberus.height * .46 * pulse, 0, 0, Math.PI * 2);
      context.stroke();
      for (let spark = 0; spark < 6; spark += 1) {
        const angle = time * 9 + spark * Math.PI / 3;
        const radiusX = cerberus.width * (.48 + (spark % 2) * .1);
        const radiusY = cerberus.height * (.46 + (spark % 2) * .08);
        context.fillStyle = spark % 2 ? '#8ee5ff' : '#ffd000';
        context.fillRect(centerX + Math.cos(angle) * radiusX, centerY + Math.sin(angle) * radiusY, 5, 5);
      }
      context.restore();
    }
    const attacking = !leaving && time >= cerberus.nextShot - .45;
    const frames = attacking ? cerberusAttack : cerberusRun;
    const attackFrame = Math.min(frames.length - 1, Math.floor(Math.max(0, time - (cerberus.nextShot - .45)) / (.45 / cerberusAttack.length)));
    const frameIndex = attacking ? attackFrame : Math.floor(time * 7) % frames.length;
    const image = frames[frameIndex];
    if (!image.complete || !image.naturalWidth) return;
    context.imageSmoothingEnabled = false;
    context.save();
    context.globalAlpha = easedEntrance * (1 - easedExit);
    context.translate(drawX + cerberus.width, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, drawY, cerberus.width, cerberus.height);
    context.restore();
  }

  function drawFireball(fireball) {
    if (fireballSprite.complete && fireballSprite.naturalWidth) {
      context.imageSmoothingEnabled = false;
      context.save();
      context.translate(fireball.x + fireball.width, 0);
      context.scale(-1, 1);
      context.drawImage(fireballSprite, 0, fireball.y, fireball.width, fireball.height);
      context.restore();
      return;
    }
    context.fillStyle = '#ff4b14';
    context.fillRect(fireball.x, fireball.y + 5, fireball.width, fireball.height - 10);
    context.fillStyle = '#ffd000';
    context.fillRect(fireball.x + 8, fireball.y + 8, fireball.width - 16, fireball.height - 16);
    context.fillStyle = '#fff4bd';
    context.fillRect(fireball.x + 16, fireball.y + 10, fireball.width - 25, fireball.height - 20);
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
        const types = ['beer', 'books', 'cone'];
        const type = types[Math.floor(Math.random() * types.length)];
        const image = props[type];
        const height = type === 'cone' ? 66 : 60;
        const width = image?.naturalWidth ? height * image.naturalWidth / image.naturalHeight : 60;
        obstacles.push({ x: world.width + 20, y: world.ground - height, width, height, type });
        nextObstacle = elapsed + Math.max(.82, 1.35 - score / 900) + Math.random() * .85;
      }
      obstacles.forEach(obstacle => { obstacle.x -= speed * delta; });
      obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > -20);
      if (cerberus && Number.isFinite(cerberus.exitStart) && elapsed - cerberus.exitStart >= .75) {
        cerberus = null;
        nextCerberusAt = elapsed + 14 + Math.random() * 5;
      }
      if (!cerberus && elapsed >= nextCerberusAt) {
        const height = 142;
        cerberus = {
          x: world.width - 178,
          y: world.ground - height,
          width: 148,
          height,
          spawnedAt: elapsed,
          nextShot: elapsed + 1,
          shotsRemaining: 3,
          shotIndex: 0
        };
      }
      if (cerberus && !Number.isFinite(cerberus.exitStart) && elapsed >= cerberus.nextShot) {
        const lowShot = cerberus.shotIndex % 2 === 0;
        fireballs.push({
          x: cerberus.x - 60,
          y: world.ground - (lowShot ? 42 : 108),
          width: 66,
          height: 36,
          speed: speed + 125
        });
        cerberus.shotIndex += 1;
        cerberus.shotsRemaining -= 1;
        if (cerberus.shotsRemaining > 0) cerberus.nextShot = elapsed + .95;
        else cerberus.exitStart = elapsed;
      }
      fireballs.forEach(fireball => { fireball.x -= fireball.speed * delta; });
      fireballs = fireballs.filter(fireball => fireball.x + fireball.width > -20);
      scoreLabel.innerHTML = `PONTOS&nbsp; ${String(Math.floor(score)).padStart(4, '0')}`;
    }
    drawWorld(elapsed);
    drawCerberus(elapsed);
    obstacles.forEach(drawObstacle);
    fireballs.forEach(drawFireball);
    const player = drawPlayer(timestamp / 1000);
    if (!gameOver) {
      for (const obstacle of obstacles) {
        const insetX = 6;
        const insetY = 5;
        const overlaps = player.x < obstacle.x + obstacle.width - insetX && player.x + player.width > obstacle.x + insetX && player.y < obstacle.y + obstacle.height - insetY && player.y + player.height > obstacle.y + insetY;
        if (overlaps) { finishGame(); break; }
      }
      if (!gameOver) {
        for (const fireball of fireballs) {
          const inset = 10;
          const overlaps = player.x < fireball.x + fireball.width - inset && player.x + player.width > fireball.x + inset && player.y < fireball.y + fireball.height - 7 && player.y + player.height > fireball.y + 7;
          if (overlaps) { finishGame(); break; }
        }
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
    fireballs = [];
    cerberus = null;
    nextCerberusAt = 8;
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
  gameCanvas.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastTouch < 260) {
      clearTimeout(touchTimer);
      duck(700);
      lastTouch = 0;
    } else {
      lastTouch = now;
      jump();
      touchTimer = window.setTimeout(() => { lastTouch = 0; }, 260);
    }
  }, { passive: false });
}
