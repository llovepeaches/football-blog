'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { playlist, Track } from '@/lib/music';

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentIndex: number;
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  playlist: Track[];
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentIndex] || null;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => next();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback((track?: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track) {
      const idx = playlist.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
        if (track.src) {
          audio.src = track.src;
          audio.load();
        }
      }
    }
    if (audio.src || !currentTrack?.src) {
      // demo mode: just toggle visual state
      setIsPlaying(true);
      if (audio.src) audio.play().catch(() => setIsPlaying(true));
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + playlist.length) % playlist.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleSetVolume = useCallback((vol: number) => {
    setVolume(vol);
  }, []);

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      currentIndex,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume: handleSetVolume,
      playlist,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be inside MusicProvider');
  return ctx;
}
