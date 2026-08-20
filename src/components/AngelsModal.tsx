import React, { useState } from 'react';
import {
  Shield,
  Volume2,
  Sparkles,
  Flame,
  CheckCircle2,
  BookOpen,
  X,
  Zap,
} from 'lucide-react';
import { CELESTIAL_ANGELS, CelestialAngel } from '../data/angelsData';
import { soundEngine } from '../audio/soundEngine';

interface AngelsModalProps {
  onClose: () => void;
  onApplyBlessing: (angel: CelestialAngel) => void;
  claimedBlessingIds: string[];
}

export const AngelsModal: React.FC<AngelsModalProps> = ({
  onClose,
  onApplyBlessing,
  claimedBlessingIds,
}) => {
  const [selectedAngel, setSelectedAngel] = useState<CelestialAngel>(CELESTIAL_ANGELS[0]);
  const [speakingAngelId, setSpeakingAngelId] = useState<string | null>(null);

  const handleSpeakAngel = (angel: CelestialAngel) => {
    setSpeakingAngelId(angel.id);
    soundEngine.speakAngelProclamation(
      `${angel.proclamation} ${angel.verseRef}: ${angel.verseText}`,
      () => {
        setSpeakingAngelId(null);
      }
    );
  };

  const handleClaim = (angel: CelestialAngel) => {
    soundEngine.playCelestialTrumpet();
    soundEngine.playCleansingChime();
    onApplyBlessing(angel);
    handleSpeakAngel(angel);
  };

  return (
    <div
      id="modal-angels-sanctuary"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#0e121e] to-[#07090f] border-2 border-[#d4af37]/60 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col overflow-hidden text-gray-200">
        {/* Top Celestial Header */}
        <div className="px-5 py-4 border-b border-[#2a2a35] bg-[#121624] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#886915] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(212,175,55,0.5)]">
              👼
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#d4af37] tracking-wide flex items-center gap-2">
                <span>The Host of Heavenly Angels</span>
                <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f6e05e]">
                  Hebrews 1:14
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Ministering spirits sent forth to minister for those who will inherit salvation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playLanternTrim();
              onClose();
            }}
            className="p-2 rounded-lg bg-[#1a1f2f] hover:bg-[#283046] border border-[#2a2a35] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Left Angel Selection Grid | Right Angel Spotlight & Blessing */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto">
          {/* Left Column: List of 5 Celestial Angels */}
          <div className="md:col-span-5 border-r border-[#2a2a35]/80 p-3 sm:p-4 space-y-2.5 bg-[#0a0d15]">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Celestial Hierarchy</span>
              <span className="text-[#d4af37]">{CELESTIAL_ANGELS.length} Archangels</span>
            </div>

            {CELESTIAL_ANGELS.map((angel) => {
              const isSelected = selectedAngel.id === angel.id;
              const isClaimed = claimedBlessingIds.includes(angel.id);

              return (
                <button
                  type="button"
                  key={angel.id}
                  onClick={() => {
                    soundEngine.playScriptureBell();
                    setSelectedAngel(angel);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#182033] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      : 'bg-[#101422] border-[#222838] hover:border-[#384259] hover:bg-[#141a2c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner border border-white/10"
                      style={{ backgroundColor: `${angel.color}25` }}
                    >
                      {angel.symbol}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                        {angel.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans">
                        {angel.order}
                      </div>
                    </div>
                  </div>

                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      Blessed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/10 border border-[#d4af37]/30">
                      Available
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Angel Details, Visual Art & Holy Blessing Action */}
          <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-[#101424] to-[#0a0d16] space-y-4">
            <div className="space-y-4">
              {/* Angel Hero Banner Visual */}
              <div
                className="relative p-5 rounded-2xl border-2 overflow-hidden flex flex-col sm:flex-row items-center gap-4 shadow-xl"
                style={{
                  borderColor: `${selectedAngel.color}80`,
                  background: `linear-gradient(135deg, ${selectedAngel.color}15 0%, #0c0f1d 80%)`,
                }}
              >
                {/* Visual Avatar with multi-layer angel wings and golden halo aura */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl border-2 animate-pulse"
                    style={{
                      borderColor: selectedAngel.color,
                      backgroundColor: `${selectedAngel.color}30`,
                      boxShadow: `0 0 25px ${selectedAngel.color}50`,
                    }}
                  >
                    {selectedAngel.symbol}
                  </div>
                  {/* Floating Halo */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full border-2 border-[#fff3b0] shadow-[0_0_10px_#fff3b0]"
                    style={{ backgroundColor: `${selectedAngel.color}40` }}
                  />
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold text-[#d4af37] bg-[#d4af37]/20 border border-[#d4af37]/40">
                    {selectedAngel.order}
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-extrabold text-white">
                    {selectedAngel.name}
                  </h3>
                  <p className="text-xs text-gray-300 italic font-serif">
                    {selectedAngel.title}
                  </p>
                </div>
              </div>

              {/* Spoken Proclamation & Speech synthesis button */}
              <div className="p-3.5 rounded-xl bg-[#14192a] border border-[#2a344d] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#d4af37] font-semibold">
                  <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    Celestial Proclamation
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSpeakAngel(selectedAngel)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c243c] hover:bg-[#2a365a] border border-[#3d4d73] text-[11px] text-white font-medium transition-all"
                  >
                    <Volume2
                      className={`w-3.5 h-3.5 ${
                        speakingAngelId === selectedAngel.id ? 'animate-bounce text-[#d4af37]' : ''
                      }`}
                    />
                    <span>{speakingAngelId === selectedAngel.id ? 'Speaking...' : 'Hear Proclamation'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-amber-100 font-serif leading-relaxed italic border-l-2 border-[#d4af37] pl-3">
                  {selectedAngel.proclamation}
                </p>
              </div>

              {/* Biblical Scripture Reference Card */}
              <div className="p-3.5 rounded-xl bg-[#0d111d] border border-[#20273a] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-[#38bdf8] font-mono font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{selectedAngel.verseRef}</span>
                </div>
                <p className="text-xs text-gray-300 font-serif leading-relaxed">
                  {selectedAngel.verseText}
                </p>
                <p className="text-[11px] text-gray-400 font-sans pt-1 border-t border-[#1c2336]">
                  {selectedAngel.scriptureTeaching}
                </p>
              </div>

              {/* Angelic Blessing Perk Details */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#182035] to-[#121626] border border-[#3b476b] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{selectedAngel.blessingName}</span>
                    </div>
                    <div className="text-[11px] text-gray-300 font-sans">
                      {selectedAngel.blessingDesc}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action: Receive Blessing Button */}
            <div className="pt-2">
              {claimedBlessingIds.includes(selectedAngel.id) ? (
                <div className="w-full py-3 rounded-xl bg-[#13201d] border border-emerald-500/40 text-emerald-300 text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Angelic Blessing Active for Current Pilgrimage</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleClaim(selectedAngel)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-black text-xs sm:text-sm font-bold font-sans tracking-wide uppercase shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 border border-[#fff3b0]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Consecrate & Receive {selectedAngel.blessingName}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
