/**
 * CORE.JS — Ядро игры v1.5
 * Новый босс, 4 типа врагов, аптечки, бочки
 */

const STATE = {
  ARENA: 'arena', SHOP: 'shop', TRANSITION: 'transition',
  TRADE: 'trade', INVENTORY: 'inventory', DEAD: 'dead',
  BUFF_SELECT: 'buff_select',
  BOSS_INTRO: 'boss_intro', BOSS_FIGHT: 'boss_fight'
};
let gameState = STATE.ARENA;
let currentWave = 0;
let currentMap = ARENA_MAP;
let currentMapH = ARENA_MAP.length;
let currentMapW = ARENA_MAP[0].length;
let portalActive = false;
let shopMouseActive = false;

const player = {
  x: 13.5, y: 10.5, angle: 0,
  hp: 100, maxHp: 100, money: 0, running: false,
  baseMoveSpeed: 1.5, baseRunSpeed: 2.5,
  damageBonus: 0, damageMult: 1.0, armor: 0,
  moveSpeedMult: 1.0, attackSpeedMult: 1.0,
  lifeOnKill: 0, critChance: 0, attackAngleMult: 1.0, size: 0,
  strengthLevel: 0, armorLevel: 0,
  activeBuffs: [], temporaryBuffs: [], savedStats: null,
  equippedWeapon: null, equippedArmor: null,
  inventory: { storage: new Array(9).fill(null) }
};

function getCurrentWeapon() {
  if (player.equippedWeapon && WEAPONS[player.equippedWeapon]) {
    return WEAPONS[player.equippedWeapon];
  }
  return WEAPONS.fists;
}

function getEquippedItem() {
  if (!player.equippedWeapon) return null;
  return player.inventory.storage.find(i => i && i.key === player.equippedWeapon);
}

function addToInventory(item) {
  for (let i = 0; i < player.inventory.storage.length; i++) {
    if (!player.inventory.storage[i]) {
      player.inventory.storage[i] = item;
      return true;
    }
  }
  return false;
}

const enemies = [];
const projectiles = [];
const enemyProjectiles = [];
const pickups = [];
const barrels = [];

let boss = null;
let bossIntroTimer = 0;
let bossVictoryTimer = 0;

function createBoss() {
  return {
    x: BOSS_START_POS.x, y: BOSS_START_POS.y,
    hp: BOSS_STATS.hp, maxHp: BOSS_STATS.hp,
    phase: 'approaching', phaseTimer: 0,
    attackCount: 0, radius: BOSS_STATS.radius,
    lastFireball: 0
  };
}

function isWall(x, y) {
  const mx = Math.floor(x), my = Math.floor(y);
  if (mx < 0 || my < 0 || mx >= currentMapW || my >= currentMapH) return true;
  return currentMap[my][mx] === 1;
}

function canMove(x, y, r) {
  return !isWall(x + r, y + r) && !isWall(x + r, y - r) &&
         !isWall(x - r, y + r) && !isWall(x - r, y - r) &&
         !isWall(x + r, y)     && !isWall(x - r, y) &&
         !isWall(x, y + r)     && !isWall(x, y - r);
}

function pushOutOfWalls(entity, r) {
  if (isWall(entity.x, entity.y)) {
    entity.x = Math.floor(entity.x) + 0.5;
    entity.y = Math.floor(entity.y) + 0.5;
  }
  const push = 0.02;
  if (isWall(entity.x + r, entity.y)) entity.x -= push;
  if (isWall(entity.x - r, entity.y)) entity.x += push;
  if (isWall(entity.x, entity.y + r)) entity.y -= push;
  if (isWall(entity.x, entity.y - r)) entity.y += push;
}

function safeMove(entity, dx, dy, r) {
  if (canMove(entity.x + dx, entity.y, r)) entity.x += dx;
  else {
    const steps = 4, smallDx = dx / steps;
    for (let i = 0; i < steps; i++) {
      if (canMove(entity.x + smallDx, entity.y, r)) entity.x += smallDx;
      else break;
    }
  }
  if (canMove(entity.x, entity.y + dy, r)) entity.y += dy;
  else {
    const steps = 4, smallDy = dy / steps;
    for (let i = 0; i < steps; i++) {
      if (canMove(entity.x, entity.y + smallDy, r)) entity.y += smallDy;
      else break;
    }
  }
  pushOutOfWalls(entity, r);
}

