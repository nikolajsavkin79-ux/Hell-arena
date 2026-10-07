/**
 * UI.JS — Интерфейс игры v1.5
 */

const WEAPON_STATE = { anim: 0, state: 'idle', cooldown: 0 };
let screenShake = 0;
let mouseDragActive = false;

let audioCtx = null;

function initAudio() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) { console.warn('Audio not supported'); }
}

function playSound(type) {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    
    if (type === 'punch') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'shoot') {
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.connect(gain).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'shotgun') {
      for (let i = 0; i < 3; i++) {
        const noise = audioCtx.createBufferSource();
        const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.15, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
        noise.buffer = buffer;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, now + i * 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15 + i * 0.01);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 1000;
        noise.connect(filter).connect(gain).connect(audioCtx.destination);
        noise.start(now + i * 0.01);
      }
    } else if (type === 'smgShoot') {
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.value = 800;
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'flamethrower') {
      // Низкочастотный шум пламени
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 600;
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'rocketShoot') {
      // Свист ракеты
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'gauss') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'bfg') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.5);
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 200;
      noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'hit') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'slimeDie') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'playerHurt') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'explosion') {
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'barrelExplode') {
      // Мощный взрыв бочки
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.8, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(30, now + 0.8);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
      // Низкий гул
      const osc = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
      g2.gain.setValueAtTime(0.4, now);
      g2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(g2).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.6);
    } else if (type === 'skeletonShoot') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'turretShoot') {
      // Механический звук
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(400, now + 0.02);
      osc.frequency.setValueAtTime(200, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'mageShoot') {
      // Магический звук
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.3);
      // Шипение
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.15, now);
      ng.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.value = 2000;
      noise.connect(filter).connect(ng).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'necromancer') {
      // Тёмный звук призыва
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'pickup') {
      // Звук подбора
      [600, 800].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.15);
      });
    } else if (type === 'bossCharge') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 1.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 1.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 1.5);
    } else if (type === 'bossStrike') {
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.4, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.4);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'bossImpact') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.6);
      const noise = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.5, now);
      ng.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      const f = audioCtx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 300;
      noise.connect(f).connect(ng).connect(audioCtx.destination);
      noise.start(now);
    } else if (type === 'bossRecover') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.8);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.8);
    } else if (type === 'bossDie') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 2);
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(60, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 2.5);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.6, now + 1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 2.5);
      osc2.connect(gain2).connect(audioCtx.destination);
      osc2.start(now); osc2.stop(now + 2.5);
    }
  } catch(e) { /* ignore */ }
}

