/**
 * DATA.JS — Статические данные игры v1.5
 */

const RENDER_W = 480, RENDER_H = 300;
const FOV = Math.PI / 3;
const EPS = 1e-10;
const MAX_DEPTH = 20;

// ================= КАРТЫ =================
const ARENA_MAP_RAW = [
  "11111111111111111111111111",
  "1........................1",
  "1..1111.......11111......1",
  "1..1..........1...1......1",
  "1..1..1111........1......1",
  "1..1..1..1....1...1......1",
  "1..1..1..1....11111......1",
  "1..1..1..................1",
  "1..1..1..1....11111......1",
  "1..1..1111....1...1......1",
  "1..1..............1......1",
  "1..1111.......11111......1",
  "1........................1",
  "1....1111....1111........1",
  "1....1..........1........1",
  "1....1..1111....1........1",
  "1....1..........1........1",
  "1....1111....1111........1",
  "1........................1",
  "11111111111111111111111111",
];
const ARENA_MAP = ARENA_MAP_RAW.map(r => r.replace(/\./g,'0').split('').map(Number));

const SHOP_MAP_RAW = [
  "111111111111",
  "1..........1",
  "1.T1....T3.1",
  "1..........1",
  "1..........1",
  "1..........1",
  "1..........1",
  "1..........1",
  "1.....D....1",
  "111111111111",
];
const SHOP_MAP_NUM = SHOP_MAP_RAW.map(r => r.split('').map(c => (c === '1') ? 1 : 0));

const BOSS_MAP_RAW = [
  "1111111111111111111111",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1....................1",
  "1111111111111111111111",
];
const BOSS_MAP = BOSS_MAP_RAW.map(r => r.replace(/\./g,'0').split('').map(Number));

const ARENA_SPAWN = { x: 13.5, y: 10.5 };
const SHOP_SPAWN = { x: 6.5, y: 5.5 };
const BOSS_SPAWN = { x: 11, y: 12 };
const BOSS_START_POS = { x: 11, y: 3 };
const PORTAL_POS = { x: 13.5, y: 2.5 };
const DOOR_POS = { x: 6.5, y: 8.5 };

// ================= ОРУЖИЕ =================
const WEAPONS = {
  fists: {
    key: 'fists', name: 'КУЛАКИ', damage: 2, range: 1.8,
    speed: 1.0, price: 0, icon: 'fist', type: 'melee',
    desc: 'Твои верные кулаки.',
    pros: 'Бесплатно', cons: 'Малый урон (2)'
  },
  stick: {
    key: 'stick', name: 'ПАЛКА С ВЕТКОЙ', damage: 5, range: 2.2,
    speed: 0.85, price: 30, icon: 'stick', type: 'melee',
    desc: 'Неровная палка с веткой.',
    pros: '+150% урона', cons: 'Медленнее'
  },
  gloves: {
    key: 'gloves', name: 'БОКСЁРСКИЕ ПЕРЧАТКИ', damage: 8, range: 1.6,
    speed: 1.3, price: 80, icon: 'gloves', type: 'melee',
    desc: 'Тяжёлые перчатки. Быстрые удары.',
    pros: '+300% урона, +скорость', cons: 'Малая дальность'
  },
  fork: {
    key: 'fork', name: 'ВИЛКА', damage: 12, range: 1.8,
    speed: 1.0, price: 200, icon: 'fork', type: 'melee',
    desc: 'Столовая вилка. Колет больно.',
    pros: '+500% урона', cons: 'Средняя скорость'
  },
  knife: {
    key: 'knife', name: 'НОЖ', damage: 18, range: 1.5,
    speed: 1.5, price: 500, icon: 'knife', type: 'melee',
    desc: 'Острый кухонный нож.',
    pros: '+800% урона, +скорость', cons: 'Малая дальность'
  },
  sickle: {
    key: 'sickle', name: 'СЕРП', damage: 25, range: 2.0,
    speed: 0.9, price: 1200, icon: 'sickle', type: 'melee',
    desc: 'Серп жнеца. Смертельное оружие.',
    pros: '+1150% урона', cons: 'Медленный'
  },
  pistol: {
    key: 'pistol', name: 'ПИСТОЛЕТ', damage: 10, range: 10,
    speed: 1.8, price: 1800, icon: 'pistol', type: 'ranged',
    pellets: 1, spread: 0.02, projectileSpeed: 20,
    desc: 'Стандартный 9мм пистолет.',
    pros: 'Дальний бой, скорострельный', cons: 'Средний урон'
  },
  smg: {
    key: 'smg', name: 'ПП', damage: 7, range: 9,
    speed: 4.0, price: 2800, icon: 'smg', type: 'ranged',
    pellets: 1, spread: 0.08, projectileSpeed: 22,
    desc: 'Пистолет-пулемёт. Очередями!',
    pros: 'Очень скорострельный', cons: 'Разброс, малый урон за пулю'
  },
  shotgun: {
    key: 'shotgun', name: 'ДРОБОВИК', damage: 6, range: 5,
    speed: 0.6, price: 3500, icon: 'shotgun', type: 'ranged',
    pellets: 6, spread: 0.25, projectileSpeed: 18,
    desc: 'Двустволка. 6 пуль за выстрел.',
    pros: 'Мощный вблизи, разброс', cons: 'Медленный, малая дальность'
  },
  flamethrower: {
    key: 'flamethrower', name: 'ОГНЕМЁТ', damage: 3, range: 4,
    speed: 12.0, price: 5000, icon: 'flamethrower', type: 'ranged',
    pellets: 3, spread: 0.4, projectileSpeed: 12, burning: true,
    desc: 'Струя пламени. Поджигает врагов.',
    pros: 'Очень скорострельный, поджог', cons: 'Очень малая дальность'
  },
  rocket: {
    key: 'rocket', name: 'РАКЕТНИЦА', damage: 40, range: 15,
    speed: 0.4, price: 7000, icon: 'rocket', type: 'ranged',
    pellets: 1, spread: 0, projectileSpeed: 10, aoe: 2.5,
    desc: 'Стреляет ракетами с взрывом.',
    pros: 'Огромный урон по площади', cons: 'Очень медленная, опасна вблизи'
  },
  gauss: {
    key: 'gauss', name: 'ГАУСС-ПУШКА', damage: 50, range: 15,
    speed: 0.3, price: 9000, icon: 'gauss', type: 'ranged',
    pellets: 1, spread: 0, projectileSpeed: 40, piercing: true,
    desc: 'Электромагнитная пушка. Пробивает врагов.',
    pros: 'Огромный урон, пробитие', cons: 'Очень медленная'
  },
  bfg: {
    key: 'bfg', name: 'БФГ-9000', damage: 100, range: 12,
    speed: 0.15, price: 15000, icon: 'bfg', type: 'ranged',
    pellets: 1, spread: 0, projectileSpeed: 15, aoe: 3,
    desc: 'Bio Force Gun. Массовое уничтожение.',
    pros: 'Ультра-урон, взрыв по площади', cons: 'Очень медленный'
  }
};