function findSafeSpawn() {
  const free = [];
  for (let y = 1; y < currentMapH - 1; y++) {
    for (let x = 1; x < currentMapW - 1; x++) {
      if (currentMap[y][x] === 0) {
        const px = x + 0.5, py = y + 0.5;
        if (Math.hypot(px - player.x, py - player.y) > 4 && canMove(px, py, 0.3)) {
          let ok = true;
          for (const en of enemies) if (Math.hypot(px - en.x, py - en.y) < 1.5) { ok = false; break; }
          for (const b of barrels) if (Math.hypot(px - b.x, py - b.y) < 1.5) { ok = false; break; }
          if (Math.hypot(px - PORTAL_POS.x, py - PORTAL_POS.y) < 2) ok = false;
          if (ok) free.push({ x: px, y: py });
        }
      }
    }
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}

function spawnBarrels() {
  barrels.length = 0;
  if (gameState !== STATE.ARENA) return;
  
  const count = Math.floor(2 + Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const pos = findSafeSpawn();
    if (pos) {
      barrels.push({
        x: pos.x, y: pos.y,
        hp: 10, radius: 0.4,
        alive: true
      });
    }
  }
}

function spawnWaveEnemies() {
  enemies.length = 0;
  projectiles.length = 0;
  enemyProjectiles.length = 0;
  pickups.length = 0;
  const count = getEnemyCount(currentWave);
  
  for (let i = 0; i < count; i++) {
    const pos = findSafeSpawn();
    if (!pos) break;
    
    let enemyType = 'green';
    const roll = Math.random();
    
    // Распределение по волнам
    if (currentWave >= 6 && roll < 0.12) {
      enemyType = 'mage';
    } else if (currentWave >= 5 && roll < 0.18) {
      enemyType = 'necromancer';
    } else if (currentWave >= 4 && roll < 0.22) {
      enemyType = 'turret';
    } else if (currentWave >= 3 && roll < 0.30) {
      enemyType = 'spiky';
    } else if (currentWave >= 3 && roll < 0.40) {
      enemyType = 'red';
    } else if (currentWave >= 2 && roll < 0.50) {
      enemyType = 'skeleton';
    } else if (currentWave >= 1 && roll < 0.60) {
      enemyType = 'blue';
    }
    
    const stats = ENEMY_TYPES[enemyType];
    const enemy = {
      x: pos.x, y: pos.y,
      hp: stats.hp, maxHp: stats.hp,
      lastAtk: performance.now() - Math.random() * 2000,
      lastSpawn: performance.now(),
      type: enemyType,
      stats: stats,
      charging: false,
      chargeStart: 0,
      armor: stats.armor || 0
    };
    enemies.push(enemy);
  }
  
  spawnBarrels();
  portalActive = false;
}

function switchToArena() {
  currentMap = ARENA_MAP;
  currentMapH = ARENA_MAP.length;
  currentMapW = ARENA_MAP[0].length;
  player.x = ARENA_SPAWN.x; player.y = ARENA_SPAWN.y; player.angle = 0;
  spawnWaveEnemies();
  gameState = STATE.ARENA;
  lockPointer();
}

function switchToShop() {
  currentMap = SHOP_MAP_NUM;
  currentMapH = SHOP_MAP_NUM.length;
  currentMapW = SHOP_MAP_NUM[0].length;
  player.x = SHOP_SPAWN.x; player.y = SHOP_SPAWN.y; player.angle = Math.PI / 2;
  gameState = STATE.SHOP;
  if (mouseLocked) unlockPointer();
  shopMouseActive = true;
  barrels.length = 0;
  enemyProjectiles.length = 0;
  projectiles.length = 0;
  pickups.length = 0;
}

function switchToBossRoom() {
  currentMap = BOSS_MAP;
  currentMapH = BOSS_MAP.length;
  currentMapW = BOSS_MAP[0].length;
  player.x = BOSS_SPAWN.x; player.y = BOSS_SPAWN.y; 
  player.angle = -Math.PI / 2;
  enemies.length = 0;
  projectiles.length = 0;
  enemyProjectiles.length = 0;
  pickups.length = 0;
  barrels.length = 0;
  boss = createBoss();
  gameState = STATE.BOSS_INTRO;
  bossIntroTimer = 3.0;
  if (mouseLocked) unlockPointer();
}

function showTransition(title, text, duration, callback) {
  gameState = STATE.TRANSITION;
  const screen = document.getElementById('transitionScreen');
  document.getElementById('transTitle').textContent = title;
  document.getElementById('transText').textContent = text;
  screen.style.display = 'flex';
  setTimeout(() => { screen.style.display = 'none'; callback(); }, duration);
}

function enterPortal() {
  // На 10-й волне — босс
  if (currentWave === 10) {
    showTransition('⚔ ВОЛНА 10 ⚔', 'ПОВЕЛИТЕЛЬ ПЛАМЕНИ ПРОБУЖДАЕТСЯ...', 2500, () => {
      switchToBossRoom();
    });
  } else {
    showTransition(`ВОЛНА ${currentWave} ПРОЙДЕНА!`, 'Выбери временное усиление...', 1500, () => {
      showBuffSelectScreen();
    });
  }
}

function exitShop() {
  currentWave++;
  clearTemporaryBuffs();
  shopMouseActive = false;
  showTransition(`ВОЛНА ${currentWave}`, `Врагов: ${getEnemyCount(currentWave)}`, 1500, switchToArena);
}

let mouseLocked = false;
let isMobile = 'ontouchstart' in window;
let showReLockHint = false;

function lockPointer() {
  if (!isMobile && canvas && !mouseLocked) canvas.requestPointerLock();
}
function unlockPointer() {
  if (document.pointerLockElement) document.exitPointerLock();
}

function applyTemporaryBuff(buff) {
  if (!player.savedStats) player.savedStats = savePlayerStats();
  buff.apply(player);
  player.temporaryBuffs.push(buff);
}

function clearTemporaryBuffs() {
  if (player.savedStats) {
    restorePlayerStats(player.savedStats);
    player.savedStats = null;
  }
  player.temporaryBuffs = [];
}

function showBuffSelectScreen() {
  gameState = STATE.BUFF_SELECT;
  unlockPointer();
  const screen = document.getElementById('buffSelectScreen');
  const title = document.getElementById('buffSelectTitle');
  const options = document.getElementById('buffSelectOptions');
  const rerollBtn = document.getElementById('buffRerollBtn');
  const skipBtn = document.getElementById('buffSkipBtn');
  const price = getBuffPrice(currentWave);
  const rerollPrice = getRerollPrice(currentWave);
  title.innerHTML = `ВЫБЕРИ УСИЛЕНИЕ <span style="color:#ffaa00">(Волна ${currentWave})</span>`;
  generateBuffOptions(options, price);
  rerollBtn.textContent = `🎲 РЕРOЛЛ ($${rerollPrice})`;
  rerollBtn.onclick = () => {
    if (player.money >= rerollPrice) {
      player.money -= rerollPrice;
      generateBuffOptions(options, price);
      updateHUD();
    } else {
      rerollBtn.classList.add('shake');
      setTimeout(() => rerollBtn.classList.remove('shake'), 300);
    }
  };
  skipBtn.onclick = () => { screen.style.display = 'none'; switchToShop(); };
  screen.style.display = 'flex';
}

function generateBuffOptions(container, price) {
  container.innerHTML = '';
  const available = [...BUFFS];
  const selected = [];
  for (let i = 0; i < 3 && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    selected.push(available[idx]);
    available.splice(idx, 1);
  }
  selected.forEach(buff => {
    const card = document.createElement('div');
    card.className = 'buff-card';
    card.innerHTML = `
      <div class="buff-card-name" style="color: ${buff.color}">${buff.name}</div>
      <div class="buff-card-desc">${buff.desc}</div>
      <div class="buff-card-pros">✓ ${buff.pros}</div>
      <div class="buff-card-cons">✗ ${buff.cons}</div>
      <div class="buff-card-price">💰 ${price}</div>
      <div class="buff-card-duration">⏱ На 1 волну</div>
    `;
    card.onclick = () => {
      if (player.money >= price) {
        player.money -= price;
        applyTemporaryBuff(buff);
        updateHUD();
        document.getElementById('buffSelectScreen').style.display = 'none';
        switchToShop();
      } else {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
      }
    };
    container.appendChild(card);
  });
}

// ================= СНАРЯДЫ ИГРОКА =================
function spawnProjectile(x, y, angle, speed, damage, type, options = {}) {
  projectiles.push({
    x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    damage, type, life: 2.0,
    piercing: options.piercing || false,
    aoe: options.aoe || 0,
    burning: options.burning || false,
    hitEnemies: [],
    hitBarrels: []
  });
}

function spawnEnemyProjectile(x, y, targetX, targetY, speed, damage, type, options = {}) {
  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return;
  enemyProjectiles.push({
    x, y,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    damage, type,
    life: 3.0,
    angle: Math.atan2(dy, dx),
    aoe: options.aoe || 0
  });
}

function createExplosion(x, y, radius, damage, owner = 'player') {
  if (owner === 'player' || owner === 'barrel') {
    for (const en of enemies) {
      const dist = Math.hypot(x - en.x, y - en.y);
      if (dist < radius) {
        const dmg = damage * (1 - dist / radius);
        en.hp -= dmg;
      }
    }
    if (boss && boss.phase === 'stuck') {
      const dist = Math.hypot(x - boss.x, y - boss.y);
      if (dist < radius) {
        const dmg = damage * (1 - dist / radius);
        boss.hp -= dmg;
      }
    }
  }
  
  // Бочки тоже взрываются
  for (const b of barrels) {
    if (!b.alive) continue;
    const dist = Math.hypot(x - b.x, y - b.y);
    if (dist < radius && dist > 0.5) {
      destroyBarrel(b);
    }
  }
  
  // Игрок тоже получает урон от взрывов (если не его взрыв или взрыв бочки)
  if (owner === 'enemy' || owner === 'barrel') {
    const dist = Math.hypot(x - player.x, y - player.y);
    if (dist < radius) {
      const dmg = Math.max(3, Math.floor(damage * (1 - dist / radius)) - player.armor);
      player.hp -= dmg;
      screenShake = 0.4;
      playSound('playerHurt');
    }
  }
  
  screenShake = Math.max(screenShake, 0.5);
  playSound('explosion');
}

function destroyBarrel(barrel) {
  if (!barrel.alive) return;
  barrel.alive = false;
  createExplosion(barrel.x, barrel.y, 3.0, 30, 'barrel');
  playSound('barrelExplode');
  screenShake = 0.8;
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    
    if (isWall(p.x, p.y) || p.life <= 0) {
      if (p.aoe > 0) createExplosion(p.x, p.y, p.aoe, p.damage, 'player');
      projectiles.splice(i, 1);
      continue;
    }
    
    let hitSomething = false;
    
    // Проверка врагов
    for (const en of enemies) {
      if (p.hitEnemies.includes(en)) continue;
      const dist = Math.hypot(p.x - en.x, p.y - en.y);
      if (dist < en.stats.radius + 0.1) {
        let damage = p.damage;
        // Броня уменьшает урон
        if (en.armor > 0) damage = Math.max(1, damage - en.armor);
        en.hp -= damage;
        if (p.burning) en.burning = 2.0; // 2 секунды горения
        p.hitEnemies.push(en);
        playSound('hit');
        if (!p.piercing) { hitSomething = true; break; }
      }
    }
    
    // Проверка босса (только в фазе stuck)
    if (boss && boss.phase === 'stuck') {
      if (!p.hitEnemies.includes(boss)) {
        const dist = Math.hypot(p.x - boss.x, p.y - boss.y);
        if (dist < boss.radius + 0.1) {
          boss.hp -= p.damage;
          p.hitEnemies.push(boss);
          playSound('hit');
          if (!p.piercing) { hitSomething = true; }
        }
      }
    }
    
    // Проверка бочек
    for (const b of barrels) {
      if (!b.alive) continue;
      if (p.hitBarrels.includes(b)) continue;
      const dist = Math.hypot(p.x - b.x, p.y - b.y);
      if (dist < b.radius + 0.1) {
        destroyBarrel(b);
        p.hitBarrels.push(b);
        if (!p.piercing) { hitSomething = true; break; }
      }
    }
    
    if (hitSomething) {
      if (p.aoe > 0) createExplosion(p.x, p.y, p.aoe, p.damage, 'player');
      projectiles.splice(i, 1);
    }
  }
}