function tryAttack() {
  if (gameState === STATE.SHOP) return;
  if (gameState === STATE.BOSS_INTRO) return;
  if (boss && boss.phase === 'dead') return;
  if (gameState !== STATE.ARENA && gameState !== STATE.BOSS_FIGHT) return;
  if (WEAPON_STATE.state !== 'idle' || WEAPON_STATE.cooldown > 0) return;
  
  const weapon = getCurrentWeapon();
  WEAPON_STATE.state = 'punch';
  WEAPON_STATE.anim = 1.0;
  WEAPON_STATE.cooldown = 0.5 / (player.attackSpeedMult * weapon.speed);
  
  if (weapon.type === 'melee') {
    playSound('punch');
    let hit = false;
    
    enemies.forEach(en => {
      const dx = en.x - player.x, dy = en.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > weapon.range) return;
      let ang = Math.atan2(dy, dx) - player.angle;
      while (ang > Math.PI) ang -= Math.PI * 2;
      while (ang < -Math.PI) ang += Math.PI * 2;
      if (Math.abs(ang) < 0.4 * player.attackAngleMult) {
        let damage = (weapon.damage + player.damageBonus) * player.damageMult;
        if (Math.random() < player.critChance) { damage *= 2; screenShake = 0.3; }
        if (en.armor > 0) damage = Math.max(1, damage - en.armor);
        en.hp -= damage;
        hit = true;
      }
    });
    
    if (boss && boss.phase === 'stuck') {
      const dx = boss.x - player.x, dy = boss.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < weapon.range + 0.3) {
        let ang = Math.atan2(dy, dx) - player.angle;
        while (ang > Math.PI) ang -= Math.PI * 2;
        while (ang < -Math.PI) ang += Math.PI * 2;
        if (Math.abs(ang) < 0.6) {
          let damage = (weapon.damage + player.damageBonus) * player.damageMult;
          if (Math.random() < player.critChance) { damage *= 2; screenShake = 0.4; }
          boss.hp -= damage;
          hit = true;
        }
      }
    }
    
    // Удар по бочкам
    barrels.forEach(b => {
      if (!b.alive) return;
      const dist = Math.hypot(b.x - player.x, b.y - player.y);
      if (dist < weapon.range) {
        let ang = Math.atan2(b.y - player.y, b.x - player.x) - player.angle;
        while (ang > Math.PI) ang -= Math.PI * 2;
        while (ang < -Math.PI) ang += Math.PI * 2;
        if (Math.abs(ang) < 0.4) {
          destroyBarrel(b);
          hit = true;
        }
      }
    });
    
    if (hit) {
      if (screenShake < 0.2) screenShake = 0.15;
    }
  } else {
    const pellets = weapon.pellets || 1;
    const spread = weapon.spread || 0;
    
    if (weapon.key === 'shotgun') playSound('shotgun');
    else if (weapon.key === 'smg') playSound('smgShoot');
    else if (weapon.key === 'flamethrower') playSound('flamethrower');
    else if (weapon.key === 'rocket') playSound('rocketShoot');
    else if (weapon.key === 'gauss') playSound('gauss');
    else if (weapon.key === 'bfg') playSound('bfg');
    else playSound('shoot');
    
    for (let i = 0; i < pellets; i++) {
      const angle = player.angle + (Math.random() - 0.5) * spread;
      const damage = (weapon.damage + player.damageBonus) * player.damageMult;
      let bulletType = 'normal';
      if (weapon.key === 'gauss') bulletType = 'gauss';
      else if (weapon.key === 'bfg') bulletType = 'bfg';
      else if (weapon.key === 'rocket') bulletType = 'rocket';
      
      spawnProjectile(
        player.x + Math.cos(player.angle) * 0.5,
        player.y + Math.sin(player.angle) * 0.5,
        angle,
        weapon.projectileSpeed || 20,
        damage,
        bulletType,
        { 
          piercing: weapon.piercing || false, 
          aoe: weapon.aoe || 0,
          burning: weapon.burning || false
        }
      );
    }
    
    screenShake = weapon.key === 'bfg' ? 0.6 : 
                  weapon.key === 'gauss' ? 0.3 : 
                  weapon.key === 'rocket' ? 0.4 :
                  weapon.key === 'shotgun' ? 0.4 : 
                  weapon.key === 'smg' ? 0.1 : 
                  weapon.key === 'flamethrower' ? 0.05 : 0.15;
  }
}

function tryInteract() {
  if (gameState === STATE.TRADE) { closeTradeMenu(); return; }
  if (gameState === STATE.INVENTORY) { closeInventory(); return; }
  
  if (gameState === STATE.SHOP) {
    for (const m of MERCHANTS) {
      if (Math.hypot(player.x - m.x, player.y - m.y) < 1.8) {
        openTradeMenu(m);
        return;
      }
    }
  }
}

let dialogTimer = 0;

function showDialog(text, duration = 2.5) {
  dialogTimer = duration;
  const el = document.getElementById('dialog');
  el.textContent = text;
  el.style.display = 'block';
}

function hideDialog() {
  document.getElementById('dialog').style.display = 'none';
  dialogTimer = 0;
}

function updateInteractionHint() {
  const hint = document.getElementById('interactHint');
  if (dialogTimer > 0) {
    dialogTimer -= 1/60;
    if (dialogTimer <= 0) hideDialog();
  }
  
  if (gameState === STATE.SHOP) {
    if (nearMerchant) {
      hint.textContent = `[E] ${nearMerchant.name}`;
      hint.style.display = 'block';
    } else {
      hint.style.display = 'none';
    }
  } else if (gameState === STATE.BOSS_FIGHT && boss) {
    if (boss.phase === 'stuck') {
      const remaining = Math.max(0, BOSS_STATS.stuckTime - boss.phaseTimer);
      hint.textContent = `⚔ БЕЙ ЕГО! ${remaining.toFixed(1)}с`;
      hint.style.display = 'block';
    } else if (boss.phase === 'charging') {
      hint.textContent = '⚠ ОТХОДИ! ЗАМАХ!';
      hint.style.display = 'block';
    } else {
      hint.style.display = 'none';
    }
  } else {
    hint.style.display = 'none';
  }
}

