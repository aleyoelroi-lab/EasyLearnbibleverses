import React, { useState } from 'react';
import { BrideCharacter } from '../types';
import { BRIDES_OF_LIGHT } from '../data/brides';
import { soundEngine } from '../audio/soundEngine';
import { Sparkles, Users, User, Flame, BookOpen } from 'lucide-react';

interface CharacterSelectProps {
  onSelectBrides: (p1Bride: BrideCharacter, p2Bride: BrideCharacter | null) => void;
  isCoopMode: boolean;
  setIsCoopMode: (val: boolean) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onSelectBrides,
  isCoopMode,
  setIsCoopMode,
}) => {
  const [p1SelectedId, setP1SelectedId] = useState<string>('sophia');
  const [p2SelectedId, setP2SelectedId] = useState<string>('pistis');
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);

  const selectedBride = BRIDES_OF_LIGHT.find(
    (b) => b.id === (activeSlot === 1 ? p1SelectedId : p2SelectedId)
  ) || BRIDES_OF_LIGHT[0];

  const handleSelectBride = (bride: BrideCharacter) => {
    soundEngine.playScriptureBell();
    if (activeSlot === 1) {
      setP1SelectedId(bride.id);
      if (isCoopMode && p2SelectedId === bride.id) {
        const other = BRIDES_OF_LIGHT.find((b) => b.id !== bride.id);
        if (other) setP2SelectedId(other.id);
      }
    } else {
      setP2SelectedId(bride.id);
    }
  };

  const handleConfirm = () => {
    soundEngine.playCelestialTrumpet();
    const p1 = BRIDES_OF_LIGHT.find((b) => b.id === p1SelectedId)!;
    const p2 = isCoopMode ? BRIDES_OF_LIGHT.find((b) => b.id === p2SelectedId)! : null;
    onSelectBrides(p1, p2);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-5 sm:p-8 bg-[#0c0d10]/95 backdrop-blur-md rounded-lg border border-[#2a2a35] shadow-2xl text-[#e2e2d5] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.06) 0%, transparent 65%)',
        }}
      />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="h-[1px] w-5 bg-[#d4af37]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]">
            Parable of the Ten Virgins • Matthew 25:1-13
          </span>
          <div className="h-[1px] w-5 bg-[#d4af37]" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
          Choose Your Bride of Light
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2 italic font-serif leading-relaxed">
          “The foolish took their lamps but took no oil with them, while the wise took flasks of oil along with their lamps.”
        </p>

        {/* Solo vs Co-Op Mode Toggle */}
        <div className="flex justify-center items-center gap-3 mt-5">
          <button
            id="btn-mode-solo"
            type="button"
            onClick={() => {
              setIsCoopMode(false);
              setActiveSlot(1);
            }}
            className={`flex items-center gap-2 px-5 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border ${
              !isCoopMode
                ? 'bg-[#d4af37] text-black border-[#d4af37] font-semibold'
                : 'bg-[#1a1c25] text-gray-400 border-[#2a2a35] hover:border-[#d4af37]/40'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Single Pilgrim
          </button>
          <button
            id="btn-mode-coop"
            type="button"
            onClick={() => {
              setIsCoopMode(true);
            }}
            className={`flex items-center gap-2 px-5 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border ${
              isCoopMode
                ? 'bg-[#d4af37] text-black border-[#d4af37] font-semibold'
                : 'bg-[#1a1c25] text-gray-400 border-[#2a2a35] hover:border-[#d4af37]/40'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2-Player Co-Op (Shared Screen)
          </button>
        </div>

        {/* Co-Op Slot Switcher */}
        {isCoopMode && (
          <div className="flex justify-center gap-4 mt-3">
            <button
              id="slot-p1"
              type="button"
              onClick={() => setActiveSlot(1)}
              className={`px-4 py-1.5 rounded text-[10px] uppercase tracking-[0.15em] font-sans flex items-center gap-2 border ${
                activeSlot === 1
                  ? 'bg-blue-900/60 text-white border-blue-400'
                  : 'bg-[#1a1c25] text-gray-400 border-[#2a2a35]'
              }`}
            >
              Player 1 (WASD):{' '}
              <span className="text-[#d4af37] font-bold">
                {BRIDES_OF_LIGHT.find((b) => b.id === p1SelectedId)?.name}
              </span>
            </button>
            <button
              id="slot-p2"
              type="button"
              onClick={() => setActiveSlot(2)}
              className={`px-4 py-1.5 rounded text-[10px] uppercase tracking-[0.15em] font-sans flex items-center gap-2 border ${
                activeSlot === 2
                  ? 'bg-pink-900/60 text-white border-pink-400'
                  : 'bg-[#1a1c25] text-gray-400 border-[#2a2a35]'
              }`}
            >
              Player 2 (IJKL / Arrows):{' '}
              <span className="text-[#d4af37] font-bold">
                {BRIDES_OF_LIGHT.find((b) => b.id === p2SelectedId)?.name}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of 10 Brides */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 relative z-10">
        {BRIDES_OF_LIGHT.map((bride) => {
          const isP1 = p1SelectedId === bride.id;
          const isP2 = isCoopMode && p2SelectedId === bride.id;
          const isCurrentlyActive = (activeSlot === 1 && isP1) || (activeSlot === 2 && isP2);

          return (
            <button
              key={bride.id}
              id={`select-bride-${bride.id}`}
              type="button"
              onClick={() => handleSelectBride(bride)}
              className={`relative p-3.5 rounded text-left border transition-all duration-200 group flex flex-col justify-between ${
                isCurrentlyActive
                  ? 'bg-[#1a1c25] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                  : 'bg-[#0f1117] border-[#2a2a35] hover:bg-[#161822] hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-[#d4af37]">{bride.symbol.split(' ')[0]}</span>
                <div className="flex gap-1 font-sans">
                  {isP1 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                      P1
                    </span>
                  )}
                  {isP2 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-600 text-white">
                      P2
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-light text-sm text-white group-hover:text-[#d4af37] transition-colors">
                  {bride.name}
                </h4>
                <p className="text-[10px] text-[#d4af37] uppercase tracking-wider font-sans mt-0.5">
                  {bride.title}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 italic font-serif">
                  {bride.temperament}
                </p>
              </div>

              {/* Gold swatch indicator */}
              <div
                className="w-full h-[2px] mt-2 rounded-full opacity-60"
                style={{ backgroundColor: bride.color }}
              />
            </button>
          );
        })}
      </div>

      {/* Selected Bride In-Depth Detail Card */}
      <div className="p-5 rounded border border-[#2a2a35] bg-[#0a0c10] grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Profile */}
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#2a2a35] pb-4 md:pb-0 md:pr-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] p-0.5 bg-[#1a1c25] flex items-center justify-center text-[#d4af37] text-lg font-bold">
                {selectedBride.symbol.split(' ')[0]}
              </div>
              <div>
                <h3 className="text-xl font-light text-white tracking-wide">{selectedBride.name}</h3>
                <span className="text-[11px] text-[#d4af37] uppercase tracking-[0.2em] font-sans block">
                  {selectedBride.title}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-300 italic font-serif leading-relaxed mt-2">
              “{selectedBride.description}”
            </p>
          </div>
          <div className="mt-3 p-2.5 rounded border border-[#d4af37]/20 bg-[#d4af37]/5 text-[11px] text-[#e2e2d5] font-serif">
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5 text-[#d4af37]" />
            {selectedBride.verseAnchor}
          </div>
        </div>

        {/* Stats & Perk */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] w-4 bg-[#d4af37]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans">
                Spiritual Perk & Vessel Attributes
              </span>
            </div>

            <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35] text-xs text-gray-300 mb-4 flex items-start gap-2.5 font-serif">
              <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>{selectedBride.spiritualPerk}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs font-sans">
              <div className="p-2.5 rounded bg-[#0f1117] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Oil Burn Rate</span>
                <span className="text-[#d4af37] font-mono font-bold text-sm">
                  {Math.round(selectedBride.baseOilDrainRate * 100)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0f1117] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Lantern Glow</span>
                <span className="text-white font-mono font-bold text-sm">
                  +{Math.round((selectedBride.lightRadiusBonus - 1) * 100)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0f1117] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Pilgrim Speed</span>
                <span className="text-white font-mono font-bold text-sm">
                  +{Math.round((selectedBride.speedBonus - 1) * 100)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0f1117] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Faith Gain</span>
                <span className="text-[#d4af37] font-mono font-bold text-sm">
                  +{Math.round((selectedBride.faithMultiplier - 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              id="btn-embark-journey"
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-8 py-3 border border-[#d4af37] text-[#d4af37] uppercase text-[10px] tracking-[0.3em] font-sans hover:bg-[#d4af37] hover:text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              <Flame className="w-4 h-4" />
              <span>Embark as Bride of Light</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
