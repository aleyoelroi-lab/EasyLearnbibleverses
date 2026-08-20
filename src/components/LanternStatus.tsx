import React from 'react';
import { PlayerState, WeatherType } from '../types';
import { Flame, Droplet, Heart, Sun, CloudRain, CloudLightning, Sparkles, Trophy, ShoppingBag, BookOpen, Zap } from 'lucide-react';

interface LanternStatusProps {
  player1: PlayerState;
  player2: PlayerState | null;
  weather: WeatherType;
  stageTitle: string;
  soulsBelievedCount: number;
  lifeTimeRemainingSeconds: number;
  onOpenGarden: () => void;
  onTrimLanternP1: () => void;
  onTrimLanternP2?: () => void;
  onOpenLeaderboard: () => void;
  onOpenInventory: () => void;
  onOpenHelp: () => void;
}

export const LanternStatus: React.FC<LanternStatusProps> = ({
  player1,
  player2,
  weather,
  stageTitle,
  soulsBelievedCount,
  lifeTimeRemainingSeconds,
  onOpenGarden,
  onTrimLanternP1,
  onTrimLanternP2,
  onOpenLeaderboard,
  onOpenInventory,
  onOpenHelp,
}) => {
  const getWeatherBadge = () => {
    switch (weather) {
      case 'peaceful_day':
        return { label: 'Peaceful Day', icon: Sun, color: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30' };
      case 'evening_rain':
        return { label: 'Evening Rain', icon: CloudRain, color: 'text-blue-300 bg-blue-950/40 border-blue-500/30' };
      case 'midnight_storm':
        return { label: 'Midnight Storm', icon: CloudLightning, color: 'text-purple-300 bg-purple-950/40 border-purple-500/30' };
      case 'celestial_dawn':
        return { label: 'Celestial Dawn', icon: Sparkles, color: 'text-yellow-200 bg-yellow-950/40 border-yellow-400/40' };
    }
  };

  const weatherInfo = getWeatherBadge();
  const WeatherIcon = weatherInfo.icon;

  const talentsCount = player1.inventory?.find((i) => i.id === 'kingdom_talents')?.count || player1.talentsCollected || 0;

  return (
    <div className="w-full bg-[#0f1117]/95 backdrop-blur-md border border-[#2a2a35]/60 rounded-lg p-3 sm:p-4 text-[#e2e2d5] shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Stage Title & Weather */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] p-0.5 bg-[#1a1c25] overflow-hidden flex items-center justify-center shrink-0">
              <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-tighter">
                {player1.bride.symbol.split(' ')[0] || '★'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="h-[1px] w-3 bg-[#d4af37]" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#d4af37]">
                  Active RPG Pilgrimage
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-light tracking-wide text-white">
                {stageTitle}
              </h3>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded border text-[10px] uppercase tracking-[0.15em] font-sans flex items-center gap-1.5 ${weatherInfo.color}`}>
            <WeatherIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{weatherInfo.label}</span>
          </div>
        </div>

        {/* Center: Oil of Vigilance Meter, HP, SP, Level */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          {/* Player 1 Stats */}
          <div className="flex items-center gap-3 bg-[#0a0c10]/90 px-3.5 py-2 rounded border border-[#2a2a35]">
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.15em] text-gray-400 block font-sans">
                  {player1.bride.name}
                </span>
                <span className="text-[9px] bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.2 rounded border border-[#d4af37]/40 font-mono">
                  Lv.{player1.level}
                </span>
              </div>
              <span className="text-[10px] text-[#d4af37] font-serif italic block">
                {player1.bride.title}
              </span>
            </div>

            {/* Oil Bar */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#2a2a35]">
              <Droplet className="w-3.5 h-3.5 text-[#d4af37]" />
              <div className="w-20 sm:w-28 bg-[#1a1c25] h-3 rounded-full overflow-hidden border border-[#2a2a35] relative">
                <div
                  className="h-full bg-gradient-to-r from-[#8b6b00] to-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all duration-300"
                  style={{ width: `${(player1.oil / player1.maxOil) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[#d4af37] font-bold min-w-[30px]">
                {Math.round(player1.oil)}%
              </span>
            </div>

            {/* HP */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#2a2a35]">
              <Heart className="w-3 h-3 text-rose-400" />
              <div className="w-12 bg-[#1a1c25] h-2 rounded-full overflow-hidden border border-[#2a2a35]">
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${(player1.health / player1.maxHealth) * 100}%` }}
                />
              </div>
            </div>

            {/* SP */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#2a2a35]">
              <Zap className="w-3 h-3 text-blue-400" />
              <div className="w-12 bg-[#1a1c25] h-2 rounded-full overflow-hidden border border-[#2a2a35]">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(player1.sp / player1.maxSp) * 100}%` }}
                />
              </div>
            </div>

            {/* Trim Flame Button */}
            <button
              type="button"
              id="btn-trim-p1"
              onClick={onTrimLanternP1}
              className="px-2 py-1 rounded border border-[#d4af37] text-[#d4af37] uppercase text-[9px] tracking-[0.15em] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1 ml-1"
              title="Trim lantern flame (Spacebar)"
            >
              <Flame className="w-3 h-3" />
              <span>Trim</span>
            </button>
          </div>
        </div>

        {/* Right: Talents, Satchel & Leaderboard */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {/* Garden of Faith Button */}
          <button
            type="button"
            id="btn-nav-garden"
            onClick={onOpenGarden}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#13221a] hover:bg-[#1a2f23] border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 transition-all text-xs font-sans font-semibold tracking-wider shadow-sm"
            title="Open Sanctuary Garden (1 Cor 3:6)"
          >
            <span>🌱</span>
            <span>Garden ({soulsBelievedCount}/7)</span>
          </button>

          {/* 1-Hour Lifespan Clock */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1a1c25] border border-amber-500/40 text-[11px] font-mono text-amber-300"
            title="Mortal Pilgrimage Lifespan (1 Hour Maximum before Old Age Rest)"
          >
            <span>⏳</span>
            <span>
              {Math.floor(lifeTimeRemainingSeconds / 60)}:
              {String(lifeTimeRemainingSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          {/* Talents */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1c25] border border-[#2a2a35] text-xs font-mono text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{talentsCount} Talents</span>
          </div>

          {/* Satchel / Inventory */}
          <button
            type="button"
            id="btn-nav-inventory"
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1c25] hover:bg-[#252836] border border-[#d4af37]/60 text-white hover:text-[#d4af37] transition-colors text-xs font-sans uppercase tracking-wider"
            title="Open Satchel & Spells"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Satchel</span>
          </button>

          {/* Lore / Scripture */}
          <button
            type="button"
            id="btn-nav-lore"
            onClick={onOpenHelp}
            className="p-2 rounded bg-[#1a1c25] hover:bg-[#252836] border border-[#2a2a35] text-gray-300 hover:text-white transition-colors"
            title="Scripture Lore & Guidance"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Hall of Faith */}
          <button
            type="button"
            id="btn-nav-leaderboard"
            onClick={onOpenLeaderboard}
            className="p-2 rounded bg-[#1a1c25] hover:bg-[#252836] border border-[#2a2a35] hover:border-[#d4af37]/50 text-[#d4af37] transition-colors"
            title="Hall of Faith"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
