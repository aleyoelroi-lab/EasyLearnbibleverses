import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, RPGEnemy, ScriptureReadAloud, InventoryItem } from '../types';
import { SCRIPTURE_READ_ALOUDS } from '../data/rpgData';
import { soundEngine } from '../audio/soundEngine';
import { Sword, Zap, Sparkles, Heart, Droplet, Flame, ShieldAlert, Skull, CheckCircle2, Lock, Shield, Users } from 'lucide-react';

interface BattleScreenProps {
  player: PlayerState;
  companion: PlayerState | null;
  enemy: RPGEnemy;
  onVictory: (expGained: number, talentsGained: number, enemyId?: string) => void;
  onDefeat: () => void;
  onExit?: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export interface EnemyTaunt {
  quote: string;
  affliction: 'lust_blindness' | 'pride_curse' | 'greed_cowardice' | 'sloth_lethargy';
  voiceType: 'greed' | 'lust' | 'cowardice' | 'sloth';
  label: string;
  desc: string;
}

const ENEMY_TAUNTS: EnemyTaunt[] = [
  {
    quote: '“Look upon my riches and gold! Everything belongs to me alone! You are nothing before my wealth, hahahaha!”',
    affliction: 'pride_curse',
    voiceType: 'greed',
    label: 'Boastful Greed & Pride (Arrogant Man)',
    desc: 'Boastful greed exalts wealth over God and drains spiritual defense!',
  },
  {
    quote: '“Cast your eyes upon forbidden beauty, darling... Surrender your heart to sweet desires, hahahaha!”',
    affliction: 'lust_blindness',
    voiceType: 'lust',
    label: 'Temptation of Lust (Alluring Maiden)',
    desc: 'Lustful thoughts cloud your vision and darken your radiant lamp!',
  },
  {
    quote: '“Run away, little coward! Tremble in fear! You are too weak, too pathetic to win, heheheheha!”',
    affliction: 'greed_cowardice',
    voiceType: 'cowardice',
    label: 'Mocking Cowardice (Annoying Shrill Voice)',
    desc: 'Cowardice and fears drain your sacred oil and sap your resolve!',
  },
  {
    quote: '“Why fight? Close your eyes and sleep... let your lamp burn out... sweet laziness calls, haaaaha...”',
    affliction: 'sloth_lethargy',
    voiceType: 'sloth',
    label: 'Demonic Sloth & Lethargy',
    desc: 'Laziness opens the doorway to demons and slows your spirit!',
  },
];

export const BattleScreen: React.FC<BattleScreenProps> = ({
  player,
  companion,
  enemy,
  onVictory,
  onDefeat,
  onExit,
  onUpdatePlayer,
}) => {
  const [enemyHp, setEnemyHp] = useState<number>(enemy.hp);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [activeAnimation, setActiveAnimation] = useState<
    'sword_slash' | 'lightning_strike' | 'wall_of_fire' | 'heal_grace' | 'enemy_attack' | 'angel_rescue' | null
  >(null);
  const [activeClosedCaption, setActiveClosedCaption] = useState<{
    label: string;
    text: string;
    ref?: string;
    isEnemyTaunt?: boolean;
    isAngelMessage?: boolean;
  } | null>(null);
  const [showScripturePicker, setShowScripturePicker] = useState<boolean>(false);
  const [showItemPicker, setShowItemPicker] = useState<boolean>(false);
  const [usedScriptureIds, setUsedScriptureIds] = useState<string[]>([]);
  // Armor of God: 2 = 1st attack immune (0 dmg), 1 = 2nd attack 50% discount, 0 = inactive
  const [armorCharges, setArmorCharges] = useState<number>(0);
  const [damageNumber, setDamageNumber] = useState<{ val: number; isEnemy: boolean; isHeal?: boolean; isImmune?: boolean } | null>(null);
  const [turnCounter, setTurnCounter] = useState<number>(0);
  const [currentAffliction, setCurrentAffliction] = useState<'lust_blindness' | 'pride_curse' | 'greed_cowardice' | 'sloth_lethargy' | null>(
    player.darkAffliction || null
  );
  const [isAngelIntervening, setIsAngelIntervening] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const captionTimerRef = useRef<number | null>(null);
  const damageTimerRef = useRef<number | null>(null);

  // Silence background music in battle per user request
  useEffect(() => {
    soundEngine.stopBattleAcousticBGM();
    soundEngine.stopAmbientMusic();
  }, []);

  // Helper to trigger animated pop-up damage and healing numbers
  const showDamage = (val: number, isEnemy: boolean, isHeal = false, isImmune = false) => {
    if (damageTimerRef.current) {
      clearTimeout(damageTimerRef.current);
    }
    setDamageNumber({ val, isEnemy, isHeal, isImmune });
    damageTimerRef.current = window.setTimeout(() => {
      setDamageNumber(null);
    }, 1400);
  };



  // Closed caption timeout helper (staying longer on screen so players can read comfortably!)
  const triggerCaption = (
    label: string,
    text: string,
    ref?: string,
    isEnemyTaunt?: boolean,
    isAngelMessage?: boolean,
    customDuration?: number
  ) => {
    if (captionTimerRef.current) {
      clearTimeout(captionTimerRef.current);
    }
    setActiveClosedCaption({ label, text, ref, isEnemyTaunt, isAngelMessage });
    
    // Calculate appropriate duration so players can comfortably finish reading/listening
    const duration =
      customDuration ||
      (isEnemyTaunt ? 8500 : isAngelMessage ? 7500 : Math.max(5500, text.length * 75));
    captionTimerRef.current = window.setTimeout(() => {
      setActiveClosedCaption(null);
    }, duration);
  };

  // Keyboard shortcut listener (Keypad 1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If active caption is open and player presses Escape or Space, dismiss caption
      if (activeClosedCaption && (e.code === 'Escape' || (e.code === 'Space' && !isPlayerTurn))) {
        e.preventDefault();
        setActiveClosedCaption(null);
        return;
      }

      if (!isPlayerTurn || activeAnimation || isAngelIntervening || enemyHp <= 0) return;

      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        e.preventDefault();
        handleRandomScriptureCast();
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        e.preventDefault();
        handleArmorOfGod();
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        e.preventDefault();
        setShowItemPicker((prev) => !prev);
        setShowScripturePicker(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isPlayerTurn, activeAnimation, isAngelIntervening, enemyHp, activeClosedCaption, player, armorCharges, usedScriptureIds]);