function updateReLockHint() {
  const hint = document.getElementById('relockHint');
  if (hint) {
    if (gameState === STATE.SHOP || gameState === STATE.BOSS_FIGHT || gameState === STATE.BOSS_INTRO) hint.style.display = 'none';
    else hint.style.display = showReLockHint ? 'block' : 'none';
  }
}

let nearMerchant = null;
let currentTradeMerchant = null;

function openTradeMenu(merchant) {
  gameState = STATE.TRADE;
  currentTradeMerchant = merchant;
  unlockPointer();
  const menu = document.getElementById('tradeMenu');
  const title = document.getElementById('tradeTitle');
  const items = document.getElementById('tradeItems');
  title.textContent = merchant.name;
  title.style.color = merchant.color;
  items.innerHTML = '';
  const goods = merchant.items();
  if (goods.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'trade-empty';
    empty.textContent = 'Всё куплено!';
    items.appendChild(empty);
  } else {
    goods.forEach(item => {
      const card = document.createElement('div');
      card.className = 'trade-item';
      card.innerHTML = `
        <div class="item-name" style="color: ${item.color || '#fff'}">${item.name}</div>
        <div class="item-desc">${item.desc || ''}</div>
        <div class="item-pros">✓ ${item.pros || ''}</div>
        <div class="item-cons">✗ ${item.cons || ''}</div>
        <div class="item-price">💰 ${item.price}</div>
      `;
      card.onclick = () => {
        if (player.money >= item.price) {
          player.money -= item.price;
          if (item.key) {
            const invItem = { type: 'weapon', key: item.key, name: item.name, icon: item.icon };
            if (!addToInventory(invItem)) {
              player.money += item.price;
              card.classList.add('shake');
              setTimeout(() => card.classList.remove('shake'), 300);
              showDialog('ИНВЕНТАРЬ ПОЛОН!', 2);
              return;
            }
            showDialog(`КУПЛЕНО: ${item.name}! Открой инвентарь [I]`, 2.5);
          } else {
            item.apply(player);
            showDialog(`ПОЛУЧЕНО: ${item.name}!`, 2);
          }
          updateHUD();
          openTradeMenu(merchant);
        } else {
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 300);
          showDialog('ИДИ РАБОТАЙ, ЧТОБЫ КУПИТЬ МЕНЯ!', 1.5);
        }
      };
      items.appendChild(card);
    });
  }
  menu.style.display = 'flex';
}

function closeTradeMenu() {
  document.getElementById('tradeMenu').style.display = 'none';
  currentTradeMerchant = null;
  gameState = STATE.SHOP;
  shopMouseActive = true;
}

let dragState = null;
let dragGhost = null;
let itemTooltip = null;

function openInventory() {
  if (gameState === STATE.TRADE || gameState === STATE.TRANSITION || gameState === STATE.DEAD || gameState === STATE.BUFF_SELECT) return;
  gameState = STATE.INVENTORY;
  unlockPointer();
  renderInventoryUI();
  document.getElementById('inventory').style.display = 'flex';
  hideItemTooltip();
}

function closeInventory() {
  document.getElementById('inventory').style.display = 'none';
  dragState = null;
  removeDragGhost();
  hideItemTooltip();
  if (currentMap === ARENA_MAP) {
    gameState = STATE.ARENA;
    lockPointer();
  } else if (currentMap === BOSS_MAP) {
    gameState = STATE.BOSS_FIGHT;
    lockPointer();
  } else {
    gameState = STATE.SHOP;
    shopMouseActive = true;
  }
}

