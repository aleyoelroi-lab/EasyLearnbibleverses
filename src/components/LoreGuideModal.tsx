import React from 'react';
import { BookOpen, Flame, Compass, X } from 'lucide-react';
import { BRIDES_OF_LIGHT } from '../data/brides';

interface LoreGuideModalProps {
  onClose: () => void;
}

export const LoreGuideModal: React.FC<LoreGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0f1117] border border-[#2a2a35] rounded-lg p-6 sm:p-8 shadow-2xl text-[#e2e2d5] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-3 bg-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-sans">
                  The Sanctuary Lore
                </span>
              </div>
              <h2 className="text-xl font-light text-white tracking-tight">
                The Living Word & Parables
              </h2>
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

        {/* Content Tabs / Scroll */}
        <div className="overflow-y-auto flex-1 pr-2 space-y-5 text-xs text-gray-300 leading-relaxed font-serif">
          {/* Section: Parable of the Ten Virgins */}
          <div className="p-5 rounded border border-[#2a2a35] bg-[#0a0c10] space-y-2">
            <h3 className="text-xs uppercase tracking-[0.25em] text-[#d4af37] flex items-center gap-2 font-sans">
              <Flame className="w-3.5 h-3.5" />
              The Parable of the Ten Virgins (Matthew 25:1-13)
            </h3>
            <p className="italic text-sm text-[#c2c2b5]">
              “The kingdom of heaven will be like ten virgins who took their lamps and went to meet the bridegroom. Five of them were foolish, and five were wise. For when the foolish took their lamps, they took no oil with them, but the wise took flasks of oil with their lamps.”
            </p>
            <div className="border-t border-[#2a2a35] pt-2 mt-2">
              <p className="text-[11px] text-[#d4af37]">
                <strong>Spiritual Truth:</strong> The Oil symbolizes the inner communion with the Holy Spirit and enduring faith. It cannot be borrowed at midnight—each soul must cultivate oil in secret before the Master returns.
              </p>
            </div>
          </div>

          {/* Section: The 10 Brides */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-[1px] w-3 bg-[#d4af37]" />
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans">
                The Ten Brides of Light
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BRIDES_OF_LIGHT.map((b) => (
                <div key={b.id} className="p-3 rounded bg-[#0a0c10] border border-[#2a2a35]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{b.symbol.split(' ')[0]}</span>
                    <span className="font-light text-white text-xs">{b.name}</span>
                    <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-sans ml-auto">
                      {b.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 italic">{b.spiritualPerk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Controls & Co-Op */}
          <div className="p-4 rounded border border-[#2a2a35] bg-[#0a0c10] space-y-3 font-sans">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-white flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              Controls & Interaction Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35]">
                <span className="text-[#d4af37] text-[10px] uppercase tracking-wider block mb-1">Player 1 (Solo / Co-Op)</span>
                <ul className="space-y-1 text-gray-400 text-[11px]">
                  <li>• <strong>Move:</strong> W, A, S, D or Arrow Keys</li>
                  <li>• <strong>Trim Flame:</strong> Spacebar</li>
                  <li>• <strong>Interact:</strong> Walk up to Altars & Relics</li>
                </ul>
              </div>
              <div className="p-3 rounded bg-[#0f1117] border border-[#2a2a35]">
                <span className="text-pink-400 text-[10px] uppercase tracking-wider block mb-1">Player 2 (Shared Screen)</span>
                <ul className="space-y-1 text-gray-400 text-[11px]">
                  <li>• <strong>Move:</strong> I, J, K, L Keys</li>
                  <li>• <strong>Trim Flame:</strong> Enter Key</li>
                  <li>• <strong>Mobile:</strong> Touch D-Pad toggle in top header</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2a2a35]/60 flex justify-end mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-[#d4af37] text-[#d4af37] uppercase text-[10px] tracking-[0.25em] font-sans hover:bg-[#d4af37] hover:text-black transition-all"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
