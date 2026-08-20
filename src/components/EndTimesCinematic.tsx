import React, { useEffect, useRef, useState } from 'react';
import { PlayerState, SoulPerson } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Sparkles, Sword, Flame, Heart, Crown, Shield, Volume2, ArrowRight } from 'lucide-react';

interface EndTimesCinematicProps {
  player: PlayerState;
  souls?: SoulPerson[];
  onFinishVictory?: () => void;
  onCompleteVictory?: () => void;
  onExitToPilgrimage?: () => void;
}

type BattlePhase =
  | 'transformation' // Warrior angel ascension (Wings, Armor, Flaming Sword)
  | 'angelic_clash'   // Warrior angel fighting dark angels in the sky
  | 'king_descends'   // Revelation 19:11 King on White Horse descends
  | 'every_knee_bows' // Philippians 2:10 Every knee bows, dark angels burn in fire
  | 'wedding_feast';  // Revelation 19:9 Marriage Supper of the Lamb

export const EndTimesCinematic: React.FC<EndTimesCinematicProps> = ({
  player,
  souls = [],
  onFinishVictory,
  onCompleteVictory,
  onExitToPilgrimage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<BattlePhase>('transformation');
  const [subtitle, setSubtitle] = useState<string>(
    '“Put on the whole armor of God, that you may be able to stand against the wiles of the devil.” — Ephesians 6:11'
  );
  const [phaseProgress, setPhaseProgress] = useState<number>(0);

  // Sound triggers & phase sequence
  useEffect(() => {
    soundEngine.playCelestialTrumpet();

    const t1 = setTimeout(() => {
      setPhase('angelic_clash');
      setSubtitle(
        '“And war broke out in heaven: Michael and his angels fought with the dragon and his angels.” — Revelation 12:7'
      );
      soundEngine.playSwordSlash();
    }, 6000);

    const t2 = setTimeout(() => {
      setPhase('king_descends');
      setSubtitle(
        '“Now I saw heaven opened, and behold, a white horse. And He who sat on him was called Faithful and True!” — Revelation 19:11'
      );
      soundEngine.playCelestialTrumpet();
    }, 14000);

    const t3 = setTimeout(() => {
      setPhase('every_knee_bows');
      setSubtitle(
        '“At the name of Jesus every knee shall bow... and every tongue confess that Jesus Christ is Lord!” — Philippians 2:10-11'
      );
      soundEngine.playScriptureBell();
    }, 22000);

    const t4 = setTimeout(() => {
      setPhase('wedding_feast');
      setSubtitle(
        '“Blessed are those who are called to the Marriage Supper of the Lamb!” — Revelation 19:9'
      );
      soundEngine.playCelestialTrumpet();
    }, 30000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // 1. Sky Background based on Phase
      if (phase === 'transformation' || phase === 'angelic_clash') {
        // Dramatic cosmic storm
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0f0a1c');
        grad.addColorStop(0.5, '#1e102f');
        grad.addColorStop(1, '#0a0510');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Thunder flashes
        if (tick % 45 < 3) {
          ctx.fillStyle = 'rgba(180, 160, 255, 0.15)';
          ctx.fillRect(0, 0, w, h);
        }
      } else if (phase === 'king_descends' || phase === 'every_knee_bows') {
        // Heavenly sunrise breaking through the storm
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#fff4cc');
        grad.addColorStop(0.3, '#f59e0b');
        grad.addColorStop(0.7, '#7c2d12');
        grad.addColorStop(1, '#180703');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Radiant sunbeams
        ctx.save();
        ctx.translate(w / 2, 80);
        for (let i = 0; i < 12; i++) {
          ctx.rotate((Math.PI * 2) / 12);
          ctx.fillStyle = 'rgba(255, 250, 200, 0.08)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-40, h);
          ctx.lineTo(40, h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else {
        // Celestial Wedding Ballroom
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#2d1b4e');
        grad.addColorStop(0.5, '#4c1d95');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Golden sparkles
        for (let i = 0; i < 25; i++) {
          const px = (Math.sin(tick * 0.02 + i) * 0.5 + 0.5) * w;
          const py = ((tick * 0.5 + i * 20) % h);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py, (i % 3) + 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Render Warrior Angel (Archangel Michael with Wings, Golden Armor, Flaming Sword)
      const angelX = phase === 'wedding_feast' ? w * 0.3 : w * 0.35 + Math.sin(tick * 0.05) * 15;
      const angelY = phase === 'wedding_feast' ? h * 0.65 : h * 0.5 + Math.cos(tick * 0.04) * 10;

      // Angelic Wings (Michael)
      const wingSpan = 45 + Math.sin(tick * 0.1) * 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;

      // Left Wing
      ctx.beginPath();
      ctx.moveTo(angelX - 10, angelY - 5);
      ctx.quadraticCurveTo(angelX - 35, angelY - wingSpan, angelX - 55, angelY - 15);
      ctx.quadraticCurveTo(angelX - 30, angelY + 15, angelX - 10, angelY + 10);
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(angelX + 10, angelY - 5);
      ctx.quadraticCurveTo(angelX + 35, angelY - wingSpan, angelX + 55, angelY - 15);
      ctx.quadraticCurveTo(angelX + 30, angelY + 15, angelX + 10, angelY + 10);
      ctx.fill();

      // Angel Body / Armor (Michael)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e2e8f0'; // Silver plate armor
      ctx.fillRect(angelX - 12, angelY - 15, 24, 30);

      // Gold Trim
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.strokeRect(angelX - 12, angelY - 15, 24, 30);

      // Breastplate Cross
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(angelX - 2, angelY - 10, 4, 18);
      ctx.fillRect(angelX - 7, angelY - 5, 14, 4);

      // Angel Head & Halo
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(angelX, angelY - 24, 9, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Halo
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(angelX, angelY - 36, 12, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Flaming Sword of the Spirit
      const swordAngle = Math.sin(tick * 0.15) * 0.3 - 0.5;
      ctx.save();
      ctx.translate(angelX + 16, angelY);
      ctx.rotate(swordAngle);

      // Blade
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(0, -35, 5, 35);

      // Holy Flame aura
      ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
      ctx.fillRect(-2, -38, 9, 38);

      // Guard & Hilt
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(-5, 0, 15, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 4, 5, 8);
      ctx.restore();

      // 2B. Render Archangel Gabriel (with Golden Trumpet of the 7th Seal)
      const gabrielX = phase === 'wedding_feast' ? w * 0.18 : w * 0.2 + Math.sin(tick * 0.04 + 1) * 12;
      const gabrielY = phase === 'wedding_feast' ? h * 0.55 : h * 0.32 + Math.cos(tick * 0.05 + 1) * 8;

      // Gabriel Radiant Wings (Sky Blue & Gold)
      ctx.fillStyle = 'rgba(224, 242, 254, 0.92)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(gabrielX - 8, gabrielY - 4);
      ctx.quadraticCurveTo(gabrielX - 30, gabrielY - 35, gabrielX - 48, gabrielY - 10);
      ctx.quadraticCurveTo(gabrielX - 25, gabrielY + 12, gabrielX - 8, gabrielY + 8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(gabrielX + 8, gabrielY - 4);
      ctx.quadraticCurveTo(gabrielX + 30, gabrielY - 35, gabrielX + 48, gabrielY - 10);
      ctx.quadraticCurveTo(gabrielX + 25, gabrielY + 12, gabrielX + 8, gabrielY + 8);
      ctx.fill();

      // Gabriel Robe & Head
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(gabrielX - 9, gabrielY - 10, 18, 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(gabrielX - 9, gabrielY - 10, 18, 24);

      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(gabrielX, gabrielY - 18, 7, 0, Math.PI * 2);
      ctx.fill();

      // Halo
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(gabrielX, gabrielY - 27, 9, 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Gabriel's Golden Trumpet (Blowing to the Right)
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(gabrielX + 6, gabrielY - 18, 18, 3.5);
      // Trumpet Bell
      ctx.beginPath();
      ctx.moveTo(gabrielX + 24, gabrielY - 22);
      ctx.lineTo(gabrielX + 32, gabrielY - 26);
      ctx.lineTo(gabrielX + 32, gabrielY - 10);
      ctx.lineTo(gabrielX + 24, gabrielY - 14);
      ctx.closePath();
      ctx.fill();

      // Radiant Trumpet Soundwave Rings
      const trumpetWave = (tick * 2) % 30;
      ctx.strokeStyle = `rgba(254, 240, 138, ${Math.max(0, 1 - trumpetWave / 30)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gabrielX + 32, gabrielY - 18, trumpetWave + 4, -0.6, 0.6);
      ctx.stroke();

      // 2C. Render Six-Winged Seraph of Living Fire (Isaiah 6:3)
      const seraphX = w * 0.5 + Math.sin(tick * 0.03) * 30;
      const seraphY = h * 0.18 + Math.cos(tick * 0.04) * 6;

      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(251, 146, 60, 0.85)';

      // 6 Wings of Fire
      for (let wIdx = 0; wIdx < 3; wIdx++) {
        const wingAng = (wIdx - 1) * 0.45 + Math.sin(tick * 0.08) * 0.1;
        // Left fiery wing
        ctx.beginPath();
        ctx.moveTo(seraphX - 6, seraphY + (wIdx - 1) * 6);
        ctx.lineTo(seraphX - 35, seraphY - 20 + wIdx * 16);
        ctx.lineTo(seraphX - 15, seraphY + 10 + wIdx * 8);
        ctx.closePath();
        ctx.fill();

        // Right fiery wing
        ctx.beginPath();
        ctx.moveTo(seraphX + 6, seraphY + (wIdx - 1) * 6);
        ctx.lineTo(seraphX + 35, seraphY - 20 + wIdx * 16);
        ctx.lineTo(seraphX + 15, seraphY + 10 + wIdx * 8);
        ctx.closePath();
        ctx.fill();
      }

      // Seraph Glowing Core of Holiness
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.arc(seraphX, seraphY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Seraph Altar Coal of Fire
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(seraphX, seraphY + 14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 2D. Render Archangel Uriel (Golden Censer & Prayers of the Saints - Rev 8:3)
      const urielX = phase === 'wedding_feast' ? w * 0.42 : w * 0.12 + Math.sin(tick * 0.035 + 2) * 10;
      const urielY = phase === 'wedding_feast' ? h * 0.6 : h * 0.65 + Math.cos(tick * 0.04 + 2) * 8;

      ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;

      // Uriel Amber-Gold Wings
      ctx.beginPath();
      ctx.moveTo(urielX - 6, urielY - 4);
      ctx.quadraticCurveTo(urielX - 25, urielY - 30, urielX - 40, urielY - 8);
      ctx.quadraticCurveTo(urielX - 20, urielY + 10, urielX - 6, urielY + 6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(urielX + 6, urielY - 4);
      ctx.quadraticCurveTo(urielX + 25, urielY - 30, urielX + 40, urielY - 8);
      ctx.quadraticCurveTo(urielX + 20, urielY + 10, urielX + 6, urielY + 6);
      ctx.fill();

      // Uriel Robe & Head
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(urielX - 8, urielY - 10, 16, 22);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(urielX, urielY - 16, 6, 0, Math.PI * 2);
      ctx.fill();

      // Golden Censer
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(urielX + 12, urielY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(urielX + 6, urielY - 6);
      ctx.lineTo(urielX + 12, urielY);
      ctx.stroke();

      // 2E. Render Guardian Angel of the Elect (Shield of Faith)
      const guardianX = phase === 'wedding_feast' ? w * 0.58 : w * 0.48 + Math.sin(tick * 0.045 + 3) * 12;
      const guardianY = phase === 'wedding_feast' ? h * 0.65 : h * 0.72 + Math.cos(tick * 0.03 + 3) * 8;

      ctx.fillStyle = 'rgba(240, 253, 244, 0.92)';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 12;

      // Emerald-White Wings
      ctx.beginPath();
      ctx.moveTo(guardianX - 6, guardianY - 4);
      ctx.quadraticCurveTo(guardianX - 25, guardianY - 30, guardianX - 42, guardianY - 8);
      ctx.quadraticCurveTo(guardianX - 20, guardianY + 10, guardianX - 6, guardianY + 6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(guardianX + 6, guardianY - 4);
      ctx.quadraticCurveTo(guardianX + 25, guardianY - 30, guardianX + 42, guardianY - 8);
      ctx.quadraticCurveTo(guardianX + 20, guardianY + 10, guardianX + 6, guardianY + 6);
      ctx.fill();

      // Robe & Head
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(guardianX - 8, guardianY - 10, 16, 22);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(guardianX, guardianY - 16, 6, 0, Math.PI * 2);
      ctx.fill();

      // Shield of Faith
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(guardianX - 14, guardianY - 8);
      ctx.lineTo(guardianX - 4, guardianY - 8);
      ctx.lineTo(guardianX - 4, guardianY + 6);
      ctx.lineTo(guardianX - 9, guardianY + 12);
      ctx.lineTo(guardianX - 14, guardianY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. Render Enemies or King or Feast depending on phase
      if (phase === 'angelic_clash') {
        // Dark Angels / Shadow Demons
        for (let i = 0; i < 3; i++) {
          const darkX = w * 0.7 + Math.sin(tick * 0.08 + i) * 20;
          const darkY = h * 0.35 + i * 55 + Math.cos(tick * 0.06 + i) * 15;

          // Dark bat wings
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.moveTo(darkX, darkY);
          ctx.lineTo(darkX + 35, darkY - 20);
          ctx.lineTo(darkX + 25, darkY + 10);
          ctx.closePath();
          ctx.fill();

          // Dark Body
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(darkX - 10, darkY - 10, 20, 25);

          // Fiery red eyes
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(darkX - 5, darkY - 6, 3, 3);
          ctx.fillRect(darkX + 2, darkY - 6, 3, 3);
        }

        // Holy energy beam connecting sword to darkness
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(angelX + 20, angelY - 10);
        ctx.lineTo(w * 0.68, h * 0.45);
        ctx.stroke();
      }

      if (phase === 'king_descends' || phase === 'every_knee_bows') {
        // King on the White Horse descending from top right
        const kingX = phase === 'every_knee_bows' ? w * 0.65 : w * 0.75 - Math.sin(tick * 0.02) * 20;
        const kingY = phase === 'every_knee_bows' ? h * 0.45 : h * 0.35;

        // White Horse Body
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;

        // Horse Torso
        ctx.beginPath();
        ctx.ellipse(kingX, kingY, 35, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horse Neck & Head
        ctx.beginPath();
        ctx.moveTo(kingX - 25, kingY);
        ctx.lineTo(kingX - 45, kingY - 25);
        ctx.lineTo(kingX - 35, kingY - 30);
        ctx.lineTo(kingX - 15, kingY - 10);
        ctx.closePath();
        ctx.fill();

        // Horse Legs
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(kingX - 20, kingY + 10);
        ctx.lineTo(kingX - 25, kingY + 30);
        ctx.moveTo(kingX + 15, kingY + 10);
        ctx.lineTo(kingX + 20, kingY + 30);
        ctx.stroke();

        // The King of Kings Rider
        ctx.shadowBlur = 0;
        // Robe dipped in blood
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(kingX - 8, kingY - 35, 16, 25);

        // Gold sash
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(kingX - 10, kingY - 28, 20, 5);

        // Head & Many Crowns
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(kingX, kingY - 42, 8, 0, Math.PI * 2);
        ctx.fill();

        // Golden Crowns
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(kingX - 12, kingY - 48);
        ctx.lineTo(kingX - 8, kingY - 58);
        ctx.lineTo(kingX - 4, kingY - 49);
        ctx.lineTo(kingX, kingY - 60);
        ctx.lineTo(kingX + 4, kingY - 49);
        ctx.lineTo(kingX + 8, kingY - 58);
        ctx.lineTo(kingX + 12, kingY - 48);
        ctx.closePath();
        ctx.fill();

        // Eyes like flames of fire
        ctx.fillStyle = '#f97316';
        ctx.fillRect(kingX - 4, kingY - 44, 2, 2);
        ctx.fillRect(kingX + 2, kingY - 44, 2, 2);

        // Scepter / Rod of Iron
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(kingX - 15, kingY - 45);
        ctx.lineTo(kingX - 25, kingY - 65);
        ctx.stroke();

        // If Phase is every_knee_bows: Dark angels bowing and burning in fire
        if (phase === 'every_knee_bows') {
          for (let i = 0; i < 4; i++) {
            const fx = w * 0.15 + i * (w * 0.22);
            const fy = h * 0.78;

            // Bowing dark figures
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(fx, fy + 10, 16, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Holy consuming fire (Revelation 20:10)
            const fireH = 25 + Math.sin(tick * 0.2 + i) * 10;
            const fireGrad = ctx.createLinearGradient(fx, fy + 15, fx, fy - fireH);
            fireGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
            fireGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.8)');
            fireGrad.addColorStop(1, 'rgba(254, 240, 138, 0.1)');
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.moveTo(fx - 12, fy + 10);
            ctx.quadraticCurveTo(fx, fy - fireH, fx + 12, fy + 10);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      if (phase === 'wedding_feast') {
        // Golden Banquet Table & 7 saved souls rejoicing
        const tableY = h * 0.75;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w * 0.1, tableY, w * 0.8, 12);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(w * 0.1, tableY + 12, w * 0.8, 4);

        // 7 Souls around the table with their symbols
        souls.forEach((s, idx) => {
          const sx = w * 0.18 + idx * (w * 0.09);
          const sy = tableY - 20;

          ctx.fillStyle = s.avatarColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = s.robeColor;
          ctx.fillRect(sx - 6, sy + 7, 12, 14);

          // Joyful bouncing
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px serif';
          ctx.fillText(s.symbol, sx - 5, sy - 10 + Math.sin(tick * 0.1 + idx) * 3);
        });

        // Golden chalices & bread on table
        for (let i = 0; i < 6; i++) {
          const cx = w * 0.22 + i * (w * 0.11);
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(cx - 3, tableY - 8, 6, 8);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [phase, souls]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-[#e2e2d5] select-none">
      {/* Top Banner Navigation */}
      <div className="w-full bg-[#0d0f17]/90 border-b border-[#d4af37]/60 px-6 py-3 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-[#d4af37] animate-pulse" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-widest uppercase font-sans">
              The End of Times: Revelation 19
            </h2>
            <p className="text-[11px] text-[#d4af37] font-serif">
              Victory of the King of Kings & The Marriage Supper of the Lamb
            </p>
          </div>
        </div>

        {/* Phase Indicator Pills */}
        <div className="hidden md:flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-wider">
          <span className={`px-2.5 py-1 rounded ${phase === 'transformation' ? 'bg-[#d4af37] text-black' : 'bg-[#1a1e2b] text-gray-400'}`}>
            1. Transformation
          </span>
          <span className={`px-2.5 py-1 rounded ${phase === 'angelic_clash' ? 'bg-[#d4af37] text-black' : 'bg-[#1a1e2b] text-gray-400'}`}>
            2. Angelic Clash
          </span>
          <span className={`px-2.5 py-1 rounded ${phase === 'king_descends' ? 'bg-[#d4af37] text-black' : 'bg-[#1a1e2b] text-gray-400'}`}>
            3. King on White Horse
          </span>
          <span className={`px-2.5 py-1 rounded ${phase === 'every_knee_bows' ? 'bg-[#d4af37] text-black' : 'bg-[#1a1e2b] text-gray-400'}`}>
            4. Every Knee Bows
          </span>
          <span className={`px-2.5 py-1 rounded ${phase === 'wedding_feast' ? 'bg-[#d4af37] text-black' : 'bg-[#1a1e2b] text-gray-400'}`}>
            5. Marriage Feast
          </span>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Souls Won: <strong className="text-emerald-400">7 / 7</strong>
        </div>
      </div>

      {/* Main Canvas Spectator Stage */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full max-h-[70vh] object-contain"
        />

        {/* Floating Narrative Badges during Phases */}
        <div className="absolute top-6 left-6 max-w-sm bg-[#0f1422]/85 border border-[#d4af37]/50 rounded-lg p-3 shadow-xl backdrop-blur-md">
          <div className="text-[10px] font-sans uppercase tracking-widest text-[#d4af37] font-bold">
            {phase === 'transformation' && 'Celestial Metamorphosis'}
            {phase === 'angelic_clash' && 'The War in Heaven'}
            {phase === 'king_descends' && 'The King of Kings Arrives'}
            {phase === 'every_knee_bows' && 'The Final Judgment'}
            {phase === 'wedding_feast' && 'The Eternal Celebration'}
          </div>
          <p className="text-xs text-gray-200 font-serif italic mt-1">
            {phase === 'transformation' && 'You have put on the celestial armor of God, wielding the sword of righteousness with wings of light.'}
            {phase === 'angelic_clash' && 'Angelic hosts strike down the forces of darkness and unrighteousness.'}
            {phase === 'king_descends' && 'The Heavens open wide! The Lord Jesus descends with blazing power to claim His eternal kingdom.'}
            {phase === 'every_knee_bows' && 'Every knee in heaven and on earth bows down before King Jesus; darkness is cast into the eternal flame.'}
            {phase === 'wedding_feast' && 'All 7 saved souls and the faithful Brides of Light take their seats at the Marriage Supper of the Lamb!'}
          </p>
        </div>
      </div>

      {/* Bottom Subtitle / Scripture Box & Victory Action */}
      <div className="w-full bg-[#0a0d14]/95 border-t border-[#d4af37]/70 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans font-bold flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            Eternal Gospel Revelation
          </div>
          <p className="text-xs sm:text-base font-serif italic text-white leading-relaxed">
            {subtitle}
          </p>
        </div>

        {phase === 'wedding_feast' ? (
          <button
            type="button"
            onClick={() => {
              if (onCompleteVictory) onCompleteVictory();
              else if (onFinishVictory) onFinishVictory();
            }}
            className="px-6 py-3 rounded-lg bg-[#d4af37] hover:bg-[#e6c258] text-black text-xs sm:text-sm font-sans uppercase tracking-[0.2em] font-extrabold flex items-center gap-2 shadow-2xl hover:scale-105 transition-all whitespace-nowrap"
          >
            <Crown className="w-4 h-4 text-black" />
            Enter Eternal Rest & Glory
          </button>
        ) : (
          <div className="text-xs text-gray-400 font-serif italic whitespace-nowrap animate-pulse">
            ⚔️ Spectating heavenly battle...
          </div>
        )}
      </div>
    </div>
  );
};