function renderInventoryUI() {
  const weaponSlot = document.querySelector('[data-slot-type="weapon"]');
  weaponSlot.innerHTML = '';
  const equipped = player.equippedWeapon ? WEAPONS[player.equippedWeapon] : null;
  weaponSlot.title = equipped ? equipped.name : 'Пусто (кулаки)';
  
  if (player.equippedWeapon) {
    const icon = document.createElement('img');
    icon.className = 'slot-icon';
    icon.src = ITEM_ICONS[equipped.icon].toDataURL();
    icon.draggable = false;
    weaponSlot.appendChild(icon);
  } else {
    const hint = document.createElement('div');
    hint.className = 'slot-hint';
    hint.textContent = '👊';
    weaponSlot.appendChild(hint);
  }
  
  const armorSlot = document.querySelector('[data-slot-type="armor"]');
  armorSlot.innerHTML = '';
  armorSlot.title = 'Пусто';
  
  const storageSlots = document.querySelectorAll('[data-slot-type="storage"]');
  storageSlots.forEach((slot, i) => {
    slot.innerHTML = '';
    const item = player.inventory.storage[i];
    if (item) {
      const icon = document.createElement('img');
      icon.className = 'slot-icon';
      icon.src = ITEM_ICONS[item.icon].toDataURL();
      icon.draggable = false;
      slot.appendChild(icon);
    }
    slot.title = item ? item.name : 'Пусто';
  });
  renderActiveBuffsPanel();
}

function renderActiveBuffsPanel() {
  const panel = document.getElementById('activeBuffsPanel');
  if (!panel) return;
  panel.innerHTML = '';
  
  const strLevel = player.strengthLevel || 0;
  const armLevel = player.armorLevel || 0;
  if (strLevel > 0 || armLevel > 0) {
    const section = document.createElement('div');
    section.className = 'buffs-section';
    section.innerHTML = '<div class="buffs-section-title">⚡ ПРОКАЧКА</div>';
    if (strLevel > 0) {
      const item = document.createElement('div');
      item.className = 'buff-list-item permanent';
      item.style.borderColor = '#ff8844';
      item.innerHTML = `<span class="buff-list-name" style="color: #ff8844">СИЛА УР.${strLevel}</span><span class="buff-list-desc">+${(strLevel * 0.3).toFixed(1)} урон</span>`;
      section.appendChild(item);
    }
    if (armLevel > 0) {
      const item = document.createElement('div');
      item.className = 'buff-list-item permanent';
      item.style.borderColor = '#4488ff';
      item.innerHTML = `<span class="buff-list-name" style="color: #4488ff">БРОНЯ УР.${armLevel}</span><span class="buff-list-desc">+${(armLevel * 0.5).toFixed(1)} броня</span>`;
      section.appendChild(item);
    }
    panel.appendChild(section);
  }
  if (player.activeBuffs.length > 0) {
    const section = document.createElement('div');
    section.className = 'buffs-section';
    section.innerHTML = '<div class="buffs-section-title">✨ ПОСТОЯННЫЕ</div>';
    player.activeBuffs.forEach(buff => {
      const item = document.createElement('div');
      item.className = 'buff-list-item permanent';
      item.style.borderColor = buff.color;
      item.innerHTML = `<span class="buff-list-name" style="color: ${buff.color}">${buff.name}</span><span class="buff-list-desc">${buff.pros}</span>`;
      section.appendChild(item);
    });
    panel.appendChild(section);
  }
  if (player.temporaryBuffs.length > 0) {
    const section = document.createElement('div');
    section.className = 'buffs-section';
    section.innerHTML = '<div class="buffs-section-title">⏱ НА 1 ВОЛНУ</div>';
    player.temporaryBuffs.forEach(buff => {
      const item = document.createElement('div');
      item.className = 'buff-list-item temporary';
      item.style.borderColor = buff.color;
      item.innerHTML = `<span class="buff-list-name" style="color: ${buff.color}">${buff.name}</span><span class="buff-list-desc">${buff.pros}</span>`;
      section.appendChild(item);
    });
    panel.appendChild(section);
  }
  if ((player.activeBuffs.length === 0) && (player.temporaryBuffs.length === 0) && 
      (player.strengthLevel || 0) === 0 && (player.armorLevel || 0) === 0) {
    panel.innerHTML = '<div class="buffs-empty">Нет активных эффектов</div>';
  }
}

function getSlotInfo(element) {
  const type = element.dataset.slotType;
  const index = parseInt(element.dataset.slotIndex);
  return { type, index };
}

function getItemFromSlot(type, index) {
  if (type === 'weapon') {
    if (!player.equippedWeapon) return null;
    const w = WEAPONS[player.equippedWeapon];
    const item = player.inventory.storage.find(i => i && i.key === w.key);
    return { 
      type: 'weapon', key: w.key, name: w.name, icon: w.icon,
      durability: item ? item.durability : undefined,
      maxDurability: item ? item.maxDurability : undefined,
      secret: w.secret
    };
  }
  if (type === 'armor') return player.equippedArmor;
  if (type === 'storage') return player.inventory.storage[index];
  return null;
}