function updateEnemyProjectiles(dt) {
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const p = enemyProjectiles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    
    if (isWall(p.x, p.y) || p.life <= 0) {
      if (p.aoe > 0) {
        createExplosion(p.x, p.y, p.aoe, p.damage, 'enemy');
      }
      enemyProjectiles.splice(i, 1);
      continue;
    }
    
    const dist = Math.hypot(p.x - player.x, p.y - player.y);
    if (dist < 0.4) {
      if (p.aoe > 0) {
        createExplosion(p.x, p.y, p.aoe, p.damage, 'enemy');
      } else {
        const dmg = Math.max(1, p.damage - player.armor);
        player.hp -= dmg;
        screenShake = 0.2;
        playSound('playerHurt');
      }
      enemyProjectiles.splice(i, 1);
    }
  }
}

// ================= ПОДБИРАЕМЫЕ ПРЕДМЕТЫ =================
function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.life -= dt;
    if (p.life <= 0) {
      pickups.splice(i, 1);
      continue;
    }
    
    // Подбор игроком
    const dist = Math.hypot(p.x - player.x, p.y - player.y);
    if (dist < 0.7) {
      if (p.type === 'healthpack') {
        const heal = Math.min(25, player.maxHp - player.hp);
        player.hp += heal;
        playSound('pickup');
        showDialog(`+${heal} HP`, 1);
      }
      pickups.splice(i, 1);
    }
  }
}

function dropLoot(x, y, enemyType) {
  const stats = ENEMY_TYPES[enemyType];
  if (!stats.dropChance) return;
  if (Math.random() < stats.dropChance) {
    pickups.push({
      x, y,
      type: 'healthpack',
      life: 15.0 // 15 секунд существует
    });
  }
}

// ================= AI ВРАГОВ =================
function updateTurretAI(en, dt) {
  // Турель не двигается, но стреляет
  const now = performance.now();
  const dx = player.x - en.x;
  const dy = player.y - en.y;
  const dist = Math.hypot(dx, dy);
  
  // Стреляет если видит игрока в радиусе
  if (dist < en.stats.preferredDist && now - en.lastAtk > en.stats.shootCd) {
    spawnEnemyProjectile(en.x, en.y, player.x, player.y,
                       en.stats.projectileSpeed, en.stats.projectileDmg, 'bullet');
    en.lastAtk = now;
    playSound('turretShoot');
  }
}

