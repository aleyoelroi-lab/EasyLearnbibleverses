import React from 'react';
import { GameStageId, BrideCharacter } from '../types';
import { Sparkles, Flame, ShieldAlert, Award, ArrowRight, RotateCcw } from 'lucide-react';

interface StageCinematicsProps {
  type: 'title' | 'dragon_encounter' | 'white_horse_triumph' | 'epilogue_glory' | 'game_over';
  bride: BrideCharacter;
  score: number;
  onStartGame?: () => void;
  onContinue?: () => void;
  onRestart?: () => void;
}

export const StageCinematics: React.FC<StageCinematicsProps> = ({
  type,
  bride,
  score,
  onStartGame,
  onContinue,
  onRestart,
}) => {
  if (type === 'title') {
    return (
      <div className="relative w-full max-w-4xl mx-auto my-auto p-8 sm:p-12 rounded-lg bg-[#0c0d10]/95 border border-[#2a2a35] shadow-2xl text-center flex flex-col items-center overflow-hidden">
        {/* Atmospheric Background Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top HUD: Character & Status aesthetic */}
        <div className="relative mb-6 z-10">
          <div className="w-20 h-20 rounded-full border-2 border-[#d4af37] p-1 bg-[#1a1c25] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <Flame className="w-10 h-10 text-[#d4af37]" />
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2 z-10">
          <div className="h-[1px] w-6 bg-[#d4af37]" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#d4af37] font-sans">
            A Biblical Pixel-Art Pilgrimage
          </span>
          <div className="h-[1px] w-6 bg-[#d4af37]" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-4 z-10">
          BRIDES OF LIGHT
        </h1>

        <p className="text-[#c2c2b5] text-sm sm:text-base max-w-xl mx-auto italic font-serif leading-relaxed mb-8 z-10">
          “At midnight the cry rang out: ‘Here’s the bridegroom! Come out to meet him!’”
          <br />
          <span className="text-[#d4af37] text-xs font-sans not-italic uppercase tracking-widest mt-1 block">
            — Matthew 25:6
          </span>
        </p>

        {/* Core Themes 3-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8 text-xs text-gray-300 z-10">
          <div className="p-4 rounded border border-[#2a2a35] bg-[#0f1117] flex flex-col items-center text-center">
            <Flame className="w-5 h-5 text-[#d4af37] mb-2" />
            <span className="font-light text-sm text-white mb-1">The Oil of Vigilance</span>
            <span className="text-gray-400 font-serif italic">Maintain the Holy Spirit's flame against darkness</span>
          </div>
          <div className="p-4 rounded border border-[#2a2a35] bg-[#0f1117] flex flex-col items-center text-center">
            <Sparkles className="w-5 h-5 text-[#d4af37] mb-2" />
            <span className="font-light text-sm text-white mb-1">10 Spiritual Virgins</span>
            <span className="text-gray-400 font-serif italic">Unique spiritual temperaments, perks & vessels</span>
          </div>
          <div className="p-4 rounded border border-[#2a2a35] bg-[#0f1117] flex flex-col items-center text-center">
            <Award className="w-5 h-5 text-[#d4af37] mb-2" />
            <span className="font-light text-sm text-white mb-1">The Midnight Cry</span>
            <span className="text-gray-400 font-serif italic">The King on the White Horse & eternal dawn</span>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          id="btn-title-start"
          onClick={onStartGame}
          className="px-10 py-3.5 border border-[#d4af37] text-[#d4af37] uppercase text-[11px] tracking-[0.35em] font-sans hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-3 z-10 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          <Flame className="w-4 h-4" />
          <span>Begin the Pilgrimage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (type === 'game_over') {
    return (
      <div className="relative w-full max-w-xl mx-auto p-8 rounded-lg bg-[#0c0d10] border border-rose-900/60 shadow-2xl text-center flex flex-col items-center">
        <div className="p-4 rounded-full border border-rose-800 bg-rose-950/40 text-rose-400 mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-light text-rose-300 mb-2 tracking-tight">
          The Lantern Has Flickered Out
        </h2>
        <p className="text-[#c2c2b5] text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed font-serif italic">
          Like the five foolish virgins who carried no extra oil, the midnight hour arrived before the lamp was replenished.
          <br />
          <span className="text-[#d4af37] font-sans not-italic uppercase tracking-widest text-[10px] block mt-2">
            “Watch therefore, for you know neither the day nor the hour.” — Matthew 25:13
          </span>
        </p>

        <div className="p-3 rounded border border-[#2a2a35] bg-[#0f1117] w-full max-w-xs mb-6 text-xs">
          <span className="text-gray-500 uppercase tracking-widest text-[9px] block font-sans">Final Faith Accumulated</span>
          <span className="text-xl font-light text-white font-mono">{score.toLocaleString()} FP</span>
        </div>

        <button
          type="button"
          id="btn-gameover-restart"
          onClick={onRestart}
          className="px-8 py-3 border border-[#d4af37] text-[#d4af37] uppercase text-[10px] tracking-[0.3em] font-sans hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rekindle the Lamp & Try Again</span>
        </button>
      </div>
    );
  }

  if (type === 'white_horse_triumph') {
    return (
      <div className="relative w-full max-w-2xl mx-auto p-8 rounded-lg bg-[#0c0d10] border border-[#d4af37]/60 shadow-2xl text-center flex flex-col items-center">
        <div className="p-4 rounded-full border-2 border-[#d4af37] bg-[#1a1c25] text-[#d4af37] mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Sparkles className="w-10 h-10" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-sans mb-1">
          Revelation 19:11-16
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-white mb-3 tracking-tight">
          The King on the White Horse Arrives!
        </h2>
        <p className="text-[#c2c2b5] text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed italic font-serif">
          “And I saw heaven opened, and behold, a white horse! He who sat on it is called Faithful and True, and in righteousness He judges and makes war... and the armies of heaven followed Him.”
        </p>

        <div className="p-4 rounded border border-[#2a2a35] bg-[#0f1117] w-full mb-6 text-left text-xs text-gray-300 space-y-2">
          <div className="flex items-center gap-2 text-[#d4af37] font-sans uppercase tracking-wider text-[10px]">
            <Flame className="w-4 h-4" />
            <span>5 Wise Sister Brides Rescued</span>
          </div>
          <p className="text-gray-400 font-serif italic text-xs">
            The Dragon of darkness is vanquished. The storm clouds break as the celestial golden sunrise dawns over the Sanctuary.
          </p>
        </div>

        <button
          type="button"
          id="btn-triumph-continue"
          onClick={onContinue}
          className="px-8 py-3 border border-[#d4af37] bg-[#d4af37] text-black uppercase text-[10px] tracking-[0.3em] font-sans hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] font-semibold"
        >
          <span>Enter the Marriage Supper & Feast</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Epilogue Glory (John 1:1, 1:14)
  return (
    <div className="relative w-full max-w-3xl mx-auto p-8 sm:p-12 rounded-lg bg-[#0c0d10] border border-[#d4af37] shadow-2xl text-center flex flex-col items-center overflow-hidden">
      {/* Subtle Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
        }}
      />

      <div className="p-4 rounded-full border-2 border-[#d4af37] bg-[#1a1c25] text-[#d4af37] mb-4 shadow-[0_0_25px_rgba(212,175,55,0.35)] z-10">
        <Sparkles className="w-12 h-12" />
      </div>

      <span className="text-[10px] uppercase tracking-[0.35em] text-[#d4af37] font-sans mb-1 z-10">
        The Word Made Flesh • John 1:1, 1:14
      </span>
      <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mb-4 z-10">
        The Eternal Light of Mankind
      </h2>

      <div className="p-6 rounded border border-[#d4af37]/30 bg-[#d4af37]/5 mb-6 text-[#e2e2d5] italic font-serif text-xs sm:text-sm leading-relaxed max-w-xl text-left z-10">
        <p className="mb-2">
          “In the beginning was the Word, and the Word was with God, and the Word was God... In Him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.”
        </p>
        <p>
          “And the Word became flesh and dwelt among us, and we have seen His glory, glory as of the only Son from the Father, full of grace and truth.”
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl mb-8 text-center text-xs z-10 font-sans">
        <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35]">
          <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Bride of Light</span>
          <span className="text-[#d4af37] font-serif font-light text-sm">{bride.name}</span>
        </div>
        <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35]">
          <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Total Faith</span>
          <span className="text-white font-mono font-bold text-sm">{score.toLocaleString()} FP</span>
        </div>
        <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35]">
          <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Lamps Trimmed</span>
          <span className="text-emerald-400 font-semibold">5 Wise Virgins</span>
        </div>
        <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35]">
          <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Destiny</span>
          <span className="text-[#d4af37] font-semibold">Eternal Glory</span>
        </div>
      </div>

      <button
        type="button"
        id="btn-epilogue-restart"
        onClick={onRestart}
        className="px-10 py-3.5 border border-[#d4af37] text-[#d4af37] uppercase text-[11px] tracking-[0.3em] font-sans hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-2.5 z-10 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Return to Character Selection</span>
      </button>
    </div>
  );
};
