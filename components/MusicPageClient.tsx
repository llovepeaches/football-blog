'use client';

import { useMusic } from '@/context/MusicContext';
import { Track } from '@/lib/music';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Music2,
  ListMusic, Upload
} from 'lucide-react';
import { useState, useRef } from 'react';
import Link from 'next/link';

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MusicPageClient() {
  const {
    currentTrack, isPlaying, currentTime, duration,
    toggle, next, prev, seek, volume, setVolume,
    playlist, currentIndex, play,
  } = useMusic();

  const [muted, setMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(ratio * duration, duration)));
  };

  const toggleMute = () => {
    if (muted) {
      setVolume(prevVolume);
      setMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setMuted(true);
    }
  };

  const genreColors: Record<string, string> = {
    '足球经典': 'bg-blue-500/10 text-blue-400',
    '球迷歌曲': 'bg-green-500/10 text-green-400',
    '励志经典': 'bg-[#f5c842]/10 text-[#f5c842]',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left: Big Player */}
        <div className="lg:w-96 flex-shrink-0">
          {/* Album art */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a4f2e] to-[#0d1117] border border-[#21262d] mb-6 shadow-2xl shadow-black/50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-[120px] select-none transition-transform duration-300 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                ⚽
              </div>
            </div>
            {/* Animated rings */}
            {isPlaying && (
              <>
                <div className="absolute inset-4 rounded-full border border-[#f5c842]/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-8 rounded-full border border-[#f5c842]/5 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
              </>
            )}
            {/* Genre badge */}
            {currentTrack?.genre && (
              <div className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full font-medium ${genreColors[currentTrack.genre] || 'bg-[#21262d] text-[#8b949e]'}`}>
                {currentTrack.genre}
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {currentTrack?.title || '选择一首曲目'}
            </h2>
            <p className="text-sm text-[#8b949e]">
              {currentTrack?.artist || '—'}
              {currentTrack?.album && (
                <span className="text-[#8b949e]/60"> · {currentTrack.album}</span>
              )}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div
              ref={progressRef}
              className="h-1.5 bg-[#21262d] rounded-full cursor-pointer group relative"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-[#f5c842] rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#f5c842] opacity-0 group-hover:opacity-100 transition-opacity shadow" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-[#8b949e] mt-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>{currentTrack?.duration || '0:00'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <button
              onClick={() => setShuffle(v => !v)}
              className={`p-2 rounded-lg transition-all ${shuffle ? 'text-[#f5c842]' : 'text-[#8b949e] hover:text-white'}`}
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={prev}
              className="p-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button
              onClick={toggle}
              className="w-14 h-14 rounded-full bg-[#f5c842] text-[#0d1117] flex items-center justify-center hover:bg-[#f5c842]/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#f5c842]/20"
            >
              {isPlaying
                ? <Pause size={22} fill="currentColor" />
                : <Play size={22} fill="currentColor" className="ml-1" />
              }
            </button>
            <button
              onClick={next}
              className="p-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
            <button
              onClick={() => setRepeat(v => !v)}
              className={`p-2 rounded-lg transition-all ${repeat ? 'text-[#f5c842]' : 'text-[#8b949e] hover:text-white'}`}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-[#8b949e] hover:text-white transition-colors flex-shrink-0">
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, #f5c842 ${volume * 100}%, #21262d ${volume * 100}%)`
              }}
            />
            <span className="text-xs text-[#8b949e] w-8 text-right tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Upload hint */}
          <div className="mt-6 p-4 bg-[#161b22] border border-dashed border-[#21262d] rounded-xl text-center">
            <Music2 size={20} className="text-[#8b949e] mx-auto mb-2" />
            <p className="text-xs text-[#8b949e] mb-2">将音频文件放入 public/audio/ 目录</p>
            <p className="text-xs text-[#8b949e]/60">然后在 lib/music.ts 中更新曲目列表</p>
          </div>
        </div>

        {/* Right: Playlist */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden">
            {/* Playlist header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ListMusic size={16} className="text-[#f5c842]" />
                播放列表
                <span className="text-xs text-[#8b949e] font-normal">({playlist.length} 首)</span>
              </h3>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-[#f5c842] hover:border-[#f5c842]/30 transition-all"
              >
                <Upload size={12} />
                管理曲库
              </Link>
            </div>

            {/* Tracks */}
            <div className="divide-y divide-[#21262d]">
              {playlist.map((track: Track, index: number) => {
                const isActive = index === currentIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => play(track)}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all group
                      ${isActive ? 'bg-[#f5c842]/5' : 'hover:bg-white/2'}`}
                  >
                    {/* Index / Playing indicator */}
                    <div className="w-6 text-center flex-shrink-0">
                      {isActive && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-4">
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              className="w-1 bg-[#f5c842] rounded-full animate-bounce"
                              style={{
                                animationDelay: `${i * 0.15}s`,
                                height: `${[60, 100, 40][i]}%`
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className={`text-xs ${isActive ? 'text-[#f5c842]' : 'text-[#8b949e] group-hover:text-white'}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Track icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isActive ? 'bg-[#f5c842]/15 border-[#f5c842]/30' : 'bg-[#21262d] border-transparent'}
                      border transition-all`}
                    >
                      <Music2 size={14} className={isActive ? 'text-[#f5c842]' : 'text-[#8b949e]'} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-[#f5c842]' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-[#8b949e] truncate">
                        {track.artist} · {track.album}
                      </p>
                    </div>

                    {/* Genre */}
                    <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:block ${genreColors[track.genre] || 'bg-[#21262d] text-[#8b949e]'}`}>
                      {track.genre}
                    </span>

                    {/* Duration */}
                    <span className="text-xs text-[#8b949e] tabular-nums flex-shrink-0">
                      {track.duration}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 p-4 bg-[#161b22] border border-[#21262d] rounded-xl">
            <p className="text-xs text-[#8b949e] leading-relaxed">
              <span className="text-[#f5c842] font-medium">提示：</span>
              本播放器支持本地音频文件。将 MP3/OGG/WAV 文件放置于 <code className="bg-[#21262d] px-1 py-0.5 rounded text-white">public/audio/</code> 目录，
              并在 <code className="bg-[#21262d] px-1 py-0.5 rounded text-white">lib/music.ts</code> 的 src 字段填写对应路径（如 <code className="bg-[#21262d] px-1 py-0.5 rounded text-white">/audio/track.mp3</code>）即可播放。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