function setItemToSlot(type, index, item) {
  if (type === 'weapon') player.equippedWeapon = item ? item.key : null;
  else if (type === 'armor') player.equippedArmor = item;
  else if (type === 'storage') player.inventory.storage[index] = item;
}

function createDragGhost(item, x, y) {
  removeDragGhost();
  dragGhost = document.createElement('img');
  dragGhost.className = 'drag-ghost';
  dragGhost.src = ITEM_ICONS[item.icon].toDataURL();
  dragGhost.style.left = (x - 24) + 'px';
  dragGhost.style.top = (y - 24) + 'px';
  document.body.appendChild(dragGhost);
}

function moveDragGhost(x, y) {
  if (dragGhost) {
    dragGhost.style.left = (x - 24) + 'px';
    dragGhost.style.top = (y - 24) + 'px';
  }
}

function removeDragGhost() {
  if (dragGhost) { dragGhost.remove(); dragGhost = null; }
}

function showItemTooltip(item, anchorElement) {
  hideItemTooltip();
  const panel = document.createElement('div');
  panel.className = 'item-tooltip';
  panel.id = 'itemTooltip';
  let html = `<div class="tt-name" style="color: ${item.color || '#fff'}">${item.name}</div>`;
  if (item.type === 'weapon' || item.key) {
    const w = WEAPONS[item.key] || item;
    if (w.desc) html += `<div class="tt-desc">${w.desc}</div>`;
    html += `<div class="tt-stats">`;
    html += `<div>⚔️ Урон: <b>${w.damage}</b></div>`;
    html += `<div>📏 Дальность: <b>${w.range}</b></div>`;
    html += `<div>⚡ Скорость: <b>${w.speed}</b></div>`;
    if (w.type === 'ranged') {
      html += `<div>🎯 Тип: <b>Дальний бой</b></div>`;
      if (w.pellets > 1) html += `<div>💥 Пуль: <b>${w.pellets}</b></div>`;
      if (w.piercing) html += `<div>🗡️ Пробитие</div>`;
      if (w.aoe) html += `<div>💣 Взрыв: <b>${w.aoe}м</b></div>`;
      if (w.burning) html += `<div>🔥 Поджигает</div>`;
    } else {
      html += `<div>🎯 Тип: <b>Ближний бой</b></div>`;
    }
    html += `</div>`;
    if (w.pros) html += `<div class="tt-pros">✓ ${w.pros}</div>`;
    if (w.cons) html += `<div class="tt-cons">✗ ${w.cons}</div>`;
  } else {
    if (item.desc) html += `<div class="tt-desc">${item.desc}</div>`;
    if (item.pros) html += `<div class="tt-pros">✓ ${item.pros}</div>`;
    if (item.cons) html += `<div class="tt-cons">✗ ${item.cons}</div>`;
  }
  panel.innerHTML = html;
  document.body.appendChild(panel);
  const rect = anchorElement.getBoundingClientRect();
  let left = rect.right + 10;
  let top = rect.top;
  if (left + 250 > window.innerWidth) left = rect.left - 260;
  if (top + 200 > window.innerHeight) top = window.innerHeight - 210;
  if (top < 10) top = 10;
  if (left < 10) left = 10;
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
  itemTooltip = panel;
}

function hideItemTooltip() {
  if (itemTooltip) { itemTooltip.remove(); itemTooltip = null; }
}

function startDrag(slot, item, type, index, e) {
  if (type === 'weapon' && item.key === 'fists') return;
  dragState = { fromType: type, fromIndex: index, item };
  setItemToSlot(type, index, null);
  renderInventoryUI();
  createDragGhost(item, e.clientX, e.clientY);
}

