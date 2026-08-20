import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  MessageCircle,
  Sprout,
  Briefcase,
  Compass,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface VirtualControlsProps {
  onMoveDir?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onTrimLantern: () => void;
  onInteract: () => void;
  onOpenGarden?: () => void;
  onOpenInventory?: () => void;
  onDirHoldChange?: (dirs: { up: boolean; down: boolean; left: boolean; right: boolean }) => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveDir,
  onTrimLantern,
  onInteract,
  onOpenGarden,
  onOpenInventory,
  onDirHoldChange,
}) => {
  const [activeDirs, setActiveDirs] = useState<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const intervalRef = useRef<number | null>(null);
  const activeDirsRef = useRef(activeDirs);
  activeDirsRef.current = activeDirs;

  const dpadRef = useRef<HTMLDivElement | null>(null);

  // Dispatch continuous movement while any direction is held
  useEffect(() => {
    const hasActive =
      activeDirs.up || activeDirs.down || activeDirs.left || activeDirs.right;

    if (onDirHoldChange) {
      onDirHoldChange(activeDirs);
    }

    if (hasActive) {
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          const current = activeDirsRef.current;
          if (onMoveDir) {
            if (current.up) onMoveDir('up');
            if (current.down) onMoveDir('down');
            if (current.left) onMoveDir('left');
            if (current.right) onMoveDir('right');
          }
        }, 110);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeDirs, onMoveDir, onDirHoldChange]);

  const handleDirStart = (dir: 'up' | 'down' | 'left' | 'right') => {
    soundEngine.playFootstep();
    if (onMoveDir) onMoveDir(dir);
    setActiveDirs((prev) => ({ ...prev, [dir]: true }));
  };

  const handleDirEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
    setActiveDirs((prev) => ({ ...prev, [dir]: false }));
  };

  const handleTouchMoveOnDpad = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dpadRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const rect = dpadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < 15) {
      // Near center deadzone
      setActiveDirs({ up: false, down: false, left: false, right: false });
      return;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180

    const newUp = angle >= -135 && angle <= -45;
    const newDown = angle >= 45 && angle <= 135;
    const newRight = angle >= -45 && angle <= 45;
    const newLeft = angle >= 135 || angle <= -135;

    setActiveDirs({
      up: newUp,
      down: newDown,
      left: newLeft,
      right: newRight,
    });
  };

  const handleTouchEndDpad = () => {
    setActiveDirs({ up: false, down: false, left: false, right: false });
  };

  return (
    <div
      id="mobile-gamepad-controller"
      className="w-full max-w-4xl mx-auto mt-2 bg-[#090b10]/95 backdrop-blur-md border border-[#2a2a35] rounded-xl p-3 sm:p-4 shadow-2xl select-none touch-none flex flex-col gap-3 transition-all"
      style={{ touchAction: 'none' }}
    >
      {/* Gamepad Header Label */}
      <div className="flex items-center justify-between px-1 pb-1 border-b border-[#2a2a35]/60 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-sans">
        <div className="flex items-center gap-1.5 text-[#d4af37]">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span className="font-bold">Sanctuary Mobile Gamepad</span>
        </div>
        <div className="text-gray-500 text-[9px]">Touch & Hold D-Pad to Walk Smoothly</div>
      </div>

      {/* Main Controller Layout: Left D-Pad | Center Info | Right Action Diamond */}
      <div className="flex items-center justify-between gap-2 sm:gap-6">
        {/* --- LEFT: ERGONOMIC 8-WAY / 4-WAY TOUCH D-PAD --- */}
        <div className="flex flex-col items-center gap-1">
          <div
            ref={dpadRef}
            onTouchMove={handleTouchMoveOnDpad}
            onTouchEnd={handleTouchEndDpad}
            onTouchCancel={handleTouchEndDpad}
            className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#10131c] border-2 border-[#2a2a35] p-1.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center"
          >
            {/* UP Button */}
            <button
              type="button"
              id="pad-btn-up"
              onPointerDown={(e) => {
                e.preventDefault();
                handleDirStart('up');
              }}
              onPointerUp={() => handleDirEnd('up')}
              onPointerLeave={() => handleDirEnd('up')}
              className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-t-lg flex items-center justify-center border transition-all ${
                activeDirs.up
                  ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.7)] scale-95'
                  : 'bg-[#181c28] text-gray-300 border-[#2a2a35] hover:border-[#d4af37]/60 active:bg-[#d4af37] active:text-black'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>

            {/* LEFT Button */}
            <button
              type="button"
              id="pad-btn-left"
              onPointerDown={(e) => {
                e.preventDefault();
                handleDirStart('left');
              }}
              onPointerUp={() => handleDirEnd('left')}
              onPointerLeave={() => handleDirEnd('left')}
              className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-l-lg flex items-center justify-center border transition-all ${
                activeDirs.left
                  ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.7)] scale-95'
                  : 'bg-[#181c28] text-gray-300 border-[#2a2a35] hover:border-[#d4af37]/60 active:bg-[#d4af37] active:text-black'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* CENTER HUB */}
            <div className="w-10 h-10 rounded-full bg-[#141824] border border-[#2a2a35] flex items-center justify-center text-[8px] font-bold tracking-widest text-[#d4af37]/70 shadow-inner">
              WALK
            </div>

            {/* RIGHT Button */}
            <button
              type="button"
              id="pad-btn-right"
              onPointerDown={(e) => {
                e.preventDefault();
                handleDirStart('right');
              }}
              onPointerUp={() => handleDirEnd('right')}
              onPointerLeave={() => handleDirEnd('right')}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-r-lg flex items-center justify-center border transition-all ${
                activeDirs.right
                  ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.7)] scale-95'
                  : 'bg-[#181c28] text-gray-300 border-[#2a2a35] hover:border-[#d4af37]/60 active:bg-[#d4af37] active:text-black'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* DOWN Button */}
            <button
              type="button"
              id="pad-btn-down"
              onPointerDown={(e) => {
                e.preventDefault();
                handleDirStart('down');
              }}
              onPointerUp={() => handleDirEnd('down')}
              onPointerLeave={() => handleDirEnd('down')}
              className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-b-lg flex items-center justify-center border transition-all ${
                activeDirs.down
                  ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.7)] scale-95'
                  : 'bg-[#181c28] text-gray-300 border-[#2a2a35] hover:border-[#d4af37]/60 active:bg-[#d4af37] active:text-black'
              }`}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[9px] text-gray-500 font-mono font-medium uppercase tracking-wider">
            Direction D-Pad
          </span>
        </div>

        {/* --- CENTER: QUICK SHORTCUTS (Garden & Satchel) --- */}
        <div className="flex flex-col gap-2 justify-center items-center px-1">
          {onOpenGarden && (
            <button
              type="button"
              id="btn-virtual-garden"
              onClick={() => {
                soundEngine.playCleansingChime();
                onOpenGarden();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0e1614] hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold tracking-wider uppercase active:scale-95 transition-all shadow-md"
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garden</span>
            </button>
          )}

          {onOpenInventory && (
            <button
              type="button"
              id="btn-virtual-satchel"
              onClick={() => {
                soundEngine.playScriptureBell();
                onOpenInventory();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#15131e] hover:bg-purple-900/40 border border-purple-500/40 text-purple-200 text-[10px] font-bold tracking-wider uppercase active:scale-95 transition-all shadow-md"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-300" />
              <span>Satchel</span>
            </button>
          )}
        </div>

        {/* --- RIGHT: LARGE CONSOLE ACTION BUTTONS (A / B / Y) --- */}
        <div className="flex flex-col items-center gap-1">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 p-1.5 bg-[#10131c] rounded-2xl border-2 border-[#2a2a35]">
            {/* [E] Primary Action: Talk / Proclaim Gospel / Open */}
            <button
              type="button"
              id="btn-virtual-interact-action"
              onPointerDown={(e) => {
                e.preventDefault();
                soundEngine.playScriptureBell();
                onInteract();
              }}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#997c21] text-black font-sans font-bold flex flex-col items-center justify-center gap-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-90 active:brightness-125 transition-all border border-[#fff3b0]"
            >
              <MessageCircle className="w-5 h-5 text-black" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold">Interact</span>
              <span className="text-[8px] opacity-75 font-mono">[E]</span>
            </button>

            {/* [SPACE] Secondary Action: Trim Lamp */}
            <button
              type="button"
              id="btn-virtual-trim-action"
              onPointerDown={(e) => {
                e.preventDefault();
                soundEngine.playLanternTrim();
                onTrimLantern();
              }}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-[#1a1e2b] hover:bg-[#252b3d] text-amber-300 border-2 border-amber-500/60 font-sans font-bold flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-90 active:bg-amber-500 active:text-black transition-all"
            >
              <Flame className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Trim Lamp</span>
              <span className="text-[8px] opacity-75 font-mono">[Space]</span>
            </button>
          </div>
          <span className="text-[9px] text-gray-500 font-mono font-medium uppercase tracking-wider">
            Action Buttons
          </span>
        </div>
      </div>
    </div>
  );
};
