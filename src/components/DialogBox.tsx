import React, { useState, useEffect } from 'react';
import { DialogueNode } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { BookOpen, Sparkles, ArrowRight, X } from 'lucide-react';

interface DialogBoxProps {
  dialogue: DialogueNode;
  onClose: () => void;
  onOptionSelect?: (optionIndex: number) => void;
}

export const DialogBox: React.FC<DialogBoxProps> = ({ dialogue, onClose, onOptionSelect }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const fullText = dialogue.text;

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    soundEngine.playFootstep();
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="p-4 sm:p-5 rounded-lg border border-[#2a2a35] bg-[#0c0d10]/95 backdrop-blur-md shadow-2xl text-[#e2e2d5] relative overflow-hidden">
        {/* Subtle Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Top Header: Speaker Info */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2a2a35]/60 mb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            {dialogue.portraitSymbol && (
              <div className="w-8 h-8 rounded-full border border-[#d4af37] bg-[#1a1c25] flex items-center justify-center text-sm shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                {dialogue.portraitSymbol}
              </div>
            )}
            <div>
              <h4 className="text-sm font-light text-white tracking-wide">{dialogue.speaker}</h4>
              {dialogue.title && (
                <span className="text-[10px] text-[#d4af37] uppercase tracking-wider font-sans block">
                  {dialogue.title}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dialogue.scriptureRef && (
              <div className="flex items-center gap-1 text-[11px] text-[#d4af37] font-serif italic bg-[#d4af37]/10 px-2.5 py-0.5 rounded border border-[#d4af37]/30">
                <BookOpen className="w-3 h-3 text-[#d4af37]" />
                <span>{dialogue.scriptureRef}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1a1c25]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dialogue Text Body */}
        <div className="min-h-[52px] mb-3 text-xs sm:text-sm font-serif leading-relaxed text-gray-200 relative z-10">
          <p>“{displayedText}”</p>
        </div>

        {/* Options / Action Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#2a2a35]/40 relative z-10">
          {dialogue.options && dialogue.options.length > 0 ? (
            dialogue.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (opt.action) opt.action();
                  if (onOptionSelect) onOptionSelect(idx);
                }}
                className="px-4 py-1.5 rounded border border-[#d4af37] text-[#d4af37] text-[10px] uppercase tracking-[0.2em] font-sans hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1.5 font-semibold"
              >
                <span>{opt.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 border border-[#2a2a35] text-gray-300 text-[10px] uppercase tracking-[0.2em] font-sans hover:bg-[#1a1c25] hover:text-white transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