// ================= БАФЫ =================
const BUFFS = [
  {
    id: 'random', name: 'ХАОС', color: '#ffaa00', price: 3,
    desc: 'Рандом решает всё (временный)',
    pros: 'Случайный эффект', cons: 'Может быть негативным',
    apply: (p) => {
      const roll = Math.random();
      if (roll < 0.1) { p.damageBonus += 1000; p.maxHp *= 0.5; p.hp = Math.min(p.hp, p.maxHp); }
      else if (roll < 0.3) { p.maxHp -= 20; p.hp = Math.min(p.hp, p.maxHp); }
      else if (roll < 0.5) { p.moveSpeedMult *= 1.5; p.damageBonus -= 3; }
      else if (roll < 0.7) { p.lifeOnKill += 10; p.armor -= 3; }
      else { p.critChance += 0.5; p.attackSpeedMult *= 0.7; }
    }
  },
  {
    id: 'growth', name: 'РОСТ', color: '#44ff44', price: 3,
    desc: 'Изменение размера (временный)',
    pros: 'Случайный рост (-6..+6)', cons: 'Влияет на хитбокс',
    apply: (p) => {
      const g = Math.floor(Math.random() * 13) - 6;
      p.size += g;
      p.moveSpeedMult *= (1 - g * 0.05);
      p.maxHp += g * 5;
      p.hp = Math.min(p.hp, p.maxHp);
    }
  },
  {
    id: 'berserk', name: 'БЕРСЕРК', color: '#ff0066', price: 5,
    desc: 'Кровь кипит! (временный)',
    pros: '+50% урон', cons: '-30% макс HP',
    apply: (p) => { p.damageMult *= 1.5; p.maxHp *= 0.7; p.hp = Math.min(p.hp, p.maxHp); }
  },
  {
    id: 'speed', name: 'УСКОРЕНИЕ', color: '#00ffff', price: 5,
    desc: 'Быстрее ветра (временный)',
    pros: '+40% скорость', cons: '-25% урон',
    apply: (p) => { p.moveSpeedMult *= 1.4; p.damageMult *= 0.75; }
  },
  {
    id: 'vampire', name: 'ВАМПИРИЗМ', color: '#aa00aa', price: 4,
    desc: 'Жизнь за жизнь (временный)',
    pros: '+5 HP за убийство', cons: '-5 макс HP',
    apply: (p) => { p.lifeOnKill += 5; p.maxHp -= 5; p.hp = Math.min(p.hp, p.maxHp); }
  },
  {
    id: 'crit', name: 'КРИТ', color: '#ffff00', price: 5,
    desc: 'Точные удары (временный)',
    pros: '+30% шанс крита (x2)', cons: '-15% точность',
    apply: (p) => { p.critChance += 0.3; p.attackAngleMult *= 0.85; }
  },
  {
    id: 'shield', name: 'ЩИТ', color: '#44aaff', price: 6,
    desc: 'Защитный барьер (временный)',
    pros: '+15 макс HP, +3 броня', cons: '-10% скорость атаки',
    apply: (p) => { p.maxHp += 15; p.hp += 15; p.armor += 3; p.attackSpeedMult *= 0.9; }
  }
];

// ================= ЦЕНЫ =================
function getBuffPrice(wave) { return Math.floor(3 + wave * 1.5); }
function getRerollPrice(wave) { return Math.max(1, Math.floor(getBuffPrice(wave) / 2)); }
function getHealPrice(wave) { return Math.floor(5 + wave * 2); }
function getStrengthPrice(level) { return Math.floor(5 + level * 3); }
function getArmorPrice(level) { return Math.floor(5 + level * 3); }

function getEnemyCount(wave) {
  return Math.floor(3 + wave * 1.5);
}

function getEnemyMoney(baseMoney, wave) {
  return Math.max(1, Math.floor(baseMoney * (1 + wave * 0.35)));
}

function savePlayerStats() {
  return {
    damageBonus: player.damageBonus, damageMult: player.damageMult,
    armor: player.armor, moveSpeedMult: player.moveSpeedMult,
    attackSpeedMult: player.attackSpeedMult, lifeOnKill: player.lifeOnKill,
    critChance: player.critChance, attackAngleMult: player.attackAngleMult,
    maxHp: player.maxHp, hp: player.hp, size: player.size
  };
}

function restorePlayerStats(stats) {
  player.damageBonus = stats.damageBonus;
  player.damageMult = stats.damageMult;
  player.armor = stats.armor;
  player.moveSpeedMult = stats.moveSpeedMult;
  player.attackSpeedMult = stats.attackSpeedMult;
  player.lifeOnKill = stats.lifeOnKill;
  player.critChance = stats.critChance;
  player.attackAngleMult = stats.attackAngleMult;
  player.maxHp = stats.maxHp;
  player.hp = Math.min(player.hp, stats.maxHp);
  player.size = stats.size;
}

// ================= ТОРГОВЦЫ =================
const MERCHANTS = [
  {
    id: 'T1', name: 'Оружейник', x: 2.5, y: 2.5, color: '#ff4444',
    type: 'weapon', greeting: 'Хочешь оружие?',
    items: () => Object.values(WEAPONS).filter(w => {
      if (w.key === 'fists') return false;
      if (player.equippedWeapon === w.key) return false;
      if (player.inventory.storage.some(i => i && i.key === w.key)) return false;
      return true;
    })
  },
  {
    id: 'T3', name: 'Зельевар', x: 9.5, y: 2.5, color: '#aa44ff',
    type: 'potion', greeting: 'Мои зелья исцелят и усилят!',
    items: () => {
      const items = [];
      const healPrice = getHealPrice(currentWave);
      items.push({
        key: null, name: 'ЗЕЛЬЕ ЛЕЧЕНИЯ', color: '#ff4444',
        price: healPrice, desc: 'Полностью восстанавливает HP',
        pros: `HP: ${Math.floor(player.hp)} → ${Math.floor(player.maxHp)}`,
        cons: 'Тратит деньги',
        apply: (p) => { p.hp = p.maxHp; }
      });
      const strLevel = player.strengthLevel || 0;
      if (strLevel < 100) {
        items.push({
          key: null, name: `СИЛА УР.${strLevel + 1}`, color: '#ff8844',
          price: getStrengthPrice(strLevel),
          desc: `Уровень ${strLevel}/100 → ${strLevel + 1}/100`,
          pros: `+0.3 урон`, cons: 'Цена растёт',
          apply: (p) => { p.strengthLevel = (p.strengthLevel || 0) + 1; p.damageBonus += 0.3; }
        });
      }
      const armLevel = player.armorLevel || 0;
      if (armLevel < 100) {
        items.push({
          key: null, name: `БРОНЯ УР.${armLevel + 1}`, color: '#4488ff',
          price: getArmorPrice(armLevel),
          desc: `Уровень ${armLevel}/100 → ${armLevel + 1}/100`,
          pros: `+0.5 броня`, cons: 'Цена растёт',
          apply: (p) => { p.armorLevel = (p.armorLevel || 0) + 1; p.armor += 0.5; }
        });
      }
      return items;
    }
  }
];

// ================= ВРАГИ =================
const ENEMY_TYPES = {
  green: {
    name: 'Зелёный слизень', hp: 24, speed: 1.0,
    dmgMin: 3, dmgMax: 7, cd: 3000, range: 1.2, radius: 0.3,
    color: '#44ff44', money: 15, texKey: 'slime', ai: 'melee',
    dropChance: 0.08
  },
  blue: {
    name: 'Синий слизень', hp: 12, speed: 2.5,
    dmgMin: 2, dmgMax: 4, cd: 2000, range: 1.0, radius: 0.25,
    color: '#44aaff', money: 20, texKey: 'slimeBlue', ai: 'melee',
    dropChance: 0.06
  },
  red: {
    name: 'Красный слизень', hp: 60, speed: 0.5,
    dmgMin: 8, dmgMax: 15, cd: 4000, range: 1.4, radius: 0.4,
    color: '#ff4444', money: 50, texKey: 'slimeRed', ai: 'melee',
    dropChance: 0.15
  },
  skeleton: {
    name: 'Скелет-лучник', hp: 15, speed: 1.2,
    dmgMin: 2, dmgMax: 2, cd: 1500, range: 2.0, radius: 0.3,
    color: '#ddddaa', money: 25, texKey: 'skeleton', ai: 'ranged',
    shootCd: 3000, chargeTime: 1000, projectileSpeed: 6, projectileDmg: 5,
    preferredDist: 5, tooCloseDist: 3,
    dropChance: 0.1
  },
  turret: {
    name: 'Турель', hp: 80, speed: 0,
    dmgMin: 4, dmgMax: 8, cd: 800, range: 1.0, radius: 0.5,
    color: '#888888', money: 40, texKey: 'turret', ai: 'turret',
    shootCd: 800, chargeTime: 0, projectileSpeed: 15, projectileDmg: 4,
    preferredDist: 8, armor: 5,
    dropChance: 0.12
  },
  necromancer: {
    name: 'Некромант', hp: 30, speed: 0.8,
    dmgMin: 0, dmgMax: 0, cd: 5000, range: 8.0, radius: 0.35,
    color: '#aa44ff', money: 35, texKey: 'necromancer', ai: 'necromancer',
    spawnCd: 5000, spawnRange: 6,
    preferredDist: 7, tooCloseDist: 4,
    dropChance: 0.15
  },
  mage: {
    name: 'Огненный маг', hp: 20, speed: 1.0,
    dmgMin: 0, dmgMax: 0, cd: 2500, range: 2.0, radius: 0.3,
    color: '#ff8844', money: 30, texKey: 'mage', ai: 'mage',
    shootCd: 2500, chargeTime: 800, projectileSpeed: 5, projectileDmg: 8,
    aoeRadius: 1.5, preferredDist: 6, tooCloseDist: 3,
    dropChance: 0.12
  },
  spiky: {
    name: 'Шипастый', hp: 40, speed: 0.3,
    dmgMin: 10, dmgMax: 10, cd: 500, range: 1.3, radius: 0.45,
    color: '#aa8800', money: 25, texKey: 'spiky', ai: 'spiky',
    contactDmg: 5,
    dropChance: 0.1
  }
};

