import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Loader2,
  ZoomIn,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "mkv", "avi", "m4v"];

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  const ext = clean.split(".").pop() ?? "";
  return VIDEO_EXTENSIONS.includes(ext);
}

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Image Viewer ──────────────────────────────────────────
interface ImageViewerProps {
  src: string;
  alt?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = "Post image",
}) => {
  const [lightbox, setLightbox] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        className="relative rounded-[24px] overflow-hidden border border-white/5 bg-zinc-900/50 group/img cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        {!loaded && (
          <div className="w-full h-64 flex items-center justify-center bg-zinc-900/80 rounded-[24px]">
            <Loader2 className="animate-spin text-zinc-600" size={28} />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full object-cover max-h-[520px] transition-all duration-700 group-hover/img:scale-[1.02] ${loaded ? "opacity-100" : "opacity-0 absolute"}`}
        />
        {loaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        )}
        {loaded && (
          <div className="absolute top-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/50 backdrop-blur-md rounded-xl p-2">
            <ZoomIn size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Video Player ──────────────────────────────────────────
interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // ── Playback ───────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  // ── Progress ───────────────────────────────────────────
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.buffered.length > 0) {
      setBuffered(v.buffered.end(v.buffered.length - 1));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  // ── Volume ─────────────────────────────────────────────
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
    v.muted = val === 0;
  };

  // ── Fullscreen ─────────────────────────────────────────
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Auto-hide controls ─────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2800);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative rounded-[24px] overflow-hidden bg-black border border-white/5 group/video"
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      onMouseLeave={() => {
        if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
        if (playing) setShowControls(false);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[520px] object-contain bg-black"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          setDuration((e.target as HTMLVideoElement).duration);
          setLoading(false);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onEnded={() => setPlaying(false)}
        preload="metadata"
        playsInline
      />

      {/* Loading Spinner */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none"
          >
            <Loader2 className="animate-spin text-white/70" size={36} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big Play Button (centre, when paused) */}
      <AnimatePresence>
        {!playing && !loading && (
          <motion.button
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-all"
          >
            <Play size={26} className="text-white ml-1 fill-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/bar"
              onClick={handleSeek}
            >
              {/* Buffered */}
              <div
                className="absolute left-0 top-0 h-full bg-white/20 rounded-full"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Progress */}
              <div
                className="absolute left-0 top-0 h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity -ml-1.5"
                style={{ left: `${progress}%` }}
              />
            </div>

            {/* Buttons row */}
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-1.5 text-white hover:text-blue-400 transition-colors"
              >
                {playing ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
              </button>

              {/* Volume */}
              <div
                className="flex items-center gap-1.5 group/vol"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-white hover:text-blue-400 transition-colors"
                >
                  {muted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 64, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 accent-blue-400 cursor-pointer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time */}
              <span className="text-[11px] font-mono text-white/70 ml-1 select-none">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-white hover:text-blue-400 transition-colors"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Auto-detect and render ────────────────────────────────
interface MediaPlayerProps {
  url: string;
  alt?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ url, alt }) => {
  if (isVideoUrl(url)) {
    return <VideoPlayer src={url} />;
  }
  return <ImageViewer src={url} alt={alt} />;
};
