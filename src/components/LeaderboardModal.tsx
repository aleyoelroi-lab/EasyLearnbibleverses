import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, X } from 'lucide-react';

interface LeaderboardModalProps {
  currentScore?: number;
  currentBride?: string;
  stageName?: string;
  onClose: () => void;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    playerName: 'Faithful Watchman',
    brideName: 'Sophia',
    faithScore: 4850,
    stageReached: 'The Word Made Flesh',
    oilConserved: 92,
    timeSurvivedSeconds: 380,
    date: '2026-08-15',
    mode: 'Single',
  },
  {
    id: 'lb-2',
    playerName: 'Pilgrim of Hope',
    brideName: 'Pistis',
    faithScore: 4320,
    stageReached: 'The Word Made Flesh',
    oilConserved: 88,
    timeSurvivedSeconds: 410,
    date: '2026-08-16',
    mode: 'Single',
  },
  {
    id: 'lb-3',
    playerName: 'Two Lamps Alight',
    brideName: 'Irene & Agathe',
    faithScore: 3950,
    stageReached: 'Midnight Cry & King',
    oilConserved: 84,
    timeSurvivedSeconds: 320,
    date: '2026-08-17',
    mode: 'Co-Op',
  },
  {
    id: 'lb-4',
    playerName: 'LampBearer',
    brideName: 'Chara',
    faithScore: 2800,
    stageReached: 'Parable of Kingdom',
    oilConserved: 76,
    timeSurvivedSeconds: 240,
    date: '2026-08-18',
    mode: 'Single',
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentScore,
  currentBride,
  stageName,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('brides_of_light_leaderboard');
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        setEntries(DEFAULT_LEADERBOARD);
        localStorage.setItem('brides_of_light_leaderboard', JSON.stringify(DEFAULT_LEADERBOARD));
      }
    } catch (e) {
      setEntries(DEFAULT_LEADERBOARD);
    }
  }, []);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !currentScore || !currentBride) return;

    const newEntry: LeaderboardEntry = {
      id: `lb-${Date.now()}`,
      playerName: newPlayerName.trim(),
      brideName: currentBride,
      faithScore: currentScore,
      stageReached: stageName || 'Sanctuary Pilgrimage',
      oilConserved: 85,
      timeSurvivedSeconds: 180,
      date: new Date().toISOString().split('T')[0],
      mode: 'Single',
    };

    const updated = [...entries, newEntry].sort((a, b) => b.faithScore - a.faithScore);
    setEntries(updated);
    try {
      localStorage.setItem('brides_of_light_leaderboard', JSON.stringify(updated));
    } catch (e) {}
    setHasSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f1117] border border-[#2a2a35] rounded-lg p-6 sm:p-8 shadow-2xl text-[#e2e2d5] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2a2a35]/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-3 bg-[#d4af37]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-sans">
                  The Record of the Wise
                </span>
              </div>
              <h2 className="text-xl font-light text-white tracking-tight">
                Hall of Vigilance & Faith
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

        {/* Current Score Submission Form */}
        {currentScore !== undefined && currentScore > 0 && !hasSubmitted && (
          <form
            onSubmit={handleSaveScore}
            className="p-4 rounded border border-[#d4af37]/20 bg-[#d4af37]/5 mb-4 flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="text-xs text-gray-300 flex-1 font-serif">
              <span className="text-[10px] text-[#d4af37] uppercase tracking-wider block font-sans">Record Your Pilgrimage</span>
              <span>
                {currentBride} • {currentScore.toLocaleString()} Faith Points
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                maxLength={20}
                placeholder="Pilgrim Name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="px-3 py-1.5 rounded bg-[#0a0c10] border border-[#2a2a35] text-xs text-white focus:outline-none focus:border-[#d4af37] w-full sm:w-44 font-sans"
              />
              <button
                type="submit"
                className="px-4 py-1.5 border border-[#d4af37] bg-[#d4af37] text-black text-[10px] uppercase tracking-widest font-sans font-semibold shrink-0 hover:brightness-110"
              >
                Record
              </button>
            </div>
          </form>
        )}

        {/* Leaderboard Table */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
          {entries.map((entry, index) => {
            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded border flex items-center justify-between text-xs transition-colors ${
                  index === 0
                    ? 'bg-[#1a1c25] border-[#d4af37]/60 text-[#e2e2d5]'
                    : 'bg-[#0a0c10] border-[#2a2a35] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-serif text-xs ${
                      index === 0
                        ? 'border border-[#d4af37] text-[#d4af37]'
                        : 'border border-[#2a2a35] text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-light text-sm text-white">{entry.playerName}</h4>
                    <span className="text-[10px] text-[#d4af37] uppercase tracking-wider font-sans">
                      {entry.brideName} • {entry.stageReached}
                    </span>
                  </div>
                </div>

                <div className="text-right font-sans">
                  <span className="font-mono text-sm text-[#d4af37] font-bold block">
                    {entry.faithScore.toLocaleString()} FP
                  </span>
                  <span className="text-[9px] text-gray-500">{entry.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2a2a35]/60 flex justify-end mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-[#2a2a35] text-gray-400 uppercase text-[10px] tracking-[0.2em] hover:bg-[#1a1c25] hover:text-white transition-all font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
