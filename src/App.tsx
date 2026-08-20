import React, { useState, useEffect, useCallback } from 'react';
import { GameStageId, PlayerState, WeatherType, WorldObject, BrideCharacter, RPGEnemy, DialogueNode, SoulPerson } from './types';
import { BRIDES_OF_LIGHT } from './data/brides';
import { STAGE_NARRATIVES, StageNarrative } from './data/scriptures';
import { SCRIPTURE_READ_ALOUDS, INITIAL_INVENTORY, RPG_ENEMIES } from './data/rpgData';
import { SEVEN_SOULS_DATA } from './data/soulsData';
import { soundEngine } from './audio/soundEngine';
import { PixelCanvas } from './components/PixelCanvas';
import { CharacterSelect } from './components/CharacterSelect';
import { ScriptureModal } from './components/ScriptureModal';
import { LanternStatus } from './components/LanternStatus';
import { VirtualControls } from './components/VirtualControls';
import { LeaderboardModal } from './components/LeaderboardModal';
import { StageCinematics } from './components/StageCinematics';
import { LoreGuideModal } from './components/LoreGuideModal';
import { BattleScreen } from './components/BattleScreen';
import { DialogBox } from './components/DialogBox';
import { InventoryModal } from './components/InventoryModal';
import { MerchantModal } from './components/MerchantModal';
import { GospelShareModal } from './components/GospelShareModal';
import { GardenModal } from './components/GardenModal';
import { EndTimesCinematic } from './components/EndTimesCinematic';
import { OldAgeEndingModal } from './components/OldAgeEndingModal';
import { AngelsModal } from './components/AngelsModal';
import { MountainPrayerRoomModal } from './components/MountainPrayerRoomModal';
import { CELESTIAL_ANGELS, CelestialAngel } from './data/angelsData';
import { Volume2, VolumeX, BookOpen, Trophy, Sparkles, Smartphone, Flame, ShoppingBag, Music, Shield, Mountain } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentStage, setCurrentStage] = useState<GameStageId>('prologue_call');
  const [weather, setWeather] = useState<WeatherType>('peaceful_day');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isEndTimesBGMActive, setIsEndTimesBGMActive] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showLoreGuide, setShowLoreGuide] = useState<boolean>(false);
  const [showAngelsModal, setShowAngelsModal] = useState<boolean>(false);
  const [showMountainPrayerModal, setShowMountainPrayerModal] = useState<boolean>(false);
  const [claimedAngelBlessingIds, setClaimedAngelBlessingIds] = useState<string[]>([]);
  const [showVirtualControls, setShowVirtualControls] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 850 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    }
    return false;
  });
  const [virtualDirs, setVirtualDirs] = useState<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showMerchant, setShowMerchant] = useState<boolean>(false);
  const [isCoopMode, setIsCoopMode] = useState<boolean>(false);

  // 7 Souls & Sanctuary Garden System
  const [souls, setSouls] = useState<SoulPerson[]>(SEVEN_SOULS_DATA);
  const [activeSoulShare, setActiveSoulShare] = useState<SoulPerson | null>(null);
  const [showGardenModal, setShowGardenModal] = useState<boolean>(false);

  // 1-Hour Earthly Lifespan Countdown (3600 seconds)
  const [lifeTimeRemaining, setLifeTimeRemaining] = useState<number>(3600);

  // Active Narrative & RPG Modals
  const [activeNarrative, setActiveNarrative] = useState<StageNarrative | null>(null);
  const [activeBattle, setActiveBattle] = useState<RPGEnemy | null>(null);
  const [activeBattleWorldObjId, setActiveBattleWorldObjId] = useState<string | null>(null);
  const [defeatedEnemyIds, setDefeatedEnemyIds] = useState<string[]>([]);
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // Players State
  const [player1, setPlayer1] = useState<PlayerState>({
    id: 1,
    bride: BRIDES_OF_LIGHT[0],
    x: 900,
    y: 650,
    vx: 0,
    vy: 0,
    direction: 'down',
    level: 1,
    faithExp: 0,
    nextLevelExp: 100,
    health: 100,
    maxHealth: 100,
    sp: BRIDES_OF_LIGHT[0].baseSp || 50,
    maxSp: BRIDES_OF_LIGHT[0].baseSp || 50,
    oil: 100,
    maxOil: 100,
    attack: BRIDES_OF_LIGHT[0].baseAttack || 18,
    wisdom: BRIDES_OF_LIGHT[0].baseWisdom || 24,
    defense: 10,
    isLanternLit: true,
    talentsCollected: 0,
    landPurchased: false,
    confessedFaith: false,
    score: 0,
    stepsWalked: 0,
    isAlive: true,
    angelRescuesRemaining: 3,
    activeHelpersCount: 0,
    darkAffliction: null,
    inventory: INITIAL_INVENTORY,
    scriptures: SCRIPTURE_READ_ALOUDS,
  });

  const [player2, setPlayer2] = useState<PlayerState | null>(null);

  // 1-Hour Lifespan Clock Ticker
  useEffect(() => {
    if (
      currentStage === 'title' ||
      currentStage === 'character_select' ||
      currentStage === 'victory' ||
      currentStage === 'game_over' ||
      currentStage === 'tomb_old_age' ||
      currentStage === 'end_times_battle'
    ) {
      return;
    }

    const timer = setInterval(() => {
      setLifeTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const soulsBelieved = souls.filter((s) => s.status === 'believed').length;
          if (soulsBelieved < 7) {
            setCurrentStage('tomb_old_age');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStage, souls]);

  // Update Weather based on stage (No background music per user instruction)
  useEffect(() => {
    switch (currentStage) {
      case 'title':
      case 'character_select':
      case 'prologue_call':
      case 'stage1_talents':
        setWeather('peaceful_day');
        soundEngine.stopRainAudio();
        break;
      case 'stage2_confession':
        setWeather('evening_rain');
        soundEngine.startRainAudio(0.14);
        break;
      case 'stage3_midnight':
        setWeather('midnight_storm');
        soundEngine.startRainAudio(0.24);
        break;
      case 'epilogue_word':
      case 'victory':
        setWeather('celestial_dawn');
        soundEngine.stopRainAudio();
        break;
    }
  }, [currentStage]);

  // Check Game Over condition
  useEffect(() => {
    if (
      (currentStage === 'prologue_call' ||
        currentStage === 'stage1_talents' ||
        currentStage === 'stage2_confession' ||
        currentStage === 'stage3_midnight') &&
      player1.oil <= 0 &&
      player1.health <= 0
    ) {
      setCurrentStage('game_over');
    }
  }, [player1.oil, player1.health, currentStage]);

  const handleStartGame = () => {
    soundEngine.playScriptureBell();
    setCurrentStage('character_select');
  };

  const handleSelectBrides = (p1Bride: BrideCharacter, p2Bride: BrideCharacter | null) => {
    const maxOilP1 = p1Bride.id === 'hypomone' ? 140 : 100;
    const maxHpP1 = p1Bride.id === 'hypomone' ? 130 : 100;

    setPlayer1({
      id: 1,
      bride: p1Bride,
      x: 900,
      y: 650,
      vx: 0,
      vy: 0,
      direction: 'down',
      level: 1,
      faithExp: 0,
      nextLevelExp: 100,
      health: maxHpP1,
      maxHealth: maxHpP1,
      sp: p1Bride.baseSp || 50,
      maxSp: p1Bride.baseSp || 50,
      oil: maxOilP1,
      maxOil: maxOilP1,
      attack: p1Bride.baseAttack || 18,
      wisdom: p1Bride.baseWisdom || 24,
      defense: 10,
      isLanternLit: true,
      talentsCollected: 0,
      landPurchased: false,
      confessedFaith: false,
      score: 100,
      stepsWalked: 0,
      isAlive: true,
      angelRescuesRemaining: 3,
      activeHelpersCount: 0,
      darkAffliction: null,
      inventory: INITIAL_INVENTORY,
      scriptures: SCRIPTURE_READ_ALOUDS,
    });

    if (p2Bride) {
      const maxOilP2 = p2Bride.id === 'hypomone' ? 140 : 100;
      setPlayer2({
        id: 2,
        bride: p2Bride,
        x: 940,
        y: 650,
        vx: 0,
        vy: 0,
        direction: 'down',
        level: 1,
        faithExp: 0,
        nextLevelExp: 100,
        health: 100,
        maxHealth: 100,
        sp: p2Bride.baseSp || 50,
        maxSp: p2Bride.baseSp || 50,
        oil: maxOilP2,
        maxOil: maxOilP2,
        attack: p2Bride.baseAttack || 18,
        wisdom: p2Bride.baseWisdom || 24,
        defense: 10,
        isLanternLit: true,
        talentsCollected: 0,
        landPurchased: false,
        confessedFaith: false,
        score: 100,
        stepsWalked: 0,
        isAlive: true,
        angelRescuesRemaining: 3,
        activeHelpersCount: 0,
        darkAffliction: null,
        inventory: INITIAL_INVENTORY,
        scriptures: SCRIPTURE_READ_ALOUDS,
      });
    } else {
      setPlayer2(null);
    }

    setCurrentStage('prologue_call');
    setActiveNarrative(STAGE_NARRATIVES.prologue_call);
  };

  const handleTrimLantern = useCallback((playerId: 1 | 2) => {
    soundEngine.playLanternTrim();
    if (playerId === 1) {
      setPlayer1((prev) => ({
        ...prev,
        score: prev.score + 10,
        isLanternLit: prev.oil > 0,
      }));
    } else if (player2) {
      setPlayer2((prev) => ({
        ...prev,
        score: prev.score + 10,
        isLanternLit: prev.oil > 0,
      }));
    }
  }, [player2]);

  // Object Interaction (NPCs, Altars, Merchant, Garden, Souls)
  const handleInteractObject = useCallback((obj: WorldObject) => {
    if (obj.type === 'npc_elder') {
      soundEngine.playScriptureBell();
      setActiveDialogue(obj.dialogue || {
        speaker: 'Elder Simeon',
        text: 'Keep your lamp burning brightly, for the Bridegroom comes at an hour you do not expect.',
        scriptureRef: 'Luke 12:35',
      });
    } else if (obj.type === 'npc_merchant') {
      soundEngine.playScriptureBell();
      setShowMerchant(true);
    } else if (obj.type === 'home_cottage' || obj.type === 'home_garden') {
      soundEngine.playScriptureBell();
      setShowGardenModal(true);
    } else if (obj.type === 'npc_soul_human' && obj.soulData) {
      soundEngine.playScriptureBell();
      setActiveSoulShare(obj.soulData);
    } else if (obj.type === 'mountain_prayer_room') {
      soundEngine.playScriptureBell();
      setShowMountainPrayerModal(true);
    } else if (obj.type === 'scripture_altar') {
      soundEngine.playScriptureBell();
      if (currentStage === 'prologue_call') {
        setActiveNarrative(STAGE_NARRATIVES.prologue_call);
      } else if (currentStage === 'stage1_talents') {
        setActiveNarrative(STAGE_NARRATIVES.stage1_talents);
      } else if (currentStage === 'stage2_confession') {
        setActiveNarrative(STAGE_NARRATIVES.stage2_confession);
      } else if (currentStage === 'epilogue_word') {
        setActiveNarrative(STAGE_NARRATIVES.epilogue_word);
      }
    } else if (obj.type === 'land_deed') {
      soundEngine.playTalentPickup();
      setActiveNarrative(STAGE_NARRATIVES.stage2_confession);
    } else if (obj.type === 'bride_companion' || obj.type === 'white_horse_king') {
      soundEngine.playScriptureBell();
      setActiveNarrative(STAGE_NARRATIVES.stage3_midnight);
    }
  }, [currentStage]);

  // Soul Gospel Interaction Callbacks
  const handleInteractSoul = (soul: SoulPerson) => {
    soundEngine.playScriptureBell();
    setActiveSoulShare(soul);
  };

  const handleSoulBelieved = (soulId: string) => {
    soundEngine.playScriptureBell();
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#fef08a', '#10b981', '#3b82f6'],
    });

    const targetSoul = souls.find((s) => s.id === soulId);
    const isRed = Boolean(targetSoul?.isHardToWin);

    setSouls((prev) =>
      prev.map((s) =>
        s.id === soulId
          ? {
              ...s,
              status: 'believed',
              seedPlanted: true,
              plantGrowth: Math.max(s.plantGrowth, 50),
              isDiscipleFollowing: isRed ? true : s.isDiscipleFollowing,
              isShepherd: false,
              name: isRed ? `Disciple ${s.name.replace('Disciple ', '').replace('Shepherd ', '')}` : s.name,
            }
          : s
      )
    );

    const soulNextLevel = player1.level + 1;
    if (isRed) {
      setLevelUpMessage(`🔥 Red Human Cornelius won over! +1 LEVEL UP (Lv.${soulNextLevel}) & +5 Talents! He walks beside you as DISCIPLE into battle!`);
      setTimeout(() => setLevelUpMessage(null), 6000);
    } else {
      setLevelUpMessage(`✨ SOUL SAVED! +1 LEVEL UP (Now Lv.${soulNextLevel}) & +5 Kingdom Talents rewarded!`);
      setTimeout(() => setLevelUpMessage(null), 5500);
    }

    setPlayer1((prev) => {
      const newLevel = prev.level + 1;
      const nextExpThreshold = prev.nextLevelExp + 100;
      const newMaxHp = prev.maxHealth + 25;
      const newMaxSp = prev.maxSp + 20;
      const newAtk = prev.attack + 5;
      const newWis = prev.wisdom + 6;

      // Add 5 Talents to inventory for winning a soul
      const updatedInv = prev.inventory.map((item) =>
        item.id === 'kingdom_talents'
          ? { ...item, count: item.count + 5 }
          : item
      );

      return {
        ...prev,
        level: newLevel,
        nextLevelExp: nextExpThreshold,
        health: newMaxHp,
        maxHealth: newMaxHp,
        sp: newMaxSp,
        maxSp: newMaxSp,
        attack: newAtk,
        wisdom: newWis,
        score: prev.score + (isRed ? 800 : 500),
        talentsCollected: prev.talentsCollected + 5,
        inventory: updatedInv,
        oil: Math.min(prev.maxOil, prev.oil + 20),
        activeHelpersCount: (prev.activeHelpersCount || 0) + (isRed ? 1 : 0),
      };
    });
  };

  // Water Plant with Prayer in Sanctuary Garden (Spends 10 SP blue energy)
  const handleWaterPlant = (soulId: string) => {
    if (player1.sp < 10) return;

    soundEngine.playScriptureBell();
    setPlayer1((prev) => ({
      ...prev,
      sp: prev.sp - 10,
      score: prev.score + 50,
    }));

    setSouls((prev) =>
      prev.map((s) =>
        s.id === soulId
          ? {
              ...s,
              plantGrowth: Math.min(100, s.plantGrowth + 35),
            }
          : s
      )
    );
  };

  const handleStartEndTimesBattle = () => {
    setShowGardenModal(false);
    setCurrentStage('end_times_battle');
  };

  const handleFinishEndTimesVictory = () => {
    setCurrentStage('victory');
  };

  // Trigger RPG Battle
  const handleTriggerBattle = (enemy: RPGEnemy, worldObjectId?: string) => {
    soundEngine.startStageMusic('stage3_midnight');
    setActiveBattle(enemy);
    if (worldObjectId) {
      setActiveBattleWorldObjId(worldObjectId);
    }
  };

  // Battle Victory Handler: Automatically exits battle, transports player home, and rewards 2 Level Ups & 20 Talents
  const handleBattleVictory = (expGained: number, talentsGained: number, enemyId?: string) => {
    if (enemyId) {
      setDefeatedEnemyIds((prev) => (prev.includes(enemyId) ? prev : [...prev, enemyId]));
    }
    if (activeBattle) {
      setDefeatedEnemyIds((prev) => (prev.includes(activeBattle.id) ? prev : [...prev, activeBattle.id]));
    }
    if (activeBattleWorldObjId) {
      setDefeatedEnemyIds((prev) => (prev.includes(activeBattleWorldObjId) ? prev : [...prev, activeBattleWorldObjId]));
      setActiveBattleWorldObjId(null);
    }
    setActiveBattle(null);

    confetti({
      particleCount: 75,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#fef08a', '#3b82f6', '#10b981'],
    });

    const nextLevel = player1.level + 2;
    const actualTalents = Math.max(20, talentsGained || 20);

    // Check if any disciple was following the player during battle
    const hasFollowingDisciples = souls.some((s) => s.isDiscipleFollowing);
    if (hasFollowingDisciples) {
      setSouls((prev) =>
        prev.map((s) =>
          s.isDiscipleFollowing
            ? {
                ...s,
                isDiscipleFollowing: false,
                isShepherd: true,
                name: `Shepherd ${s.name.replace('Disciple ', '').replace('Shepherd ', '')}`,
              }
            : s
        )
      );
      setLevelUpMessage(
        `🐑 Demon Defeated! +2 LEVEL UPS (Now Lv.${nextLevel}) & +${actualTalents} Talents! Your Disciple is sent forth as a SHEPHERD!`
      );
      setTimeout(() => setLevelUpMessage(null), 6000);
    } else {
      setLevelUpMessage(
        `⚔️ DEMON DEFEATED! Returned Home safely with +2 LEVEL UPS (Now Lv.${nextLevel}) & +${actualTalents} Kingdom Talents!`
      );
      setTimeout(() => setLevelUpMessage(null), 5500);
    }

    setPlayer1((prev) => {
      const newScore = prev.score + Math.round(expGained * (prev.bride.faithMultiplier || 1));
      const newExp = prev.faithExp + expGained;
      const newLevel = prev.level + 2;
      const nextExpThreshold = prev.nextLevelExp + 240;
      const newMaxHp = prev.maxHealth + 50; // +50 HP for 2 level ups!
      const newMaxSp = prev.maxSp + 40;     // +40 SP for 2 level ups!
      const newAtk = prev.attack + 10;       // +10 ATK for 2 level ups!
      const newWis = prev.wisdom + 12;       // +12 Wisdom for 2 level ups!

      // Add 20 Talents to inventory
      const updatedInv = prev.inventory.map((item) =>
        item.id === 'kingdom_talents'
          ? { ...item, count: item.count + actualTalents }
          : item
      );

      return {
        ...prev,
        x: 260,
        y: 350,
        vx: 0,
        vy: 0,
        direction: 'down',
        level: newLevel,
        faithExp: newExp,
        nextLevelExp: nextExpThreshold,
        health: newMaxHp,
        maxHealth: newMaxHp,
        sp: newMaxSp,
        maxSp: newMaxSp,
        attack: newAtk,
        wisdom: newWis,
        score: newScore,
        talentsCollected: prev.talentsCollected + actualTalents,
        inventory: updatedInv,
        oil: Math.min(prev.maxOil, prev.oil + 35),
        darkAffliction: null, // Cleansed from enemy dark curses! Can walk normal again!
        activeHelpersCount: Math.max(0, (prev.activeHelpersCount || 0) - (hasFollowingDisciples ? 1 : 0)),
      };
    });

    // If boss defeated in stage 3, victory stage!
    if (activeBattle?.id === 'dragon_boss') {
      soundEngine.playDragonDefeat();
      setCurrentStage('victory');
    }
  };

  // Battle Defeat Handler
  const handleBattleDefeat = () => {
    setActiveBattle(null);
    setPlayer1((prev) => ({
      ...prev,
      health: 30,
      oil: 30,
      x: 900,
      y: 650,
    }));
  };

  const handleCompleteStageNarrative = (bonusFaith: number) => {
    setActiveNarrative(null);
    setPlayer1((prev) => ({
      ...prev,
      score: prev.score + Math.round(bonusFaith * (prev.bride.faithMultiplier || 1)),
      oil: prev.maxOil,
      health: prev.maxHealth,
      sp: prev.maxSp,
    }));

    if (currentStage === 'prologue_call') {
      setCurrentStage('stage1_talents');
    } else if (currentStage === 'stage1_talents') {
      setCurrentStage('stage2_confession');
    } else if (currentStage === 'stage2_confession') {
      setCurrentStage('stage3_midnight');
    } else if (currentStage === 'stage3_midnight') {
      setCurrentStage('victory');
    } else if (currentStage === 'epilogue_word') {
      setCurrentStage('victory');
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const handleConsecration = (consecrationType: 'full_consecration' | 'intercession' | 'vigil_fasting') => {
    soundEngine.playScriptureBell();
    if (consecrationType === 'full_consecration') {
      setLevelUpMessage('✨ MOUNTAIN CONSECRATION: Soul renewed, Lamp Oil refilled & burdens cleansed!');
      setTimeout(() => setLevelUpMessage(null), 5000);
      setPlayer1((prev) => ({
        ...prev,
        oil: prev.maxOil,
        sp: prev.maxSp,
        score: prev.score + 150,
        wisdom: prev.wisdom + 10,
        darkAffliction: null,
      }));
    } else if (consecrationType === 'intercession') {
      setLevelUpMessage('🕊️ Intercessory prayers offered on the mountain peak! (+100 Faith Score)');
      setTimeout(() => setLevelUpMessage(null), 4000);
      setPlayer1((prev) => ({
        ...prev,
        score: prev.score + 100,
        wisdom: prev.wisdom + 15,
      }));
    } else if (consecrationType === 'vigil_fasting') {
      setLevelUpMessage('🛡️ Mountain vigil observed: Health restored & spiritual defenses fortified!');
      setTimeout(() => setLevelUpMessage(null), 4000);
      setPlayer1((prev) => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + 35),
        defense: prev.defense + 5,
        score: prev.score + 75,
      }));
    }
  };

  const handleApplyAngelBlessing = (angel: CelestialAngel) => {
    if (claimedAngelBlessingIds.includes(angel.id)) return;
    setClaimedAngelBlessingIds((prev) => [...prev, angel.id]);
    soundEngine.playScriptureBell();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#fef08a', '#38bdf8', '#ef4444', '#ffffff'],
    });

    setLevelUpMessage(`👼 CELESTIAL BLESSING OF ${angel.name.toUpperCase()} GRANTED!`);
    setTimeout(() => setLevelUpMessage(null), 5000);

    setPlayer1((prev) => {
      let extraRescues = prev.angelRescuesRemaining;
      let newAtk = prev.attack;
      let newWis = prev.wisdom;
      let newOil = prev.oil;
      let newSp = prev.sp;
      let newHp = prev.health;

      if (angel.id === 'archangel_michael') {
        extraRescues = Math.min(5, extraRescues + 1);
        newAtk += 8;
      } else if (angel.id === 'archangel_gabriel') {
        newOil = prev.maxOil;
        newSp = prev.maxSp;
      } else if (angel.id === 'archangel_uriel') {
        newHp = prev.maxHealth;
      } else if (angel.id === 'seraph_living_fire') {
        newAtk += 6;
        newWis += 8;
      } else if (angel.id === 'guardian_angel_elect') {
        extraRescues = Math.min(5, extraRescues + 1);
        newHp = Math.min(prev.maxHealth, prev.health + 40);
      }

      return {
        ...prev,
        angelRescuesRemaining: extraRescues,
        attack: newAtk,
        wisdom: newWis,
        oil: newOil,
        sp: newSp,
        health: newHp,
        score: prev.score + 250,
        darkAffliction: null, // Holy angel presence cleanses all demonic curses
      };
    });
  };

  const handleToggleEndTimesBGM = () => {
    if (isEndTimesBGMActive) {
      soundEngine.stopEndTimesBGM();
      setIsEndTimesBGMActive(false);
    } else {
      soundEngine.startEndTimesBGM(0.12);
      setIsEndTimesBGMActive(true);
    }
  };

  const handleRestart = () => {
    setLifeTimeRemaining(3600);
    setSouls(SEVEN_SOULS_DATA);
    setCurrentStage('character_select');
  };

  const handleVirtualMove = (dir: 'up' | 'down' | 'left' | 'right') => {
    soundEngine.playFootstep();
    const step = 25;
    setPlayer1((prev) => {
      let nx = prev.x;
      let ny = prev.y;
      if (dir === 'up') ny -= step;
      if (dir === 'down') ny += step;
      if (dir === 'left') nx -= step;
      if (dir === 'right') nx += step;
      return {
        ...prev,
        x: Math.max(60, Math.min(1800 - 60, nx)),
        y: Math.max(60, Math.min(1400 - 60, ny)),
        direction: dir,
        stepsWalked: prev.stepsWalked + 1,
      };
    });
  };

  const soulsBelievedCount = souls.filter((s) => s.status === 'believed').length;

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#e2e2d5] flex flex-col relative overflow-x-hidden selection:bg-[#d4af37] selection:text-black font-sans">
      {/* Atmospheric Background Radial Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.05) 0%, transparent 75%)',
        }}
      />

      {/* Level Up Banner */}
      {levelUpMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-3 px-6 rounded border border-[#d4af37] bg-[#0f1117]/95 text-[#d4af37] text-xs uppercase tracking-[0.25em] font-sans font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span>{levelUpMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full bg-[#0f1117]/95 border-b border-[#2a2a35]/60 px-4 sm:px-8 py-3 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full border-2 border-[#d4af37] p-0.5 bg-[#1a1c25] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)]">
            <Flame className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-light tracking-[0.2em] uppercase text-[#d4af37]">
                Brides of Light RPG
              </span>
              <div className="h-[1px] w-3 bg-[#d4af37]/40 hidden sm:inline-block" />
              <span className="hidden sm:inline text-[11px] text-gray-400 tracking-wider">
                The Living Word & Parables
              </span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.25em] font-sans">
              Matthew 25 • 1 Cor 3:6-7 • Revelation 19
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            id="btn-nav-top-garden"
            onClick={() => setShowGardenModal(true)}
            className="px-3 py-1.5 rounded bg-[#13221a] hover:bg-[#1a2f23] text-emerald-300 text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border border-emerald-500/50 hover:border-emerald-400 transition-colors font-semibold"
            title="Sanctuary Garden & Faith Seeds"
          >
            <span>🌱</span>
            <span>Garden ({soulsBelievedCount}/7)</span>
          </button>

          <button
            type="button"
            id="btn-select-bride"
            onClick={() => setCurrentStage('character_select')}
            className="px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#252836] text-[#d4af37] text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border border-[#d4af37]/40 hover:border-[#d4af37] transition-colors"
            title="Change Active Bride"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Bride</span>
          </button>

          <button
            type="button"
            id="btn-toggle-touch-pad"
            onClick={() => setShowVirtualControls(!showVirtualControls)}
            className={`px-3 py-1.5 rounded border text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all ${
              showVirtualControls
                ? 'bg-[#d4af37] text-black border-[#d4af37] font-semibold'
                : 'bg-[#1a1c25] text-gray-300 border-[#2a2a35] hover:border-[#d4af37]/50'
            }`}
            title="Toggle On-Screen Touch Controls"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Touch D-Pad</span>
          </button>

          <button
            type="button"
            id="btn-top-lore"
            onClick={() => setShowLoreGuide(true)}
            className="px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#252836] text-[#e2e2d5] text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border border-[#2a2a35] hover:border-[#d4af37]/50 transition-colors"
            title="Sanctuary Scroll & Lore Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">The Scripture Scroll</span>
          </button>

          <button
            type="button"
            id="btn-top-lb"
            onClick={() => setShowLeaderboard(true)}
            className="px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#252836] text-[#e2e2d5] text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border border-[#2a2a35] hover:border-[#d4af37]/50 transition-colors"
            title="Hall of Faith"
          >
            <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Hall of Faith</span>
          </button>

          <button
            type="button"
            id="btn-top-mountain-prayer"
            onClick={() => setShowMountainPrayerModal(true)}
            className="px-3 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-[#fef08a] text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border border-[#d4af37]/60 hover:border-[#d4af37] transition-colors font-bold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
            title="Mountain Prayer Room & Consecration Altar"
          >
            <Mountain className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Mountain Consecration</span>
          </button>

          <button
            type="button"
            id="btn-top-angels"
            onClick={() => setShowAngelsModal(true)}
            className="px-3 py-1.5 rounded bg-[#1e1b4b] hover:bg-[#2e2a72] text-[#38bdf8] text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border border-[#38bdf8]/40 hover:border-[#38bdf8] transition-colors font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)]"
            title="Celestial Host of Angels (Archangels & Blessings)"
          >
            <span>👼</span>
            <span className="hidden sm:inline">Angels ({claimedAngelBlessingIds.length}/5)</span>
          </button>

          <button
            type="button"
            id="btn-top-bgm"
            onClick={handleToggleEndTimesBGM}
            className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5 border transition-all ${
              isEndTimesBGMActive
                ? 'bg-[#451a03] text-[#fbbf24] border-[#fbbf24] font-semibold shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse'
                : 'bg-[#1a1c25] text-gray-300 border-[#2a2a35] hover:border-[#d4af37]/50'
            }`}
            title="Toggle Apocalyptic End of Time Background Music"
          >
            <Music className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span className="hidden sm:inline">{isEndTimesBGMActive ? 'End Times BGM: ON' : 'End Times BGM'}</span>
          </button>

          <button
            type="button"
            id="btn-audio-mute"
            onClick={handleToggleMute}
            className="p-1.5 rounded bg-[#1a1c25] hover:bg-[#252836] text-gray-300 border border-[#2a2a35] hover:border-[#d4af37]/50 transition-colors"
            title={isMuted ? 'Unmute Soundscape' : 'Mute Soundscape'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center p-2 sm:p-4 relative z-10">
        {currentStage === 'title' && (
          <StageCinematics
            type="title"
            bride={player1.bride}
            score={player1.score}
            onStartGame={handleStartGame}
          />
        )}

        {currentStage === 'character_select' && (
          <CharacterSelect
            onSelectBrides={handleSelectBrides}
            isCoopMode={isCoopMode}
            setIsCoopMode={setIsCoopMode}
          />
        )}

        {currentStage === 'game_over' && (
          <StageCinematics
            type="game_over"
            bride={player1.bride}
            score={player1.score}
            onRestart={handleRestart}
          />
        )}

        {currentStage === 'tomb_old_age' && (
          <OldAgeEndingModal souls={souls} onRestart={handleRestart} />
        )}

        {currentStage === 'end_times_battle' && (
          <EndTimesCinematic
            player={player1}
            onCompleteVictory={handleFinishEndTimesVictory}
            onExitToPilgrimage={() => setCurrentStage('prologue_call')}
          />
        )}

        {currentStage === 'victory' && (
          <StageCinematics
            type="epilogue_glory"
            bride={player1.bride}
            score={player1.score}
            onRestart={handleRestart}
          />
        )}

        {(currentStage === 'prologue_call' ||
          currentStage === 'stage1_talents' ||
          currentStage === 'stage2_confession' ||
          currentStage === 'stage3_midnight' ||
          currentStage === 'epilogue_word') && (
          <div className="w-full max-w-6xl flex flex-col gap-3">
            {/* Top In-Game HUD with RPG Stats */}
            <LanternStatus
              player1={player1}
              player2={player2}
              weather={weather}
              stageTitle={STAGE_NARRATIVES[currentStage]?.title || 'Sanctuary Pilgrimage'}
              soulsBelievedCount={soulsBelievedCount}
              lifeTimeRemainingSeconds={lifeTimeRemaining}
              onOpenGarden={() => setShowGardenModal(true)}
              onTrimLanternP1={() => handleTrimLantern(1)}
              onTrimLanternP2={player2 ? () => handleTrimLantern(2) : undefined}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenInventory={() => setShowInventory(true)}
              onOpenHelp={() => setShowLoreGuide(true)}
            />

            {/* Controls Bar */}
            <div className="w-full bg-[#11131a]/80 border border-[#2a2a35]/60 rounded px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400 font-sans tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-[#d4af37] font-semibold uppercase">Controls:</span>
                <span><strong className="text-white">WASD / Arrow Keys</strong> to Move</span>
                <span>•</span>
                <span><strong className="text-white">Spacebar</strong> to Trim Lamp</span>
                <span>•</span>
                <span>Walk up to <strong className="text-emerald-300">Garden/Home</strong> or <strong className="text-[#d4af37]">Souls [E]</strong> to Share Gospel & Tend Garden</span>
              </div>
              <div className="text-emerald-400 font-medium hidden sm:block">
                🌱 1 Cor 3:6 • Plant Seeds & Pray for Souls
              </div>
            </div>

            {/* If in JRPG Battle, display Battle Screen, else Pixel World */}
            {activeBattle ? (
              <BattleScreen
                player={player1}
                companion={player2}
                enemy={activeBattle}
                onVictory={handleBattleVictory}
                onDefeat={handleBattleDefeat}
                onExit={() => {
                  soundEngine.stopBattleAcousticBGM();
                  setActiveBattle(null);
                }}
                onUpdatePlayer={setPlayer1}
              />
            ) : (
              <div className="rounded-lg border border-[#2a2a35] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-[#08090d]">
                <PixelCanvas
                  player1={player1}
                  player2={player2}
                  onUpdateP1={setPlayer1}
                  onUpdateP2={setPlayer2}
                  stageId={currentStage}
                  weather={weather}
                  souls={souls}
                  defeatedEnemyIds={defeatedEnemyIds}
                  virtualDirs={virtualDirs}
                  onInteractObject={handleInteractObject}
                  onInteractSoul={handleInteractSoul}
                  onOpenGarden={() => setShowGardenModal(true)}
                  onOpenPrayerRoom={() => setShowMountainPrayerModal(true)}
                  onTriggerBattle={handleTriggerBattle}
                  onTrimLantern={handleTrimLantern}
                />
              </div>
            )}

            {/* Virtual Controls for mobile touch */}
            {showVirtualControls && !activeBattle && (
              <VirtualControls
                onMoveDir={handleVirtualMove}
                onDirHoldChange={setVirtualDirs}
                onTrimLantern={() => handleTrimLantern(1)}
                onInteract={() => {
                  // Trigger dialogue or nearest object/soul interaction
                  const nearbySoul = souls.find((s) => Math.hypot(player1.x - s.x, player1.y - s.y) < 95);
                  if (nearbySoul) {
                    handleInteractSoul(nearbySoul);
                  } else if (STAGE_NARRATIVES[currentStage]) {
                    setActiveNarrative(STAGE_NARRATIVES[currentStage]);
                  }
                }}
                onOpenGarden={() => setShowGardenModal(true)}
                onOpenInventory={() => setShowInventory(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer className="w-full h-11 border-t border-[#2a2a35]/50 bg-[#0a0c10] flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-[0.2em] text-gray-500 z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
          <span>Sanctuary Realm: {weather.replace('_', ' ')}</span>
        </div>
        <div className="hidden sm:flex gap-8">
          <span>7 Souls Gospel & Garden of Faith (1 Cor 3:6)</span>
          <span className="text-[#d4af37]">“Behold, the Bridegroom Comes”</span>
        </div>
        <div>v1.2.0 • End of Times Edition</div>
      </footer>

      {/* Dialog Box for NPC Conversation */}
      {activeDialogue && (
        <DialogBox
          dialogue={activeDialogue}
          onClose={() => setActiveDialogue(null)}
          onOptionSelect={() => setActiveDialogue(null)}
        />
      )}

      {/* Mountain Prayer Sanctuary & Consecration Modal */}
      {showMountainPrayerModal && (
        <MountainPrayerRoomModal
          player={player1}
          onConsecrate={handleConsecration}
          onClose={() => setShowMountainPrayerModal(false)}
        />
      )}

      {/* Gospel Sharing Interactive Modal for 7 Souls */}
      {activeSoulShare && (
        <GospelShareModal
          soul={activeSoulShare}
          player={player1}
          onUpdatePlayer={setPlayer1}
          onSoulBelieved={handleSoulBelieved}
          onClose={() => setActiveSoulShare(null)}
        />
      )}

      {/* Sanctuary Garden Modal */}
      {showGardenModal && (
        <GardenModal
          souls={souls}
          player={player1}
          onUpdatePlayer={setPlayer1}
          onWaterPlant={handleWaterPlant}
          onStartEndTimesBattle={handleStartEndTimesBattle}
          onClose={() => setShowGardenModal(false)}
        />
      )}

      {/* Inventory & Stats Satchel Modal */}
      {showInventory && (
        <InventoryModal
          player={player1}
          onUpdatePlayer={setPlayer1}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Oil Merchant Shop Modal */}
      {showMerchant && (
        <MerchantModal
          player={player1}
          onUpdatePlayer={setPlayer1}
          onClose={() => setShowMerchant(false)}
        />
      )}

      {/* Interactive Scripture & Discernment Modal */}
      {activeNarrative && (
        <ScriptureModal
          stageNarrative={activeNarrative}
          onCompleteStage={handleCompleteStageNarrative}
          onClose={() => setActiveNarrative(null)}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          currentScore={player1.score}
          currentBride={player1.bride.name}
          stageName={STAGE_NARRATIVES[currentStage]?.title}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Lore Guide Modal */}
      {showLoreGuide && <LoreGuideModal onClose={() => setShowLoreGuide(false)} />}

      {/* Celestial Host of Angels Modal */}
      {showAngelsModal && (
        <AngelsModal
          player={player1}
          claimedBlessingIds={claimedAngelBlessingIds}
          onClaimBlessing={handleApplyAngelBlessing}
          onClose={() => setShowAngelsModal(false)}
        />
      )}
    </div>
  );
}
