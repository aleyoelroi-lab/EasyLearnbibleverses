import React, { useState, useEffect } from 'react';
import { SoulPerson, PlayerState } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { BookOpen, Sparkles, CheckCircle2, HelpCircle, X, Volume2, Shield, Users } from 'lucide-react';

interface GospelShareModalProps {
  soul: SoulPerson;
  player: PlayerState;
  onUpdatePlayer?: (updater: (prev: PlayerState) => PlayerState) => void;
  onSoulBelieved: (soulId: string) => void;
  onClose: () => void;
}

export const GospelShareModal: React.FC<GospelShareModalProps> = ({
  soul,
  player,
  onUpdatePlayer,
  onSoulBelieved,
  onClose,
}) => {
  const [step, setStep] = useState<'initial' | 'shared_basic' | 'questioning' | 'used_scroll' | 'believed'>(
    soul.status === 'believed' ? 'believed' : 'initial'
  );

  const isRed = Boolean(soul.isHardToWin);
  const scrollCost = isRed
    ? 5
    : (soul.id === 'soul_chloe' || soul.id === 'soul_lydia' || soul.id === 'soul_martha' || soul.id === 'soul_stephen' ? 1 : 2);

  const scrollItem = player?.inventory?.find((i) => i.id === 'scroll_truth');
  const scrollCount = scrollItem?.count || 0;

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShareBasicGospel = () => {
    soundEngine.playGospelShare();
    // Speak verse in lively, warm voice
    soundEngine.speakScriptureLivelyVoice(soul.initialScripture, soul.initialScriptureRef);

    setStep('shared_basic');
    setTimeout(() => {
      // Red souls always question deeply and require 5 Scrolls of Truth; easy souls may believe directly
      if (soul.id === 'soul_chloe') {
        handleBeliefSuccess();
      } else {
        setStep('questioning');
      }
    }, 1800);
  };

  const handleUseScrollOfTruth = () => {
    if (scrollCount < scrollCost) {
      return;
    }

    soundEngine.playGospelShare();
    // Speak deeper explanation verse in lively, radiant voice
    soundEngine.speakScriptureLivelyVoice(soul.deeperScriptureText, soul.deeperScriptureRef);

    // Consume scrolls of truth (5 for red souls, 1-2 for white souls)
    if (onUpdatePlayer) {
      onUpdatePlayer((prev) => ({
        ...prev,
        inventory: (prev.inventory || []).map((item) =>
          item.id === 'scroll_truth' ? { ...item, count: Math.max(0, item.count - scrollCost) } : item
        ),
        sp: Math.min(prev.maxSp, prev.sp + 15),
      }));
    }

    setStep('used_scroll');
    setTimeout(() => {
      handleBeliefSuccess();
    }, 2400);
  };

  const handleBeliefSuccess = () => {
    soundEngine.playSoulSaved();
    setStep('believed');
    onSoulBelieved(soul.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c12]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl bg-[#0f1118] border rounded-xl p-5 sm:p-7 shadow-2xl text-[#e2e2d5] max-h-[92vh] flex flex-col justify-between ${soul.isHardToWin ? 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-[#d4af37]/70'}`}>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a35] mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl shadow-lg"
              style={{
                backgroundColor: soul.robeColor,
                borderColor: soul.isHardToWin ? '#ef4444' : '#d4af37',
              }}
            >
              {soul.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-[0.25em] font-sans font-bold ${soul.isHardToWin ? 'text-rose-400' : 'text-[#d4af37]'}`}>
                  {soul.isHardToWin ? 'Deep Inquirer [RED SOUL]' : 'Sharing the Gospel of Grace'}
                </span>
                {soul.isHardToWin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 font-sans font-bold uppercase">
                    Instantly Grows Tree Helper
                  </span>
                )}
              </div>
              <h3 className="text-lg font-medium text-white tracking-wide">{soul.name}</h3>
              <p className="text-xs text-gray-400 font-serif italic">{soul.title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1c25] rounded transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 my-2 overflow-y-auto max-h-[55vh] pr-1">
          {/* 1. Initial Encounter Question */}
          <div className={`p-4 rounded-lg border ${soul.isHardToWin ? 'bg-[#1a1012] border-red-900/60' : 'bg-[#141824] border-[#2a2a35]'}`}>
            <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-amber-300 font-semibold mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {soul.name} asks you:
            </div>
            <p className="text-sm font-serif italic text-gray-200 leading-relaxed">
              {soul.initialQuestion}
            </p>
          </div>

          {/* 2. Step: Shared Basic Gospel Scripture */}
          {(step === 'shared_basic' || step === 'questioning' || step === 'used_scroll' || step === 'believed') && (
            <div className="bg-[#0e121c] border border-blue-500/40 p-4 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between text-[11px] font-sans text-blue-300 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  Gospel Proclamation (Elder Voice)
                </span>
                <span className="font-mono text-[#d4af37]">{soul.initialScriptureRef}</span>
              </div>
              <p className="text-xs sm:text-sm font-serif text-white leading-relaxed italic">
                {soul.initialScripture}
              </p>
            </div>
          )}

          {/* 3. Step: Questioning / Wanting more explanation */}
          {(step === 'questioning' || step === 'used_scroll') && (
            <div className="bg-amber-950/30 border border-amber-500/50 p-4 rounded-lg space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                Seeking Further Revelation
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-amber-100/90 leading-relaxed">
                {soul.doubtExplanation}
              </p>
              <div className="text-[11px] text-gray-300 pt-1 flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  {isRed ? (
                    <strong className="text-red-400">Opening revelation for this Red Soul requires 5 Scrolls of Truth.</strong>
                  ) : (
                    <strong className="text-blue-300">Opening revelation for this White Soul requires {scrollCost} Scroll{scrollCost > 1 ? 's' : ''} of Truth.</strong>
                  )}
                  {' '}(You currently possess: <span className="font-bold text-white font-mono">{scrollCount}</span>)
                </span>
              </div>
            </div>
          )}

          {/* 4. Step: Deep Explanation via Scroll of Truth */}
          {(step === 'used_scroll' || (step === 'believed' && soul.id !== 'soul_chloe')) && (
            <div className="bg-emerald-950/40 border border-emerald-500/60 p-4 rounded-lg space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between text-[11px] font-sans text-emerald-300 uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Scroll of Truth Unrolled ({soul.deeperScriptureRef})
                </span>
              </div>
              <p className="text-xs sm:text-sm font-serif text-emerald-100 italic leading-relaxed">
                {soul.deeperScriptureText}
              </p>
              <p className="text-xs text-emerald-200 font-sans leading-relaxed pt-1">
                {soul.deeperExplanation}
              </p>
            </div>
          )}

          {/* 5. Step: Soul Believed & Seed Planted in Home Garden */}
          {step === 'believed' && (
            <div className={`p-4 rounded-lg space-y-2 text-center animate-in zoom-in-95 duration-400 shadow-xl border-2 ${soul.isHardToWin ? 'bg-[#201014] border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'bg-[#142618] border-emerald-400'}`}>
              <div className={`flex items-center justify-center gap-2 text-sm font-bold font-sans uppercase tracking-widest ${soul.isHardToWin ? 'text-red-300' : 'text-emerald-300'}`}>
                <CheckCircle2 className="w-5 h-5" />
                Soul Received Christ as Lord!
              </div>
              <p className="text-xs sm:text-sm text-gray-200 font-serif italic">
                “Praise be to God! My heart is full of peace. I believe that Jesus is the Son of God who gave His life for me!”
              </p>

              <div className="p-2 rounded bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-sans font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>REWARD: +1 LEVEL UP & +5 KINGDOM TALENTS!</span>
              </div>

              {soul.isHardToWin ? (
                <div className="pt-2 border-t border-red-500/40 text-xs text-amber-300 font-sans space-y-1">
                  <div className="flex items-center justify-center gap-2 text-red-200 font-bold">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    <span>INSTANT TREE GROWTH & CONSECRATED HELPER UNLOCKED!</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    The seed sprouted <strong>instantly into a full-grown Tree of Righteousness</strong> in your Garden, and {soul.name} is now your <strong>Consecrated Earthly Helper</strong> (assisting with prayers and battle power without wings)!
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-emerald-500/30 text-xs text-[#d4af37] font-sans flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>A <strong>{soul.plantName}</strong> seed has been planted in your <strong>Sanctuary Garden</strong>!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#2a2a35] flex items-center justify-between gap-3 mt-2">
          {step === 'initial' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-[#2a2a35] text-xs font-sans text-gray-400 hover:text-white"
              >
                Depart for Now
              </button>
              <button
                type="button"
                onClick={handleShareBasicGospel}
                className="px-5 py-2.5 rounded bg-[#d4af37] hover:bg-[#e6c258] text-black text-xs uppercase tracking-widest font-sans font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Proclaim the Gospel
              </button>
            </>
          )}

          {step === 'questioning' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-[#2a2a35] text-xs font-sans text-gray-400 hover:text-white"
              >
                I Will Return with More Wisdom
              </button>
              <button
                type="button"
                onClick={handleUseScrollOfTruth}
                disabled={scrollCount < scrollCost}
                className={`px-5 py-2.5 rounded text-white text-xs uppercase tracking-widest font-sans font-bold flex items-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all ${isRed ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                title={scrollCount < scrollCost ? `Need ${scrollCost} Scroll(s) of Truth (you have ${scrollCount})` : `Unroll ${scrollCost} Scroll(s) of Truth`}
              >
                <Sparkles className="w-4 h-4 text-white" />
                {isRed ? `Unroll 5 Scrolls of Truth (${scrollCount}/5)` : `Unroll ${scrollCost} Scroll${scrollCost > 1 ? 's' : ''} (${scrollCount}/${scrollCost})`}
              </button>
            </>
          )}

          {step === 'believed' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded bg-[#d4af37] text-black text-xs uppercase tracking-widest font-sans font-bold hover:bg-[#e6c258] transition-all"
            >
              Glory to God • Return to Sanctuary
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
