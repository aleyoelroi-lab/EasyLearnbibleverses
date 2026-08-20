import React, { useState } from 'react';
import { SoulPerson, PlayerState } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Sparkles, Sprout, Droplets, BookOpen, Sword, X, CheckCircle, TreePine } from 'lucide-react';

interface GardenModalProps {
  souls: SoulPerson[];
  player?: PlayerState;
  onUpdatePlayer?: (updater: (prev: PlayerState) => PlayerState) => void;
  onWaterPlant: (soulId: string) => void;
  onStartEndTimesBattle: () => void;
  onClose: () => void;
}

export const GardenModal: React.FC<GardenModalProps> = ({
  souls,
  player,
  onUpdatePlayer,
  onWaterPlant,
  onStartEndTimesBattle,
  onClose,
}) => {
  const [selectedSoul, setSelectedSoul] = useState<SoulPerson | null>(null);
  const [notePopup, setNotePopup] = useState<boolean>(false);

  const plantedCount = souls.filter((s) => s.seedPlanted || s.status === 'believed').length;
  const fullyGrownCount = souls.filter(
    (s) => (s.seedPlanted || s.status === 'believed') && s.plantGrowth >= 100
  ).length;

  const hasAtLeast7FullyGrown = fullyGrownCount >= 7;

  const currentSp = player?.sp || 0;
  const WATER_SP_COST = 10;

  const handlePlantClick = (soul: SoulPerson) => {
    setSelectedSoul(soul);
    setNotePopup(true);
    soundEngine.playScriptureBell();
  };

  const handleWater = (soul: SoulPerson) => {
    if (currentSp < WATER_SP_COST) {
      soundEngine.playErrorBuzz();
      return;
    }
    soundEngine.playOilPickup();
    onWaterPlant(soul.id);
  };

  const helpersCount = player?.activeHelpersCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080a0f]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0f141f] border-2 border-[#d4af37]/80 rounded-xl p-5 sm:p-7 shadow-2xl text-[#e2e2d5] max-h-[92vh] flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a35] mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border-2 border-[#d4af37] bg-[#1a2332] flex items-center justify-center text-2xl shadow-lg">
              🏡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans font-bold">
                  Pilgrim’s Home & Sanctuary Garden
                </span>
                {helpersCount > 0 && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-sans font-semibold">
                    {helpersCount} Consecrated Helper(s) Sowing
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-light text-white tracking-wide">
                The Garden of Faithful Sowing & Righteous Trees
              </h3>
              <p className="text-xs text-gray-400 font-serif italic">
                {plantedCount} Seeds Planted • {fullyGrownCount} Fully Grown (7 required for End of Times Revelation Battle)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1c25] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biblical Banner of Divine Increase */}
        <div className="bg-[#121c2c] border border-[#d4af37]/50 rounded-lg p-3 sm:p-4 mb-3 shadow-md">
          <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-[#d4af37] font-bold mb-1">
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            Sacred Garden Inscription (1 Corinthians 3:6-7)
          </div>
          <p className="text-xs sm:text-sm font-serif italic text-white leading-relaxed">
            “I planted the seed, Apollos watered it, but God has been making it grow. So neither the one who plants nor the one who waters is anything, but only God, who makes things grow.”
          </p>
        </div>

        {/* Garden Plots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 overflow-y-auto max-h-[44vh] pr-1 py-1">
          {souls.map((soul, idx) => {
            const isPlanted = soul.seedPlanted || soul.status === 'believed';
            const growth = soul.plantGrowth;
            const isFullyGrown = growth >= 100;
            const isRed = Boolean(soul.isHardToWin);

            return (
              <div
                key={soul.id}
                onClick={() => isPlanted && handlePlantClick(soul)}
                className={`relative p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-between ${
                  isPlanted
                    ? isRed
                      ? 'bg-[#221014] border-red-500/70 hover:border-red-400 cursor-pointer hover:scale-105 shadow-md'
                      : 'bg-[#151c29] border-[#d4af37]/60 hover:border-[#d4af37] cursor-pointer hover:scale-105 shadow-md'
                    : 'bg-[#0d1017]/80 border-[#222838] opacity-60'
                }`}
              >
                {/* Status Badge */}
                <div className="text-[8px] font-mono uppercase tracking-wider text-gray-400 mb-0.5 flex items-center justify-center gap-1">
                  <span>#{idx + 1}</span>
                  {isRed && <span className="text-red-400 font-bold">[RED]</span>}
                </div>

                {/* Plant Visual Graphic */}
                <div className="my-1.5 h-14 flex items-center justify-center">
                  {!isPlanted ? (
                    <div className="text-gray-600 flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-full border border-dashed border-gray-700 flex items-center justify-center text-sm">
                        🌱
                      </div>
                      <span className="text-[9px] font-serif italic">Unreached</span>
                    </div>
                  ) : isRed && isFullyGrown ? (
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="text-2xl">🌲</div>
                      <span className="text-[9px] font-sans font-bold text-red-300">Helper Tree</span>
                    </div>
                  ) : isFullyGrown ? (
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="text-2xl">🌟</div>
                      <span className="text-[9px] font-sans font-bold text-amber-300">Celestial Fruit</span>
                    </div>
                  ) : growth >= 50 ? (
                    <div className="flex flex-col items-center">
                      <div className="text-xl">🌿</div>
                      <span className="text-[9px] font-sans text-emerald-400">Vine</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-xl">🌱</div>
                      <span className="text-[9px] font-sans text-emerald-300">Seedling</span>
                    </div>
                  )}
                </div>

                {/* Soul & Plant Info */}
                <div className="w-full">
                  <div className="text-[11px] font-semibold text-white truncate">
                    {isPlanted ? soul.name.split(' ')[0] : 'Empty Plot'}
                  </div>
                  <div className="text-[8px] text-[#d4af37] font-serif truncate">
                    {isPlanted ? soul.plantName : 'Awaiting Gospel'}
                  </div>

                  {/* Growth Progress Bar */}
                  {isPlanted && (
                    <div className="w-full bg-[#0a0d14] h-1.5 rounded-full overflow-hidden border border-[#2a2a35] mt-1">
                      <div
                        className={`h-full transition-all duration-500 ${isRed ? 'bg-gradient-to-r from-red-600 to-amber-300' : 'bg-gradient-to-r from-emerald-500 to-amber-300'}`}
                        style={{ width: `${growth}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Plant Note Popover / Modal Detail */}
        {notePopup && selectedSoul && (
          <div className="bg-[#0b0e14] border-2 border-emerald-500/70 p-3.5 rounded-lg my-2 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2a35] mb-2">
              <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-emerald-300 font-bold">
                <Sprout className="w-4 h-4 text-emerald-400" />
                {selectedSoul.plantName} ({selectedSoul.name})
              </div>
              <button
                type="button"
                onClick={() => setNotePopup(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-serif italic text-amber-100 leading-relaxed">
              “Remember: Paul planted, Apollos watered, but God is the One who causes the growth! Trust in the Lord who nurtures this seed into eternal life.” (1 Corinthians 3:6-7)
            </p>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#2a2a35] mt-2">
              <div className="text-xs font-mono text-gray-400">
                Growth: <strong className="text-emerald-400">{selectedSoul.plantGrowth}%</strong>
              </div>

              {selectedSoul.plantGrowth < 100 ? (
                <button
                  type="button"
                  onClick={() => handleWater(selectedSoul)}
                  disabled={currentSp < WATER_SP_COST}
                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs uppercase tracking-wider font-sans font-bold flex items-center gap-1.5 shadow-md transition-all"
                  title={currentSp < WATER_SP_COST ? `Requires 10 SP Blue Energy (You have: ${currentSp} SP)` : 'Water with Prayer'}
                >
                  <Droplets className="w-3.5 h-3.5 text-blue-200" />
                  Water with Prayer (-10 SP Blue Energy • +35% Growth)
                </button>
              ) : (
                <span className="text-xs font-sans text-[#d4af37] font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                  {selectedSoul.isHardToWin ? 'Full-Grown Tree & Consecrated Helper!' : 'Fully Ripened Celestial Fruit!'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-[#2a2a35] flex items-center justify-between gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#2a2a35] text-xs font-sans text-gray-400 hover:text-white"
          >
            Leave Garden
          </button>

          {/* End of Times Battle Trigger */}
          {hasAtLeast7FullyGrown ? (
            <button
              type="button"
              id="btn-end-times-battle"
              onClick={onStartEndTimesBattle}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black text-xs sm:text-sm uppercase tracking-[0.2em] font-sans font-extrabold flex items-center gap-2 shadow-2xl animate-pulse hover:scale-105 transition-all"
            >
              <Sword className="w-5 h-5 text-black" />
              Begin End of Times Battle (Revelation 19)!
            </button>
          ) : (
            <div className="text-right text-[11px] text-gray-400 font-sans">
              Win and nurture at least 7 souls/plants to unlock the <strong className="text-[#d4af37]">End of Times Battle</strong> ({fullyGrownCount}/7 grown).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
