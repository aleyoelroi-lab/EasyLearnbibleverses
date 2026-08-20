import React, { useState } from 'react';
import { StageNarrative } from '../data/scriptures';
import { soundEngine } from '../audio/soundEngine';
import { BookOpen, Sparkles, CheckCircle2, Flame, ShieldAlert, X, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScriptureModalProps {
  stageNarrative: StageNarrative;
  onCompleteStage: (bonusFaith: number) => void;
  onClose: () => void;
}

export const ScriptureModal: React.FC<ScriptureModalProps> = ({
  stageNarrative,
  onCompleteStage,
  onClose,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const handlePlayVoice = () => {
    setIsPlayingAudio(true);
    soundEngine.speakScriptureLivelyVoice(stageNarrative.themeVerseText, stageNarrative.themeVerseRef);
    setTimeout(() => setIsPlayingAudio(false), 4500);
  };

  const handleSelectOption = (opt: any) => {
    setSelectedOptionId(opt.id);
    if (opt.isCorrect) {
      soundEngine.playScriptureBell();
      setFeedback({
        isCorrect: true,
        message: opt.consequenceGood,
      });
    } else {
      soundEngine.playDamage();
      setFeedback({
        isCorrect: false,
        message: opt.consequenceBad,
      });
    }
  };

  const handleProceed = () => {
    if (feedback?.isCorrect) {
      soundEngine.playCelestialTrumpet();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#fbf7ea', '#aa8520', '#ffffff'],
      });
      onCompleteStage(stageNarrative.rewardFaith);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0f1117] border border-[#2a2a35] rounded-lg p-6 sm:p-8 shadow-2xl text-[#e2e2d5] overflow-y-auto max-h-[90vh]">
        {/* Stage Badge & Title */}
        <div className="flex items-center justify-between border-b border-[#2a2a35]/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-3 bg-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-sans">
                  The Scripture • Stage {stageNarrative.stageNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                {stageNarrative.title}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-sans">Reward</span>
            <span className="text-xs font-mono text-[#d4af37] font-bold">
              +{stageNarrative.rewardFaith} FP
            </span>
          </div>
        </div>

        {/* Theme Scripture Callout Box */}
        <div className="p-5 rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 mb-5 space-y-2 relative group">
          <div className="flex items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Holy Proclamation
            </span>
            <button
              type="button"
              onClick={handlePlayVoice}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-sans uppercase tracking-wider transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#d4af37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-[#1a1c26] text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black'
              }`}
              title="Listen to scripture proclaimed in a lively voice"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAudio ? 'Proclaiming...' : 'Listen Aloud'}</span>
            </button>
          </div>
          <p className="italic text-base sm:text-lg leading-relaxed text-[#c2c2b5] font-serif">
            “{stageNarrative.themeVerseText}”
          </p>
          <p className="text-[11px] text-[#d4af37] font-sans tracking-wider text-right font-medium">
            — {stageNarrative.themeVerseRef}
          </p>
        </div>

        {/* Spiritual Revelation of the Oil */}
        <div className="p-4 rounded border border-[#2a2a35] bg-[#0a0c10] mb-5 text-xs text-gray-300 space-y-1.5 font-serif">
          <div className="flex items-center gap-2 text-[#d4af37] text-[10px] uppercase tracking-[0.25em] font-sans">
            <Flame className="w-3.5 h-3.5" />
            <span>The Revelation of the Oil</span>
          </div>
          <p className="leading-relaxed">{stageNarrative.oilSymbolismTeaching}</p>
        </div>

        {/* Quest & Interactive Moral Discernment Challenge */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-sans">
              {stageNarrative.questTitle}
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 font-serif italic">{stageNarrative.questDescription}</p>

          <div className="p-4 rounded border border-[#2a2a35] bg-[#08090d]">
            <h4 className="text-sm sm:text-base font-light text-white mb-4 tracking-tight">
              “{stageNarrative.interactiveChallenge.question}”
            </h4>

            <div className="space-y-3">
              {stageNarrative.interactiveChallenge.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-3.5 rounded border text-xs sm:text-sm font-serif transition-all ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/40 border-rose-500 text-rose-100'
                        : 'bg-[#0f1117] border-[#2a2a35] text-gray-300 hover:border-[#d4af37]/60 hover:bg-[#161822]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded text-xs font-serif mb-5 flex items-start gap-3 border ${
              feedback.isCorrect
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-sans text-[10px] uppercase tracking-wider block font-bold">
                {feedback.isCorrect ? 'Spiritual Discernment Confirmed' : 'Spiritual Warning'}
              </span>
              <p className="mt-0.5 leading-relaxed">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2a2a35]/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#2a2a35] text-gray-400 uppercase text-[10px] tracking-[0.2em] hover:bg-[#1a1c25] hover:text-white transition-all font-sans"
          >
            Return
          </button>
          <button
            id="btn-proceed-stage"
            type="button"
            disabled={!feedback?.isCorrect}
            onClick={handleProceed}
            className={`px-8 py-2.5 border text-[10px] uppercase tracking-[0.3em] font-sans transition-all flex items-center gap-2 ${
              feedback?.isCorrect
                ? 'border-[#d4af37] bg-[#d4af37] text-black font-semibold hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer'
                : 'border-[#2a2a35] text-gray-600 cursor-not-allowed bg-[#1a1c25]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advance in Faith</span>
          </button>
        </div>
      </div>
    </div>
  );
};
