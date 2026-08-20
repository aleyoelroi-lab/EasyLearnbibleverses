import React, { useEffect, useRef, useState } from 'react';
import { PlayerState, WorldObject, WeatherType, RPGEnemy, SoulPerson } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { RPG_ENEMIES } from '../data/rpgData';
import { Minimap } from './Minimap';

interface PixelCanvasProps {
  player1: PlayerState;
  player2: PlayerState | null;
  souls: SoulPerson[];
  onUpdateP1: (updater: (prev: PlayerState) => PlayerState) => void;
  onUpdateP2?: (updater: (prev: PlayerState) => PlayerState) => void;
  stageId: string;
  weather: WeatherType;
  defeatedEnemyIds?: string[];
  virtualDirs?: { up: boolean; down: boolean; left: boolean; right: boolean };
  onInteractObject: (obj: WorldObject) => void;
  onInteractSoul: (soul: SoulPerson) => void;
  onOpenGarden: () => void;
  onOpenPrayerRoom?: () => void;
  onTriggerBattle: (enemy: RPGEnemy, worldObjectId?: string) => void;
  onTrimLantern: (playerId: 1 | 2) => void;
}

const MAP_WIDTH = 1800;
const MAP_HEIGHT = 1400;

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  player1,
  player2,
  souls,
  onUpdateP1,
  onUpdateP2,
  stageId,
  weather,
  defeatedEnemyIds = [],
  virtualDirs,
  onInteractObject,
  onInteractSoul,
  onOpenGarden,
  onOpenPrayerRoom,
  onTriggerBattle,
  onTrimLantern,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const interactedCooldown = useRef<{ [objId: string]: number }>({});
  const touchTarget = useRef<{ x: number; y: number } | null>(null);

  const [worldObjects, setWorldObjects] = useState<WorldObject[]>([]);
  const rainDrops = useRef<{ x: number; y: number; speed: number; len: number }[]>([]);
  const goldenMotes = useRef<{ x: number; y: number; radius: number; speedY: number; opacity: number }[]>([]);
  const lightningFlash = useRef<number>(0);
  const stepTicker = useRef<number>(0);

  // Initialize objects based on stage
  useEffect(() => {
    const objs: WorldObject[] = [];

    // Always include Pilgrim's Home Cottage, Sanctuary Garden, and High Mountain Prayer Sanctuary
    objs.push(
      {
        id: 'pilgrim_home_cottage',
        x: 260,
        y: 310,
        type: 'home_cottage',
        name: "Pilgrim's Home & Hearth",
      },
      {
        id: 'pilgrim_home_garden',
        x: 260,
        y: 410,
        type: 'home_garden',
        name: 'Sanctuary Garden of Faith (1 Cor 3:6)',
      },
      {
        id: 'mountain_prayer_sanctuary',
        x: 1280,
        y: 190,
        type: 'mountain_prayer_room',
        name: 'Mount of Olives Prayer Sanctuary & Consecration Altar',
      }
    );

    // Add the 7 Souls to share the Gospel with across the Sanctuary
    souls.forEach((s) => {
      objs.push({
        id: `npc_${s.id}`,
        x: s.x,
        y: s.y,
        type: 'npc_soul_human',
        name: s.name,
        soulData: s,
      });
    });

    if (
      stageId === 'sanctuary_gardens' ||
      stageId === 'prologue_call' ||
      stageId === 'stage1_talents'
    ) {
      objs.push(
        { id: 'oil_1', x: 420, y: 320, type: 'oil_vessel', name: 'Alabaster Oil Vessel' },
        { id: 'oil_2', x: 920, y: 480, type: 'oil_vessel', name: 'Consecrated Oil' },
        { id: 'chest_1', x: 740, y: 220, type: 'talent_chest', name: 'Kingdom Talent Chest' },
        { id: 'altar_1', x: 580, y: 560, type: 'scripture_altar', name: 'Altar of Psalm 119' },
        { id: 'elder_1', x: 800, y: 640, type: 'npc_elder', name: 'Elder Simeon' },
        { id: 'merchant_1', x: 620, y: 350, type: 'npc_merchant', name: 'Temple of the Lord (Holy Oil & Truth Scrolls)' },
        {
          id: 'enemy_doubt_1',
          x: 1140,
          y: 720,
          type: 'enemy_shadow',
          name: 'Shadow of Doubt',
          enemyData: RPG_ENEMIES.enemy_doubt,
        },
        {
          id: 'enemy_anxiety_1',
          x: 480,
          y: 820,
          type: 'enemy_shadow',
          name: 'Whisper of Anxiety',
          enemyData: RPG_ENEMIES.enemy_anxiety,
        },
        {
          id: 'enemy_distraction_1',
          x: 1300,
          y: 320,
          type: 'enemy_shadow',
          name: 'Distraction of the Flesh',
          enemyData: RPG_ENEMIES.enemy_distraction,
        },
        {
          id: 'enemy_bitterness_1',
          x: 760,
          y: 980,
          type: 'enemy_shadow',
          name: 'Spirit of Bitterness',
          enemyData: RPG_ENEMIES.enemy_bitterness,
        },
        {
          id: 'spirit_slumber_1',
          x: 320,
          y: 1100,
          type: 'enemy_shadow',
          name: 'Spirit of Slumber',
          enemyData: RPG_ENEMIES.spirit_slumber,
        },
        {
          id: 'enemy_discontent_1',
          x: 1040,
          y: 1120,
          type: 'enemy_shadow',
          name: 'Phantom of Discontent',
          enemyData: RPG_ENEMIES.enemy_discontent,
        },
        {
          id: 'enemy_red_pride_1',
          x: 1420,
          y: 620,
          type: 'enemy_shadow',
          name: 'Crimson Zealot of Pride [RED]',
          enemyData: RPG_ENEMIES.enemy_red_pride,
        }
      );
    } else if (stageId === 'valley_shadow' || stageId === 'stage2_confession') {
      objs.push(
        { id: 'oil_3', x: 380, y: 400, type: 'oil_vessel', name: 'Lamp Oil' },
        { id: 'oil_4', x: 840, y: 780, type: 'oil_vessel', name: 'Lamp Oil' },
        { id: 'chest_2', x: 1200, y: 360, type: 'talent_chest', name: 'Talent Chest' },
        { id: 'altar_2', x: 720, y: 320, type: 'scripture_altar', name: 'Altar of Psalm 23' },
        { id: 'merchant_2', x: 980, y: 300, type: 'npc_merchant', name: 'Temple of the Lord (Holy Oil & Truth Scrolls)' },
        {
          id: 'enemy_tempter_1',
          x: 600,
          y: 650,
          type: 'enemy_shadow',
          name: 'Tempter Spirit',
          enemyData: RPG_ENEMIES.enemy_tempter,
        },
        {
          id: 'enemy_greed_1',
          x: 1050,
          y: 900,
          type: 'enemy_shadow',
          name: 'Spectre of Greed',
          enemyData: RPG_ENEMIES.enemy_greed,
        },
        {
          id: 'enemy_deceiver_1',
          x: 880,
          y: 420,
          type: 'enemy_shadow',
          name: 'The Deceiver',
          enemyData: RPG_ENEMIES.deceiver_shadow,
        },
        {
          id: 'enemy_accusation_1',
          x: 350,
          y: 750,
          type: 'enemy_shadow',
          name: 'Phantom of Accusation',
          enemyData: RPG_ENEMIES.enemy_accusation,
        },
        {
          id: 'enemy_despair_1',
          x: 1250,
          y: 520,
          type: 'enemy_shadow',
          name: 'Shadow of Despair',
          enemyData: RPG_ENEMIES.shadow_despair,
        },
        {
          id: 'enemy_lust_1',
          x: 520,
          y: 1050,
          type: 'enemy_shadow',
          name: 'Fiery Dart of Lust',
          enemyData: RPG_ENEMIES.enemy_lust,
        },
        {
          id: 'enemy_red_behemoth_1',
          x: 1380,
          y: 960,
          type: 'enemy_shadow',
          name: 'Crimson Behemoth of Guilt [RED]',
          enemyData: RPG_ENEMIES.enemy_red_behemoth,
        },
        {
          id: 'enemy_red_rebellion_1',
          x: 780,
          y: 1180,
          type: 'enemy_shadow',
          name: 'Crimson Leviathan of Rebellion [RED]',
          enemyData: RPG_ENEMIES.enemy_red_rebellion,
        }
      );
    } else if (
      stageId === 'midnight_watch' ||
      stageId === 'stage3_midnight' ||
      stageId === 'epilogue_word'
    ) {
      objs.push(
        { id: 'oil_5', x: 500, y: 350, type: 'oil_vessel', name: 'Midnight Oil' },
        { id: 'oil_6', x: 1020, y: 820, type: 'oil_vessel', name: 'Midnight Oil' },
        { id: 'chest_3', x: 820, y: 220, type: 'talent_chest', name: 'Talent Chest' },
        { id: 'altar_3', x: 920, y: 520, type: 'scripture_altar', name: 'Altar of Matthew 25' },
        { id: 'merchant_3', x: 440, y: 680, type: 'npc_merchant', name: 'Temple of the Lord (Holy Oil & Truth Scrolls)' },
        {
          id: 'enemy_mid_deceiver',
          x: 650,
          y: 750,
          type: 'enemy_shadow',
          name: 'Arch-Deceiver of Midnight',
          enemyData: RPG_ENEMIES.enemy_midnight_deceiver,
        },
        {
          id: 'enemy_apostasy_1',
          x: 380,
          y: 860,
          type: 'enemy_shadow',
          name: 'Grim Spirit of Apostasy',
          enemyData: RPG_ENEMIES.enemy_apostasy,
        },
        {
          id: 'enemy_stalker_1',
          x: 1100,
          y: 400,
          type: 'enemy_shadow',
          name: 'Abyssal Shadow Stalker',
          enemyData: RPG_ENEMIES.enemy_stalker,
        },
        {
          id: 'enemy_terror_1',
          x: 820,
          y: 980,
          type: 'enemy_shadow',
          name: 'Terror of the Dark Night',
          enemyData: RPG_ENEMIES.enemy_terror,
        },
        {
          id: 'enemy_red_hellwarden_1',
          x: 1400,
          y: 450,
          type: 'enemy_shadow',
          name: 'Crimson Hell-Warden [RED]',
          enemyData: RPG_ENEMIES.enemy_red_hellwarden,
        },
        {
          id: 'enemy_false_prophet_1',
          x: 550,
          y: 1150,
          type: 'enemy_shadow',
          name: 'Spirit of the Antichrist',
          enemyData: RPG_ENEMIES.enemy_false_prophet,
        },
        {
          id: 'enemy_boss',
          x: 1280,
          y: 700,
          type: 'dragon_boss',
          name: 'The Great Accuser & Dragon [RED BOSS]',
          enemyData: RPG_ENEMIES.dragon_boss,
        }
      );
    } else {
      // General fallback
      objs.push(
        { id: 'oil_default', x: 500, y: 350, type: 'oil_vessel', name: 'Lamp Oil' },
        { id: 'merchant_default', x: 620, y: 350, type: 'npc_merchant', name: 'Oil Merchant' },
        { id: 'elder_default', x: 800, y: 640, type: 'npc_elder', name: 'Elder Simeon' },
        {
          id: 'enemy_default_1',
          x: 1100,
          y: 700,
          type: 'enemy_shadow',
          name: 'Shadow of Doubt',
          enemyData: RPG_ENEMIES.enemy_doubt,
        }
      );
    }

    // Filter out defeated enemies from worldObjects
    const activeObjs = objs.filter((obj) => {
      if (obj.type === 'enemy_shadow' || obj.type === 'dragon_boss') {
        if (defeatedEnemyIds.includes(obj.id)) return false;
        if (obj.enemyData && defeatedEnemyIds.includes(obj.enemyData.id)) return false;
      }
      return true;
    });

    setWorldObjects(activeObjs);
  }, [stageId, souls, defeatedEnemyIds]);

  // Weather particles setup
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 160; i++) {
      drops.push({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        speed: 400 + Math.random() * 250,
        len: 12 + Math.random() * 10,
      });
    }
    rainDrops.current = drops;

    const motes = [];
    for (let i = 0; i < 60; i++) {
      motes.push({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        radius: 1 + Math.random() * 2.5,
        speedY: -15 - Math.random() * 25,
        opacity: 0.2 + Math.random() * 0.6,
      });
    }
    goldenMotes.current = motes;
  }, []);

  // Lightning timer for midnight storm
  useEffect(() => {
    if (weather !== 'midnight_storm') return;
    const interval = setInterval(() => {
      if (Math.random() < 0.35) {
        lightningFlash.current = 1.0;
        soundEngine.playThunder();
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [weather]);

  // Key Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // [E] key for explicit object interaction
      if (e.code === 'KeyE') {
        e.preventDefault();
        triggerNearestObjectInteraction();
      }

      // Lamp trimming shortcuts
      if (e.code === 'Space') {
        e.preventDefault();
        onTrimLantern(1);
      }
      if (e.code === 'Numpad0' && player2) {
        e.preventDefault();
        onTrimLantern(2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player1, player2, onTrimLantern, worldObjects]);

  // Interaction helper with cooldown check
  const triggerObjectAction = (obj: WorldObject, force: boolean = false) => {
    const now = Date.now();
    const lastTime = interactedCooldown.current[obj.id] || 0;
    if (!force && now - lastTime < 2200) {
      return; // In cooldown to prevent spamming / auto re-opening on shop exit
    }
    interactedCooldown.current[obj.id] = now;

    if (obj.type === 'npc_merchant') {
      onInteractObject(obj);
    } else if (obj.type === 'npc_soul_human') {
      if (obj.soulData) onInteractSoul(obj.soulData);
    } else if (obj.type === 'home_cottage' || obj.type === 'home_garden') {
      onOpenGarden();
    } else if (obj.type === 'mountain_prayer_room') {
      if (onOpenPrayerRoom) onOpenPrayerRoom();
      else onInteractObject(obj);
    } else if (obj.type === 'dragon_boss') {
      if (obj.enemyData) onTriggerBattle(obj.enemyData);
      else onInteractObject(obj);
    } else {
      onInteractObject(obj);
    }
  };

  const triggerNearestObjectInteraction = () => {
    let closestObj: WorldObject | null = null;
    let closestDist = 80;

    worldObjects.forEach((obj) => {
      if (obj.collected) return;
      const dist = Math.hypot(player1.x - obj.x, player1.y - obj.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestObj = obj;
      }
    });

    if (closestObj) {
      triggerObjectAction(closestObj, true);
    }
  };

  const handleCanvasPointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 960 / rect.width;
    const scaleY = 620 / rect.height;
    const screenX = (clientX - rect.left) * scaleX;
    const screenY = (clientY - rect.top) * scaleY;

    const targetCamX = player2 ? (player1.x + player2.x) / 2 : player1.x;
    const targetCamY = player2 ? (player1.y + player2.y) / 2 : player1.y;
    const currentCamX = Math.max(0, Math.min(MAP_WIDTH - 960, targetCamX - 480));
    const currentCamY = Math.max(0, Math.min(MAP_HEIGHT - 620, targetCamY - 310));

    const worldTargetX = Math.max(60, Math.min(MAP_WIDTH - 60, currentCamX + screenX));
    const worldTargetY = Math.max(60, Math.min(MAP_HEIGHT - 60, currentCamY + screenY));

    touchTarget.current = { x: worldTargetX, y: worldTargetY };
  };

  // Main Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update Player 1 position
      let p1Speed = 195 * (player1.bride?.speedBonus || 1);
      if (weather === 'midnight_storm' && player1.bride?.id !== 'irene') {
        p1Speed *= 0.85;
      }
      // Sloth affliction slows player walking
      if (player1.darkAffliction === 'sloth_lethargy') {
        p1Speed *= 0.55;
      }

      let dx1 = 0;
      let dy1 = 0;
      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp'] || virtualDirs?.up) dy1 -= 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown'] || virtualDirs?.down) dy1 += 1;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft'] || virtualDirs?.left) dx1 -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight'] || virtualDirs?.right) dx1 += 1;

      // Also support canvas touch-to-walk destination
      if (dx1 === 0 && dy1 === 0 && touchTarget.current) {
        const tDist = Math.hypot(touchTarget.current.x - player1.x, touchTarget.current.y - player1.y);
        if (tDist > 14) {
          dx1 = touchTarget.current.x - player1.x;
          dy1 = touchTarget.current.y - player1.y;
        } else {
          touchTarget.current = null;
          triggerNearestObjectInteraction();
        }
      } else if (dx1 !== 0 || dy1 !== 0) {
        touchTarget.current = null;
      }

      if (dx1 !== 0 || dy1 !== 0) {
        const len = Math.hypot(dx1, dy1);
        const normDx = (dx1 / len) * p1Speed * dt;
        const normDy = (dy1 / len) * p1Speed * dt;

        let newDir = player1.direction;
        if (Math.abs(dx1) > Math.abs(dy1)) {
          newDir = dx1 > 0 ? 'right' : 'left';
        } else {
          newDir = dy1 > 0 ? 'down' : 'up';
        }

        const newX = Math.max(60, Math.min(MAP_WIDTH - 60, player1.x + normDx));
        const newY = Math.max(60, Math.min(MAP_HEIGHT - 60, player1.y + normDy));

        stepTicker.current += len * dt;
        if (stepTicker.current > 0.28) {
          stepTicker.current = 0;
          soundEngine.playFootstep();
        }

        onUpdateP1((prev) => ({
          ...prev,
          x: newX,
          y: newY,
          direction: newDir,
          stepsWalked: prev.stepsWalked + 1,
        }));
      }

      // Oil passive drain and Home/Temple Mana recovery
      const drainFactor = (player1.bride?.baseOilDrainRate || 1.0) * (weather === 'midnight_storm' ? 1.3 : 1.0);
      const distToHome = Math.hypot(player1.x - 260, player1.y - 310);
      const isAtHome = distToHome < 95;

      const distToTemple = Math.hypot(player1.x - 620, player1.y - 350);
      const distToAltar = Math.hypot(player1.x - 580, player1.y - 560);
      const isAtTemple = distToTemple < 110 || distToAltar < 90;

      onUpdateP1((prev) => {
        const drained = Math.max(0, prev.oil - dt * 1.0 * drainFactor);

        let newSp = prev.sp;
        let newHp = prev.health;

        if (isAtHome) {
          // Sleeping at home recovers mana energy (SP) and restores health
          newSp = Math.min(prev.maxSp, prev.sp + dt * 18);
          newHp = Math.min(prev.maxHealth, prev.health + dt * 12);
        } else if (isAtTemple) {
          // Praising & praying in the Lord's temple replenishes holy mana energy (SP)
          newSp = Math.min(prev.maxSp, prev.sp + dt * 24);
        }

        return {
          ...prev,
          oil: drained,
          isLanternLit: drained > 0,
          sp: newSp,
          health: newHp,
        };
      });

      // Update Disciples following player & Shepherds walking the map
      worldObjects.forEach((obj) => {
        if (obj.type === 'npc_soul_human' && obj.soulData) {
          const s = obj.soulData;
          if (s.isDiscipleFollowing) {
            // Disciple follows behind player 1
            let targetX = player1.x;
            let targetY = player1.y;
            if (player1.direction === 'down') {
              targetX = player1.x - 24;
              targetY = player1.y - 32;
            } else if (player1.direction === 'up') {
              targetX = player1.x + 24;
              targetY = player1.y + 32;
            } else if (player1.direction === 'left') {
              targetX = player1.x + 32;
              targetY = player1.y - 8;
            } else if (player1.direction === 'right') {
              targetX = player1.x - 32;
              targetY = player1.y - 8;
            }
            obj.x += (targetX - obj.x) * Math.min(1, dt * 5.0);
            obj.y += (targetY - obj.y) * Math.min(1, dt * 5.0);
          } else if (s.isShepherd) {
            // Shepherd walks peacefully along the map pathways
            const t = time * 0.0003;
            const wanderX = 900 + Math.sin(t * 1.2 + (obj.x % 100)) * 260;
            const wanderY = 650 + Math.cos(t * 0.9 + (obj.y % 100)) * 280;
            obj.x += (wanderX - obj.x) * Math.min(1, dt * 1.2);
            obj.y += (wanderY - obj.y) * Math.min(1, dt * 1.2);
          }
        }
      });

      // Object collision & proximity check
      worldObjects.forEach((obj) => {
        if (obj.collected) return;
        const dist1 = Math.hypot(player1.x - obj.x, player1.y - obj.y);
        const dist2 = player2 ? Math.hypot(player2.x - obj.x, player2.y - obj.y) : 9999;
        const minDist = Math.min(dist1, dist2);

        // Immediate automatic collection for items & battles
        if (minDist < 38) {
          if (obj.type === 'oil_vessel') {
            obj.collected = true;
            soundEngine.playOilPickup();
            onUpdateP1((prev) => ({
              ...prev,
              oil: Math.min(prev.maxOil, prev.oil + 35),
              score: prev.score + 100,
            }));
          } else if (obj.type === 'talent_chest') {
            obj.collected = true;
            soundEngine.playTalentPickup();
            onUpdateP1((prev) => {
              const updatedInv = prev.inventory.map((item) =>
                item.id === 'kingdom_talents' ? { ...item, count: item.count + 5 } : item
              );
              return {
                ...prev,
                talentsCollected: prev.talentsCollected + 1,
                inventory: updatedInv,
                score: prev.score + 200,
              };
            });
          } else if (obj.type === 'enemy_shadow' || obj.type === 'dragon_boss') {
            if (defeatedEnemyIds.includes(obj.id) || (obj.enemyData && defeatedEnemyIds.includes(obj.enemyData.id))) {
              return;
            }
            obj.collected = true;
            if (obj.enemyData) {
              onTriggerBattle(obj.enemyData, obj.id);
            }
          }
        }
      });

      // Camera calculations
      const viewW = canvas.width;
      const viewH = canvas.height;
      const targetCamX = player2 ? (player1.x + player2.x) / 2 : player1.x;
      const targetCamY = player2 ? (player1.y + player2.y) / 2 : player1.y;

      const camX = Math.max(0, Math.min(MAP_WIDTH - viewW, targetCamX - viewW / 2));
      const camY = Math.max(0, Math.min(MAP_HEIGHT - viewH, targetCamY - viewH / 2));

      // --- RENDERING ---
      ctx.save();
      ctx.clearRect(0, 0, viewW, viewH);
      ctx.translate(-camX, -camY);

      // 1. Rich 16-Bit Textured Sanctuary Island Map
      drawSanctuaryWorld(ctx, stageId, weather, time);

      // 2. Interactive Objects, Shops & NPCs
      worldObjects.forEach((obj) => {
        if (!obj.collected) {
          drawWorldObject(ctx, obj, time, player1);
        }
      });

      // 3. Player Sprite
      drawBrideSprite(ctx, player1, time);
      if (player2) {
        drawBrideSprite(ctx, player2, time);
      }

      // 4. Dynamic Lighting & Shadows
      drawDynamicLighting(ctx, viewW, viewH, camX, camY, player1, player2, weather, time);

      // 5. Weather FX
      drawWeatherEffects(ctx, weather, time);

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [player1, player2, stageId, weather, worldObjects, onInteractObject, onTriggerBattle, onTrimLantern, onUpdateP1]);

  // Render 16-bit textured sanctuary island world
  const drawSanctuaryWorld = (
    ctx: CanvasRenderingContext2D,
    currentStage: string,
    currentWeather: WeatherType,
    time: number
  ) => {
    // 1. Lush Green Meadow with Pixel Texture
    ctx.fillStyle = '#1c381e';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Grass blade clumps pattern
    ctx.fillStyle = '#244727';
    for (let x = 0; x < MAP_WIDTH; x += 32) {
      for (let y = 0; y < MAP_HEIGHT; y += 32) {
        if ((x + y) % 64 === 0) {
          ctx.fillRect(x + 4, y + 4, 3, 6);
          ctx.fillRect(x + 8, y + 2, 3, 8);
        }
      }
    }

    // Olive Trees with Foliage
    const trees = [
      { x: 180, y: 150 },
      { x: 420, y: 180 },
      { x: 1450, y: 220 },
      { x: 1550, y: 460 },
      { x: 1380, y: 920 },
      { x: 240, y: 880 },
      { x: 500, y: 1100 },
      { x: 1200, y: 1180 },
    ];
    trees.forEach((t) => {
      // Tree Trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(t.x - 8, t.y - 10, 16, 32);
      // Tree Foliage (Canopy)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(t.x, t.y - 28, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(t.x - 8, t.y - 34, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(t.x + 12, t.y - 22, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Crystal River of Living Water
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(MAP_WIDTH * 0.42, 0);
    ctx.bezierCurveTo(MAP_WIDTH * 0.45, 450, MAP_WIDTH * 0.35, 850, MAP_WIDTH * 0.48, MAP_HEIGHT);
    ctx.lineTo(MAP_WIDTH * 0.54, MAP_HEIGHT);
    ctx.bezierCurveTo(MAP_WIDTH * 0.41, 850, MAP_WIDTH * 0.51, 450, MAP_WIDTH * 0.48, 0);
    ctx.closePath();
    ctx.fill();

    // River Highlights & Water Shimmer
    ctx.fillStyle = '#60a5fa';
    for (let i = 0; i < 24; i++) {
      const wx = MAP_WIDTH * 0.44 + Math.sin(time * 0.003 + i) * 35;
      const wy = (i * 60 + time * 0.04) % MAP_HEIGHT;
      ctx.fillRect(wx, wy, 18, 3);
    }

    // Wooden Bridges over River
    const bridges = [
      { x: 740, y: 280 },
      { x: 700, y: 760 },
      { x: 780, y: 1140 },
    ];
    bridges.forEach((b) => {
      // Planks
      ctx.fillStyle = '#78350f';
      ctx.fillRect(b.x, b.y, 200, 60);
      ctx.fillStyle = '#92400e';
      for (let px = b.x; px < b.x + 200; px += 20) {
        ctx.fillRect(px, b.y, 14, 60);
      }
      // Top and bottom guide rails
      ctx.fillStyle = '#451a03';
      ctx.fillRect(b.x, b.y, 200, 6);
      ctx.fillRect(b.x, b.y + 54, 200, 6);
    });

    // 3. Ancient Cobblestone Paths
    const drawStoneRoad = (rx: number, ry: number, rw: number, rh: number) => {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.fillStyle = '#64748b';
      for (let y = ry; y < ry + rh; y += 16) {
        ctx.fillRect(rx, y, rw, 2);
        const offset = ((y - ry) / 16) % 2 === 0 ? 0 : 12;
        for (let x = rx + offset; x < rx + rw; x += 24) {
          ctx.fillRect(x, y, 2, 16);
        }
      }
      ctx.fillStyle = '#475569';
      ctx.fillRect(rx, ry, rw, 3);
      ctx.fillRect(rx, ry + rh - 3, rw, 3);
    };

    drawStoneRoad(840, 80, 120, 1240);
    drawStoneRoad(340, 590, 1120, 120);

    // 4. Central Sanctuary Temple Plaza
    ctx.save();
    ctx.translate(900, 650);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 10, 145, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 130, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 3;
    for (let r = 0; r < 4; r++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-110, 0);
      ctx.lineTo(110, 0);
      ctx.stroke();
    }

    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 5. Ancient Carved Temple Columns
    const columns = [
      { x: 730, y: 480 },
      { x: 1070, y: 480 },
      { x: 730, y: 820 },
      { x: 1070, y: 820 },
      { x: 520, y: 550 },
      { x: 1280, y: 550 },
    ];
    // 6. Mount of Olives & Mountain Consecration Ridge (Northeast Plateau)
    ctx.save();
    // Mountain Base Shadow & Granite Crags
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(1120, 320);
    ctx.lineTo(1220, 110);
    ctx.lineTo(1380, 90);
    ctx.lineTo(1520, 180);
    ctx.lineTo(1580, 340);
    ctx.lineTo(1120, 340);
    ctx.closePath();
    ctx.fill();

    // Mountain Rock Facets (Lighter Slate)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(1160, 310);
    ctx.lineTo(1250, 130);
    ctx.lineTo(1360, 110);
    ctx.lineTo(1460, 190);
    ctx.lineTo(1420, 310);
    ctx.closePath();
    ctx.fill();

    // Mountain Summit Plateau
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(1280, 190, 90, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone Steps ascending the Mountain Peak
    ctx.fillStyle = '#94a3b8';
    for (let st = 0; st < 6; st++) {
      ctx.fillRect(1250 - st * 8, 230 + st * 14, 55 + st * 10, 8);
    }

    // Mountain Pines
    const mPines = [
      { x: 1180, y: 200 },
      { x: 1400, y: 160 },
      { x: 1460, y: 250 },
    ];
    mPines.forEach((p) => {
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(p.x - 3, p.y, 6, 16);
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 30);
      ctx.lineTo(p.x + 14, p.y + 2);
      ctx.lineTo(p.x - 14, p.y + 2);
      ctx.closePath();
      ctx.fill();
    });

    // Mountain Holy Mist
    ctx.fillStyle = 'rgba(241, 245, 249, 0.12)';
    ctx.beginPath();
    ctx.ellipse(1280, 200, 130, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Draw 16-Bit World Objects
  const drawWorldObject = (
    ctx: CanvasRenderingContext2D,
    obj: WorldObject,
    time: number,
    player: PlayerState
  ) => {
    const bob = Math.sin(time * 0.005 + obj.x) * 3;
    const isNearby = Math.hypot(player.x - obj.x, player.y - obj.y) < 65;

    if (obj.type === 'oil_vessel') {
      ctx.save();
      ctx.translate(obj.x, obj.y + bob);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-4, -13, 8, 5);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (obj.type === 'talent_chest') {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-12, -8, 24, 16);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-12, -12, 24, 5);
      ctx.fillRect(-3, -7, 6, 6);
      ctx.restore();
    } else if (obj.type === 'npc_merchant') {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // Holy Golden pulsing aura under Temple of the Lord
      ctx.fillStyle = 'rgba(212, 175, 55, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 44 + Math.sin(time * 0.005) * 5, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Temple Foundation / Steps
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-32, 12, 64, 14);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-28, 6, 56, 6);

      // Temple Sanctuary Altar / Inner Portico
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-24, -18, 48, 24);

      // White/Golden Marble Pillars
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-24, -20, 6, 26);
      ctx.fillRect(-10, -20, 5, 26);
      ctx.fillRect(5, -20, 5, 26);
      ctx.fillRect(18, -20, 6, 26);

      // Pillar Golden Capitals & Bases
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-25, -22, 8, 3);
      ctx.fillRect(-11, -22, 7, 3);
      ctx.fillRect(4, -22, 7, 3);
      ctx.fillRect(17, -22, 8, 3);
      ctx.fillRect(-25, 4, 8, 3);
      ctx.fillRect(-11, 4, 7, 3);
      ctx.fillRect(4, 4, 7, 3);
      ctx.fillRect(17, 4, 8, 3);

      // Temple Golden Pediment / Triangular Roof
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(-30, -22);
      ctx.lineTo(30, -22);
      ctx.lineTo(0, -42);
      ctx.closePath();
      ctx.fill();

      // Inner Pediment Crest (Golden Radiant Cross)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -30, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Consecrated Holy Oil Vessels on Sacred Altar
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-6, -4, 4, 7);
      ctx.fillRect(2, -4, 4, 7);

      // Temple Steward / Priest Sprite
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -10, 5, 0, Math.PI * 2);
      ctx.fill();
      // Priest Robe & Golden Ephod
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -5, 8, 11);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-2, -5, 4, 8);

      // Sacred Golden Altar Flame / Menorah Glow
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-18, -12, 3, 0, Math.PI * 2);
      ctx.arc(18, -12, 3, 0, Math.PI * 2);
      ctx.fill();

      // Overhead Floating Tag
      ctx.fillStyle = isNearby ? '#fef08a' : '#d4af37';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isNearby ? '🏛️ Temple [E] • Praise Restores Mana' : '🏛️ Temple of the Lord', 0, -48 + bob);

      ctx.fillStyle = isNearby ? '#93c5fd' : '#cbd5e1';
      ctx.font = '9px sans-serif';
      ctx.fillText(isNearby ? '✨ Holy Mana Energy Recharging!' : '(Holy Oil & Truth Scrolls)', 0, -36 + bob);
      ctx.restore();
    } else if (obj.type === 'home_cottage') {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 24, 42, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillRect(-35, -20, 70, 44);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-33, -18, 66, 40);
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(-42, -20);
      ctx.lineTo(0, -55);
      ctx.lineTo(42, -20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-10, 2, 20, 24);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(4, 14, 3, 3);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-26, -6, 12, 12);
      ctx.fillRect(14, -6, 12, 12);
      ctx.fillStyle = isNearby ? '#6ee7b7' : '#e2e8f0';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isNearby ? "🛌 Resting at Home [E] • Mana & HP Restoring" : "Pilgrim's Home & Hearth", 0, -62 + bob);
      ctx.restore();
    } else if (obj.type === 'home_garden') {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = '#291e12';
      ctx.fillRect(-45, -20, 90, 40);
      ctx.fillStyle = '#3e2c1c';
      ctx.fillRect(-42, -18, 84, 36);
      ctx.fillStyle = '#b45309';
      for (let f = -44; f <= 44; f += 11) {
        ctx.fillRect(f, -24, 4, 10);
        ctx.fillRect(f, 16, 4, 10);
      }
      ctx.fillRect(-46, -20, 92, 2);
      ctx.fillRect(-46, 20, 92, 2);

      souls.forEach((s, idx) => {
        const px = -32 + (idx % 4) * 21;
        const py = idx < 4 ? -8 : 8;
        if (s.status === 'believed') {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py - 4, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.seedPlanted) {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(px - 1, py - 3, 2, 4);
          ctx.fillRect(px - 3, py - 4, 3, 2);
        } else {
          ctx.fillStyle = '#573d26';
          ctx.beginPath();
          ctx.ellipse(px, py, 4, 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.fillStyle = isNearby ? '#fef08a' : '#a7f3d0';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isNearby ? '🌱 Garden [E]' : '🌱 Garden of Faith', 0, -30 + bob);
      ctx.restore();
    } else if (obj.type === 'npc_soul_human' && obj.soulData) {
      const s = obj.soulData;
      const isRed = Boolean(s.isHardToWin);
      const isDisciple = Boolean(s.isDiscipleFollowing);
      const isShepherd = Boolean(s.isShepherd);

      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Aura effects
      if (isDisciple) {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 20 + Math.sin(time * 0.006) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (isShepherd) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 18 + Math.sin(time * 0.005) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (isRed && s.status !== 'believed') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      const tunicColor =
        isDisciple
          ? '#fef08a'
          : isShepherd
          ? '#6ee7b7'
          : s.status === 'believed'
          ? '#dcfce7'
          : s.status === 'questioning'
          ? '#fef08a'
          : isRed
          ? '#dc2626'
          : '#94a3b8';

      ctx.fillStyle = tunicColor;
      ctx.beginPath();
      ctx.moveTo(-7, 12);
      ctx.lineTo(7, 12);
      ctx.lineTo(5, -6 + bob);
      ctx.lineTo(-5, -6 + bob);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -11 + bob, 5, 0, Math.PI * 2);
      ctx.fill();

      // Golden Halo / Crown for Believers & Disciples
      if (isDisciple || isShepherd || s.status === 'believed') {
        ctx.fillStyle = isDisciple ? '#d4af37' : isShepherd ? '#34d399' : '#d4af37';
        ctx.beginPath();
        ctx.arc(0, -18 + bob, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shepherd's Staff (Crook)
      if (isShepherd) {
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 14);
        ctx.lineTo(8, -16 + bob);
        ctx.arc(6, -18 + bob, 3, 0, Math.PI, true);
        ctx.stroke();
      }

      // Disciple's Scripture Scroll
      if (isDisciple) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 2 + bob, 4, 7);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(5, 1 + bob, 6, 2);
      }

      ctx.fillStyle =
        isDisciple
          ? '#fef08a'
          : isShepherd
          ? '#a7f3d0'
          : s.status === 'believed'
          ? '#34d399'
          : isRed
          ? '#f87171'
          : s.status === 'questioning'
          ? '#fbbf24'
          : '#e2e8f0';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';

      let label = isNearby
        ? `[E] ${s.name}`
        : `${isDisciple ? '📖' : isShepherd ? '🐑' : s.status === 'believed' ? '✨' : isRed ? '🔥' : '👤'} ${s.name}`;

      ctx.fillText(label, 0, -24 + bob);
      ctx.restore();
    } else if (obj.type === 'enemy_shadow' || obj.type === 'dragon_boss') {
      const isDragon = obj.type === 'dragon_boss';
      const isRedEnemy = Boolean(obj.enemyData?.isStrongRed || isDragon);
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // Red demonic mist on ground
      ctx.fillStyle = isRedEnemy ? 'rgba(239, 68, 68, 0.25)' : 'rgba(220, 38, 38, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 14, isDragon ? 38 : 24, isDragon ? 16 : 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shadow body aura
      ctx.fillStyle = isRedEnemy ? 'rgba(69, 10, 10, 0.95)' : 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      const bodyRadius = (isDragon ? 32 : isRedEnemy ? 22 : 18) + Math.sin(time * 0.005) * 3;
      ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer border / flame
      ctx.strokeStyle = isRedEnemy ? '#dc2626' : '#ef4444';
      ctx.lineWidth = isRedEnemy ? 3 : 2;
      ctx.stroke();

      if (isRedEnemy) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, bodyRadius + 8 + Math.sin(time * 0.008) * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Demonic Horns
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-10, -bodyRadius + 4);
      ctx.lineTo(-18, -bodyRadius - 10);
      ctx.lineTo(-6, -bodyRadius);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -bodyRadius + 4);
      ctx.lineTo(18, -bodyRadius - 10);
      ctx.lineTo(6, -bodyRadius);
      ctx.closePath();
      ctx.fill();

      // Red glowing eyes
      ctx.fillStyle = isRedEnemy ? '#fef08a' : '#ef4444';
      ctx.fillRect(-6, -4, 4, 4);
      ctx.fillRect(2, -4, 4, 4);

      // Name & battle prompt
      ctx.fillStyle = isRedEnemy ? '#fca5a5' : '#f87171';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isNearby ? `⚔️ Confront [E]` : isDragon ? `🐉 ${obj.name}` : `😈 ${obj.name}`,
        0,
        -bodyRadius - 14
      );
      ctx.restore();
    } else if (obj.type === 'mountain_prayer_room') {
      ctx.save();
      ctx.translate(obj.x, obj.y);

      // Holy Mountain Sanctuary Radiant Golden Aura
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 48 + Math.sin(time * 0.005) * 5, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone Platform / Foundation
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-36, 6, 72, 14);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-32, 0, 64, 6);

      // Sanctuary Chapel Walls (White Stone)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-28, -26, 56, 26);

      // Portico Pillars
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-26, -26, 5, 26);
      ctx.fillRect(21, -26, 5, 26);
      ctx.fillRect(-6, -26, 12, 26);

      // Golden Archway / Altar Niche
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -10, 10, Math.PI, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();

      // Altar Flame (Holy Prayer Incense)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, -8, 4 + Math.sin(time * 0.01) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -9, 2, 0, Math.PI * 2);
      ctx.fill();

      // Incense Smoke Particle rising up
      const smokeOffset = (time * 0.04) % 25;
      ctx.fillStyle = 'rgba(241, 245, 249, 0.5)';
      ctx.beginPath();
      ctx.arc(Math.sin(time * 0.01) * 3, -15 - smokeOffset, 3 + smokeOffset * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Mountain Dome Roof (Golden)
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(0, -26, 22, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Golden Cross on Roof
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, -54, 4, 14);
      ctx.fillRect(-6, -50, 12, 4);

      // Two Mountain Prayer Lamps on each side
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-34, -4, 4, 10);
      ctx.fillRect(30, -4, 4, 10);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-32, -6, 3, 0, Math.PI * 2);
      ctx.arc(32, -6, 3, 0, Math.PI * 2);
      ctx.fill();

      // Overhead Prompt
      ctx.fillStyle = isNearby ? '#fef08a' : '#d4af37';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isNearby ? `⛰️ Mountain Prayer Sanctuary [E] • Consecrate` : `⛰️ Mount of Olives Prayer Room`,
        0,
        -62 + bob
      );

      ctx.fillStyle = isNearby ? '#6ee7b7' : '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText(`(Kneel & Consecrate Heart to God)`, 0, -50 + bob);

      ctx.restore();
    }
  };

  // Draw 16-Bit Bride Sprite (Shows Darkening & Afflictions)
  const drawBrideSprite = (ctx: CanvasRenderingContext2D, p: PlayerState, time: number) => {
    ctx.save();
    ctx.translate(p.x, p.y);

    const b = p.bride;
    const walkBob = p.stepsWalked % 2 === 0 ? 0 : -2;
    const isAfflicted = Boolean(p.darkAffliction);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark affliction aura on canvas if afflicted by enemy taunts
    if (isAfflicted) {
      ctx.fillStyle =
        p.darkAffliction === 'lust_blindness'
          ? 'rgba(88, 28, 135, 0.35)'
          : p.darkAffliction === 'pride_curse'
          ? 'rgba(185, 28, 28, 0.35)'
          : p.darkAffliction === 'greed_cowardice'
          ? 'rgba(161, 98, 7, 0.35)'
          : 'rgba(76, 29, 149, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -6, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gown / Robe - Darkened when afflicted by enemy taunt!
    ctx.fillStyle = isAfflicted ? '#1e1b2e' : b.color;
    ctx.beginPath();
    ctx.moveTo(-10, 14);
    ctx.lineTo(10, 14);
    ctx.lineTo(6, -8 + walkBob);
    ctx.lineTo(-6, -8 + walkBob);
    ctx.closePath();
    ctx.fill();

    // Mantle
    ctx.fillStyle = isAfflicted ? '#0f0c1b' : b.secondaryColor;
    ctx.fillRect(-6, -8 + walkBob, 12, 8);

    // Head / Veil
    ctx.fillStyle = isAfflicted ? '#cbd5e1' : '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -14 + walkBob, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isAfflicted ? '#475569' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, -17 + walkBob, 7, Math.PI, 0, false);
    ctx.lineTo(6, -6 + walkBob);
    ctx.lineTo(-6, -6 + walkBob);
    ctx.closePath();
    ctx.fill();

    // Crown
    ctx.fillStyle = isAfflicted ? '#71717a' : b.accentColor;
    ctx.fillRect(-5, -20 + walkBob, 10, 3);

    // Lantern
    const lanternX = p.direction === 'left' ? -14 : 14;
    const lanternY = -2 + walkBob;

    ctx.fillStyle = '#78350f';
    ctx.fillRect(lanternX - 4, lanternY, 8, 10);

    if (p.isLanternLit && p.oil > 0) {
      const flicker = Math.sin(time * 0.02 + p.id) * 2;
      const flameRad = (isAfflicted ? 3 : 5) + (p.oil / 100) * 4 + flicker;
      ctx.fillStyle = isAfflicted ? '#a855f7' : '#d4af37';
      ctx.beginPath();
      ctx.arc(lanternX, lanternY + 5, flameRad, 0, Math.PI * 2);
      ctx.fill();
      if (!isAfflicted) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lanternX, lanternY + 4, flameRad * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  // Dynamic Lighting
  const drawDynamicLighting = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camX: number,
    camY: number,
    p1: PlayerState,
    p2: PlayerState | null,
    currentWeather: WeatherType,
    time: number
  ) => {
    let ambientDarkness = 0.42;
    if (currentWeather === 'peaceful_day') ambientDarkness = 0.2;
    if (currentWeather === 'evening_rain') ambientDarkness = 0.65;
    if (currentWeather === 'midnight_storm') ambientDarkness = 0.88;
    if (currentWeather === 'celestial_dawn') ambientDarkness = 0.08;

    if (lightningFlash.current > 0) {
      ambientDarkness = Math.max(0, ambientDarkness - lightningFlash.current * 0.8);
      lightningFlash.current = Math.max(0, lightningFlash.current - 0.05);
    }

    ctx.save();
    ctx.fillStyle = `rgba(12, 13, 16, ${ambientDarkness})`;
    ctx.fillRect(camX, camY, w, h);

    const p1Rad = (p1.oil / 100) * 140 + 45 + Math.sin(time * 0.01) * 6;
    if (p1.isLanternLit && p1.oil > 0) {
      const grad1 = ctx.createRadialGradient(p1.x, p1.y, 10, p1.x, p1.y, p1Rad);
      grad1.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      grad1.addColorStop(0.7, 'rgba(212, 175, 55, 0.15)');
      grad1.addColorStop(1, 'rgba(212, 175, 55, 0)');

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1Rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1Rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Weather Effects
  const drawWeatherEffects = (ctx: CanvasRenderingContext2D, currentWeather: WeatherType, time: number) => {
    if (currentWeather === 'evening_rain' || currentWeather === 'midnight_storm') {
      ctx.strokeStyle = currentWeather === 'midnight_storm' ? '#93c5fd' : '#bfdbfe';
      ctx.lineWidth = 1.5;
      rainDrops.current.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x -= 1.5;
        if (d.y > MAP_HEIGHT) {
          d.y = 0;
          d.x = Math.random() * MAP_WIDTH;
        }
      });
    }

    if (currentWeather === 'peaceful_day' || currentWeather === 'celestial_dawn') {
      goldenMotes.current.forEach((m) => {
        ctx.fillStyle = `rgba(212, 175, 55, ${m.opacity})`;
        ctx.beginPath();
        ctx.arc(m.x + Math.sin(time * 0.002 + m.y) * 8, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        m.y += m.speedY;
        if (m.y < 0) {
          m.y = MAP_HEIGHT;
          m.x = Math.random() * MAP_WIDTH;
        }
      });
    }
  };

  const viewW = 960;
  const viewH = 620;
  const targetCamX = player2 ? (player1.x + player2.x) / 2 : player1.x;
  const targetCamY = player2 ? (player1.y + player2.y) / 2 : player1.y;
  const camX = Math.max(0, Math.min(MAP_WIDTH - viewW, targetCamX - viewW / 2));
  const camY = Math.max(0, Math.min(MAP_HEIGHT - viewH, targetCamY - viewH / 2));

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-lg overflow-hidden bg-[#0c0d10] border border-[#2a2a35] shadow-2xl touch-none select-none">
      <canvas
        ref={canvasRef}
        width={960}
        height={620}
        className="w-full h-full object-cover block cursor-pointer touch-none"
        onPointerDown={(e) => {
          handleCanvasPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) {
            handleCanvasPointer(e.clientX, e.clientY);
          }
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            handleCanvasPointer(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            handleCanvasPointer(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onClick={triggerNearestObjectInteraction}
      />

      {/* Interactive Minimap & Radar (Upper-Right) */}
      <Minimap
        player1={player1}
        player2={player2}
        worldObjects={worldObjects}
        souls={souls}
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
        camX={camX}
        camY={camY}
        viewWidth={viewW}
        viewHeight={viewH}
      />
    </div>
  );
};