function finishDrag(clientX, clientY) {
  if (!dragState) return;
  const target = document.elementFromPoint(clientX, clientY);
  const slot = target ? target.closest('.slot') : null;
  if (slot && !slot.classList.contains('disabled') && document.getElementById('inventory').contains(slot)) {
    const { type, index } = getSlotInfo(slot);
    let canPlace = true;
    if (type === 'weapon' && dragState.item.type !== 'weapon') canPlace = false;
    if (type === 'armor') canPlace = false;
    if (canPlace) {
      const existingItem = getItemFromSlot(type, index);
      setItemToSlot(type, index, dragState.item);
      if (existingItem) setItemToSlot(dragState.fromType, dragState.fromIndex, existingItem);
    } else {
      setItemToSlot(dragState.fromType, dragState.fromIndex, dragState.item);
    }
  } else {
    setItemToSlot(dragState.fromType, dragState.fromIndex, dragState.item);
  }
  dragState = null;
  removeDragGhost();
  renderInventoryUI();
  updateHUD();
}

function setupInventoryDrag() {
  const inv = document.getElementById('inventory');
  let clickTimer = null;
  let clickTarget = null;
  let activeTouchId = null;
  
  inv.addEventListener('mousedown', (e) => {
    const slot = e.target.closest('.slot');
    if (!slot || slot.classList.contains('disabled')) return;
    const { type, index } = getSlotInfo(slot);
    const item = getItemFromSlot(type, index);
    if (!item) { hideItemTooltip(); return; }
    clickTarget = { slot, item, type, index };
    clickTimer = setTimeout(() => {
      startDrag(slot, item, type, index, e);
      clickTimer = null;
    }, 200);
    e.preventDefault();
  });
  
  inv.addEventListener('mousemove', (e) => {
    if (clickTimer && dragState === null) {
      if (clickTarget) {
        const { slot, item, type, index } = clickTarget;
        startDrag(slot, item, type, index, e);
      }
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    if (dragState) moveDragGhost(e.clientX, e.clientY);
  });
  
  document.addEventListener('mouseup', (e) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      if (clickTarget) {
        showItemTooltip(clickTarget.item, clickTarget.slot);
        clickTarget = null;
      }
      return;
    }
    if (!dragState) return;
    finishDrag(e.clientX, e.clientY);
  });
  
  inv.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = target ? target.closest('.slot') : null;
    if (!slot || slot.classList.contains('disabled')) return;
    const { type, index } = getSlotInfo(slot);
    const item = getItemFromSlot(type, index);
    if (!item) { hideItemTooltip(); return; }
    activeTouchId = touch.identifier;
    clickTarget = { slot, item, type, index };
    clickTimer = setTimeout(() => {
      startDrag(slot, item, type, index, { clientX: touch.clientX, clientY: touch.clientY });
      clickTimer = null;
    }, 250);
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
  
  inv.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        if (clickTimer && clickTarget) {
          const dx = touch.clientX - (clickTarget.slot.getBoundingClientRect().left + 24);
          const dy = touch.clientY - (clickTarget.slot.getBoundingClientRect().top + 24);
          if (Math.sqrt(dx*dx + dy*dy) > 15) {
            clearTimeout(clickTimer);
            clickTimer = null;
            startDrag(clickTarget.slot, clickTarget.item, clickTarget.type, clickTarget.index, 
                     { clientX: touch.clientX, clientY: touch.clientY });
          }
        }
        if (dragState) moveDragGhost(touch.clientX, touch.clientY);
        e.preventDefault();
      }
    }
  }, { passive: false });
  
  inv.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
          if (clickTarget) {
            showItemTooltip(clickTarget.item, clickTarget.slot);
            clickTarget = null;
          }
        } else if (dragState) {
          finishDrag(touch.clientX, touch.clientY);
        }
        activeTouchId = null;
        e.preventDefault();
      }
    }
  }, { passive: false });
  
  inv.addEventListener('touchcancel', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        if (dragState) {
          setItemToSlot(dragState.fromType, dragState.fromIndex, dragState.item);
          dragState = null;
          removeDragGhost();
          renderInventoryUI();
        }
        activeTouchId = null;
      }
    }
  });
  
  document.addEventListener('mousedown', (e) => {
    if (itemTooltip && !document.getElementById('inventory').contains(e.target) && e.target !== itemTooltip) {
      hideItemTooltip();
    }
  });
}

const keys = {};
let joyData = { dx: 0, dy: 0, active: false, distance: 0, originX: 0, originY: 0 };
let moveTouchId = null;
let lookTouchId = null;
let lookStartAngle = 0;
let lookStartX = 0;

