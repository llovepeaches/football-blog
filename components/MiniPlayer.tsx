'use client';

import { useMusic } from '@/context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Music2, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, toggle, next, prev, seek, volume, setVolume } = useMusic();
  const [expanded, setExpanded] = useState(false);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[#21262d] bg-[#0d1117]/95 backdrop-blur-xl transition-all duration-300 ${expanded ? 'pb-4' : ''}`}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-[#21262d] relative cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          seek(ratio * duration);
        }}
      >
        <div
          className="h-full bg-[#f5c842] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Track info */}
          <Link href="/music" className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#f5c842]/20 to-[#0a4f2e]/40 border border-[#21262d] flex items-center justify-center flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
              <Music2 size={16} className="text-[#f5c842]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-[#f5c842] transition-colors">
                {currentTrack?.title || '选择一首歌曲'}
              </p>
              <p className="text-xs text-[#8b949e] truncate">
                {currentTrack?.artist || '点击音乐页面浏览播放列表'}
              </p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full bg-[#f5c842] text-[#0d1117] flex items-center justify-center hover:bg-[#f5c842]/90 transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>
            <button
              onClick={next}
              className="p-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Time + Volume */}
          <div className="hidden sm:flex items-center gap-3 flex-1 justify-end">
            <span className="text-xs text-[#8b949e] tabular-nums">
              {formatTime(currentTime)} / {currentTrack?.duration || '0:00'}
            </span>
            <div className="flex items-center gap-2 w-24">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #f5c842 ${volume * 100}%, #21262d ${volume * 100}%)`
                }}
              />
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1 text-[#8b949e] hover:text-white transition-colors"
            >
              <ChevronUp size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