// ================= БОСС =================
const BOSS_STATS = {
  name: 'ПОВЕЛИТЕЛЬ ПЛАМЕНИ',
  hp: 600,
  speed: 1.5,
  radius: 1.0,
  attackDamage: 20,
  attackRange: 3.0,
  aoeRadius: 3.5,
  chargeTime: 1.5,
  strikeTime: 0.5,
  stuckTime: 7.0,
  recoverTime: 1.5,
  fireballDmg: 10,
  fireballSpeed: 8,
  fireballCd: 3000
};

// ================= ТЕКСТУРЫ =================
function makeTex(type, color) {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const t = c.getContext('2d');
  t.imageSmoothingEnabled = false;
  
  if(type === 'wall') {
    t.fillStyle = '#2a0a0a'; t.fillRect(0,0,s,s);
    for(let y=0; y<s; y+=16) {
      const off = (y/16)%2 ? 8 : 0;
      for(let x=-8; x<s; x+=16) {
        const sh = 30 + Math.random()*40;
        t.fillStyle = `rgb(${sh+80},${sh/2},${sh/4})`;
        t.fillRect(x+off+1, y+1, 14, 14);
        t.strokeStyle = 'rgba(0,0,0,0.6)'; t.strokeRect(x+off+1, y+1, 14, 14);
      }
    }
  } else if (type === 'shopwall') {
    t.fillStyle = '#0a0a2a'; t.fillRect(0,0,s,s);
    for(let y=0; y<s; y+=16) {
      const off = (y/16)%2 ? 8 : 0;
      for(let x=-8; x<s; x+=16) {
        const sh = 30 + Math.random()*30;
        t.fillStyle = `rgb(${sh/3},${sh/3},${sh+60})`;
        t.fillRect(x+off+1, y+1, 14, 14);
        t.strokeStyle = 'rgba(255,200,0,0.3)'; t.strokeRect(x+off+1, y+1, 14, 14);
      }
    }
    t.fillStyle = 'rgba(255,200,0,0.4)'; t.fillRect(0, 30, s, 2);
  } else if (type === 'bosswall') {
    t.fillStyle = '#1a0505'; t.fillRect(0,0,s,s);
    for(let y=0; y<s; y+=16) {
      const off = (y/16)%2 ? 8 : 0;
      for(let x=-8; x<s; x+=16) {
        const sh = 15 + Math.random()*20;
        t.fillStyle = `rgb(${sh+40},${sh},${sh})`;
        t.fillRect(x+off+1, y+1, 14, 14);
        t.strokeStyle = 'rgba(200,50,0,0.5)'; t.strokeRect(x+off+1, y+1, 14, 14);
      }
    }
    t.fillStyle = 'rgba(255,100,0,0.4)';
    t.fillRect(28, 28, 8, 2); t.fillRect(30, 24, 4, 10);
  } else if (type.startsWith('slime')) {
    const baseColor = type === 'slimeBlue' ? ['#44aaff','#0044aa'] :
                      type === 'slimeRed' ? ['#ff4444','#880000'] :
                      ['#aaff44','#226611'];
    const headColor = type === 'slimeBlue' ? ['#66ccff','#2288dd'] :
                      type === 'slimeRed' ? ['#ff6666','#aa2222'] :
                      ['#ccff66','#55cc33'];
    t.clearRect(0,0,s,s);
    const g = t.createRadialGradient(s/2,s*0.6,5,s/2,s*0.6,25);
    g.addColorStop(0, baseColor[0]); g.addColorStop(1, baseColor[1]);
    t.fillStyle = g; t.beginPath(); t.ellipse(s/2,s*0.7,22,18,0,0,Math.PI*2); t.fill();
    const hg = t.createRadialGradient(s/2,s*0.4,3,s/2,s*0.4,18);
    hg.addColorStop(0, headColor[0]); hg.addColorStop(1, headColor[1]);
    t.fillStyle = hg; t.beginPath(); t.ellipse(s/2,s*0.45,16,14,0,0,Math.PI*2); t.fill();
    t.fillStyle = '#fff';
    t.beginPath(); t.arc(s*0.35,s*0.4,3,0,Math.PI*2); t.arc(s*0.65,s*0.4,3,0,Math.PI*2); t.fill();
    t.fillStyle = '#000';
    t.beginPath(); t.arc(s*0.35,s*0.4,1.5,0,Math.PI*2); t.arc(s*0.65,s*0.4,1.5,0,Math.PI*2); t.fill();
  } else if (type === 'skeleton' || type === 'skeletonCharging') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#e8e0c8';
    t.fillRect(24, 48, 4, 14);
    t.fillRect(36, 48, 4, 14);
    t.fillStyle = '#d8d0b8';
    t.fillRect(22, 28, 20, 22);
    t.strokeStyle = '#8a8070'; t.lineWidth = 1;
    for(let i=0; i<4; i++) {
      t.beginPath(); t.moveTo(22, 30 + i*5); t.lineTo(42, 30 + i*5); t.stroke();
    }
    t.fillStyle = '#e8e0c8';
    t.fillRect(31, 28, 2, 22);
    t.fillStyle = '#f0e8d0';
    t.beginPath(); t.arc(32, 18, 10, 0, Math.PI*2); t.fill();
    t.strokeStyle = '#8a8070'; t.lineWidth = 1;
    t.beginPath(); t.arc(32, 18, 10, 0, Math.PI*2); t.stroke();
    t.fillStyle = '#000';
    t.beginPath(); t.arc(28, 18, 2, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(36, 18, 2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ff3333';
    t.beginPath(); t.arc(28, 18, 1, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(36, 18, 1, 0, Math.PI*2); t.fill();
    t.fillStyle = '#000';
    t.fillRect(28, 23, 2, 2); t.fillRect(32, 23, 2, 2); t.fillRect(36, 23, 2, 2);
    t.strokeStyle = '#e8e0c8'; t.lineWidth = 3;
    t.beginPath(); t.moveTo(22, 30); t.lineTo(12, 32); t.stroke();
    t.strokeStyle = '#6b4423'; t.lineWidth = 2;
    t.beginPath(); t.arc(8, 32, 14, -Math.PI/2 - 0.6, Math.PI/2 + 0.6, false); t.stroke();
    t.strokeStyle = '#fff'; t.lineWidth = 1;
    if (type === 'skeletonCharging') {
      t.beginPath(); t.moveTo(8, 18); t.quadraticCurveTo(20, 32, 8, 46); t.stroke();
      t.strokeStyle = '#8b6f47'; t.lineWidth = 2;
      t.beginPath(); t.moveTo(18, 32); t.lineTo(38, 32); t.stroke();
      t.fillStyle = '#aaa';
      t.beginPath(); t.moveTo(38, 30); t.lineTo(42, 32); t.lineTo(38, 34); t.closePath(); t.fill();
    } else {
      t.beginPath(); t.moveTo(8, 18); t.lineTo(8, 46); t.stroke();
    }
    t.strokeStyle = '#e8e0c8'; t.lineWidth = 3;
    t.beginPath(); t.moveTo(42, 30); t.lineTo(48, 38); t.stroke();
  } else if (type === 'turret') {
    t.clearRect(0,0,s,s);
    // Основание
    t.fillStyle = '#555';
    t.fillRect(18, 50, 28, 10);
    t.strokeStyle = '#333'; t.lineWidth = 1;
    t.strokeRect(18, 50, 28, 10);
    // Стойка
    t.fillStyle = '#666';
    t.fillRect(28, 30, 8, 20);
    t.strokeStyle = '#444'; t.strokeRect(28, 30, 8, 20);
    // Голова (пушка)
    t.fillStyle = '#888';
    t.fillRect(20, 20, 24, 14);
    t.strokeStyle = '#444';
    t.strokeRect(20, 20, 24, 14);
    // Ствол
    t.fillStyle = '#444';
    t.fillRect(44, 24, 12, 6);
    t.strokeStyle = '#222';
    t.strokeRect(44, 24, 12, 6);
    // Красный глаз/сенсор
    t.fillStyle = '#ff0000';
    t.beginPath(); t.arc(32, 27, 3, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ffff00';
    t.beginPath(); t.arc(32, 27, 1.5, 0, Math.PI*2); t.fill();
    // Бронепластины
    t.fillStyle = '#777';
    t.fillRect(22, 22, 4, 10);
    t.fillRect(38, 22, 4, 10);
  } else if (type === 'necromancer') {
    t.clearRect(0,0,s,s);
    // Мантия (фиолетовая)
    t.fillStyle = '#6a1a9a';
    t.beginPath();
    t.moveTo(32, 20);
    t.lineTo(16, 58);
    t.lineTo(48, 58);
    t.closePath();
    t.fill();
    t.strokeStyle = '#4a0a6a'; t.lineWidth = 1;
    t.beginPath();
    t.moveTo(32, 20); t.lineTo(16, 58); t.lineTo(48, 58); t.closePath();
    t.stroke();
    // Капюшон
    t.fillStyle = '#4a0a6a';
    t.beginPath();
    t.arc(32, 18, 12, 0, Math.PI*2);
    t.fill();
    // Глаза (светящиеся зелёные)
    t.fillStyle = '#44ff44';
    t.beginPath(); t.arc(28, 18, 2, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(36, 18, 2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ffffff';
    t.beginPath(); t.arc(28, 18, 1, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(36, 18, 1, 0, Math.PI*2); t.fill();
    // Посох
    t.strokeStyle = '#3a2a1a'; t.lineWidth = 2;
    t.beginPath(); t.moveTo(46, 25); t.lineTo(50, 58); t.stroke();
    // Череп на посохе
    t.fillStyle = '#e8e0c8';
    t.beginPath(); t.arc(46, 22, 5, 0, Math.PI*2); t.fill();
    t.fillStyle = '#000';
    t.beginPath(); t.arc(44, 22, 1, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(48, 22, 1, 0, Math.PI*2); t.fill();
    // Магическая аура
    t.strokeStyle = 'rgba(170, 68, 255, 0.6)';
    t.lineWidth = 1;
    t.beginPath(); t.arc(32, 35, 18, 0, Math.PI*2); t.stroke();
  } else if (type === 'mage' || type === 'mageCharging') {
    t.clearRect(0,0,s,s);
    // Мантия (оранжево-красная)
    t.fillStyle = '#cc4400';
    t.beginPath();
    t.moveTo(32, 20);
    t.lineTo(18, 58);
    t.lineTo(46, 58);
    t.closePath();
    t.fill();
    t.strokeStyle = '#882200'; t.lineWidth = 1;
    t.beginPath();
    t.moveTo(32, 20); t.lineTo(18, 58); t.lineTo(46, 58); t.closePath();
    t.stroke();
    // Голова
    t.fillStyle = '#dcb';
    t.beginPath(); t.arc(32, 18, 8, 0, Math.PI*2); t.fill();
    // Борода
    t.fillStyle = '#fff';
    t.beginPath();
    t.moveTo(28, 22); t.lineTo(32, 28); t.lineTo(36, 22);
    t.closePath();
    t.fill();
    // Глаза
    t.fillStyle = '#ff8844';
    t.beginPath(); t.arc(29, 17, 1.5, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(35, 17, 1.5, 0, Math.PI*2); t.fill();
    // Руки с огнём
    t.strokeStyle = '#dcb'; t.lineWidth = 2;
    t.beginPath(); t.moveTo(22, 30); t.lineTo(14, 26); t.stroke();
    t.beginPath(); t.moveTo(42, 30); t.lineTo(50, 26); t.stroke();
    // Огненные шары в руках
    if (type === 'mageCharging') {
      // Большие огненные шары
      const g1 = t.createRadialGradient(14, 22, 1, 14, 22, 6);
      g1.addColorStop(0, '#ffffff');
      g1.addColorStop(0.3, '#ffff00');
      g1.addColorStop(0.7, '#ff8800');
      g1.addColorStop(1, '#ff0000');
      t.fillStyle = g1;
      t.beginPath(); t.arc(14, 22, 6, 0, Math.PI*2); t.fill();
      
      const g2 = t.createRadialGradient(50, 22, 1, 50, 22, 6);
      g2.addColorStop(0, '#ffffff');
      g2.addColorStop(0.3, '#ffff00');
      g2.addColorStop(0.7, '#ff8800');
      g2.addColorStop(1, '#ff0000');
      t.fillStyle = g2;
      t.beginPath(); t.arc(50, 22, 6, 0, Math.PI*2); t.fill();
    } else {
      // Маленькие огоньки
      t.fillStyle = '#ff8844';
      t.beginPath(); t.arc(14, 24, 3, 0, Math.PI*2); t.fill();
      t.beginPath(); t.arc(50, 24, 3, 0, Math.PI*2); t.fill();
    }
  } else if (type === 'spiky') {
    t.clearRect(0,0,s,s);
    // Тело (круглое, коричнево-жёлтое)
    t.fillStyle = '#8a6a2a';
    t.beginPath(); t.arc(32, 38, 18, 0, Math.PI*2); t.fill();
    t.strokeStyle = '#5a4a1a'; t.lineWidth = 2;
    t.beginPath(); t.arc(32, 38, 18, 0, Math.PI*2); t.stroke();
    // Шипы (в разные стороны)
    t.fillStyle = '#444';
    const spikes = [
      {x: 32, y: 18, angle: 0},
      {x: 46, y: 28, angle: Math.PI/4},
      {x: 50, y: 38, angle: Math.PI/2},
      {x: 46, y: 48, angle: 3*Math.PI/4},
      {x: 32, y: 58, angle: Math.PI},
      {x: 18, y: 48, angle: 5*Math.PI/4},
      {x: 14, y: 38, angle: 3*Math.PI/2},
      {x: 18, y: 28, angle: 7*Math.PI/4},
    ];
    spikes.forEach(sp => {
      t.save();
      t.translate(sp.x, sp.y);
      t.rotate(sp.angle);
      t.beginPath();
      t.moveTo(0, 0);
      t.lineTo(-4, -8);
      t.lineTo(4, -8);
      t.closePath();
      t.fill();
      t.restore();
    });
    // Глаза (злые)
    t.fillStyle = '#ff0000';
    t.beginPath(); t.arc(26, 34, 2.5, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(38, 34, 2.5, 0, Math.PI*2); t.fill();
    t.fillStyle = '#000';
    t.beginPath(); t.arc(26, 34, 1, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(38, 34, 1, 0, Math.PI*2); t.fill();
    // Рот (зубы)
    t.fillStyle = '#000';
    t.fillRect(28, 42, 8, 2);
    t.fillStyle = '#fff';
    t.fillRect(29, 42, 1, 2);
    t.fillRect(32, 42, 1, 2);
    t.fillRect(35, 42, 1, 2);
  } else if (type === 'boss') {
    // ПОВЕЛИТЕЛЬ ПЛАМЕНИ - огромный огненный демон
    t.clearRect(0,0,s,s);
    
    // Аура огня вокруг
    const aura = t.createRadialGradient(s/2, s/2, 10, s/2, s/2, 32);
    aura.addColorStop(0, 'rgba(255,100,0,0)');
    aura.addColorStop(0.7, 'rgba(255,100,0,0.2)');
    aura.addColorStop(1, 'rgba(255,0,0,0.4)');
    t.fillStyle = aura;
    t.beginPath(); t.arc(s/2, s/2, 32, 0, Math.PI*2); t.fill();
    
    // Ноги (массивные)
    t.fillStyle = '#2a0a0a';
    t.fillRect(20, 48, 10, 16);
    t.fillRect(34, 48, 10, 16);
    t.strokeStyle = '#000'; t.lineWidth = 1;
    t.strokeRect(20, 48, 10, 16);
    t.strokeRect(34, 48, 10, 16);
    
    // Торс (огромный, огненный)
    const body = t.createRadialGradient(s/2, 30, 5, s/2, 30, 20);
    body.addColorStop(0, '#ff6600');
    body.addColorStop(0.5, '#cc3300');
    body.addColorStop(1, '#661100');
    t.fillStyle = body;
    t.beginPath();
    t.moveTo(14, 20);
    t.lineTo(50, 20);
    t.lineTo(52, 48);
    t.lineTo(12, 48);
    t.closePath();
    t.fill();
    t.strokeStyle = '#000'; t.lineWidth = 2;
    t.stroke();
    
    // Символ на груди (пентаграмма огня)
    t.strokeStyle = '#ffff00';
    t.lineWidth = 1.5;
    t.beginPath();
    t.moveTo(32, 26);
    t.lineTo(28, 36);
    t.lineTo(36, 30);
    t.lineTo(28, 30);
    t.lineTo(36, 36);
    t.closePath();
    t.stroke();
    
    // Плечи с шипами
    t.fillStyle = '#661100';
    t.beginPath();
    t.moveTo(10, 20); t.lineTo(16, 14); t.lineTo(16, 26); t.closePath();
    t.fill();
    t.beginPath();
    t.moveTo(54, 20); t.lineTo(48, 14); t.lineTo(48, 26); t.closePath();
    t.fill();
    
    // Рога (большие, изогнутые)
    t.fillStyle = '#1a0a0a';
    t.beginPath();
    t.moveTo(20, 12);
    t.quadraticCurveTo(16, 4, 22, 2);
    t.lineTo(24, 8);
    t.closePath();
    t.fill();
    t.beginPath();
    t.moveTo(44, 12);
    t.quadraticCurveTo(48, 4, 42, 2);
    t.lineTo(40, 8);
    t.closePath();
    t.fill();
    
    // Голова (демоническая)
    t.fillStyle = '#aa2200';
    t.beginPath();
    t.arc(32, 14, 12, 0, Math.PI*2);
    t.fill();
    t.strokeStyle = '#000'; t.lineWidth = 1;
    t.stroke();
    
    // Глаза (горят огнём)
    const eyeGlow = t.createRadialGradient(28, 13, 1, 28, 13, 4);
    eyeGlow.addColorStop(0, '#ffffff');
    eyeGlow.addColorStop(0.3, '#ffff00');
    eyeGlow.addColorStop(1, '#ff6600');
    t.fillStyle = eyeGlow;
    t.beginPath(); t.arc(28, 13, 3, 0, Math.PI*2); t.fill();
    
    const eyeGlow2 = t.createRadialGradient(36, 13, 1, 36, 13, 4);
    eyeGlow2.addColorStop(0, '#ffffff');
    eyeGlow2.addColorStop(0.3, '#ffff00');
    eyeGlow2.addColorStop(1, '#ff6600');
    t.fillStyle = eyeGlow2;
    t.beginPath(); t.arc(36, 13, 3, 0, Math.PI*2); t.fill();
    
    // Пасть с клыками
    t.fillStyle = '#000';
    t.beginPath();
    t.moveTo(26, 20);
    t.lineTo(38, 20);
    t.lineTo(32, 24);
    t.closePath();
    t.fill();
    // Клыки
    t.fillStyle = '#fff';
    t.beginPath();
    t.moveTo(28, 20); t.lineTo(28, 23); t.lineTo(30, 20); t.closePath();
    t.fill();
    t.beginPath();
    t.moveTo(34, 20); t.lineTo(34, 23); t.lineTo(36, 20); t.closePath();
    t.fill();
    
    // Руки (мощные)
    t.fillStyle = '#aa2200';
    t.fillRect(8, 28, 8, 18);
    t.fillRect(48, 28, 8, 18);
    t.strokeStyle = '#000';
    t.strokeRect(8, 28, 8, 18);
    t.strokeRect(48, 28, 8, 18);
    
    // Огненный меч в правой руке
    // Рукоять
    t.fillStyle = '#3a2a1a';
    t.fillRect(52, 38, 4, 14);
    // Лезвие (пламя)
    const blade = t.createLinearGradient(54, 20, 58, 38);
    blade.addColorStop(0, '#ffffff');
    blade.addColorStop(0.3, '#ffff00');
    blade.addColorStop(0.7, '#ff6600');
    blade.addColorStop(1, '#ff0000');
    t.fillStyle = blade;
    t.beginPath();
    t.moveTo(52, 38);
    t.lineTo(54, 16);
    t.quadraticCurveTo(56, 10, 58, 16);
    t.lineTo(58, 38);
    t.closePath();
    t.fill();
  } else if (type === 'bossStuck') {
    // Босс с мечом в земле
    t.clearRect(0,0,s,s);
    
    // Меч застрял в земле (внизу)
    const blade = t.createLinearGradient(32, 48, 32, 64);
    blade.addColorStop(0, '#ffffff');
    blade.addColorStop(0.5, '#ffff00');
    blade.addColorStop(1, '#ff6600');
    t.fillStyle = blade;
    t.fillRect(30, 48, 4, 16);
    
    // Ноги
    t.fillStyle = '#2a0a0a';
    t.fillRect(20, 48, 10, 16);
    t.fillRect(34, 48, 10, 16);
    
    // Торс (наклонён)
    t.save();
    t.translate(32, 30);
    t.rotate(0.2);
    const body = t.createRadialGradient(0, 0, 5, 0, 0, 20);
    body.addColorStop(0, '#ff6600');
    body.addColorStop(0.5, '#cc3300');
    body.addColorStop(1, '#661100');
    t.fillStyle = body;
    t.beginPath();
    t.moveTo(-18, -10);
    t.lineTo(18, -10);
    t.lineTo(20, 18);
    t.lineTo(-20, 18);
    t.closePath();
    t.fill();
    t.restore();
    
    // Голова (опущена)
    t.fillStyle = '#aa2200';
    t.beginPath(); t.arc(32, 20, 10, 0, Math.PI*2); t.fill();
    // Тусклые глаза
    t.fillStyle = '#882200';
    t.beginPath(); t.arc(28, 20, 2, 0, Math.PI*2); t.fill();
    t.beginPath(); t.arc(36, 20, 2, 0, Math.PI*2); t.fill();
  } else if (type === 'portal') {
    t.clearRect(0,0,s,s);
    const g = t.createRadialGradient(s/2,s/2,5,s/2,s/2,30);
    g.addColorStop(0,'#ffffff'); g.addColorStop(0.3,'#ff66ff');
    g.addColorStop(0.7,'#8800ff'); g.addColorStop(1,'rgba(0,0,0,0)');
    t.fillStyle = g; t.beginPath(); t.arc(s/2,s/2,30,0,Math.PI*2); t.fill();
    t.strokeStyle = 'rgba(255,200,255,0.6)'; t.lineWidth = 2;
    for(let i=0; i<3; i++) {
      t.beginPath();
      for(let a=0; a<Math.PI*2; a+=0.1) {
        const r = 5 + a*3 + i*5;
        const x = s/2 + Math.cos(a + i*2)*r;
        const y = s/2 + Math.sin(a + i*2)*r;
        if(a===0) t.moveTo(x,y); else t.lineTo(x,y);
      }
      t.stroke();
    }
  } else if (type === 'door') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#5a3a1a'; t.fillRect(10, 5, 44, 55);
    t.strokeStyle = '#3a2010'; t.lineWidth = 2; t.strokeRect(10, 5, 44, 55);
    for(let y=15; y<60; y+=10) { t.beginPath(); t.moveTo(10,y); t.lineTo(54,y); t.stroke(); }
    t.fillStyle = '#ffcc00';
    t.beginPath(); t.arc(45, 35, 3, 0, Math.PI*2); t.fill();
  } else if (type === 'merchant') {
    t.clearRect(0,0,s,s);
    t.fillStyle = color;
    t.beginPath(); t.moveTo(s/2, 15); t.lineTo(s/2-18, 55); t.lineTo(s/2+18, 55); t.closePath(); t.fill();
    t.fillStyle = '#dcb';
    t.beginPath(); t.arc(s/2, 18, 8, 0, Math.PI*2); t.fill();
    t.fillStyle = color;
    t.beginPath(); t.arc(s/2, 15, 10, Math.PI, Math.PI*2); t.fill();
    t.fillStyle = '#fff';
    t.beginPath(); t.arc(s/2-3, 18, 1.5, 0, Math.PI*2); t.arc(s/2+3, 18, 1.5, 0, Math.PI*2); t.fill();
  } else if (type === 'bullet') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#ffcc00';
    t.beginPath(); t.arc(s/2, s/2, 8, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ffffff';
    t.beginPath(); t.arc(s/2, s/2, 4, 0, Math.PI*2); t.fill();
  } else if (type === 'bulletGauss') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#00ffff';
    t.beginPath(); t.arc(s/2, s/2, 12, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ffffff';
    t.beginPath(); t.arc(s/2, s/2, 6, 0, Math.PI*2); t.fill();
    t.strokeStyle = 'rgba(0,255,255,0.5)';
    t.lineWidth = 2;
    t.beginPath(); t.arc(s/2, s/2, 16, 0, Math.PI*2); t.stroke();
  } else if (type === 'bulletBfg') {
    t.clearRect(0,0,s,s);
    const g = t.createRadialGradient(s/2,s/2,5,s/2,s/2,20);
    g.addColorStop(0,'#ffffff'); g.addColorStop(0.5,'#44ff44');
    g.addColorStop(1,'rgba(0,255,0,0)');
    t.fillStyle = g; t.beginPath(); t.arc(s/2, s/2, 20, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ffffff';
    t.beginPath(); t.arc(s/2, s/2, 8, 0, Math.PI*2); t.fill();
  } else if (type === 'rocket') {
    t.clearRect(0,0,s,s);
    // Корпус ракеты
    t.fillStyle = '#888';
    t.fillRect(s/2-4, 10, 8, 30);
    t.strokeStyle = '#444'; t.lineWidth = 1;
    t.strokeRect(s/2-4, 10, 8, 30);
    // Нос
    t.fillStyle = '#cc2222';
    t.beginPath();
    t.moveTo(s/2-4, 10);
    t.lineTo(s/2, 4);
    t.lineTo(s/2+4, 10);
    t.closePath();
    t.fill();
    // Плавники
    t.fillStyle = '#cc2222';
    t.beginPath();
    t.moveTo(s/2-4, 38);
    t.lineTo(s/2-8, 44);
    t.lineTo(s/2-4, 40);
    t.closePath();
    t.fill();
    t.beginPath();
    t.moveTo(s/2+4, 38);
    t.lineTo(s/2+8, 44);
    t.lineTo(s/2+4, 40);
    t.closePath();
    t.fill();
    // Пламя сзади
    const flame = t.createLinearGradient(s/2, 40, s/2, 52);
    flame.addColorStop(0, '#ffff00');
    flame.addColorStop(0.5, '#ff6600');
    flame.addColorStop(1, 'rgba(255,0,0,0)');
    t.fillStyle = flame;
    t.beginPath();
    t.moveTo(s/2-4, 40);
    t.quadraticCurveTo(s/2, 54, s/2+4, 40);
    t.closePath();
    t.fill();
  } else if (type === 'fireball') {
    t.clearRect(0,0,s,s);
    const g = t.createRadialGradient(s/2,s/2,3,s/2,s/2,16);
    g.addColorStop(0,'#ffffff');
    g.addColorStop(0.3,'#ffff00');
    g.addColorStop(0.7,'#ff6600');
    g.addColorStop(1,'rgba(255,0,0,0)');
    t.fillStyle = g;
    t.beginPath(); t.arc(s/2, s/2, 16, 0, Math.PI*2); t.fill();
  } else if (type === 'fire') {
    t.clearRect(0,0,s,s);
    const g = t.createRadialGradient(s/2,s/2,2,s/2,s/2,10);
    g.addColorStop(0,'#ffffff');
    g.addColorStop(0.4,'#ffff00');
    g.addColorStop(0.8,'#ff6600');
    g.addColorStop(1,'rgba(255,0,0,0)');
    t.fillStyle = g;
    t.beginPath(); t.arc(s/2, s/2, 10, 0, Math.PI*2); t.fill();
  } else if (type === 'arrow') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#8b6f47';
    t.fillRect(s/2-1, 10, 2, 35);
    t.fillStyle = '#ddddaa';
    t.beginPath();
    t.moveTo(s/2-3, 44); t.lineTo(s/2, 40); t.lineTo(s/2+3, 44);
    t.closePath(); t.fill();
    t.beginPath();
    t.moveTo(s/2-3, 46); t.lineTo(s/2, 42); t.lineTo(s/2+3, 46);
    t.closePath(); t.fill();
    t.fillStyle = '#aaa';
    t.beginPath();
    t.moveTo(s/2-3, 10); t.lineTo(s/2, 4); t.lineTo(s/2+3, 10);
    t.closePath(); t.fill();
    t.strokeStyle = '#666'; t.stroke();
  } else if (type === 'healthpack') {
    t.clearRect(0,0,s,s);
    // Коробка
    t.fillStyle = '#ffffff';
    t.fillRect(s/2-12, s/2-12, 24, 24);
    t.strokeStyle = '#888'; t.lineWidth = 1;
    t.strokeRect(s/2-12, s/2-12, 24, 24);
    // Красный крест
    t.fillStyle = '#ff0000';
    t.fillRect(s/2-2, s/2-8, 4, 16);
    t.fillRect(s/2-8, s/2-2, 16, 4);
    // Свечение
    t.strokeStyle = 'rgba(0,255,0,0.4)';
    t.lineWidth = 2;
    t.beginPath(); t.arc(s/2, s/2, 16, 0, Math.PI*2); t.stroke();
  } else if (type === 'barrel') {
    t.clearRect(0,0,s,s);
    // Бочка (красная)
    t.fillStyle = '#cc2222';
    t.beginPath(); t.ellipse(s/2, s*0.65, 18, 16, 0, 0, Math.PI*2); t.fill();
    t.strokeStyle = '#880000'; t.lineWidth = 2;
    t.stroke();
    // Полосы
    t.strokeStyle = '#ffff00'; t.lineWidth = 1;
    t.beginPath(); t.ellipse(s/2, s*0.55, 18, 4, 0, 0, Math.PI*2); t.stroke();
    t.beginPath(); t.ellipse(s/2, s*0.75, 18, 4, 0, 0, Math.PI*2); t.stroke();
    // Символ опасности
    t.fillStyle = '#ffff00';
    t.font = 'bold 14px Arial';
    t.textAlign = 'center';
    t.fillText('⚠', s/2, s*0.7);
  } else if (type === 'fist') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#dcb';
    t.beginPath(); t.roundRect(10, 15, 44, 35, 8); t.fill();
    t.fillStyle = '#cba'; t.fillRect(12, 18, 40, 10);
    t.strokeStyle = '#a98'; t.lineWidth = 2;
    t.beginPath(); 
    t.moveTo(22,18); t.lineTo(22,50); 
    t.moveTo(32,18); t.lineTo(32,50); 
    t.moveTo(42,18); t.lineTo(42,50); 
    t.stroke();
  } else if (type === 'stick') {
    t.clearRect(0,0,s,s);
    t.strokeStyle = '#6b4423';
    t.lineWidth = 4; t.lineCap = 'round';
    t.beginPath();
    t.moveTo(16, 4); t.quadraticCurveTo(20, 20, 18, 35);
    t.quadraticCurveTo(16, 50, 20, 60); t.stroke();
    t.strokeStyle = '#5a3a1a'; t.lineWidth = 3;
    t.beginPath(); t.moveTo(19, 25); t.quadraticCurveTo(28, 22, 32, 18); t.stroke();
    t.lineWidth = 2;
    t.beginPath(); t.moveTo(28, 20); t.lineTo(30, 14); t.stroke();
    t.beginPath(); t.moveTo(17, 45); t.lineTo(12, 48); t.stroke();
  } else if (type === 'gloves') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#cc2222';
    t.beginPath(); t.ellipse(14, 20, 10, 12, -0.2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#aa1111'; t.fillRect(10, 28, 8, 10);
    t.fillStyle = '#cc2222';
    t.beginPath(); t.ellipse(50, 20, 10, 12, 0.2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#aa1111'; t.fillRect(46, 28, 8, 10);
    t.fillStyle = 'rgba(255,255,255,0.3)';
    t.beginPath();
    t.ellipse(12, 16, 4, 5, -0.2, 0, Math.PI*2);
    t.ellipse(48, 16, 4, 5, 0.2, 0, Math.PI*2); t.fill();
  } else if (type === 'fork') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#888'; t.fillRect(29, 20, 6, 38);
    t.fillStyle = '#aaa';
    for(let i=0; i<4; i++) t.fillRect(26 + i*3, 4, 2, 18);
    t.fillStyle = '#888'; t.fillRect(25, 18, 14, 4);
    t.fillStyle = 'rgba(255,255,255,0.4)'; t.fillRect(30, 22, 2, 34);
  } else if (type === 'knife') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#ccc';
    t.beginPath();
    t.moveTo(30, 4); t.lineTo(34, 4); t.lineTo(34, 30); t.lineTo(30, 32);
    t.closePath(); t.fill();
    t.fillStyle = '#eee';
    t.beginPath(); t.moveTo(30, 4); t.lineTo(34, 4); t.lineTo(32, 2); t.closePath(); t.fill();
    t.fillStyle = '#4a2a0a'; t.fillRect(29, 32, 6, 26);
    t.fillStyle = '#888';
    t.beginPath();
    t.arc(32, 36, 1, 0, Math.PI*2);
    t.arc(32, 45, 1, 0, Math.PI*2);
    t.arc(32, 54, 1, 0, Math.PI*2); t.fill();
    t.fillStyle = 'rgba(255,255,255,0.5)'; t.fillRect(31, 6, 1, 24);
  } else if (type === 'sickle') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#6b4423'; t.fillRect(30, 30, 4, 28);
    t.strokeStyle = '#aaa'; t.lineWidth = 3; t.lineCap = 'round';
    t.beginPath();
    t.moveTo(32, 30); t.quadraticCurveTo(45, 20, 40, 8);
    t.quadraticCurveTo(35, 4, 28, 8); t.stroke();
    t.strokeStyle = '#888'; t.lineWidth = 1;
    t.beginPath(); t.moveTo(32, 28); t.quadraticCurveTo(43, 20, 39, 10); t.stroke();
  } else if (type === 'pistol') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#2a2a2a';
    t.fillRect(16, 28, 10, 24);
    t.strokeStyle = '#000'; t.lineWidth = 1; t.strokeRect(16, 28, 10, 24);
    t.fillStyle = '#444';
    t.fillRect(14, 20, 28, 10);
    t.strokeRect(14, 20, 28, 10);
    t.fillStyle = '#555';
    t.fillRect(40, 22, 16, 6);
    t.strokeRect(40, 22, 16, 6);
    t.fillStyle = '#222';
    t.beginPath(); t.arc(22, 32, 2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#fff';
    t.fillRect(54, 21, 2, 2);
  } else if (type === 'smg') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#2a2a2a';
    t.fillRect(12, 30, 8, 22);
    t.strokeStyle = '#000'; t.lineWidth = 1; t.strokeRect(12, 30, 8, 22);
    t.fillStyle = '#3a3a3a';
    t.fillRect(10, 22, 36, 10);
    t.strokeRect(10, 22, 36, 10);
    t.fillStyle = '#1a1a1a';
    t.fillRect(22, 32, 10, 20);
    t.strokeStyle = '#000';
    t.strokeRect(22, 32, 10, 20);
    t.fillStyle = '#555';
    t.fillRect(44, 24, 14, 5);
    t.strokeRect(44, 24, 14, 5);
    t.fillStyle = '#fff';
    t.fillRect(56, 22, 2, 2);
    t.fillStyle = '#666';
    t.fillRect(14, 24, 4, 4);
  } else if (type === 'shotgun') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#5a3a1a';
    t.fillRect(6, 26, 14, 8);
    t.strokeStyle = '#3a2010'; t.lineWidth = 1; t.strokeRect(6, 26, 14, 8);
    t.fillStyle = '#444';
    t.fillRect(18, 24, 38, 4);
    t.fillRect(18, 30, 38, 4);
    t.strokeStyle = '#222';
    t.strokeRect(18, 24, 38, 4);
    t.strokeRect(18, 30, 38, 4);
    t.fillStyle = '#2a2a2a';
    t.fillRect(14, 34, 8, 14);
    t.strokeRect(14, 34, 8, 14);
    t.fillStyle = '#888';
    t.fillRect(22, 36, 2, 6);
  } else if (type === 'flamethrower') {
    t.clearRect(0,0,s,s);
    // Баллон
    t.fillStyle = '#cc4400';
    t.fillRect(8, 20, 20, 30);
    t.strokeStyle = '#882200'; t.lineWidth = 1;
    t.strokeRect(8, 20, 20, 30);
    // Метки
    t.fillStyle = '#ffff00';
    t.fillRect(12, 28, 12, 2);
    t.fillRect(12, 36, 12, 2);
    // Шланг
    t.strokeStyle = '#333'; t.lineWidth = 3;
    t.beginPath();
    t.moveTo(28, 25);
    t.quadraticCurveTo(34, 25, 36, 30);
    t.stroke();
    // Сопло
    t.fillStyle = '#444';
    t.fillRect(36, 28, 16, 8);
    t.strokeStyle = '#222';
    t.strokeRect(36, 28, 16, 8);
    // Пламя из сопла
    const flame = t.createRadialGradient(54, 32, 2, 54, 32, 8);
    flame.addColorStop(0, '#ffffff');
    flame.addColorStop(0.3, '#ffff00');
    flame.addColorStop(0.7, '#ff6600');
    flame.addColorStop(1, 'rgba(255,0,0,0)');
    t.fillStyle = flame;
    t.beginPath(); t.arc(54, 32, 8, 0, Math.PI*2); t.fill();
  } else if (type === 'rocketL') {
    // Ракетница (оружие)
    t.clearRect(0,0,s,s);
    // Труба
    t.fillStyle = '#555';
    t.fillRect(8, 26, 40, 12);
    t.strokeStyle = '#333'; t.lineWidth = 1;
    t.strokeRect(8, 26, 40, 12);
    // Прицел
    t.fillStyle = '#888';
    t.fillRect(24, 22, 8, 4);
    t.fillStyle = '#ff0000';
    t.beginPath(); t.arc(28, 24, 1.5, 0, Math.PI*2); t.fill();
    // Рукоять
    t.fillStyle = '#3a2a1a';
    t.fillRect(18, 38, 8, 16);
    t.strokeStyle = '#1a1a0a';
    t.strokeRect(18, 38, 8, 16);
    // Дуло
    t.fillStyle = '#333';
    t.fillRect(48, 28, 8, 8);
    t.strokeStyle = '#111';
    t.strokeRect(48, 28, 8, 8);
  } else if (type === 'gauss') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#1a3a5a';
    t.fillRect(10, 22, 44, 14);
    t.strokeStyle = '#0a2040'; t.lineWidth = 1; t.strokeRect(10, 22, 44, 14);
    t.fillStyle = '#4488aa';
    for(let i=0; i<4; i++) {
      t.fillRect(14 + i*10, 20, 6, 18);
      t.strokeStyle = '#226688';
      t.strokeRect(14 + i*10, 20, 6, 18);
    }
    t.fillStyle = '#88ccff';
    t.fillRect(50, 26, 8, 6);
    t.fillStyle = '#00ffff';
    t.beginPath(); t.arc(12, 29, 2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#2a2a2a';
    t.fillRect(4, 24, 8, 10);
  } else if (type === 'bfg') {
    t.clearRect(0,0,s,s);
    t.fillStyle = '#2a5a2a';
    t.fillRect(6, 18, 52, 22);
    t.strokeStyle = '#1a3a1a'; t.lineWidth = 2; t.strokeRect(6, 18, 52, 22);
    t.fillStyle = '#44ff44';
    t.beginPath(); t.arc(32, 29, 8, 0, Math.PI*2); t.fill();
    t.fillStyle = '#ffffff';
    t.beginPath(); t.arc(32, 29, 4, 0, Math.PI*2); t.fill();
    t.fillStyle = '#555';
    t.fillRect(54, 24, 8, 10);
    t.strokeStyle = '#222'; t.strokeRect(54, 24, 8, 10);
    t.fillStyle = '#1a3a1a';
    t.fillRect(10, 22, 4, 14);
    t.fillRect(20, 22, 4, 14);
    t.fillRect(40, 22, 4, 14);
    t.fillStyle = '#2a2a2a';
    t.fillRect(18, 38, 10, 14);
  }
  return c;
}

function makeItemIcon(type) {
  const s = 32, c = document.createElement('canvas');
  c.width = c.height = s;
  const t = c.getContext('2d');
  t.imageSmoothingEnabled = false;
  
  if (type === 'fist') {
    t.fillStyle = '#dcb';
    t.fillRect(6, 8, 20, 18);
    t.fillStyle = '#cba'; t.fillRect(7, 10, 18, 5);
    t.strokeStyle = '#a98'; t.lineWidth = 1;
    t.beginPath();
    t.moveTo(12, 10); t.lineTo(12, 26);
    t.moveTo(17, 10); t.lineTo(17, 26);
    t.moveTo(22, 10); t.lineTo(22, 26); t.stroke();
  } else if (type === 'stick') {
    t.strokeStyle = '#6b4423'; t.lineWidth = 3; t.lineCap = 'round';
    t.beginPath(); t.moveTo(10, 4); t.quadraticCurveTo(14, 16, 12, 28); t.stroke();
    t.lineWidth = 2;
    t.beginPath(); t.moveTo(13, 18); t.lineTo(20, 14); t.stroke();
  } else if (type === 'gloves') {
    t.fillStyle = '#cc2222';
    t.beginPath(); t.ellipse(10, 18, 7, 9, -0.2, 0, Math.PI*2); t.fill();
    t.fillRect(7, 24, 6, 6);
    t.beginPath(); t.ellipse(22, 18, 7, 9, 0.2, 0, Math.PI*2); t.fill();
    t.fillRect(19, 24, 6, 6);
  } else if (type === 'fork') {
    t.fillStyle = '#888'; t.fillRect(14, 12, 4, 18);
    t.fillStyle = '#aaa';
    for(let i=0; i<3; i++) t.fillRect(12 + i*3, 4, 2, 10);
    t.fillStyle = '#888'; t.fillRect(11, 10, 8, 3);
  } else if (type === 'knife') {
    t.fillStyle = '#ccc';
    t.beginPath(); t.moveTo(14, 4); t.lineTo(18, 4); t.lineTo(18, 18); t.lineTo(14, 20); t.closePath(); t.fill();
    t.fillStyle = '#4a2a0a'; t.fillRect(13, 20, 6, 10);
  } else if (type === 'sickle') {
    t.fillStyle = '#6b4423'; t.fillRect(15, 18, 3, 12);
    t.strokeStyle = '#aaa'; t.lineWidth = 2; t.lineCap = 'round';
    t.beginPath(); t.moveTo(16, 18); t.quadraticCurveTo(24, 12, 22, 6); t.quadraticCurveTo(20, 4, 16, 6); t.stroke();
  } else if (type === 'pistol') {
    t.fillStyle = '#2a2a2a'; t.fillRect(8, 14, 6, 14);
    t.fillStyle = '#444'; t.fillRect(6, 10, 18, 6);
    t.fillStyle = '#555'; t.fillRect(22, 11, 8, 4);
  } else if (type === 'smg') {
    t.fillStyle = '#2a2a2a'; t.fillRect(6, 15, 5, 13);
    t.fillStyle = '#3a3a3a'; t.fillRect(5, 11, 20, 6);
    t.fillStyle = '#1a1a1a'; t.fillRect(11, 17, 6, 12);
    t.fillStyle = '#555'; t.fillRect(23, 12, 7, 3);
  } else if (type === 'shotgun') {
    t.fillStyle = '#5a3a1a'; t.fillRect(3, 13, 8, 5);
    t.fillStyle = '#444'; t.fillRect(10, 12, 18, 3);
    t.fillRect(10, 16, 18, 3);
    t.fillStyle = '#2a2a2a'; t.fillRect(7, 17, 5, 9);
  } else if (type === 'flamethrower') {
    t.fillStyle = '#cc4400'; t.fillRect(4, 11, 12, 18);
    t.fillStyle = '#ffff00'; t.fillRect(7, 16, 6, 1); t.fillRect(7, 21, 6, 1);
    t.fillStyle = '#444'; t.fillRect(15, 17, 12, 5);
    t.fillStyle = '#ff6600';
    t.beginPath(); t.arc(28, 19, 4, 0, Math.PI*2); t.fill();
  } else if (type === 'rocket') {
    t.fillStyle = '#555'; t.fillRect(4, 14, 22, 6);
    t.fillStyle = '#888'; t.fillRect(12, 12, 5, 2);
    t.fillStyle = '#3a2a1a'; t.fillRect(10, 20, 5, 10);
    t.fillStyle = '#333'; t.fillRect(25, 15, 5, 5);
  } else if (type === 'gauss') {
    t.fillStyle = '#1a3a5a'; t.fillRect(4, 12, 24, 8);
    t.fillStyle = '#4488aa';
    for(let i=0; i<4; i++) t.fillRect(6 + i*5, 11, 3, 10);
    t.fillStyle = '#88ccff'; t.fillRect(26, 13, 4, 4);
    t.fillStyle = '#00ffff'; t.beginPath(); t.arc(6, 16, 1, 0, Math.PI*2); t.fill();
  } else if (type === 'bfg') {
    t.fillStyle = '#2a5a2a'; t.fillRect(3, 11, 26, 10);
    t.fillStyle = '#44ff44'; t.beginPath(); t.arc(16, 16, 4, 0, Math.PI*2); t.fill();
    t.fillStyle = '#fff'; t.beginPath(); t.arc(16, 16, 2, 0, Math.PI*2); t.fill();
    t.fillStyle = '#555'; t.fillRect(27, 13, 4, 5);
  }
  return c;
}

const TEX = {
  arenaWall: makeTex('wall'),
  shopWall: makeTex('shopwall'),
  bossWall: makeTex('bosswall'),
  slime: makeTex('slime'),
  slimeBlue: makeTex('slimeBlue'),
  slimeRed: makeTex('slimeRed'),
  skeleton: makeTex('skeleton'),
  skeletonCharging: makeTex('skeletonCharging'),
  turret: makeTex('turret'),
  necromancer: makeTex('necromancer'),
  mage: makeTex('mage'),
  mageCharging: makeTex('mageCharging'),
  spiky: makeTex('spiky'),
  boss: makeTex('boss'),
  bossStuck: makeTex('bossStuck'),
  portal: makeTex('portal'),
  door: makeTex('door'),
  bullet: makeTex('bullet'),
  bulletGauss: makeTex('bulletGauss'),
  bulletBfg: makeTex('bulletBfg'),
  rocket: makeTex('rocket'),
  fireball: makeTex('fireball'),
  fire: makeTex('fire'),
  arrow: makeTex('arrow'),
  healthpack: makeTex('healthpack'),
  barrel: makeTex('barrel'),
  fist: makeTex('fist'),
  stick: makeTex('stick'),
  gloves: makeTex('gloves'),
  fork: makeTex('fork'),
  knife: makeTex('knife'),
  sickle: makeTex('sickle'),
  pistol: makeTex('pistol'),
  smg: makeTex('smg'),
  shotgun: makeTex('shotgun'),
  flamethrower: makeTex('flamethrower'),
  rocketL: makeTex('rocketL'),
  gauss: makeTex('gauss'),
  bfg: makeTex('bfg'),
  merchants: [
    makeTex('merchant', '#ff4444'),
    makeTex('merchant', '#aa44ff')
  ]
};

const ITEM_ICONS = {
  fist: makeItemIcon('fist'), stick: makeItemIcon('stick'),
  gloves: makeItemIcon('gloves'), fork: makeItemIcon('fork'),
  knife: makeItemIcon('knife'), sickle: makeItemIcon('sickle'),
  pistol: makeItemIcon('pistol'), smg: makeItemIcon('smg'),
  shotgun: makeItemIcon('shotgun'), flamethrower: makeItemIcon('flamethrower'),
  rocket: makeItemIcon('rocket'), gauss: makeItemIcon('gauss'),
  bfg: makeItemIcon('bfg')
};