function updateNecromancerAI(en, dt) {
  const now = performance.now();
  const dx = player.x - en.x;
  const dy = player.y - en.y;
  const dist = Math.hypot(dx, dy);
  
  // Держит дистанцию
  if (dist < en.stats.tooCloseDist) {
    // Отходит
    safeMove(en, -(dx/dist)*en.stats.speed*dt, -(dy/dist)*en.stats.speed*dt, en.stats.radius);
  } else if (dist > en.stats.preferredDist) {
    // Подходит
    safeMove(en, (dx/dist)*en.stats.speed*0.5*dt, (dy/dist)*en.stats.speed*0.5*dt, en.stats.radius);
  }
  
  // Спавнит слизней
  if (now - en.lastSpawn > en.stats.spawnCd && enemies.length < 15) {
    // Создаём зелёного слизня рядом
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 1.5;
    const sx = en.x + Math.cos(angle) * spawnDist;
    const sy = en.y + Math.sin(angle) * spawnDist;
    
    if (!isWall(sx, sy) && canMove(sx, sy, 0.3)) {
      const slimeStats = ENEMY_TYPES.green;
      enemies.push({
        x: sx, y: sy,
        hp: slimeStats.hp, maxHp: slimeStats.hp,
        lastAtk: now, lastSpawn: now,
        type: 'green', stats: slimeStats,
        charging: false, chargeStart: 0,
        armor: 0
      });
      playSound('necromancer');
      en.lastSpawn = now;
    }
  }
}

function updateMageAI(en, dt) {
  const now = performance.now();
  const dx = player.x - en.x;
  const dy = player.y - en.y;
  const dist = Math.hypot(dx, dy);
  
  // Держит дистанцию
  if (dist < en.stats.tooCloseDist) {
    safeMove(en, -(dx/dist)*en.stats.speed*dt, -(dy/dist)*en.stats.speed*dt, en.stats.radius);
    en.charging = false;
  } else if (dist > en.stats.preferredDist) {
    safeMove(en, (dx/dist)*en.stats.speed*0.5*dt, (dy/dist)*en.stats.speed*0.5*dt, en.stats.radius);
  }
  
  // Стреляет огненными шарами
  if (dist < en.stats.preferredDist && dist > en.stats.tooCloseDist) {
    if (!en.charging && now - en.lastAtk > en.stats.shootCd) {
      en.charging = true;
      en.chargeStart = now;
    }
    if (en.charging && now - en.chargeStart > en.stats.chargeTime) {
      spawnEnemyProjectile(en.x, en.y, player.x, player.y,
                         en.stats.projectileSpeed, en.stats.projectileDmg, 'fireball',
                         { aoe: en.stats.aoeRadius });
      en.charging = false;
      en.lastAtk = now;
      playSound('mageShoot');
    }
  } else {
    en.charging = false;
  }
}

function updateSpikyAI(en, dt) {
  const dx = player.x - en.x;
  const dy = player.y - en.y;
  const dist = Math.hypot(dx, dy);
  
  // Медленно идёт к игроку
  if (dist > 0.5) {
    safeMove(en, (dx/dist)*en.stats.speed*dt, (dy/dist)*en.stats.speed*dt, en.stats.radius);
  }
  
  // Постоянный урон при касании
  if (dist < en.stats.range) {
    const now = performance.now();
    if (now - en.lastAtk > en.stats.cd) {
      const dmg = Math.max(1, en.stats.contactDmg - player.armor);
      player.hp -= dmg;
      en.lastAtk = now;
      screenShake = 0.2;
      playSound('playerHurt');
    }
  }
}

// ================= ЛОГИКА БОССА =================
function updateBoss(dt) {
  if (!boss) return;
  boss.phaseTimer += dt;
  const now = performance.now();
  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  const dist = Math.hypot(dx, dy);
  
  // Стреляет огненными шарами в фазах approaching и recovering
  if ((boss.phase === 'approaching' || boss.phase === 'recovering') &&
      now - boss.lastFireball > BOSS_STATS.fireballCd && dist < 10) {
    spawnEnemyProjectile(boss.x, boss.y, player.x, player.y,
                        BOSS_STATS.fireballSpeed, BOSS_STATS.fireballDmg, 'fireball',
                        { aoe: 1.5 });
    boss.lastFireball = now;
    playSound('mageShoot');
  }
  
  if (boss.phase === 'approaching') {
    if (dist > BOSS_STATS.attackRange + 0.5) {
      const mx = (dx / dist) * BOSS_STATS.speed * dt;
      const my = (dy / dist) * BOSS_STATS.speed * dt;
      safeMove(boss, mx, my, boss.radius);
    } else {
      boss.phase = 'charging';
      boss.phaseTimer = 0;
      playSound('bossCharge');
    }
  } else if (boss.phase === 'charging') {
    if (boss.phaseTimer >= BOSS_STATS.chargeTime) {
      boss.phase = 'striking';
      boss.phaseTimer = 0;
      playSound('bossStrike');
    }
  } else if (boss.phase === 'striking') {
    if (boss.phaseTimer >= BOSS_STATS.strikeTime) {
      if (dist < BOSS_STATS.aoeRadius) {
        const dmgMult = 1 - (dist / BOSS_STATS.aoeRadius);
        const damage = Math.floor(BOSS_STATS.attackDamage * dmgMult);
        const finalDmg = Math.max(5, damage - player.armor);
        player.hp -= finalDmg;
        screenShake = 0.8;
        playSound('playerHurt');
      } else {
        screenShake = 0.4;
      }
      playSound('bossImpact');
      boss.phase = 'stuck';
      boss.phaseTimer = 0;
    }
  } else if (boss.phase === 'stuck') {
    if (boss.phaseTimer >= BOSS_STATS.stuckTime) {
      boss.phase = 'recovering';
      boss.phaseTimer = 0;
      playSound('bossRecover');
    }
  } else if (boss.phase === 'recovering') {
    if (boss.phaseTimer >= BOSS_STATS.recoverTime) {
      boss.phase = 'approaching';
      boss.phaseTimer = 0;
      boss.attackCount++;
    }
  }
  
  if (boss.hp <= 0 && boss.phase !== 'dead') {
    bossVictoryTimer = 3.0;
    boss.phase = 'dead';
    playSound('bossDie');
    screenShake = 1.0;
  }
}