function setupInput() {
  window.addEventListener('blur', () => {
    for (let key in keys) keys[key] = false;
    player.running = false;
    joyData.active = false;
    joyData.dx = 0; joyData.dy = 0; joyData.distance = 0;
  });
  
  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') player.running = true;
    if (e.code === 'KeyE') tryInteract();
    if (e.code === 'KeyI' || e.code === 'Tab') {
      e.preventDefault();
      if (gameState === STATE.INVENTORY) closeInventory();
      else openInventory();
    }
    if (e.code === 'Escape') {
      if (gameState === STATE.TRADE) closeTradeMenu();
      else if (gameState === STATE.INVENTORY) closeInventory();
    }
  });
  
  document.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') player.running = false;
  });
  
  document.addEventListener('mousemove', e => {
    if (mouseLocked && (gameState === STATE.ARENA || gameState === STATE.BOSS_FIGHT)) player.angle += e.movementX * 0.0025;
    if (shopMouseActive && gameState === STATE.SHOP) player.angle += e.movementX * 0.005;
  });
  
  document.addEventListener('mousedown', (e) => {
    if (e.target === canvas && !mouseLocked && 
        gameState !== STATE.DEAD && gameState !== STATE.TRADE && 
        gameState !== STATE.INVENTORY && gameState !== STATE.BUFF_SELECT &&
        gameState !== STATE.BOSS_INTRO) {
      if (gameState === STATE.SHOP) {
        shopMouseActive = true;
      } else if (gameState === STATE.ARENA || gameState === STATE.BOSS_FIGHT) {
        lockPointer();
        showReLockHint = false;
        updateReLockHint();
      }
    }
    if (mouseLocked && (gameState === STATE.ARENA || gameState === STATE.BOSS_FIGHT)) tryAttack();
  });
  
  document.addEventListener('mouseup', () => {
    if (gameState !== STATE.SHOP) mouseDragActive = false;
  });
  
  document.addEventListener('pointerlockchange', () => {
    mouseLocked = !!document.pointerLockElement;
    if (!mouseLocked && 
        gameState !== STATE.TRADE && 
        gameState !== STATE.INVENTORY && 
        gameState !== STATE.DEAD && 
        gameState !== STATE.SHOP && 
        gameState !== STATE.BUFF_SELECT &&
        gameState !== STATE.BOSS_INTRO &&
        gameState !== STATE.BOSS_FIGHT) {
      showReLockHint = true;
    } else {
      showReLockHint = false;
    }
    updateReLockHint();
  });
  
  document.addEventListener('touchstart', (e) => {
    const target = e.target;
    const isUIElement = target.closest('#atkBtn, #useBtn, #invBtn, #closeTradeBtn, #closeInvBtn, #startScreen, #tradeMenu, #inventory, .slot, .trade-item, #buffSelectScreen, .buff-card, #buffRerollBtn, #buffSkipBtn');
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const x = touch.clientX;
      const y = touch.clientY;
      if (isUIElement) continue;
      const isLeftHalf = x < window.innerWidth / 2;
      if (isLeftHalf && moveTouchId === null) {
        moveTouchId = touch.identifier;
        joyData.active = true;
        joyData.originX = x;
        joyData.originY = y;
        joyData.dx = 0;
        joyData.dy = 0;
        joyData.distance = 0;
        updateJoystickVisual(0, 0);
      } else if (!isLeftHalf && lookTouchId === null) {
        lookTouchId = touch.identifier;
        lookStartAngle = player.angle;
        lookStartX = x;
      }
    }
    e.preventDefault();
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId) {
        const dx = touch.clientX - joyData.originX;
        const dy = touch.clientY - joyData.originY;
        const maxDist = 50;
        const d = Math.sqrt(dx * dx + dy * dy);
        let ndx = dx, ndy = dy;
        if (d > maxDist) { ndx = dx / d * maxDist; ndy = dy / d * maxDist; }
        joyData.dx = ndx / maxDist;
        joyData.dy = ndy / maxDist;
        joyData.distance = Math.min(1, d / maxDist);
        player.running = joyData.distance > 0.8;
        updateJoystickVisual(ndx, ndy);
      } else if (touch.identifier === lookTouchId) {
        const dx = touch.clientX - lookStartX;
        player.angle = lookStartAngle + dx * 0.005;
      }
    }
    e.preventDefault();
  }, { passive: false });
  
  document.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId) {
        moveTouchId = null;
        joyData.active = false;
        joyData.dx = 0; joyData.dy = 0; joyData.distance = 0;
        player.running = false;
        updateJoystickVisual(0, 0);
      } else if (touch.identifier === lookTouchId) {
        lookTouchId = null;
      }
    }
    e.preventDefault();
  }, { passive: false });
  
  document.addEventListener('touchcancel', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId) {
        moveTouchId = null;
        joyData.active = false;
        joyData.dx = 0; joyData.dy = 0; joyData.distance = 0;
        player.running = false;
        updateJoystickVisual(0, 0);
      } else if (touch.identifier === lookTouchId) {
        lookTouchId = null;
      }
    }
  });
  
  document.getElementById('atkBtn').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); tryAttack(); }, { passive: false });
  document.getElementById('useBtn').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); tryInteract(); }, { passive: false });
  document.getElementById('invBtn').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); openInventory(); }, { passive: false });
  
  const startScreen = document.getElementById('startScreen');
  function startGame(e) {
    if (e) e.preventDefault();
    if (!isMobile) canvas.requestPointerLock();
    startScreen.style.display = 'none';
    switchToArena();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  startScreen.addEventListener('click', startGame);
  startScreen.addEventListener('touchstart', startGame, { passive: false });
  
  document.getElementById('closeTradeBtn').addEventListener('click', closeTradeMenu);
  document.getElementById('closeInvBtn').addEventListener('click', closeInventory);
  
  setupInventoryDrag();
}

