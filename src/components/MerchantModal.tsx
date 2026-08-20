import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Droplet, Heart, BookOpen, Sparkles, X } from 'lucide-react';

interface MerchantModalProps {
  player: PlayerState;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
  onClose: () => void;
}

export const MerchantModal: React.FC<MerchantModalProps> = ({ player, onUpdatePlayer, onClose }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const talentsCount = player.inventory.find((i) => i.id === 'kingdom_talents')?.count || 0;

  // Escape key listener to close shop smoothly
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

  const handleBuyItem = (itemId: string, cost: number, name: string) => {
    if (talentsCount < cost) {
      setFeedback('Not enough Kingdom Talents to purchase this!');
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    soundEngine.playTalentPickup();

    onUpdatePlayer((prev) => {
      const updatedInv = prev.inventory.map((item) => {
        if (item.id === 'kingdom_talents') {
          return { ...item, count: item.count - cost };
        }
        if (item.id === itemId) {
          return { ...item, count: item.count + 1 };
        }
        return item;
      });

      return {
        ...prev,
        inventory: updatedInv,
      };
    });

    setFeedback(`Purchased 1 ${name}!`);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0f1117] border border-[#2a2a35] rounded-lg p-6 sm:p-7 shadow-2xl text-[#e2e2d5] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a35]/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] p-0.5 bg-[#1a1c25] flex items-center justify-center text-lg shadow-[0_0_12px_rgba(212,175,55,0.4)]">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-3 bg-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans font-bold">
                  Temple of the Lord • Matthew 25:9
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-light text-white tracking-wide">
                Sanctuary Holy Oil & Sacred Supplies
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1c25] rounded transition-colors"
            title="Leave Temple of the Lord (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Temple Scripture Quote */}
        <div className="p-3.5 rounded border border-[#d4af37]/20 bg-[#d4af37]/5 mb-4 text-xs font-serif italic text-[#c2c2b5] leading-relaxed">
          “‘Let them make Me a sanctuary, that I may dwell among them.’ — Exodus 25:8 • Obtain consecrated oil and scrolls of truth for your lamp.”
        </div>

        {/* Player Currency Balance */}
        <div className="flex items-center justify-between p-2.5 rounded bg-[#0a0c10] border border-[#2a2a35] mb-4 font-sans text-xs">
          <span className="text-gray-400 uppercase text-[10px] tracking-wider">Your Kingdom Talents:</span>
          <span className="font-mono text-sm text-[#d4af37] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {talentsCount} Talents
          </span>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-sans mb-3 text-center animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Merchant Items Grid */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {/* Item 1: Alabaster Oil Flask */}
          <div className="p-3 rounded border border-[#2a2a35] bg-[#0a0c10] flex items-center justify-between transition-colors hover:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-950/40 border border-amber-500/30 text-[#d4af37]">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-light text-white">Alabaster Oil Flask</h4>
                <p className="text-[10px] text-gray-400 font-serif italic">Restores +40% Lantern Oil capacity</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleBuyItem('alabaster_oil_flask', 3, 'Alabaster Oil Flask')}
              className="px-4 py-1.5 rounded border border-[#d4af37] bg-[#1a1c25] hover:bg-[#d4af37] hover:text-black text-[#d4af37] text-[10px] uppercase tracking-wider font-sans font-semibold transition-all flex items-center gap-1"
            >
              <span>3 Talents</span>
            </button>
          </div>

          {/* Item 2: Heavenly Manna */}
          <div className="p-3 rounded border border-[#2a2a35] bg-[#0a0c10] flex items-center justify-between transition-colors hover:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-light text-white">Heavenly Manna</h4>
                <p className="text-[10px] text-gray-400 font-serif italic">Restores +45 Health Points (HP)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleBuyItem('heavenly_manna', 4, 'Heavenly Manna')}
              className="px-4 py-1.5 rounded border border-[#d4af37] bg-[#1a1c25] hover:bg-[#d4af37] hover:text-black text-[#d4af37] text-[10px] uppercase tracking-wider font-sans font-semibold transition-all flex items-center gap-1"
            >
              <span>4 Talents</span>
            </button>
          </div>

          {/* Item 3: Scroll of Truth */}
          <div className="p-3 rounded border border-[#2a2a35] bg-[#0a0c10] flex items-center justify-between transition-colors hover:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-950/40 border border-blue-500/30 text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-light text-white">Scroll of Truth</h4>
                <p className="text-[10px] text-gray-400 font-serif italic">Restores +30 Spirit Points (SP)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleBuyItem('scroll_truth', 5, 'Scroll of Truth')}
              className="px-4 py-1.5 rounded border border-[#d4af37] bg-[#1a1c25] hover:bg-[#d4af37] hover:text-black text-[#d4af37] text-[10px] uppercase tracking-wider font-sans font-semibold transition-all flex items-center gap-1"
            >
              <span>5 Talents</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2a2a35]/60 flex justify-end mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-[#2a2a35] text-gray-300 uppercase text-[10px] tracking-[0.2em] font-sans hover:bg-[#1a1c25] hover:text-white transition-all rounded"
          >
            Leave Temple of the Lord
          </button>
        </div>
      </div>
    </div>
  );
};
