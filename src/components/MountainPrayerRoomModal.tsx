import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Heart,
  Volume2,
  BookOpen,
  CheckCircle2,
  X,
  Mountain,
  Sun,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PlayerState } from '../types';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';

interface MountainPrayerRoomModalProps {
  player: PlayerState;
  onConsecrate: (consecrationType: 'full_consecration' | 'intercession' | 'vigil_fasting') => void;
  onClose: () => void;
}

export const MountainPrayerRoomModal: React.FC<MountainPrayerRoomModalProps> = ({
  player,
  onConsecrate,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'consecrate' | 'scriptures' | 'intercession'>('consecrate');
  const [isConsecrating, setIsConsecrating] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleFullConsecration = () => {
    setIsConsecrating(true);
    soundEngine.playCleansingChime();
    soundEngine.playScriptureBell();

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#fef08a', '#60a5fa', '#34d399', '#ffffff'],
    });

    onConsecrate('full_consecration');
    setLastActionMessage('✨ Soul consecrated! Your lamp oil is replenished, burdens lifted, and your heart renewed.');

    // Spoken prayer proclamation at gentle volume
    soundEngine.speakScripture(
      'Romans 12:1. I beseech you therefore, brethren, by the mercies of God, that you present your bodies a living sacrifice, holy, acceptable to God, which is your reasonable service.',
      () => {
        setIsConsecrating(false);
      }
    );
  };

  const handleIntercessoryPrayer = () => {
    soundEngine.playScriptureBell();
    onConsecrate('intercession');
    setLastActionMessage('🕊️ Prayers of intercession offered for the weary souls across the valley.');
    soundEngine.speakScripture(
      'James 5:16. The effective, fervent prayer of a righteous man avails much.',
      () => {}
    );
  };

  const handleVigilFasting = () => {
    soundEngine.playCleansingChime();
    onConsecrate('vigil_fasting');
    setLastActionMessage('🛡️ Mountain vigil observed. Your spiritual defenses and stamina are fortified.');
  };

  const speakPrayer = (verseRef: string, text: string) => {
    setIsSpeaking(true);
    soundEngine.speakScripture(`${verseRef}. ${text}`, () => {
      setIsSpeaking(false);
    });
  };

  const PRAYER_SCRIPTURES = [
    {
      ref: 'Romans 12:1-2',
      title: 'A Living Sacrifice',
      text: '“Present your bodies a living sacrifice, holy, acceptable to God, which is your reasonable service. And do not be conformed to this world, but be transformed by the renewing of your mind.”',
      meaning: 'Consecration is laying everything upon the altar—mind, body, time, and heart—trusting God completely.',
    },
    {
      ref: 'Matthew 14:23 & Luke 6:12',
      title: 'The Solitary Mountain Vigil',
      text: '“And when He had sent the multitudes away, He went up on the mountain by Himself to pray. Now when evening came, He was alone there... and continued all night in prayer to God.”',
      meaning: 'Following the Master’s steps up the holy mountain to seek intimacy, power, and wisdom from the Father in stillness.',
    },
    {
      ref: 'Psalm 24:3-4',
      title: 'Who May Ascend the Mountain of the Lord?',
      text: '“Who may ascend into the hill of the Lord? Or who may stand in His holy place? He who has clean hands and a pure heart, who has not lifted up his soul to an idol, nor sworn deceitfully.”',
      meaning: 'Purity of heart and true repentance allow the pilgrim to behold the glory of the Lord with unclouded vision.',
    },
    {
      ref: 'Isaiah 40:31',
      title: 'Renewed Strength on the Heights',
      text: '“Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.”',
      meaning: 'Waiting in quiet prayer restores our spiritual stamina for the final leg of the pilgrimage.',
    },
  ];

  return (
    <div
      id="modal-mountain-prayer-room"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-[#11162b] via-[#0d1222] to-[#070a14] border-2 border-[#d4af37]/70 rounded-2xl shadow-[0_0_60px_rgba(212,175,55,0.3)] flex flex-col overflow-hidden text-gray-200">
        {/* Mountain Sanctuary Header */}
        <div className="px-5 py-4 border-b border-[#2a344d] bg-[#141b30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f59e0b] to-[#92400e] flex items-center justify-center text-xl shadow-[0_0_18px_rgba(212,175,55,0.6)]">
              <Mountain className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#d4af37] tracking-wide flex items-center gap-2">
                <span>Mount of Olives Prayer Sanctuary</span>
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a]">
                  Matthew 14:23
                </span>
              </h2>
              <p className="text-xs text-gray-300 font-sans">
                A solitary mountain refuge for deep prayer, fasting, and total holy consecration.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-prayer-room"
            onClick={() => {
              soundEngine.playLanternTrim();
              onClose();
            }}
            className="p-2 rounded-lg bg-[#1c243c] hover:bg-[#2c395c] border border-[#2e3b5e] text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#242d44] bg-[#0c101d] px-4 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('consecrate')}
            className={`px-4 py-2.5 text-xs font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'consecrate'
                ? 'border-[#d4af37] text-[#fef08a] bg-[#161d31]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Flame className="w-4 h-4 text-[#d4af37]" />
            <span>Altar of Consecration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scriptures')}
            className={`px-4 py-2.5 text-xs font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'scriptures'
                ? 'border-[#d4af37] text-[#fef08a] bg-[#161d31]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#38bdf8]" />
            <span>Mountain Scriptures ({PRAYER_SCRIPTURES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('intercession')}
            className={`px-4 py-2.5 text-xs font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'intercession'
                ? 'border-[#d4af37] text-[#fef08a] bg-[#161d31]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 text-[#ec4899]" />
            <span>Intercession & Vigil</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#090d18]">
          {/* Status Feedback Banner */}
          {lastActionMessage && (
            <div className="p-3 rounded-xl bg-[#142328] border border-emerald-500/50 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{lastActionMessage}</span>
            </div>
          )}

          {/* TAB 1: CONSECRATION ALTAR */}
          {activeTab === 'consecrate' && (
            <div className="space-y-5">
              {/* Mountain Altar Visual Display */}
              <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#18223d] to-[#0f1424] border border-[#d4af37]/40 shadow-xl flex flex-col sm:flex-row items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#78350f] via-[#b45309] to-[#d4af37] p-1 shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center">
                    <div className="w-full h-full rounded-xl bg-[#121626] flex flex-col items-center justify-center">
                      <Flame className="w-10 h-10 text-[#f59e0b] animate-pulse" />
                      <span className="text-[10px] font-mono text-[#fef08a] mt-1 font-bold">ALTAR</span>
                    </div>
                  </div>
                  {/* Glowing Incense Cloud */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#fde047]/30 blur-sm animate-ping" />
                </div>

                <div className="text-center sm:text-left space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/20 border border-[#d4af37]/40 font-bold">
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    <span>Sacred Mountain Sanctuary</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-extrabold text-white">
                    The Golden Altar of Total Consecration
                  </h3>
                  <p className="text-xs text-gray-300 font-serif leading-relaxed italic">
                    “Present yourselves to God as being alive from the dead, and your members as instruments of righteousness to God.” — Romans 6:13
                  </p>
                </div>
              </div>

              {/* Pilgrim Spiritual Status in Prayer Room */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#13182b] border border-[#242e47] text-center">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Lamp Oil</div>
                  <div className="text-base sm:text-lg font-bold text-[#f59e0b] font-mono">
                    {Math.round(player.oil)} / {player.maxOil}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#13182b] border border-[#242e47] text-center">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Spirit Points</div>
                  <div className="text-base sm:text-lg font-bold text-[#38bdf8] font-mono">
                    {player.sp} / {player.maxSp}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#13182b] border border-[#242e47] text-center">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Faith Score</div>
                  <div className="text-base sm:text-lg font-bold text-[#fef08a] font-mono">
                    {player.score}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#13182b] border border-[#242e47] text-center">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Affliction</div>
                  <div className="text-xs sm:text-sm font-bold font-mono">
                    {player.darkAffliction ? (
                      <span className="text-rose-400 capitalize">{player.darkAffliction}</span>
                    ) : (
                      <span className="text-emerald-400">Pure & Consecrated</span>
                    )}
                  </div>
                </div>
              </div>

              {/* PRIMARY CONSECRATION BUTTON */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  id="btn-mountain-consecrate"
                  onClick={handleFullConsecration}
                  disabled={isConsecrating}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-black font-extrabold text-sm sm:text-base font-sans tracking-wide uppercase shadow-[0_0_35px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-3 border-2 border-[#fff3b0]"
                >
                  <Flame className="w-5 h-5 text-black" />
                  <span>
                    {isConsecrating ? 'Consecrating Soul Before the Lord...' : 'Kneel & Consecrate Heart to the Lord'}
                  </span>
                  <Sparkles className="w-5 h-5 text-black" />
                </button>

                <p className="text-[11px] text-center text-gray-400 font-sans">
                  Consecration fully refills your consecrated oil vessel, restores maximum SP, cleanses dark afflictions, and earns +150 Faith points.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: MOUNTAIN SCRIPTURES */}
          {activeTab === 'scriptures' && (
            <div className="space-y-3">
              {PRAYER_SCRIPTURES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#11172a] border border-[#263353] space-y-2 hover:border-[#d4af37]/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#38bdf8]" />
                      <span className="text-xs font-mono font-bold text-[#fef08a]">{item.ref}</span>
                      <span className="text-xs text-gray-400 font-serif font-semibold">({item.title})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakPrayer(item.ref, item.text)}
                      className="p-1.5 rounded-lg bg-[#1c253d] hover:bg-[#283556] border border-[#34446e] text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Read Aloud</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 font-serif leading-relaxed italic border-l-2 border-[#d4af37] pl-3">
                    {item.text}
                  </p>

                  <p className="text-[11px] text-gray-400 font-sans pt-1 border-t border-[#1c243c]">
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: INTERCESSION & VIGIL */}
          {activeTab === 'intercession' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#13192d] border border-[#2b395e] space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                  <Heart className="w-4 h-4 text-[#ec4899]" />
                  <span>Intercessory Prayer for the 7 Lost Souls</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  From this mountain peak, look out across the wilderness where weary souls wander. Lift them up by name before the Throne of Grace.
                </p>
                <button
                  type="button"
                  onClick={handleIntercessoryPrayer}
                  className="w-full py-3 rounded-xl bg-[#1e2746] hover:bg-[#28355d] border border-[#ec4899]/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Heart className="w-4 h-4 text-[#ec4899]" />
                  <span>Offer Fervent Intercession for the Lost (+100 Faith Score & +15 Wisdom)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#13192d] border border-[#2b395e] space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                  <ShieldCheck className="w-4 h-4 text-[#34d399]" />
                  <span>Mountain Fasting & All-Night Vigil</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  Quiet your heart in prolonged solitude and contemplation. Holy fasting strengthens the spirit against demonic assaults.
                </p>
                <button
                  type="button"
                  onClick={handleVigilFasting}
                  className="w-full py-3 rounded-xl bg-[#1e2746] hover:bg-[#28355d] border border-[#34d399]/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#34d399]" />
                  <span>Observe Mountain Vigil (+30 Health & Spiritual Fortification)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#232c42] bg-[#0c101d] flex items-center justify-between text-xs text-gray-400">
          <span className="font-mono text-[11px] text-[#d4af37]">
            “The Lord is near to all who call upon Him in truth.” (Psalm 145:18)
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playLanternTrim();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#182035] hover:bg-[#253252] text-gray-200 border border-[#2e3d64] text-xs font-medium transition-colors"
          >
            Descend Mountain
          </button>
        </div>
      </div>
    </div>
  );
};