// ================= RAYCASTING =================
function castRay(angle) {
  const sin = Math.sin(angle), cos = Math.cos(angle);
  let mapX = Math.floor(player.x), mapY = Math.floor(player.y);
  const dX = 1 / (Math.abs(cos) + EPS), dY = 1 / (Math.abs(sin) + EPS);
  let sX, sY, stX, stY;
  if (cos < 0) { stX = -1; sX = (player.x - mapX) * dX; } else { stX = 1; sX = (mapX + 1 - player.x) * dX; }
  if (sin < 0) { stY = -1; sY = (player.y - mapY) * dY; } else { stY = 1; sY = (mapY + 1 - player.y) * dY; }
  let side = 0, iter = 0;
  while (iter++ < 60) {
    if (sX < sY) { sX += dX; mapX += stX; side = 0; } else { sY += dY; mapY += stY; side = 1; }
    if (mapX < 0 || mapY < 0 || mapX >= currentMapW || mapY >= currentMapH) break;
    if (currentMap[mapY][mapX] === 1) break;
  }
  let dist = side === 0 ? sX - dX : sY - dY;
  if (dist < 0.01) dist = 0.01;
  let wallX = side === 0 ? player.y + dist * sin : player.x + dist * cos;
  wallX -= Math.floor(wallX);
  if (wallX < 0) wallX += 1;
  return { dist, side, wallX };
}

