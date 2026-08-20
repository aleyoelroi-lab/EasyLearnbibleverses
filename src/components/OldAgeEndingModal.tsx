import React from 'react';
import { PlayerState, SoulPerson } from '../types';
import { Sparkles, Heart, Crown, Clock, Flame, RotateCcw, BookOpen } from 'lucide-react';

interface OldAgeEndingModalProps {
  player: PlayerState;
  souls: SoulPerson[];
  onRestart: () => void;
}

export const OldAgeEndingModal: React.FC<OldAgeEndingModalProps> = ({
  player,
  souls,
  onRestart,
}) => {
  const wonSouls = souls.filter((s) => s.status === 'believed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090d]/95 backdrop-blur-lg animate-in fade-in duration-700">
      <div className="relative w-full max-w-2xl bg-[#0e111a] border-2 border-[#d4af37]/70 rounded-2xl p-6 sm:p-8 shadow-2xl text-[#e2e2d5] text-center flex flex-col items-center">
        {/* Resting Epitaph Symbol */}
        <div className="w-16 h-16 rounded-full bg-[#182030] border-2 border-[#d4af37] flex items-center justify-center text-3xl shadow-xl mb-4">
          🪦
        </div>

        {/* Header Title */}
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-sans font-bold">
          A Faithful Life Finished in Grace
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-white tracking-wide mt-1">
          Tomb of the Faithful Pilgrim
        </h2>
        <p className="text-xs text-gray-400 font-serif italic mb-6">
          Having lived out a full 1-hour earthly pilgrimage, resting peacefully in Christ awaiting the Resurrection
        </p>

        {/* Sacred Stone Inscription */}
        <div className="w-full bg-[#131826] border border-[#d4af37]/40 rounded-xl p-5 sm:p-6 mb-6 shadow-inner text-left">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#d4af37] font-bold font-sans mb-2">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            Stone Epitaph (2 Timothy 4:7-8 & Titus 2:13)
          </div>
          <p className="text-sm sm:text-base font-serif italic text-white leading-relaxed">
            “I have fought the good fight, I have finished the race, I have kept the faith. Now there is in store for me the crown of righteousness, which the Lord, the righteous Judge, will award to me on that day... waiting for our blessed hope, the glorious appearing of our great God and Savior Jesus Christ.”
          </p>
        </div>

        {/* Earthly Pilgrimage Legacy Stats */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-left">
          <div className="bg-[#161c2c] border border-[#2a2a35] p-3 rounded-lg">
            <div className="text-[10px] text-gray-400 font-sans uppercase">Souls Reached</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {wonSouls.length} / 7
            </div>
            <div className="text-[9px] text-gray-400 font-serif">Seeds in Garden</div>
          </div>

          <div className="bg-[#161c2c] border border-[#2a2a35] p-3 rounded-lg">
            <div className="text-[10px] text-gray-400 font-sans uppercase">Lamp Oil Preserved</div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              {Math.round(player.oil)}%
            </div>
            <div className="text-[9px] text-gray-400 font-serif">Virgin's Vigil</div>
          </div>

          <div className="bg-[#161c2c] border border-[#2a2a35] p-3 rounded-lg">
            <div className="text-[10px] text-gray-400 font-sans uppercase">Steps of Faith</div>
            <div className="text-lg font-bold text-blue-300 font-mono">
              {player.stepsWalked}
            </div>
            <div className="text-[9px] text-gray-400 font-serif">Sanctuary Path</div>
          </div>

          <div className="bg-[#161c2c] border border-[#2a2a35] p-3 rounded-lg">
            <div className="text-[10px] text-gray-400 font-sans uppercase">Faith EXP Score</div>
            <div className="text-lg font-bold text-[#d4af37] font-mono">
              {player.score}
            </div>
            <div className="text-[9px] text-gray-400 font-serif">Heavenly Talents</div>
          </div>
        </div>

        {/* Souls Remembered */}
        {wonSouls.length > 0 && (
          <div className="w-full bg-[#111622] border border-[#2a2a35] p-3 rounded-lg mb-6 text-left">
            <div className="text-[10px] font-sans text-amber-300 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Souls Sown Into Eternity
            </div>
            <div className="flex flex-wrap gap-2">
              {wonSouls.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded bg-[#1c2436] border border-[#d4af37]/40 text-xs text-white font-serif flex items-center gap-1"
                >
                  <span>{s.symbol}</span>
                  <span>{s.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onRestart}
          className="px-8 py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#e6c258] text-black text-xs uppercase tracking-[0.2em] font-sans font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"
        >
          <RotateCcw className="w-4 h-4 text-black" />
          Begin A New Generation of Faith
        </button>
      </div>
    </div>
  );
};
