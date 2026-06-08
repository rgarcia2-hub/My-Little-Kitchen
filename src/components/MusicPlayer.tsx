import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, X, Minimize2, Maximize2, Lock } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  isPremium?: boolean;
}

/**
 * PLAYLIST CONFIGURATION
 * To add your own music:
 * 1. Place your .mp3 files in the /public/music folder.
 * 2. Add a new entry to the PLAYLIST array below with the correct path.
 *    Example: { id: 4, title: "My Song", artist: "Me", url: "/music/my-song.mp3" }
 * 
 * PREMIUM TRACKS:
 * To make a song only available for Music Pass holders:
 * Add `isPremium: true` to the track object.
 */
const PLAYLIST: Track[] = [
  {
    id: 1,
    title: "Kitchen Vibes",
    artist: "Lo-Fi Chef",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Brutalist Beats",
    artist: "OS Architect",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Manifesting Melodies",
    artist: "God Tier",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    isPremium: true
  },
  {
    id: 4,
    title: "CLEAN LOOK",
    artist: "Roby_010",
    url: "/music/clean_look.mp3",
    isPremium: true
  }
];

interface MusicPlayerProps {
  hasMusicPass?: boolean;
  onPurchasePass?: () => void;
}

export function MusicPlayer({ hasMusicPass = false, onPurchasePass }: MusicPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = PLAYLIST[currentTrackIndex];
  const isLocked = currentTrack.isPremium && !hasMusicPass;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && !isLocked) {
      audioRef.current?.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current?.pause();
      if (isLocked) setIsPlaying(false);
    }
  }, [isPlaying, currentTrackIndex, isLocked]);

  const togglePlay = () => {
    if (isLocked) return;
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
      setDuration(total);
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const nextTrack = () => {
    let nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
  };

  const prevTrack = () => {
    let prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
      setProgress(newProgress);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="music-player-container">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Floating Toggle Button */}
      <button 
        className={`music-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Music Player"
      >
        <Music size={24} />
        {isPlaying && <span className="music-playing-indicator" />}
      </button>

      {/* Player UI */}
      {isOpen && (
        <div className={`music-player-ui ${isMinimized ? 'minimized' : ''} ${currentTrack.isPremium ? 'kitchen-os-theme' : ''}`}>
          <div className="player-header">
            <div className="player-title">
              <Music size={14} className="mr-2" />
              <span>{currentTrack.isPremium ? 'KITCHEN_OS_AUDIO_PREMIUM' : 'KITCHEN_AUDIO_V1.0'}</span>
            </div>
            <div className="player-header-actions">
              <button onClick={() => setIsMinimized(!isMinimized)} className="header-btn">
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="header-btn">
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="player-body">
              <div className="track-info">
                <div className="track-name flex items-center">
                  {currentTrack.title}
                  {currentTrack.isPremium && (
                    <span className={`ml-2 text-[10px] px-1 border ${hasMusicPass ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
                      {hasMusicPass ? 'PASS_ACTIVE' : 'PASS_REQUIRED'}
                    </span>
                  )}
                </div>
                <div className="track-artist">{currentTrack.artist}</div>
              </div>

              {isLocked ? (
                <div className="locked-track-overlay">
                  <Lock size={32} className="mb-2 text-green-500" />
                  <p className="text-[11px] font-bold text-center uppercase text-white tracking-widest">Access Restricted</p>
                  <p className="text-[9px] text-green-500/70 text-center mt-2 font-mono">MUSIC_PASS_REQUIRED</p>
                  {onPurchasePass && (
                    <button 
                      onClick={onPurchasePass}
                      className="mt-4 px-6 py-2 relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[12px] uppercase font-black hover:scale-105 transition-all rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] group border-2 border-emerald-300 z-10 block"
                    >
                      <div className="absolute inset-0 bg-white/40 w-full translate-x-[-150%] skew-x-[-20deg] group-hover:transition-all group-hover:duration-700 group-hover:translate-x-[150%] ease-in-out -z-10" />
                      <span className="drop-shadow-md">Purchase Music Pass</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="progress-container">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress || 0}
                      onChange={handleProgressChange}
                      className="progress-bar"
                    />
                    <div className="time-display">
                      <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                      <span>{formatTime(duration || 0)}</span>
                    </div>
                  </div>

                  <div className="controls-container">
                    <button onClick={prevTrack} className="control-btn">
                      <SkipBack size={20} fill="currentColor" />
                    </button>
                    <button onClick={togglePlay} className="control-btn play-pause">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <button onClick={nextTrack} className="control-btn">
                      <SkipForward size={20} fill="currentColor" />
                    </button>
                  </div>

                  <div className="volume-container">
                    <button onClick={toggleMute} className="volume-btn">
                      {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="volume-slider"
                    />
                  </div>
                </>
              )}
              
              <div className="playlist-mini-list mt-4 border-t border-gray-200 pt-2">
                <div className="text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Playlist_Manifest</div>
                {PLAYLIST.map((track, index) => (
                  <div 
                    key={track.id} 
                    className={`playlist-item ${currentTrackIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentTrackIndex(index)}
                  >
                    <div className="playlist-item-info">
                      <span className="playlist-item-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="playlist-item-title">{track.title}</span>
                      {track.isPremium && (
                        <span className="playlist-item-badge">PREMIUM</span>
                      )}
                    </div>
                    {track.isPremium && !hasMusicPass && <Lock size={10} className="text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isMinimized && isPlaying && (
            <div className="minimized-info">
              <span className="scrolling-text">{currentTrack.title} - {currentTrack.artist}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