  // Canvas visual rendering loop for real-time battlefield effects
  useEffect(() => {
    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Battlefield Background
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, w, h);

      // Arena ground gradient
      const groundGrad = ctx.createLinearGradient(0, 0, 0, h);
      groundGrad.addColorStop(0, '#111522');
      groundGrad.addColorStop(0.65, '#192033');
      groundGrad.addColorStop(1, '#0e121d');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, w, h);

      // Dark affliction screen tint if player is afflicted by lust/pride/greed/laziness
      if (currentAffliction) {
        ctx.fillStyle = currentAffliction === 'lust_blindness'
          ? 'rgba(15, 10, 25, 0.45)'
          : currentAffliction === 'pride_curse'
          ? 'rgba(45, 10, 20, 0.35)'
          : currentAffliction === 'greed_cowardice'
          ? 'rgba(30, 25, 10, 0.35)'
          : 'rgba(25, 15, 35, 0.4)';
        ctx.fillRect(0, 0, w, h);
      }

      // Stone sanctuary ring on ground
      ctx.fillStyle = currentAffliction ? 'rgba(80, 50, 100, 0.15)' : 'rgba(212, 175, 55, 0.08)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.78, w * 0.42, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = currentAffliction ? 'rgba(168, 85, 247, 0.3)' : 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Atmospheric rain & glowing motes
      for (let i = 0; i < 20; i++) {
        const moteX = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * w;
        const moteY = ((time * 0.04 + i * 35) % h);
        ctx.fillStyle = currentAffliction ? 'rgba(168, 85, 247, 0.3)' : 'rgba(212, 175, 55, 0.3)';
        ctx.beginPath();
        ctx.arc(moteX, h - moteY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Consecrated Earthly Helpers (Converted Red Souls without wings)
      if (player.activeHelpersCount && player.activeHelpersCount > 0) {
        const helperCount = Math.min(3, player.activeHelpersCount);
        for (let idx = 0; idx < helperCount; idx++) {
          const hX = w * 0.14 - idx * 30;
          const hY = h * 0.68 + (idx % 2 === 0 ? 10 : -10);
          const helperBob = Math.sin(time * 0.004 + idx) * 3;

          ctx.save();
          ctx.translate(hX, hY + helperBob);

          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(0, 18, 16, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Robe (Earthly missionary helper - no wings, but holy green & gold sash)
          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.moveTo(-10, 16);
          ctx.lineTo(10, 16);
          ctx.lineTo(6, -12);
          ctx.lineTo(-6, -12);
          ctx.closePath();
          ctx.fill();

          // Gold Sash
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(-6, -2, 12, 3);

          // Head
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(0, -18, 7, 0, Math.PI * 2);
          ctx.fill();

          // Scripture scroll in helper's hand
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(8, -8, 5, 10);

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Helper', 0, -28);

          ctx.restore();
        }
      }

      // 3. Draw Bride Sprite (Player) on the Left
      const brideX = w * 0.28;
      const brideY = h * 0.65;
      const bob = Math.sin(time * 0.005) * 3;

      ctx.save();
      ctx.translate(brideX, brideY + bob);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 22, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark affliction aura on the player
      if (currentAffliction) {
        ctx.fillStyle = currentAffliction === 'lust_blindness'
          ? 'rgba(88, 28, 135, 0.4)'
          : currentAffliction === 'pride_curse'
          ? 'rgba(185, 28, 28, 0.4)'
          : currentAffliction === 'greed_cowardice'
          ? 'rgba(161, 98, 7, 0.4)'
          : 'rgba(76, 29, 149, 0.4)';
        ctx.beginPath();
        ctx.arc(0, -10, 34, 0, Math.PI * 2);
        ctx.fill();

        // Dark tendrils
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 10);
        ctx.lineTo(-24 + Math.sin(time * 0.01) * 6, -20);
        ctx.moveTo(15, 10);
        ctx.lineTo(24 + Math.cos(time * 0.01) * 6, -20);
        ctx.stroke();
      }

      // Bride Gown - Darkened if afflicted by enemy taunt!
      const gownColor = currentAffliction
        ? '#1e1b2e' // Darkened color when afflicted by lust/pride/greed/laziness
        : player.bride.color;

      ctx.fillStyle = gownColor;
      ctx.beginPath();
      ctx.moveTo(-16, 20);
      ctx.lineTo(16, 20);
      ctx.lineTo(10, -18);
      ctx.lineTo(-10, -18);
      ctx.closePath();
      ctx.fill();

      // Mantle
      ctx.fillStyle = currentAffliction ? '#0f0c1b' : player.bride.secondaryColor;
      ctx.fillRect(-10, -18, 20, 14);

      // Head & Veil
      ctx.fillStyle = currentAffliction ? '#cbd5e1' : '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -28, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = currentAffliction ? '#475569' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, -32, 12, Math.PI, 0, false);
      ctx.lineTo(10, -14);
      ctx.lineTo(-10, -14);
      ctx.closePath();
      ctx.fill();

      // Crown of Gold
      ctx.fillStyle = currentAffliction ? '#71717a' : '#d4af37';
      ctx.fillRect(-8, -38, 16, 4);

      // Golden Lantern in Hand
      const lanternX = 22;
      const lanternY = -6;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(lanternX - 6, lanternY, 12, 16);

      if (player.oil > 0) {
        const flameRad = currentAffliction ? 4 : 7 + Math.sin(time * 0.02) * 2;
        ctx.fillStyle = currentAffliction ? '#a855f7' : '#d4af37';
        ctx.beginPath();
        ctx.arc(lanternX, lanternY + 8, flameRad, 0, Math.PI * 2);
        ctx.fill();
        if (!currentAffliction) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(lanternX, lanternY + 6, flameRad * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Draw Enemy Sprite on the Right (with Red Aura if Strong Red Enemy)
      const enemyX = w * 0.72;
      const enemyY = h * 0.62;
      const enemyBob = Math.sin(time * 0.004 + 1) * 4;

      ctx.save();
      ctx.translate(enemyX, enemyY + enemyBob);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 36, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // If Strong Red Enemy: Pulsating Crimson Fire Aura!
      if (enemy.isStrongRed) {
        const redGlow = 42 + Math.sin(time * 0.008) * 8;
        ctx.fillStyle = 'rgba(220, 38, 38, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, redGlow, 0, Math.PI * 2);
        ctx.fill();

        // Fire tendrils
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        for (let fi = 0; fi < 6; fi++) {
          const fAngle = (fi / 6) * Math.PI * 2 + time * 0.003;
          ctx.beginPath();
          ctx.moveTo(Math.cos(fAngle) * 24, Math.sin(fAngle) * 24);
          ctx.lineTo(Math.cos(fAngle) * (36 + Math.sin(time * 0.01 + fi) * 8), Math.sin(fAngle) * (36 + Math.cos(time * 0.01 + fi) * 8));
          ctx.stroke();
        }
      }

      if (enemy.id === 'dragon_boss') {
        // Grand Dragon Boss Sprite
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 60, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated Wings
        const wingSpan = Math.sin(time * 0.006) * 16;
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.moveTo(-45, -10);
        ctx.lineTo(-95 - wingSpan, -65);
        ctx.lineTo(-35, 25);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(45, -10);
        ctx.lineTo(95 + wingSpan, -65);
        ctx.lineTo(35, 25);
        ctx.closePath();
        ctx.fill();

        // Glowing red eyes & horns
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-16, -14, 8, 10);
        ctx.fillRect(8, -14, 8, 10);
      } else {
        // Shadow Miasma Enemy (Red if isStrongRed)
        const rad = (enemy.isStrongRed ? 36 : 30) + Math.sin(time * 0.006) * 4;
        ctx.fillStyle = enemy.isStrongRed ? 'rgba(69, 10, 10, 0.95)' : 'rgba(15, 23, 42, 0.95)';
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();

        // Spooky aura
        ctx.strokeStyle = enemy.isStrongRed ? '#ef4444' : enemy.color;
        ctx.lineWidth = enemy.isStrongRed ? 4 : 3;
        ctx.stroke();

        // Evil Eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -6, 6, 7);
        ctx.fillRect(4, -6, 6, 7);
      }
      ctx.restore();

      // 5. ANGEL OF THE LORD RESCUE ANIMATION (When demon is subdued!)
      if (isAngelIntervening || activeAnimation === 'angel_rescue') {
        const angelX = w * 0.68;
        const angelY = h * 0.38 + Math.sin(time * 0.006) * 6;

        ctx.save();
        ctx.translate(angelX, angelY);

        // Radiant Heavenly Glory Pillar
        const beamGrad = ctx.createLinearGradient(0, -180, 0, 140);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        beamGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.7)');
        beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(-45, -180, 90, 320);

        // Angel Wings (Majestic Feathers)
        const wingFlap = Math.sin(time * 0.008) * 14;
        ctx.fillStyle = '#fef08a';
        // Left Wing
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(-75 - wingFlap, -60);
        ctx.lineTo(-30, 20);
        ctx.closePath();
        ctx.fill();
        // Right Wing
        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(75 + wingFlap, -60);
        ctx.lineTo(30, 20);
        ctx.closePath();
        ctx.fill();

        // Angel Radiant Robe
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-16, 28);
        ctx.lineTo(16, 28);
        ctx.lineTo(10, -20);
        ctx.lineTo(-10, -20);
        ctx.closePath();
        ctx.fill();

        // Golden Halo
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -36, 16, 6, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Face
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -24, 9, 0, Math.PI * 2);
        ctx.fill();

        // Flaming Sword of the Lord striking down
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-2, 10, 4, 48);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-6, 56);
        ctx.lineTo(6, 56);
        ctx.lineTo(0, 72);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 6. ANIMATION EFFECTS (Real-time visual FX)
      // A. [1] Light Strike (Holy Sword Cutting Effect)
      if (activeAnimation === 'sword_slash') {
        const slashProgress = (time % 400) / 400;
        ctx.save();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(enemyX - 50 + slashProgress * 90, enemyY - 60 + slashProgress * 120);
        ctx.lineTo(enemyX + 50 - slashProgress * 40, enemyY + 60 - slashProgress * 30);
        ctx.stroke();
        ctx.restore();
      }

      // B. [2] Scripture Read Aloud (Holy Lightning Strike)
      if (activeAnimation === 'lightning_strike') {
        ctx.save();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(enemyX + Math.sin(time * 0.05) * 15, 0);
        ctx.lineTo(enemyX - 20, enemyY * 0.35);
        ctx.lineTo(enemyX + 25, enemyY * 0.7);
        ctx.lineTo(enemyX, enemyY);
        ctx.stroke();
        ctx.restore();
      }

      // C. [2] Armor of God / Shield of Faith (Ephesians 6)
      if (activeAnimation === 'wall_of_fire' || armorCharges > 0) {
        ctx.save();
        ctx.strokeStyle = armorCharges === 2 ? 'rgba(212, 175, 55, 0.9)' : 'rgba(245, 158, 11, 0.6)';
        ctx.fillStyle = armorCharges === 2 ? 'rgba(212, 175, 55, 0.18)' : 'rgba(245, 158, 11, 0.1)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(brideX, brideY, 44 + Math.sin(time * 0.008) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw holy shield rays
        for (let ri = 0; ri < 6; ri++) {
          const angle = (time * 0.003) + (ri * Math.PI / 3);
          const rx = brideX + Math.cos(angle) * 44;
          const ry = brideY + Math.sin(angle) * 44;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(rx, ry, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // D. [3] Vessel Item Heal / Grace
      if (activeAnimation === 'heal_grace') {
        ctx.save();
        ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
        ctx.beginPath();
        ctx.arc(brideX, brideY, 48 + Math.sin(time * 0.01) * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentAffliction, player, enemy, armorCharges, activeAnimation, isAngelIntervening]);

  // Action 1: Scripture Read Aloud (Proclamation of Living Word that unleashes Holy Light Damage & Blessings!)
  const handleCastScripture = (recitation: ScriptureReadAloud) => {
    if (!isPlayerTurn || isAngelIntervening) return;
    if (player.sp < recitation.spCost) {
      triggerCaption('Insufficient Spirit Points', 'You need more SP to proclaim this scripture. Use a Scroll of Truth or rest.');
      return;
    }

    setIsPlayerTurn(false);
    setShowScripturePicker(false);

    // Track used scripture to prevent duplicate usage
    setUsedScriptureIds((prev) => (prev.includes(recitation.id) ? prev : [...prev, recitation.id]));

    soundEngine.playLightningStrike();
    setActiveAnimation('lightning_strike');

    // Deduct SP
    onUpdatePlayer((prev) => ({
      ...prev,
      sp: Math.max(0, prev.sp - recitation.spCost),
    }));

    // Trigger Closed Caption Subtitle with plenty of duration for reading
    triggerCaption(`Scripture Read Aloud: ${recitation.name}`, recitation.verseText, recitation.verseRef);

    const helperBonus = (player.activeHelpersCount || 0) * 8;
    let holyDmg = 0;

    if (recitation.type === 'holy_damage') {
      // Direct Holy Blast: Maximum power + Wisdom scaling + Helper bonuses
      holyDmg = Math.max(38, recitation.power + player.wisdom * 2 + helperBonus + Math.floor(Math.random() * 16));
    } else if (recitation.type === 'heal') {
      // Psalm 23: Restores HP, cleanses affliction AND inflicts Holy Radiant Rebuke damage upon the darkness!
      soundEngine.playHolyHeal();
      onUpdatePlayer((prev) => ({
        ...prev,
        health: Math.min(prev.maxHealth, prev.health + recitation.power),
        darkAffliction: null,
      }));
      setCurrentAffliction(null);
      holyDmg = Math.max(28, Math.floor(recitation.power * 0.8) + player.wisdom + helperBonus);
      showDamage(recitation.power, false, true); // Show heal on player
    } else if (recitation.type === 'refill_oil') {
      // Matthew 25: Restores lamp oil AND unleashes Blazing Oil Fire damage upon the darkness!
      soundEngine.playOilPickup();
      onUpdatePlayer((prev) => ({
        ...prev,
        oil: Math.min(prev.maxOil, prev.oil + recitation.power),
      }));
      holyDmg = Math.max(28, Math.floor(recitation.power * 0.8) + player.wisdom + helperBonus);
    } else if (recitation.type === 'buff_shield') {
      // Ephesians 6: Sets Armor of God charges AND inflicts living light damage!
      soundEngine.playWallOfFire();
      setArmorCharges(2);
      holyDmg = Math.max(28, Math.floor(recitation.power * 0.8) + player.wisdom + helperBonus);
    }

    // Proclaiming the Word ALWAYS inflicts living damage upon demonic darkness!
    const calculatedNextHp = Math.max(0, enemyHp - holyDmg);
    setEnemyHp(calculatedNextHp);
    showDamage(holyDmg, true);

    // Cleanse dark affliction on powerful verses
    if (recitation.power >= 50 && currentAffliction) {
      setCurrentAffliction(null);
      soundEngine.playCleansingChime();
      onUpdatePlayer((prev) => ({ ...prev, darkAffliction: null }));
    }

    // Clear animation after visual effect finishes
    setTimeout(() => {
      setActiveAnimation(null);
    }, 800);

    // Speak with lively voice, and execute victory or enemy turn after reading
    let finishedReading = false;
    soundEngine.speakScriptureLivelyVoice(recitation.verseText, recitation.verseRef, () => {
      if (finishedReading) return;
      finishedReading = true;

      if (calculatedNextHp <= 0) {
        handleVictoryOutcome();
      } else {
        // Generous 1-second pause after scripture completes before demon retaliates
        setTimeout(() => {
          handleEnemyTurn();
        }, 1000);
      }
    });
  };

  // Random Scripture Selection: Randomly picks from unlocked scriptures, ensuring no duplicate scripture is used twice!
  const handleRandomScriptureCast = () => {
    if (!isPlayerTurn || isAngelIntervening) return;

    const scriptures =
      player.scriptures && player.scriptures.length > 0 ? player.scriptures : SCRIPTURE_READ_ALOUDS;

    // Filter available scriptures by level and SP
    const unlocked = scriptures.filter((s) => player.level >= (s.requiredLevel || 1));
    const affordable = unlocked.filter((s) => player.sp >= s.spCost);
    const candidatePool = affordable.length > 0 ? affordable : unlocked;

    if (candidatePool.length === 0) {
      triggerCaption('Insufficient Spirit Points', 'You need more SP to proclaim holy scriptures. Use a Scroll of Truth or rest.');
      return;
    }

    // Filter out previously used scriptures to guarantee no duplicate
    let unusedPool = candidatePool.filter((s) => !usedScriptureIds.includes(s.id));

    // If all scriptures have been proclaimed in this battle cycle, reset the pool (excluding the most recent if multiple exist)
    if (unusedPool.length === 0) {
      const lastUsedId = usedScriptureIds[usedScriptureIds.length - 1];
      unusedPool = candidatePool.filter((s) => candidatePool.length <= 1 || s.id !== lastUsedId);
      setUsedScriptureIds(lastUsedId ? [lastUsedId] : []);
    }

    if (unusedPool.length === 0) {
      unusedPool = candidatePool;
    }

    // Randomly pick one scripture from the unused pool
    const chosenIndex = Math.floor(Math.random() * unusedPool.length);
    const chosenScripture = unusedPool[chosenIndex];

    handleCastScripture(chosenScripture);
  };

  // Action 2: Armor of God (Ephesians 6:10-18)
  // Grants IMMUNITY to next 1st attack, and 50% damage discount for 2nd attack!
  const handleArmorOfGod = () => {
    if (!isPlayerTurn || isAngelIntervening) return;
    setIsPlayerTurn(false);
    setShowScripturePicker(false);
    setShowItemPicker(false);

    soundEngine.playWallOfFire();
    setActiveAnimation('wall_of_fire');
    setArmorCharges(2);

    triggerCaption(
      '🛡️ Armor of God Activated (Ephesians 6:10-18)',
      '“Put on the whole armor of God! Taking the Shield of Faith to extinguish all the fiery darts of the wicked one.” — 1st Attack: IMMUNE (0 Dmg) • 2nd Attack: 50% Damage Discount!',
      'Ephesians 6:11-16'
    );

    onUpdatePlayer((prev) => ({
      ...prev,
      oil: Math.min(prev.maxOil, prev.oil + 10),
    }));

    setTimeout(() => {
      setActiveAnimation(null);
      setTimeout(handleEnemyTurn, 1000);
    }, 800);
  };

  // Action 3: Vessel Items
  const handleUseItem = (item: InventoryItem) => {
    if (!isPlayerTurn || isAngelIntervening) return;
    if (item.count <= 0) {
      triggerCaption('Vessel Empty', `You have no ${item.name} remaining in your satchel.`);
      return;
    }

    setIsPlayerTurn(false);
    setShowItemPicker(false);

    soundEngine.playHolyHeal();
    setActiveAnimation('heal_grace');

    onUpdatePlayer((prev) => {
      const updatedInv = prev.inventory.map((i) =>
        i.id === item.id ? { ...i, count: i.count - 1 } : i
      );

      let newHp = prev.health;
      let newOil = prev.oil;
      let newSp = prev.sp;

      if (item.type === 'heal') {
        newHp = Math.min(prev.maxHealth, prev.health + item.effectValue);
        triggerCaption('Heavenly Manna Received', `Consumed Heavenly Manna: Restored +${item.effectValue} HP! (Exodus 16:4)`, 'Exodus 16:4');
      } else if (item.type === 'oil') {
        newOil = Math.min(prev.maxOil, prev.oil + item.effectValue);
        triggerCaption('Alabaster Oil Vessel Poured', `Filled Lamp: Restored +${item.effectValue}% Lantern Oil! (Matthew 25:4)`, 'Matthew 25:4');
      } else if (item.type === 'sp') {
        newSp = Math.min(prev.maxSp, prev.sp + item.effectValue);
        triggerCaption('Scroll of Truth Read', `Inscribed with Promises: Restored +${item.effectValue} SP! (Psalm 119:105)`, 'Psalm 119:105');
      }

      return {
        ...prev,
        inventory: updatedInv,
        health: newHp,
        oil: newOil,
        sp: newSp,
      };
    });

    setTimeout(() => {
      setActiveAnimation(null);
      setTimeout(handleEnemyTurn, 1000);
    }, 800);
  };

  // Enemy Turn: Fights Back with Sinister Voice & Dark Afflictions!
  const handleEnemyTurn = () => {
    if (enemyHp <= 0) return;

    setActiveAnimation('enemy_attack');

    // Select the dark taunt based on turn or enemy
    const tauntIndex = turnCounter % ENEMY_TAUNTS.length;
    const currentTaunt = ENEMY_TAUNTS[tauntIndex];
    setTurnCounter((c) => c + 1);

    // Speak with distinct demonic persona (Boastful Man for Greed, Beautiful Girl for Lust, Annoying Voice for Cowardice)
    soundEngine.speakDemonicTaunt(currentTaunt.quote, currentTaunt.voiceType);

    // Apply dark affliction to player
    setCurrentAffliction(currentTaunt.affliction);

    // Display the demonic quote prominently in crimson/purple (stays 8.5s for comfortable reading!)
    triggerCaption(
      `😈 Darkness Speaks • ${currentTaunt.label}`,
      `${currentTaunt.quote} — ${currentTaunt.desc}`,
      undefined,
      true
    );

    const helperDef = (player.activeHelpersCount || 0) * 4;
    const rawDmg = enemy.attack + Math.floor(Math.random() * 6);
    let calculatedDmg = Math.max(6, Math.floor(rawDmg - (player.defense + helperDef) / 2));
    let isImmuneHit = false;

    // Apply Armor of God protection rules
    if (armorCharges === 2) {
      // 1st attack: IMMUNE to damage!
      calculatedDmg = 0;
      isImmuneHit = true;
      setArmorCharges(1);
      showDamage(0, false, false, true);
      triggerCaption(
        '🛡️ Shield of Faith: IMMUNE (0 Dmg)',
        '“The Shield of Faith completely quenched the fiery dart! 0 Damage taken! (Next attack receives 50% Armor Discount)”',
        'Ephesians 6:16'
      );
    } else if (armorCharges === 1) {
      // 2nd attack: 50% discount from usual damage!
      calculatedDmg = Math.max(1, Math.floor(calculatedDmg * 0.5));
      setArmorCharges(0);
      showDamage(calculatedDmg, false, false, false);
      triggerCaption(
        '🛡️ Armor of God: 50% Damage Discount',
        '“The Breastplate of Righteousness blunted the demonic assault! 50% damage discount applied!”',
        'Ephesians 6:14'
      );
    } else {
      showDamage(calculatedDmg, false, false, false);
    }

    const finalDmg = calculatedDmg;

    // Check if damage would defeat player
    if (!isImmuneHit && player.health - finalDmg <= 0) {
      // Check for Angel of the Lord Deliverance (Max 3 Rescues)
      if (player.angelRescuesRemaining > 0) {
        handleAngelRescueIntervention();
        return;
      }
    }

    const willDefeat = !isImmuneHit && player.health - finalDmg <= 0;

    onUpdatePlayer((prev) => {
      const nextHp = Math.max(0, prev.health - finalDmg);
      const nextOil = Math.max(0, prev.oil - (isImmuneHit ? 0 : 4));

      return {
        ...prev,
        health: nextHp,
        oil: nextOil,
        darkAffliction: currentTaunt.affliction,
      };
    });

    if (willDefeat) {
      setTimeout(() => {
        onDefeat();
      }, 1400);
    } else {
      setTimeout(() => {
        setActiveAnimation(null);
        setIsPlayerTurn(true);
      }, 1100);
    }
  };

  // Angel of the Lord Rescue: Subdues Demon & Command to Consecrate (3 Times Max!)
  const handleAngelRescueIntervention = () => {
    setIsAngelIntervening(true);
    setActiveAnimation('angel_rescue');
    soundEngine.playCelestialTrumpet();
    soundEngine.playCleansingChime();

    const rescuesLeft = player.angelRescuesRemaining - 1;
    const restoredHp = Math.floor(player.maxHealth * 0.6);

    setEnemyHp(0);
    setCurrentAffliction(null);

    // Angel Proclamation
    triggerCaption(
      `👼 ANGEL OF THE LORD DELIVERANCE (${rescuesLeft}/3 Rescues Left)`,
      `“Fear not! The Lord of Hosts has subdued this demon! Heed this word: Consecrate yourself, read more Holy Scriptures, and pray at the Temple! Go forth in peace!”`,
      'Psalm 34:7',
      false,
      true
    );

    onUpdatePlayer((prev) => ({
      ...prev,
      health: restoredHp,
      oil: Math.min(prev.maxOil, prev.oil + 30),
      sp: Math.min(prev.maxSp, prev.sp + 25),
      darkAffliction: null,
      angelRescuesRemaining: rescuesLeft,
    }));

    setTimeout(() => {
      setIsAngelIntervening(false);
      handleVictoryOutcome();
    }, 2500);
  };

  // Victory: Cleanse all curses, stop battle acoustic music, and return directly to pilgrimage!
  const handleVictoryOutcome = () => {
    // Cancel any demonic speech immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Ignore
      }
    }

    soundEngine.stopBattleAcousticBGM();
    soundEngine.playCleansingChime();
    soundEngine.playCelestialTrumpet();
    setCurrentAffliction(null);
    setEnemyHp(0);

    onUpdatePlayer((prev) => ({
      ...prev,
      darkAffliction: null,
      oil: Math.min(prev.maxOil, prev.oil + 25),
      sp: Math.min(prev.maxSp, prev.sp + 15),
    }));

    // Seamlessly transition back to pilgrimage without any stuck modal (+20 Talents minimum)
    onVictory(enemy.expReward, Math.max(20, enemy.talentReward || 20), enemy.id);
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-lg overflow-hidden bg-[#0a0d14] border border-[#2a2a35] shadow-2xl flex flex-col justify-between">
      {/* 1. TOP COMBAT HUD: Player & Enemy Health/Mana Bars + Deliverance Counter */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Player Vitality Badge (Longer Bar with Level) */}
        <div className="bg-[#0f1117]/90 backdrop-blur-md border border-[#2a2a35] px-3.5 py-2 rounded-lg flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#d4af37] uppercase tracking-wider block font-sans font-bold">
                {player.bride.name} <span className="text-white bg-[#1a1c25] px-1.5 py-0.5 rounded text-[10px]">Lv.{player.level}</span>
              </span>
              {currentAffliction && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/50 text-purple-300 font-sans animate-pulse">
                  Afflicted: {currentAffliction.replace('_', ' ')}
                </span>
              )}
              {player.activeHelpersCount > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-sans flex items-center gap-1 font-semibold">
                  <Users className="w-2.5 h-2.5" />
                  {player.activeHelpersCount} Helper(s) (+{player.activeHelpersCount * 8} Pow)
                </span>
              )}
            </div>

            {/* Health Bar */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono text-rose-400 font-bold w-6">HP</span>
              <div className="w-36 sm:w-44 bg-[#1a1c25] h-2 rounded-full overflow-hidden border border-[#2a2a35]">
                <div
                  className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-300"
                  style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-rose-300 font-bold">
                {player.health}/{player.maxHealth}
              </span>
            </div>

            {/* Mana / SP Bar (Longer Mana Bar!) */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-blue-400 font-bold w-6">SP</span>
              <div className="w-36 sm:w-44 bg-[#1a1c25] h-2 rounded-full overflow-hidden border border-[#2a2a35]">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${(player.sp / player.maxSp) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-blue-300 font-bold">
                {player.sp}/{player.maxSp}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Angel Deliverance Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161208]/90 border border-amber-500/50 text-amber-300 text-[10px] font-sans font-semibold tracking-wider shadow-lg">
            <span>👼 Angel Rescues:</span>
            <span className="font-mono text-white font-bold">{player.angelRescuesRemaining}/3</span>
          </div>
        </div>

        {/* Enemy Vitality Badge */}
        <div className={`bg-[#0f1117]/90 backdrop-blur-md border px-4 py-2 rounded-lg text-right ${enemy.isStrongRed ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-rose-900/50'}`}>
          <div className="flex items-center justify-end gap-2">
            {enemy.isStrongRed && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/80 border border-red-500 text-red-200 font-sans font-bold uppercase tracking-wider animate-pulse">
                Crimson Stronghold
              </span>
            )}
            <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              {enemy.name}
            </span>
            <span className="text-sm">{enemy.symbol}</span>
          </div>
          {/* Enemy HP bar */}
          <div className="w-36 sm:w-44 bg-[#1a1c25] h-2.5 rounded-full overflow-hidden border border-[#2a2a35] mt-1.5">
            <div
              className={`h-full transition-all duration-300 ${enemy.isStrongRed ? 'bg-gradient-to-r from-red-700 via-red-500 to-rose-400' : 'bg-gradient-to-r from-red-600 to-rose-400'}`}
              style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-rose-300 font-bold">
            {enemyHp} / {enemy.maxHp} HP
          </span>
        </div>
      </div>

      {/* 2. THE VISIBLE BATTLEGROUND CANVAS */}
      <canvas
        ref={canvasRef}
        width={960}
        height={620}
        className="w-full h-full object-cover block"
      />

      {/* 2.5 DYNAMIC FLOATING POP-UP DAMAGE & HEALING NUMBERS */}
      {damageNumber && (
        <div
          className={`absolute z-40 font-bold font-sans pointer-events-none transition-all duration-300 select-none animate-bounce ${
            damageNumber.isEnemy
              ? 'top-[40%] right-[24%] text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,1)]'
              : damageNumber.isHeal
              ? 'top-[46%] left-[24%] text-3xl sm:text-4xl text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,1)]'
              : damageNumber.isImmune
              ? 'top-[44%] left-[22%] text-2xl sm:text-3xl text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,1)]'
              : 'top-[46%] left-[24%] text-3xl sm:text-4xl text-rose-500 drop-shadow-[0_0_20px_rgba(239,68,68,1)]'
          }`}
        >
          <div className="flex items-center gap-1.5 bg-[#0a0c14]/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl">
            {damageNumber.isHeal ? (
              <span className="text-emerald-300 flex items-center gap-1">
                <Heart className="w-5 h-5 text-emerald-400 inline fill-emerald-400" />
                +{damageNumber.val} HP
              </span>
            ) : damageNumber.isImmune ? (
              <span className="text-cyan-300 flex items-center gap-1 font-extrabold uppercase tracking-wide">
                <Shield className="w-6 h-6 text-cyan-400 inline animate-pulse" />
                IMMUNE (0 Dmg)
              </span>
            ) : damageNumber.isEnemy ? (
              <span className="flex items-center gap-1 text-amber-300">
                <Zap className="w-6 h-6 text-amber-400 inline animate-spin" />
                -{damageNumber.val} Holy Dmg
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <Skull className="w-5 h-5 text-rose-500 inline" />
                -{damageNumber.val} HP
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. CLOSED CAPTION SUBTITLE BANNER (Enemy taunts, Angel messages & Scripture readings) */}
      {activeClosedCaption && (
        <div className="absolute bottom-24 sm:bottom-28 left-4 right-4 sm:left-12 sm:right-12 z-30 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className={`backdrop-blur-md rounded-lg p-3.5 sm:p-4 shadow-2xl border relative ${
              activeClosedCaption.isAngelMessage
                ? 'bg-[#1e1a0b]/95 border-amber-400 text-amber-100 shadow-[0_0_30px_rgba(254,240,138,0.5)]'
                : activeClosedCaption.isEnemyTaunt
                ? 'bg-[#18081c]/95 border-purple-500 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
                : 'bg-[#0a0c10]/95 border-[#d4af37]/70 text-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b pb-1.5 border-white/10">
              <div className="flex items-center gap-2">
                {activeClosedCaption.isAngelMessage ? (
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                ) : activeClosedCaption.isEnemyTaunt ? (
                  <Skull className="w-4 h-4 text-purple-400 animate-bounce" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                )}
                <span
                  className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] font-sans font-bold ${
                    activeClosedCaption.isAngelMessage
                      ? 'text-amber-300'
                      : activeClosedCaption.isEnemyTaunt
                      ? 'text-purple-400'
                      : 'text-[#d4af37]'
                  }`}
                >
                  {activeClosedCaption.label} {activeClosedCaption.ref && `• ${activeClosedCaption.ref}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveClosedCaption(null)}
                className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-wider font-sans cursor-pointer"
                title="Dismiss dialog"
              >
                Dismiss [Space]
              </button>
            </div>
            <p className="text-xs sm:text-sm font-serif italic leading-relaxed max-w-2xl text-left sm:text-center mx-auto">
              “{activeClosedCaption.text}”
            </p>
          </div>
        </div>
      )}

      {/* 4. SCRIPTURE PICKER POPOVER (Keypad 1) */}
      {showScripturePicker && (
        <div className="absolute bottom-24 right-4 z-40 w-84 max-w-[90vw] bg-[#0f1117]/95 border border-[#d4af37]/70 rounded-lg p-3 shadow-2xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a35] mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-sans font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Proclaim Scripture (SP) • Elder Voice
            </span>
            <button
              type="button"
              onClick={() => setShowScripturePicker(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {SCRIPTURE_READ_ALOUDS.map((rec) => {
              const isLocked = rec.requiredLevel && player.level < rec.requiredLevel;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleCastScripture(rec)}
                  disabled={Boolean(isLocked || player.sp < rec.spCost)}
                  className="w-full text-left p-2 rounded bg-[#0a0c10] hover:bg-[#1a1c25] border border-[#2a2a35] hover:border-[#d4af37] transition-all disabled:opacity-40 flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#d4af37] flex items-center gap-1.5">
                      {rec.name}
                      {isLocked && (
                        <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Lv.{rec.requiredLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-gray-400 font-serif italic">{rec.verseRef}</div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                    {rec.spCost} SP
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ITEM PICKER POPOVER (Keypad 3) */}
      {showItemPicker && (
        <div className="absolute bottom-24 right-4 z-40 w-72 bg-[#0f1117]/95 border border-[#d4af37]/70 rounded-lg p-3 shadow-2xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a35] mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-sans font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Use Pilgrim Vessel
            </span>
            <button
              type="button"
              onClick={() => setShowItemPicker(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {player.inventory
              .filter((item) => item.type !== 'currency')
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleUseItem(item)}
                  disabled={item.count <= 0}
                  className="w-full text-left p-2 rounded bg-[#0a0c10] hover:bg-[#1a1c25] border border-[#2a2a35] hover:border-[#d4af37] transition-all disabled:opacity-30 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs text-white font-medium">{item.name}</div>
                    <div className="text-[9px] text-gray-400 font-serif italic">{item.description}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#d4af37] bg-[#1a1c25] px-2 py-0.5 rounded border border-[#2a2a35]">
                    x{item.count}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 6. COMPACT LOWER-RIGHT ACTION DOCK (Keypad 1, 2, 3) */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 bg-[#0a0c10]/95 backdrop-blur-md border border-[#2a2a35] p-2 rounded-lg shadow-2xl">
        {/* [1] Scripture Read Aloud (Random non-repeating proclamation on click or [1]) */}
        <div className="relative flex flex-col">
          <button
            type="button"
            id="btn-action-scripture-read"
            onClick={handleRandomScriptureCast}
            disabled={!isPlayerTurn || isAngelIntervening}
            className="flex flex-col items-center justify-center w-16 h-14 sm:w-18 sm:h-16 rounded bg-[#131722] hover:bg-[#d4af37] text-white hover:text-black border border-[#2a2a35] hover:border-[#d4af37] transition-all disabled:opacity-40 group relative"
            title="Scripture: Random Living Scripture Proclamation (Press 1 or Numpad 1)"
          >
            <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-blue-400 group-hover:text-black">
              [1]
            </span>
            <Zap className="w-5 h-5 text-blue-400 group-hover:text-black transition-transform group-hover:scale-110" />
            <span className="text-[9px] uppercase tracking-wider font-sans font-bold mt-1">
              Scripture
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowScripturePicker(!showScripturePicker);
              setShowItemPicker(false);
            }}
            disabled={!isPlayerTurn || isAngelIntervening}
            className="text-[8px] text-gray-400 hover:text-[#d4af37] text-center mt-0.5 tracking-tight underline"
            title="View full list of scriptures"
          >
            List
          </button>
        </div>

        {/* [2] Armor of God */}
        <button
          type="button"
          id="btn-action-armor-of-god"
          onClick={handleArmorOfGod}
          disabled={!isPlayerTurn || isAngelIntervening}
          className={`flex flex-col items-center justify-center w-16 h-14 sm:w-18 sm:h-16 rounded transition-all disabled:opacity-40 group relative ${
            armorCharges > 0
              ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-[#131722] hover:bg-[#d4af37] text-white hover:text-black border border-[#2a2a35] hover:border-[#d4af37]'
          }`}
          title="Armor of God: 1st attack IMMUNE, 2nd attack 50% discount (Press 2 or Numpad 2)"
        >
          <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-amber-400 group-hover:text-black">
            [2]
          </span>
          {armorCharges > 0 && (
            <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-amber-400 text-black text-[8px] font-bold">
              {armorCharges === 2 ? 'IMMUNE' : '50% OFF'}
            </span>
          )}
          <Shield className="w-5 h-5 text-amber-400 group-hover:text-black transition-transform group-hover:scale-110" />
          <span className="text-[9px] uppercase tracking-wider font-sans font-bold mt-1">
            Armor of God
          </span>
        </button>

        {/* [3] Vessel Items */}
        <button
          type="button"
          id="btn-action-vessels"
          onClick={() => {
            setShowItemPicker(!showItemPicker);
            setShowScripturePicker(false);
          }}
          disabled={!isPlayerTurn || isAngelIntervening}
          className="flex flex-col items-center justify-center w-16 h-14 sm:w-18 sm:h-16 rounded bg-[#131722] hover:bg-[#d4af37] text-white hover:text-black border border-[#2a2a35] hover:border-[#d4af37] transition-all disabled:opacity-40 group relative"
          title="Vessel Items: Heal HP & Oil (Press 3 or Numpad 3)"
        >
          <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-emerald-400 group-hover:text-black">
            [3]
          </span>
          <Droplet className="w-5 h-5 text-emerald-400 group-hover:text-black transition-transform group-hover:scale-110" />
          <span className="text-[9px] uppercase tracking-wider font-sans font-bold mt-1">
            Vessels
          </span>
        </button>
      </div>
    </div>
  );
};