// ================= РЕНДЕР =================
function render() {
  let shX = 0, shY = 0;
  if (screenShake > 0) {
    shX = (Math.random() - 0.5) * 10 * screenShake;
    shY = (Math.random() - 0.5) * 10 * screenShake;
  }
  ctx.save();
  ctx.translate(shX, shY);
  
  // Фон
  if (gameState === STATE.SHOP || gameState === STATE.TRADE) {
    const cg = ctx.createLinearGradient(0, 0, 0, RENDER_H / 2);
    cg.addColorStop(0, '#0a001a'); cg.addColorStop(1, '#3a0555');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, RENDER_W, RENDER_H / 2);
    const fg = ctx.createLinearGradient(0, RENDER_H / 2, 0, RENDER_H);
    fg.addColorStop(0, '#4a3a05'); fg.addColorStop(1, '#aa7700');
    ctx.fillStyle = fg; ctx.fillRect(0, RENDER_H / 2, RENDER_W, RENDER_H / 2);
  } else if (gameState === STATE.BOSS_INTRO || gameState === STATE.BOSS_FIGHT) {
    const cg = ctx.createLinearGradient(0, 0, 0, RENDER_H / 2);
    cg.addColorStop(0, '#200000'); cg.addColorStop(1, '#4a0505');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, RENDER_W, RENDER_H / 2);
    const fg = ctx.createLinearGradient(0, RENDER_H / 2, 0, RENDER_H);
    fg.addColorStop(0, '#4a1515'); fg.addColorStop(1, '#8a2a0a');
    ctx.fillStyle = fg; ctx.fillRect(0, RENDER_H / 2, RENDER_W, RENDER_H / 2);
  } else {
    const cg = ctx.createLinearGradient(0, 0, 0, RENDER_H / 2);
    cg.addColorStop(0, '#0a0000'); cg.addColorStop(1, '#3a0505');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, RENDER_W, RENDER_H / 2);
    const fg = ctx.createLinearGradient(0, RENDER_H / 2, 0, RENDER_H);
    fg.addColorStop(0, '#4a1a05'); fg.addColorStop(1, '#ff4400');
    ctx.fillStyle = fg; ctx.fillRect(0, RENDER_H / 2, RENDER_W, RENDER_H / 2);
  }
  
  // Стены
  const zBuf = new Array(RENDER_W);
  let wallTex = TEX.arenaWall;
  if (gameState === STATE.SHOP || gameState === STATE.TRADE) wallTex = TEX.shopWall;
  else if (gameState === STATE.BOSS_INTRO || gameState === STATE.BOSS_FIGHT) wallTex = TEX.bossWall;
  
  for (let x = 0; x < RENDER_W; x++) {
    const ra = (player.angle - FOV / 2) + (x / RENDER_W) * FOV;
    const ray = castRay(ra);
    const cd = Math.max(0.1, ray.dist * Math.cos(ra - player.angle));
    zBuf[x] = cd;
    const wh = Math.min(RENDER_H * 2, RENDER_H / cd);
    const wt = (RENDER_H - wh) / 2;
    const shade = (ray.side === 1 ? 0.7 : 1) * Math.max(0, 1 - cd / MAX_DEPTH);
    const tx = Math.max(0, Math.min(63, Math.floor(ray.wallX * 64)));
    ctx.drawImage(wallTex, tx, 0, 1, 64, x, wt, 1, wh);
    ctx.fillStyle = `rgba(0,0,0,${1 - shade})`; ctx.fillRect(x, wt, 1, wh);
  }
  
  // Сбор всех спрайтов
  const sprites = [];
  
  // Враги
  enemies.forEach(en => {
    let texKey = en.stats.texKey;
    if (en.type === 'skeleton' && en.charging) texKey = 'skeletonCharging';
    if (en.type === 'mage' && en.charging) texKey = 'mageCharging';
    sprites.push({
      x: en.x, y: en.y,
      tex: TEX[texKey],
      scale: 0.8 + (en.type === 'red' ? 0.3 : en.type === 'blue' ? -0.1 : 0),
      type: 'enemy', data: en
    });
  });
  
  // Босс
  if (boss && boss.phase !== 'dead') {
    const bossTex = (boss.phase === 'stuck') ? TEX.bossStuck : TEX.boss;
    sprites.push({
      x: boss.x, y: boss.y, tex: bossTex,
      scale: 3.0, type: 'boss', data: boss
    });
  }
  
  // Портал
  if (gameState === STATE.ARENA && portalActive) {
    sprites.push({ x: PORTAL_POS.x, y: PORTAL_POS.y, tex: TEX.portal, scale: 1.0, type: 'portal' });
  }
  
  // Магазин
  if (gameState === STATE.SHOP || gameState === STATE.TRADE) {
    MERCHANTS.forEach((m, i) => {
      sprites.push({ x: m.x, y: m.y, tex: TEX.merchants[i], scale: 1.0, type: 'merchant', data: m });
    });
    sprites.push({ x: DOOR_POS.x, y: DOOR_POS.y, tex: TEX.door, scale: 0.9, type: 'door' });
  }
  
  // Снаряды игрока
  projectiles.forEach(p => {
    let tex = TEX.bullet;
    let scale = 0.3;
    if (p.type === 'gauss') { tex = TEX.bulletGauss; scale = 0.5; }
    else if (p.type === 'bfg') { tex = TEX.bulletBfg; scale = 0.8; }
    else if (p.type === 'rocket') { tex = TEX.rocket; scale = 0.4; }
    else if (p.burning) { tex = TEX.fire; scale = 0.4; }
    sprites.push({ x: p.x, y: p.y, tex, scale, type: 'projectile' });
  });
  
  // Вражеские снаряды
  enemyProjectiles.forEach(p => {
    let tex = TEX.arrow;
    let scale = 0.5;
    if (p.type === 'fireball') { tex = TEX.fireball; scale = 0.6; }
    else if (p.type === 'bullet') { tex = TEX.bullet; scale = 0.3; }
    sprites.push({ x: p.x, y: p.y, tex, scale, type: 'enemyProjectile', data: p });
  });
  
  // Подбираемые предметы
  pickups.forEach(p => {
    sprites.push({ x: p.x, y: p.y, tex: TEX.healthpack, scale: 0.4, type: 'pickup', data: p });
  });
  
  // Бочки
  barrels.forEach(b => {
    if (b.alive) {
      sprites.push({ x: b.x, y: b.y, tex: TEX.barrel, scale: 0.7, type: 'barrel', data: b });
    }
  });
  
  // Сортировка
  sprites.forEach(s => { s.dist = Math.hypot(s.x - player.x, s.y - player.y); });
  sprites.sort((a, b) => b.dist - a.dist);
  
  // Рендер спрайтов
  sprites.forEach(sp => {
    if (sp.dist < 0.2) return;
    const dx = sp.x - player.x, dy = sp.y - player.y;
    let ang = Math.atan2(dy, dx) - player.angle;
    while (ang > Math.PI) ang -= Math.PI * 2;
    while (ang < -Math.PI) ang += Math.PI * 2;
    if (Math.abs(ang) > FOV / 2) return;
    const cd = Math.max(0.1, sp.dist * Math.cos(ang));
    if (cd < 0.15) return;
    const sh = Math.min(RENDER_H * 2, RENDER_H / cd);
    const sw = sh * sp.scale;
    const sx = (RENDER_W / 2) * (1 + ang / (FOV / 2));
    const st = sp.type === 'boss' ? (RENDER_H - sh) + 20 : (RENDER_H - sh) / 2;
    const startX = Math.floor(sx - sw / 2), endX = Math.floor(sx + sw / 2);
    const fog = Math.max(0, 1 - cd / MAX_DEPTH);
    let pulse = 1;
    if (sp.type === 'portal') pulse = 1 + Math.sin(performance.now() / 200) * 0.1;
    if (sp.type === 'pickup') pulse = 1 + Math.sin(performance.now() / 150) * 0.15;
    if (sp.type === 'boss') pulse = 1 + Math.sin(performance.now() / 300) * 0.05;
    
    for (let x = startX; x < endX; x++) {
      if (x < 0 || x >= RENDER_W || cd >= zBuf[x]) continue;
      const tx = Math.max(0, Math.min(63, Math.floor(((x - startX) / sw) * 64)));
      ctx.drawImage(sp.tex, tx, 0, 1, 64, x, st, 1, sh * pulse);
      if (fog < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fog})`; ctx.fillRect(x, st, 1, sh * pulse); }
    }
    
    // Подписи и индикаторы
    if (sp.type === 'merchant' && sp.dist < 5) {
      ctx.fillStyle = sp.data.color;
      ctx.font = 'bold 10px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(sp.data.name, sx, st - 5);
    }
    
    if (sp.type === 'enemy' && sp.data.hp < sp.data.maxHp) {
      const hpPercent = sp.data.hp / sp.data.maxHp;
      const barW = sw * 0.8;
      const barH = 4;
      const barX = sx - barW / 2;
      const barY = st - 8;
      ctx.fillStyle = '#000';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(barX, barY, barW * hpPercent, barH);
    }
    
    // Эффект горения
    if (sp.type === 'enemy' && sp.data.burning && sp.data.burning > 0) {
      ctx.fillStyle = 'rgba(255,100,0,0.3)';
      ctx.fillRect(startX, st, endX - startX, sh);
    }
    
    if (sp.type === 'boss') {
      const hpPercent = sp.data.hp / sp.data.maxHp;
      const barW = Math.min(300, sw * 0.9);
      const barH = 10;
      const barX = RENDER_W / 2 - barW / 2;
      const barY = 15;
      
      // Фон бара
      ctx.fillStyle = '#000';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
      
      // HP бар
      const barColor = hpPercent > 0.5 ? '#ff3300' : hpPercent > 0.25 ? '#ff8800' : '#ff00ff';
      ctx.fillStyle = barColor;
      ctx.fillRect(barX, barY, barW * hpPercent, barH);
      
      // Имя босса
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(BOSS_STATS.name, RENDER_W / 2, barY - 3);
      
      // Индикатор фазы
      if (sp.data.phase === 'stuck') {
        const remaining = Math.max(0, BOSS_STATS.stuckTime - sp.data.phaseTimer);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px Courier New';
        ctx.fillText(`УДАРЬ! ${remaining.toFixed(1)}с`, RENDER_W / 2, barY + barH + 18);
      } else if (sp.data.phase === 'charging') {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 12px Courier New';
        ctx.fillText('⚠ ЗАМАХ!', RENDER_W / 2, barY + barH + 18);
      }
    }
  });
  
  renderWeapon();
  ctx.restore();
  
  // Оверлеи
  if (gameState === STATE.BOSS_INTRO) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.8, bossIntroTimer * 0.3)})`;
    ctx.fillRect(0, 0, RENDER_W, RENDER_H);
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 24px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 ПОВЕЛИТЕЛЬ ПЛАМЕНИ 🔥', RENDER_W / 2, RENDER_H / 2 - 10);
    ctx.font = '14px Courier New';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('БОСС ПРОБУЖДАЕТСЯ...', RENDER_W / 2, RENDER_H / 2 + 20);
  }
  
  if (boss && boss.phase === 'dead') {
    ctx.fillStyle = `rgba(50,0,50,${Math.min(0.7, bossVictoryTimer * 0.3)})`;
    ctx.fillRect(0, 0, RENDER_W, RENDER_H);
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 24px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('★ ПОБЕДА! ★', RENDER_W / 2, RENDER_H / 2 - 10);
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#fff';
    ctx.fillText('Повелитель Пламени повержен', RENDER_W / 2, RENDER_H / 2 + 15);
  }
  
  renderMinimap();
}

