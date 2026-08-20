import React, { useState } from 'react';
import { PlayerState, InventoryItem, ScriptureReadAloud } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { Sparkles, Heart, Zap, Droplet, Shield, BookOpen, Flame, X } from 'lucide-react';

interface InventoryModalProps {
  player: PlayerState;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ player, onUpdatePlayer, onClose }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'scriptures' | 'stats'>('items');
  const [useFeedback, setUseFeedback] = useState<string | null>(null);

  const handleUseItem = (item: InventoryItem) => {
    if (item.count <= 0) return;
    if (item.type === 'currency' || item.type === 'key') return;

    soundEngine.playScriptureBell();

    onUpdatePlayer((prev) => {
      const updatedInv = prev.inventory.map((i) =>
        i.id === item.id ? { ...i, count: i.count - 1 } : i
      );

      let nextHealth = prev.health;
      let nextOil = prev.oil;
      let nextSp = prev.sp;

      if (item.type === 'oil') {
        nextOil = Math.min(prev.maxOil, prev.oil + item.effectValue);
        setUseFeedback(`Restored +${item.effectValue}% Lantern Oil!`);
      } else if (item.type === 'heal') {
        nextHealth = Math.min(prev.maxHealth, prev.health + item.effectValue);
        setUseFeedback(`Restored +${item.effectValue} Health (HP)!`);
      } else if (item.type === 'sp') {
        nextSp = Math.min(prev.maxSp, prev.sp + item.effectValue);
        setUseFeedback(`Restored +${item.effectValue} Spirit Points (SP)!`);
      }

      return {
        ...prev,
        health: nextHealth,
        oil: nextOil,
        sp: nextSp,
        inventory: updatedInv,
      };
    });

    setTimeout(() => setUseFeedback(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f1117] border border-[#2a2a35] rounded-lg p-5 sm:p-7 shadow-2xl text-[#e2e2d5] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a35]/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] p-0.5 bg-[#1a1c25] flex items-center justify-center text-[#d4af37]">
              {player.bride.symbol.split(' ')[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-3 bg-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-sans">
                  Pilgrim Vessel & Satchel
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-light text-white tracking-wide">
                {player.bride.name} • Level {player.level}
              </h3>
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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 font-sans text-[10px] uppercase tracking-[0.15em] border-b border-[#2a2a35]/60 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`px-4 py-1.5 rounded transition-all ${
              activeTab === 'items'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'bg-[#1a1c25] text-gray-400 hover:text-white'
            }`}
          >
            Inventory Vessels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scriptures')}
            className={`px-4 py-1.5 rounded transition-all ${
              activeTab === 'scriptures'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'bg-[#1a1c25] text-gray-400 hover:text-white'
            }`}
          >
            Scripture Read Aloud
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 rounded transition-all ${
              activeTab === 'stats'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'bg-[#1a1c25] text-gray-400 hover:text-white'
            }`}
          >
            Attributes & Stats
          </button>
        </div>

        {/* Feedback Banner */}
        {useFeedback && (
          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-sans mb-3 text-center animate-in fade-in">
            {useFeedback}
          </div>
        )}

        {/* Tab 1: Inventory Items */}
        {activeTab === 'items' && (
          <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
            {player.inventory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded border border-[#2a2a35] bg-[#0a0c10] flex items-center justify-between transition-colors hover:border-gray-600"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-light text-white">{item.name}</h4>
                    <span className="font-mono text-xs text-[#d4af37] font-bold">x{item.count}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-serif italic mt-0.5">{item.description}</p>
                </div>

                {item.type !== 'currency' && item.type !== 'key' ? (
                  <button
                    type="button"
                    disabled={item.count <= 0}
                    onClick={() => handleUseItem(item)}
                    className="px-4 py-1.5 rounded border border-[#d4af37] text-[#d4af37] text-[10px] uppercase tracking-[0.15em] font-sans hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold shrink-0"
                  >
                    Use
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-500 font-sans uppercase tracking-wider px-2 py-1 bg-[#161822] rounded border border-[#2a2a35]">
                    Treasure
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Scripture Read Aloud */}
        {activeTab === 'scriptures' && (
          <div className="overflow-y-auto flex-1 pr-1 space-y-3">
            {(player.scriptures || []).map((scripture) => (
              <div
                key={scripture.id}
                className="p-3.5 rounded border border-[#2a2a35] bg-[#0a0c10] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#d4af37]" />
                    <h4 className="text-sm font-light text-white">{scripture.name}</h4>
                  </div>
                  <span className="font-mono text-xs text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">
                    {scripture.spCost} SP
                  </span>
                </div>
                <p className="text-[11px] text-[#d4af37] font-serif italic">{scripture.verseText}</p>
                <p className="text-xs text-gray-400 font-serif">{scripture.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Attributes & Stats */}
        {activeTab === 'stats' && (
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-sans text-xs">
              <div className="p-3 rounded bg-[#0a0c10] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Health (HP)</span>
                <span className="font-mono font-bold text-sm text-rose-400">
                  {player.health} / {player.maxHealth}
                </span>
              </div>
              <div className="p-3 rounded bg-[#0a0c10] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Spirit (SP)</span>
                <span className="font-mono font-bold text-sm text-blue-400">
                  {player.sp} / {player.maxSp}
                </span>
              </div>
              <div className="p-3 rounded bg-[#0a0c10] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Holy Attack</span>
                <span className="font-mono font-bold text-sm text-yellow-300">
                  {player.attack}
                </span>
              </div>
              <div className="p-3 rounded bg-[#0a0c10] border border-[#2a2a35]">
                <span className="text-gray-500 text-[9px] uppercase tracking-wider block">Wisdom</span>
                <span className="font-mono font-bold text-sm text-purple-300">
                  {player.wisdom}
                </span>
              </div>
            </div>

            {/* Spiritual Perk Box */}
            <div className="p-4 rounded border border-[#2a2a35] bg-[#0a0c10] space-y-1">
              <div className="flex items-center gap-2 text-[#d4af37] text-[10px] uppercase tracking-[0.2em] font-sans">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spiritual Temperament & Perk</span>
              </div>
              <p className="text-xs text-gray-300 font-serif leading-relaxed">
                {player.bride.spiritualPerk}
              </p>
              <p className="text-[11px] text-gray-500 font-serif italic pt-1">
                {player.bride.verseAnchor}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#2a2a35]/60 flex justify-end mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-[#2a2a35] text-gray-300 uppercase text-[10px] tracking-[0.2em] font-sans hover:bg-[#1a1c25] hover:text-white transition-all"
          >
            Close Satchel
          </button>
        </div>
      </div>
    </div>
  );
};
