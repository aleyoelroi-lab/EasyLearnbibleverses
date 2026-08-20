import React, { useState } from 'react';
import { PlayerState, WorldObject, SoulPerson } from '../types';
import { Compass, Skull, ShoppingBag, Users, Home, MapPin, Eye, EyeOff, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface MinimapProps {
  player1: PlayerState;
  player2: PlayerState | null;
  worldObjects: WorldObject[];
  souls: SoulPerson[];
  mapWidth: number;
  mapHeight: number;
  camX: number;
  camY: number;
  viewWidth: number;
  viewHeight: number;
}

export const Minimap: React.FC<MinimapProps> = ({
  player1,
  player2,
  worldObjects,
  souls,
  mapWidth,
  mapHeight,
  camX,
  camY,
  viewWidth,
  viewHeight,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'demons' | 'merchant' | 'souls'>('all');
  const [hoveredEntity, setHoveredEntity] = useState<{ name: string; type: string; dist: number } | null>(null);

  const MINI_WIDTH = isExpanded ? 210 : 160;
  const MINI_HEIGHT = Math.round(MINI_WIDTH * (mapHeight / mapWidth)); // ~163px or ~124px

  // Scale factor from world space to minimap space
  const scaleX = MINI_WIDTH / mapWidth;
  const scaleY = MINI_HEIGHT / mapHeight;

  // Active uncollected enemies
  const activeDemons = worldObjects.filter(
    (o) => !o.collected && (o.type === 'enemy_shadow' || o.type === 'dragon_boss')
  );

  // Active merchants
  const merchants = worldObjects.filter((o) => !o.collected && o.type === 'npc_merchant');

  // Souls believed
  const soulsBelievedCount = souls.filter((s) => s.status === 'believed').length;

  // Calculate distance from Player 1
  const getDistance = (x: number, y: number) => {
    return Math.round(Math.hypot(player1.x - x, player1.y - y));
  };

  // Find closest Oil Merchant
  const closestMerchant = merchants.length > 0
    ? merchants.reduce((prev, curr) => (getDistance(curr.x, curr.y) < getDistance(prev.x, prev.y) ? curr : prev), merchants[0])
    : null;

  return (
    <div className="absolute top-3 right-3 z-30 flex flex-col items-end pointer-events-auto select-none font-sans">
      {/* Minimap Card Container */}
      <div className="bg-[#0b0e14]/90 backdrop-blur-md border-2 border-[#d4af37]/70 rounded-lg p-2 shadow-[0_8px_25px_rgba(0,0,0,0.85)] flex flex-col gap-1.5 transition-all">
        {/* Header with Title and Toggle */}
        <div className="flex items-center justify-between gap-2 border-b border-[#2a2a35] pb-1">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#d4af37] animate-spin-slow" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4af37]">
              Sanctuary Radar
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 rounded text-gray-400 hover:text-white hover:bg-[#1a1c25] transition-colors"
              title={isExpanded ? 'Minimize Radar' : 'Expand Radar'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Filter Quick Pills */}
        {isExpanded && (
          <div className="flex items-center gap-1 text-[9px] font-sans pb-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[#151822] text-gray-400 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('demons')}
              className={`px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 transition-colors ${
                activeFilter === 'demons'
                  ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  : 'bg-[#151822] text-red-400 hover:text-red-300'
              }`}
              title="Show only spiritual demons"
            >
              <Skull className="w-2.5 h-2.5" />
              <span>Demons ({activeDemons.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('merchant')}
              className={`px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 transition-colors ${
                activeFilter === 'merchant'
                  ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'bg-[#151822] text-amber-400 hover:text-amber-300'
              }`}
              title="Show Oil Merchant"
            >
              <ShoppingBag className="w-2.5 h-2.5" />
              <span>Merchant</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('souls')}
              className={`px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 transition-colors ${
                activeFilter === 'souls'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#151822] text-emerald-400 hover:text-emerald-300'
              }`}
              title="Show 7 Souls"
            >
              <Users className="w-2.5 h-2.5" />
              <span>Souls</span>
            </button>
          </div>
        )}

        {/* SVG Radar Map Area */}
        <div
          className="relative rounded border border-[#2a2a35] overflow-hidden bg-[#0e1713]"
          style={{ width: MINI_WIDTH, height: MINI_HEIGHT }}
        >
          <svg
            width={MINI_WIDTH}
            height={MINI_HEIGHT}
            viewBox={`0 0 ${MINI_WIDTH} ${MINI_HEIGHT}`}
            className="w-full h-full block"
          >
            {/* 1. River on Minimap */}
            <path
              d={`M ${mapWidth * 0.44 * scaleX} 0 
                 C ${mapWidth * 0.46 * scaleX} ${450 * scaleY}, ${mapWidth * 0.36 * scaleX} ${850 * scaleY}, ${mapWidth * 0.49 * scaleX} ${MINI_HEIGHT}
                 L ${mapWidth * 0.53 * scaleX} ${MINI_HEIGHT}
                 C ${mapWidth * 0.42 * scaleX} ${850 * scaleY}, ${mapWidth * 0.50 * scaleX} ${450 * scaleY}, ${mapWidth * 0.47 * scaleX} 0 Z`}
              fill="#1e3a8a"
              opacity="0.75"
            />

            {/* Bridges on Minimap */}
            <rect x={740 * scaleX} y={280 * scaleY} width={180 * scaleX} height={50 * scaleY} fill="#78350f" opacity="0.8" />
            <rect x={700 * scaleX} y={760 * scaleY} width={180 * scaleX} height={50 * scaleY} fill="#78350f" opacity="0.8" />
            <rect x={780 * scaleX} y={1140 * scaleY} width={180 * scaleX} height={50 * scaleY} fill="#78350f" opacity="0.8" />

            {/* 2. Camera Viewport Box */}
            <rect
              x={Math.max(0, camX * scaleX)}
              y={Math.max(0, camY * scaleY)}
              width={Math.min(MINI_WIDTH, viewWidth * scaleX)}
              height={Math.min(MINI_HEIGHT, viewHeight * scaleY)}
              fill="rgba(212, 175, 55, 0.08)"
              stroke="#d4af37"
              strokeWidth="1"
              strokeDasharray="2,2"
            />

            {/* 3. Render World Entities */}
            {worldObjects.map((obj) => {
              if (obj.collected) return null;
              const ox = obj.x * scaleX;
              const oy = obj.y * scaleY;

              // Filter checks
              if (activeFilter === 'demons' && obj.type !== 'enemy_shadow' && obj.type !== 'dragon_boss') return null;
              if (activeFilter === 'merchant' && obj.type !== 'npc_merchant') return null;
              if (activeFilter === 'souls' && obj.type !== 'npc_soul_human') return null;

              // Merchant (Gold shopping marker with pulsating circle)
              if (obj.type === 'npc_merchant') {
                return (
                  <g
                    key={obj.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEntity({ name: 'Oil Merchant (Scrolls & Oil)', type: 'Merchant', dist: getDistance(obj.x, obj.y) })}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <circle cx={ox} cy={oy} r="6" fill="rgba(245, 158, 11, 0.4)" className="animate-ping" />
                    <circle cx={ox} cy={oy} r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                    <text x={ox} y={oy - 6} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold">
                      🛍️
                    </text>
                  </g>
                );
              }

              // Demons / Spiritual Enemies (Bright Red Pulsing Skulls/Dots)
              if (obj.type === 'enemy_shadow' || obj.type === 'dragon_boss') {
                const isRedEnemy = Boolean(obj.enemyData?.isStrongRed || obj.type === 'dragon_boss');
                return (
                  <g
                    key={obj.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEntity({ name: obj.name, type: isRedEnemy ? 'Strong Red Demon' : 'Demon', dist: getDistance(obj.x, obj.y) })}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <circle
                      cx={ox}
                      cy={oy}
                      r={isRedEnemy ? '5.5' : '4'}
                      fill={isRedEnemy ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.3)'}
                      className="animate-pulse"
                    />
                    <circle
                      cx={ox}
                      cy={oy}
                      r={isRedEnemy ? '3.5' : '2.5'}
                      fill={isRedEnemy ? '#ef4444' : '#f87171'}
                      stroke="#450a0a"
                      strokeWidth="1"
                    />
                    {isRedEnemy && (
                      <circle cx={ox} cy={oy} r="7" fill="none" stroke="#ef4444" strokeWidth="0.75" strokeDasharray="1,1" />
                    )}
                  </g>
                );
              }

              // Inquiring Souls (7 Souls)
              if (obj.type === 'npc_soul_human' && obj.soulData) {
                const s = obj.soulData;
                const isBelieved = s.status === 'believed';
                const isRedSoul = Boolean(s.isHardToWin);
                return (
                  <g
                    key={obj.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEntity({ name: s.name, type: isBelieved ? 'Believed Soul' : isRedSoul ? 'Skeptical Red Soul' : 'Seeking Soul', dist: getDistance(obj.x, obj.y) })}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <circle
                      cx={ox}
                      cy={oy}
                      r="3"
                      fill={isBelieved ? '#10b981' : isRedSoul ? '#ef4444' : '#60a5fa'}
                      stroke="#0f172a"
                      strokeWidth="0.75"
                    />
                    {isBelieved && (
                      <circle cx={ox} cy={oy} r="5" fill="none" stroke="#34d399" strokeWidth="0.5" />
                    )}
                  </g>
                );
              }

              // Pilgrim's Home & Garden
              if (obj.type === 'home_cottage' || obj.type === 'home_garden') {
                return (
                  <g
                    key={obj.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEntity({ name: obj.name, type: 'Home & Garden', dist: getDistance(obj.x, obj.y) })}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <rect x={ox - 3} y={oy - 3} width="6" height="6" fill="#10b981" rx="1" stroke="#064e3b" strokeWidth="0.75" />
                  </g>
                );
              }

              // Altars & Elder Simeon
              if (obj.type === 'scripture_altar' || obj.type === 'npc_elder') {
                return (
                  <g
                    key={obj.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEntity({ name: obj.name, type: 'Scripture Altar', dist: getDistance(obj.x, obj.y) })}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <circle cx={ox} cy={oy} r="2.5" fill="#a855f7" stroke="#3b0764" strokeWidth="0.75" />
                  </g>
                );
              }

              return null;
            })}

            {/* 4. Player 2 (if Co-op) */}
            {player2 && (
              <g>
                <circle cx={player2.x * scaleX} cy={player2.y * scaleY} r="4" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
              </g>
            )}

            {/* 5. Player 1 (You) - Bright Golden Star / Beacon */}
            <g>
              <circle
                cx={player1.x * scaleX}
                cy={player1.y * scaleY}
                r="7"
                fill="rgba(254, 240, 138, 0.4)"
                className="animate-ping"
              />
              <circle
                cx={player1.x * scaleX}
                cy={player1.y * scaleY}
                r="4"
                fill="#d4af37"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
              {/* Direction pointer */}
              {player1.direction === 'up' && (
                <line x1={player1.x * scaleX} y1={player1.y * scaleY} x2={player1.x * scaleX} y2={player1.y * scaleY - 6} stroke="#ffffff" strokeWidth="1.5" />
              )}
              {player1.direction === 'down' && (
                <line x1={player1.x * scaleX} y1={player1.y * scaleY} x2={player1.x * scaleX} y2={player1.y * scaleY + 6} stroke="#ffffff" strokeWidth="1.5" />
              )}
              {player1.direction === 'left' && (
                <line x1={player1.x * scaleX} y1={player1.y * scaleY} x2={player1.x * scaleX - 6} y2={player1.y * scaleY} stroke="#ffffff" strokeWidth="1.5" />
              )}
              {player1.direction === 'right' && (
                <line x1={player1.x * scaleX} y1={player1.y * scaleY} x2={player1.x * scaleX + 6} y2={player1.y * scaleY} stroke="#ffffff" strokeWidth="1.5" />
              )}
            </g>
          </svg>

          {/* Hovered Entity Tooltip */}
          {hoveredEntity && (
            <div className="absolute bottom-1 left-1 right-1 bg-[#0b0e14]/95 border border-[#d4af37]/60 rounded px-1.5 py-0.5 text-[9px] flex items-center justify-between text-white font-sans pointer-events-none shadow">
              <span className="truncate max-w-[130px] font-semibold text-[#d4af37]">{hoveredEntity.name}</span>
              <span className="text-gray-400 font-mono text-[8px]">{hoveredEntity.dist}px</span>
            </div>
          )}
        </div>

        {/* Legend / Status Strip */}
        <div className="flex flex-col gap-1 text-[9px] font-sans pt-0.5">
          <div className="flex items-center justify-between text-gray-300">
            {/* Demons tracker */}
            <div className="flex items-center gap-1 text-red-400 font-semibold">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Demons: {activeDemons.length}</span>
            </div>

            {/* Merchant guide */}
            {closestMerchant && (
              <div className="flex items-center gap-1 text-amber-300 font-medium">
                <span>🏺 Merchant:</span>
                <span className="font-mono text-[8.5px] text-amber-200">{getDistance(closestMerchant.x, closestMerchant.y)}px</span>
              </div>
            )}
          </div>

          {/* Souls believed tracker */}
          <div className="flex items-center justify-between text-[8.5px] text-gray-400 border-t border-[#2a2a35]/60 pt-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Souls: {soulsBelievedCount}/7
            </span>
            <span className="text-yellow-400 font-mono">
              Pos: ({Math.round(player1.x)}, {Math.round(player1.y)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