function renderWeapon() {
  if (gameState === STATE.BOSS_INTRO) return;
  const weapon = getCurrentWeapon();
  const texKey = weapon.icon;
  const tex = TEX[texKey] || TEX.fist;
  const punchOffset = WEAPON_STATE.anim * 40;
  const moving = keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD || joyData.active;
  const bob = Math.sin(performance.now() / 150) * (moving ? 5 : 0);
  const ws = 140;
  const wx = RENDER_W / 2 - ws / 2 + 40;
  const wy = RENDER_H - ws + 30 + bob - punchOffset;
  ctx.save();
  ctx.translate(wx + ws / 2, wy + ws / 2);
  if (WEAPON_STATE.state === 'punch') ctx.rotate(-0.3);
  ctx.drawImage(tex, -ws / 2, -ws / 2, ws, ws);
  ctx.restore();
  
  if (weapon.type === 'melee' && weapon.key === 'fists') {
    ctx.drawImage(TEX.fist, RENDER_W / 2 - ws / 2 - 40, RENDER_H - ws + 35 + bob, ws, ws);
  }
}

function renderMinimap() {
  const c = 3, mw = currentMapW * c, mh = currentMapH * c;
  const ox = RENDER_W - mw - 10, oy = RENDER_H - mh - 10;
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(ox - 2, oy - 2, mw + 4, mh + 4);
  for (let y = 0; y < currentMapH; y++) for (let x = 0; x < currentMapW; x++) if (currentMap[y][x] === 1) {
    let wallColor = '#f44';
    if (gameState === STATE.SHOP || gameState === STATE.TRADE) wallColor = '#4488ff';
    else if (gameState === STATE.BOSS_INTRO || gameState === STATE.BOSS_FIGHT) wallColor = '#884488';
    ctx.fillStyle = wallColor;
    ctx.fillRect(ox + x * c, oy + y * c, c - 1, c - 1);
  }
  if (gameState === STATE.ARENA && portalActive) {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath(); ctx.arc(ox + PORTAL_POS.x * c, oy + PORTAL_POS.y * c, 2, 0, Math.PI * 2); ctx.fill();
  }
  if (gameState === STATE.SHOP || gameState === STATE.TRADE) {
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(ox + DOOR_POS.x * c, oy + DOOR_POS.y * c, 2, 0, Math.PI * 2); ctx.fill();
    MERCHANTS.forEach(m => {
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.arc(ox + m.x * c, oy + m.y * c, 2, 0, Math.PI * 2); ctx.fill();
    });
  }
  if (boss && boss.phase !== 'dead') {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.arc(ox + boss.x * c, oy + boss.y * c, 4, 0, Math.PI * 2); ctx.fill();
  }
  enemies.forEach(e => {
    ctx.fillStyle = e.stats.color;
    ctx.beginPath(); ctx.arc(ox + e.x * c, oy + e.y * c, 2, 0, Math.PI * 2); ctx.fill();
  });
  barrels.forEach(b => {
    if (b.alive) {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.arc(ox + b.x * c, oy + b.y * c, 2, 0, Math.PI * 2); ctx.fill();
    }
  });
  pickups.forEach(p => {
    ctx.fillStyle = '#44ff44';
    ctx.beginPath(); ctx.arc(ox + p.x * c, oy + p.y * c, 2, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = '#0f0'; ctx.beginPath(); ctx.arc(ox + player.x * c, oy + player.y * c, 2, 0, Math.PI * 2); ctx.fill();
}

// ================= ОБНОВЛЕНИЕ =================
function update(dt) {
  if (gameState === STATE.TRANSITION || gameState === STATE.DEAD || 
      gameState === STATE.TRADE || gameState === STATE.INVENTORY || 
      gameState === STATE.BUFF_SELECT) return;
  
  // Интро босса
  if (gameState === STATE.BOSS_INTRO) {
    bossIntroTimer -= dt;
    if (bossIntroTimer <= 0) {
      gameState = STATE.BOSS_FIGHT;
      lockPointer();
    }
    return;
  }
  
  // Победа над боссом
  if (boss && boss.phase === 'dead') {
    bossVictoryTimer -= dt;
    if (bossVictoryTimer <= 0) {
      boss = null;
      currentWave++;
      player.money += 500;
      clearTemporaryBuffs();
      showTransition('ПОБЕДА НАД БОССОМ!', '+500 монет. Следующая волна...', 2500, () => {
        showBuffSelectScreen();
      });
    }
    return;
  }
  
  // Оружие
  if (WEAPON_STATE.cooldown > 0) WEAPON_STATE.cooldown -= dt;
  if (WEAPON_STATE.state === 'punch') {
    WEAPON_STATE.anim -= dt * 4 * player.attackSpeedMult;
    if (WEAPON_STATE.anim <= 0) { WEAPON_STATE.state = 'idle'; WEAPON_STATE.anim = 0; }
  }
  if (screenShake > 0) screenShake -= dt;

  // Движение игрока
  const baseSpd = player.running ? player.baseRunSpeed : player.baseMoveSpeed;
  const spd = baseSpd * player.moveSpeedMult * dt;
  let dx = 0, dy = 0;
  const c = Math.cos(player.angle), s = Math.sin(player.angle);
  if (keys.KeyW) { dx += c; dy += s; }
  if (keys.KeyS) { dx -= c; dy -= s; }
  if (keys.KeyA) { dx += s; dy -= c; }
  if (keys.KeyD) { dx -= s; dy += c; }
  if (joyData.active) { dx += c * (-joyData.dy) + s * (-joyData.dx); dy += s * (-joyData.dy) - c * (-joyData.dx); }
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) { dx = dx / len * spd; dy = dy / len * spd; }
  safeMove(player, dx, dy, 0.2);

  // Обновление всего
  updateProjectiles(dt);
  updateEnemyProjectiles(dt);
  updatePickups(dt);
  
  // Горение врагов
  for (const en of enemies) {
    if (en.burning && en.burning > 0) {
      en.burning -= dt;
      en.hp -= 2 * dt; // 2 урона в секунду
    }
  }
  
  // Обновление босса
  if (gameState === STATE.BOSS_FIGHT && boss) {
    updateBoss(dt);
  }

  // Логика магазина
  nearMerchant = null;
  if (gameState === STATE.SHOP) {
    for (const m of MERCHANTS) {
      if (Math.hypot(player.x - m.x, player.y - m.y) < 1.8) { nearMerchant = m; break; }
    }
    const distToDoor = Math.hypot(player.x - DOOR_POS.x, player.y - DOOR_POS.y);
    if (distToDoor < 0.8) { exitShop(); return; }
  }
  
  // Портал
  if (gameState === STATE.ARENA && portalActive) {
    if (Math.hypot(player.x - PORTAL_POS.x, player.y - PORTAL_POS.y) < 0.8) {
      enterPortal(); return;
    }
  }

  // AI врагов
  if (gameState === STATE.ARENA) {
    const now = performance.now();
    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      if (en.hp <= 0) {
        const moneyReward = getEnemyMoney(en.stats.money, currentWave);
        player.money += moneyReward;
        if (player.lifeOnKill > 0) player.hp = Math.min(player.maxHp, player.hp + player.lifeOnKill);
        dropLoot(en.x, en.y, en.type);
        enemies.splice(i, 1);
        playSound('slimeDie');
        continue;
      }
      
      // AI по типу
      if (en.type === 'turret') {
        updateTurretAI(en, dt);
      } else if (en.type === 'necromancer') {
        updateNecromancerAI(en, dt);
      } else if (en.type === 'mage') {
        updateMageAI(en, dt);
      } else if (en.type === 'spiky') {
        updateSpikyAI(en, dt);
      } else if (en.type === 'skeleton') {
        updateSkeletonAI(en, dt);
      } else {
        // Обычный ближний бой (слизни)
        const edx = player.x - en.x, edy = player.y - en.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        if (dist > en.stats.range) {
          safeMove(en, (edx/dist)*en.stats.speed*dt, (edy/dist)*en.stats.speed*dt, en.stats.radius);
        }
        if (dist <= en.stats.range && now - en.lastAtk > en.stats.cd) {
          let dmg = en.stats.dmgMin + Math.floor(Math.random() * (en.stats.dmgMax - en.stats.dmgMin + 1));
          dmg = Math.max(1, dmg - player.armor);
          player.hp -= dmg;
          en.lastAtk = now;
          screenShake = 0.3;
          playSound('playerHurt');
        }
      }
    }
    if (enemies.length === 0 && !portalActive) {
      portalActive = true;
      showDialog('ПОРТАЛ ОТКРЫЛСЯ! Иди на север...', 3);
    }
  }
  
  updateInteractionHint();
}

function updateSkeletonAI(en, dt) {
  const now = performance.now();
  const dx = player.x - en.x;
  const dy = player.y - en.y;
  const dist = Math.hypot(dx, dy);
  
  if (dist < en.stats.tooCloseDist) {
    en.charging = false;
    if (dist < en.stats.range && now - en.lastAtk > en.stats.cd) {
      const dmg = Math.max(1, en.stats.dmgMin - player.armor);
      player.hp -= dmg;
      en.lastAtk = now;
      screenShake = 0.2;
      playSound('playerHurt');
    }
    if (dist < 1.5) {
      safeMove(en, -(dx/dist)*en.stats.speed*dt, -(dy/dist)*en.stats.speed*dt, en.stats.radius);
    }
  } else if (dist > en.stats.preferredDist) {
    en.charging = false;
    safeMove(en, (dx/dist)*en.stats.speed*dt, (dy/dist)*en.stats.speed*dt, en.stats.radius);
  } else {
    if (!en.charging && now - en.lastAtk > en.stats.shootCd) {
      en.charging = true;
      en.chargeStart = now;
    }
    if (en.charging && now - en.chargeStart > en.stats.chargeTime) {
      spawnEnemyProjectile(en.x, en.y, player.x, player.y, 
                         en.stats.projectileSpeed, en.stats.projectileDmg, 'arrow');
      en.charging = false;
      en.lastAtk = now;
      playSound('skeletonShoot');
    }
    if (dist < 3.5) {
      safeMove(en, -(dx/dist)*en.stats.speed*0.5*dt, -(dy/dist)*en.stats.speed*0.5*dt, en.stats.radius);
    } else if (dist > 4.5) {
      safeMove(en, (dx/dist)*en.stats.speed*0.5*dt, (dy/dist)*en.stats.speed*0.5*dt, en.stats.radius);
    }
  }
}

let canvas, ctx;
let last = performance.now();

function initGame(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  canvas.width = RENDER_W;
  canvas.height = RENDER_H;
  setupInput();
  initAudio();
  requestAnimationFrame(loop);
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (gameState !== STATE.TRANSITION && gameState !== STATE.INVENTORY && gameState !== STATE.BUFF_SELECT) {
    update(dt);
    render();
  }
  updateHUD();
  if (player.hp <= 0 && gameState !== STATE.DEAD) {
    gameState = STATE.DEAD;
    if (mouseLocked) unlockPointer();
    ctx.fillStyle = 'rgba(100,0,0,0.85)'; ctx.fillRect(0, 0, RENDER_W, RENDER_H);
    ctx.fillStyle = '#ff0000'; ctx.font = 'bold 32px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('ВЫ ПОГИБЛИ', RENDER_W / 2, RENDER_H / 2 - 20);
    ctx.fillStyle = '#ffaa00'; ctx.font = 'italic 16px Courier New';
    ctx.fillText('Но это ещё не конец...', RENDER_W / 2, RENDER_H / 2 + 10);
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Волна ${currentWave} | $${player.money}`, RENDER_W / 2, RENDER_H / 2 + 40);
    ctx.fillText('Обновите страницу чтобы начать заново', RENDER_W / 2, RENDER_H / 2 + 60);
    return;
  }
  requestAnimationFrame(loop);
}