function updateJoystickVisual(dx, dy) {
  const knob = document.getElementById('joystick-knob');
  const joystick = document.getElementById('joystick');
  if (!knob || !joystick) return;
  if (joyData.active && moveTouchId !== null) {
    joystick.style.left = (joyData.originX - 60) + 'px';
    joystick.style.bottom = 'auto';
    joystick.style.top = (joyData.originY - 60) + 'px';
    joystick.style.display = 'block';
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  } else {
    joystick.style.left = '30px';
    joystick.style.top = 'auto';
    joystick.style.bottom = '40px';
    knob.style.transform = 'translate(-50%, -50%)';
  }
}

function updateHUD() {
  document.getElementById('wave').innerText = currentWave;
  document.getElementById('hp').innerText = Math.max(0, Math.floor(player.hp));
  document.getElementById('maxHp').innerText = Math.floor(player.maxHp);
  document.getElementById('money').innerText = player.money;
  document.getElementById('enemies').innerText = gameState === STATE.BOSS_FIGHT ? (boss ? '1 (БОСС)' : '0') : enemies.length;
  
  const weapon = getCurrentWeapon();
  document.getElementById('weapon').innerText = weapon.name;
  
  const buffsDiv = document.getElementById('buffs');
  buffsDiv.innerHTML = '';
  player.activeBuffs.forEach(buff => {
    const item = document.createElement('div');
    item.className = 'buff-item';
    item.style.color = buff.color;
    item.textContent = `✦ ${buff.name}`;
    buffsDiv.appendChild(item);
  });
  player.temporaryBuffs.forEach(buff => {
    const item = document.createElement('div');
    item.className = 'buff-item temporary-buff';
    item.style.color = buff.color;
    item.textContent = `⏱ ${buff.name}`;
    buffsDiv.appendChild(item);
  });
  const strLevel = player.strengthLevel || 0;
  const armLevel = player.armorLevel || 0;
  if (strLevel > 0 || armLevel > 0) {
    const statsDiv = document.createElement('div');
    statsDiv.style.marginTop = '5px';
    statsDiv.style.borderTop = '1px solid #ff4444';
    statsDiv.style.paddingTop = '5px';
    statsDiv.style.fontSize = '10px';
    if (strLevel > 0) {
      const strItem = document.createElement('div');
      strItem.style.color = '#ff8844';
      strItem.textContent = `⚡ СИЛА УР.${strLevel} (+${(strLevel * 0.3).toFixed(1)})`;
      statsDiv.appendChild(strItem);
    }
    if (armLevel > 0) {
      const armItem = document.createElement('div');
      armItem.style.color = '#4488ff';
      armItem.textContent = `🛡️ БРОНЯ УР.${armLevel} (+${(armLevel * 0.5).toFixed(1)})`;
      statsDiv.appendChild(armItem);
    }
    buffsDiv.appendChild(statsDiv);
  }
}