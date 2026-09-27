'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProps, Contribution } from '@/lib/types';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { Sparkles, CheckCircle2, Eye, Share2, Heart, PlusCircle, Volume2, VolumeX, X, ZoomIn } from 'lucide-react';

// Web Audio Scratch Sound Synthesizer (Zero External MP3 dependencies!)
class ScratchAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastSoundTime: number = 0;

  constructor() {
    // Lazy init on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  playScratchBurst() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastSoundTime < 45) return; // Throttled for smooth audio
    this.lastSoundTime = now;

    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Generate soft scratch noise burst
      const bufferSize = this.ctx.sampleRate * 0.04; // 40ms burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600 + Math.random() * 800;
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

const scratchAudio = new ScratchAudioSynthesizer();

interface ScratchableCardProps {
  contribution: Contribution;
  index: number;
  onScratched: (id: string) => void;
  isFullyRevealed: boolean;
  onInspect: (contribution: Contribution) => void;
}

const ScratchableCard: React.FC<ScratchableCardProps> = ({
  contribution,
  index,
  onScratched,
  isFullyRevealed,
  onInspect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(isFullyRevealed);
  const [scratchPercent, setScratchPercent] = useState(isFullyRevealed ? 100 : 0);
  const isDrawingRef = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Dynamic metallic holographic gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#94a3b8');
    gradient.addColorStop(0.2, '#f8fafc');
    gradient.addColorStop(0.4, '#64748b');
    gradient.addColorStop(0.6, '#e2e8f0');
    gradient.addColorStop(0.8, '#cbd5e1');
    gradient.addColorStop(1, '#94a3b8');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Shimmer starfield pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let x = 0; x < rect.width; x += 22) {
      for (let y = 0; y < rect.height; y += 22) {
        ctx.beginPath();
        ctx.arc(x + 11, y + 11, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border pattern inside foil
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(10, 10, rect.width - 20, rect.height - 20);
    ctx.setLineDash([]);

    // Scratch badge banner
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(rect.width / 2 - 110, rect.height / 2 - 28, 220, 56, 12);
    ctx.fill();

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rect.width / 2 - 110, rect.height / 2 - 28, 220, 56, 12);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SCRATCH & REVEAL ✨', rect.width / 2, rect.height / 2 - 6);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(`Card #${index + 1} • Secret Surprise`, rect.width / 2, rect.height / 2 + 14);
  }, [index]);

  useEffect(() => {
    if (!isFullyRevealed) {
      initCanvas();
    }
  }, [initCanvas, isFullyRevealed]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 32 * dpr, 0, Math.PI * 2);
    ctx.fill();

    scratchAudio.playScratchBurst();
    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let transparentCount = 0;
    const totalSamples = (width * height) / 16;

    for (let i = 3; i < data.length; i += 16 * 4) {
      if (data[i] === 0) {
        transparentCount++;
      }
    }

    const percent = Math.min(100, Math.round((transparentCount / totalSamples) * 100));
    setScratchPercent(percent);

    if (percent > 45 && !isScratched) {
      setIsScratched(true);
      onScratched(contribution.id);
      fireCelebrationConfetti();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-slate-900/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col hover:border-amber-400/50 transition-colors"
    >
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono text-xs">
            #{index + 1}
          </span>
          <span className="font-semibold text-slate-200">
            {isScratched || isFullyRevealed ? contribution.contributor_name : 'Mystery Contributor'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isScratched || isFullyRevealed ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Revealed
            </span>
          ) : (
            <span className="text-amber-400 font-medium text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full font-mono">
              {scratchPercent}% Scratched
            </span>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] sm:aspect-square bg-slate-950 overflow-hidden select-none touch-none"
        onMouseDown={(e) => {
          isDrawingRef.current = true;
          scratch(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (!isDrawingRef.current) return;
          scratch(e.clientX, e.clientY);
        }}
        onMouseUp={() => { isDrawingRef.current = false; }}
        onMouseLeave={() => { isDrawingRef.current = false; }}
        onTouchStart={(e) => {
          isDrawingRef.current = true;
          if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (!isDrawingRef.current) return;
          if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={() => { isDrawingRef.current = false; }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-slate-900 to-indigo-950 text-white cursor-pointer"
          onClick={() => {
            if (isScratched || isFullyRevealed) {
              onInspect(contribution);
            }
          }}
        >
          {contribution.photo_url ? (
            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-700 group">
              <img
                src={contribution.photo_url}
                alt={contribution.contributor_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                  From {contribution.contributor_name}
                </span>
                <p className="text-white text-sm sm:text-base font-medium mt-1 leading-snug line-clamp-3">
                  &ldquo;{contribution.message}&rdquo;
                </p>
                <span className="text-[10px] text-amber-200/80 font-mono mt-1 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Tap to view full size
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Heart className="w-10 h-10 text-rose-400 mb-3 animate-bounce" />
              <p className="text-base sm:text-lg font-serif italic text-slate-100 max-w-sm mb-4">
                &ldquo;{contribution.message}&rdquo;
              </p>
              <span className="text-amber-400 font-semibold text-sm">
                — {contribution.contributor_name}
              </span>
            </div>
          )}
        </div>

        {!isScratched && !isFullyRevealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 cursor-pointer transition-opacity duration-500"
          />
        )}
      </div>

      <div className="p-4 bg-slate-900 text-slate-300 text-xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-slate-400">
          <span>{new Date(contribution.created_at).toLocaleDateString()}</span>
          {!isScratched && !isFullyRevealed && (
            <button
              onClick={() => {
                setIsScratched(true);
                onScratched(contribution.id);
                fireCelebrationConfetti();
              }}
              className="text-amber-400 hover:text-amber-300 underline font-mono text-[11px]"
            >
              Quick Reveal
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ScratchCardTheme: React.FC<ThemeProps> = ({
  wall,
  contributions,
  isRevealed: initialRevealed,
  onReveal,
  onAddWish,
}) => {
  const [scratchedIds, setScratchedIds] = useState<Set<string>>(
    new Set(initialRevealed ? contributions.map((c) => c.id) : [])
  );
  const [allRevealed, setAllRevealed] = useState(initialRevealed);
  const [isMuted, setIsMuted] = useState(false);
  const [inspectedCard, setInspectedCard] = useState<Contribution | null>(null);

  const recipientName = wall.recipient_name || wall.title;

  // Escape key support (Goal 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    scratchAudio.setMuted(next);
  };

  const handleCardScratched = (id: string) => {
    setScratchedIds((prev) => {
      const next = new Set(prev).add(id);
      if (next.size === contributions.length && !allRevealed) {
        setAllRevealed(true);
        if (onReveal) onReveal();
      }
      return next;
    });
  };

  const handleRevealAll = () => {
    setAllRevealed(true);
    setScratchedIds(new Set(contributions.map((c) => c.id)));
    fireCelebrationConfetti();
    if (onReveal) onReveal();
  };

  const progressPercent = contributions.length > 0
    ? Math.round((scratchedIds.size / contributions.length) * 100)
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Sound effect toggle bar */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleMute}
          className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-mono transition"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? 'Scratch Sound Off' : 'Scratch Sound On'}</span>
        </button>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl mb-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {wall.cover_photo_url && (
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl mb-4 bg-slate-800">
            <img
              src={wall.cover_photo_url}
              alt={recipientName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Scratch Wishes for {recipientName}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          {wall.title}
        </h1>

        <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg mb-6 leading-relaxed">
          {wall.description || `Every card below hides a secret message and photograph for ${recipientName}. Scratch over each card with your finger or mouse to uncover the memories!`}
        </p>

        {/* Progress bar and Quick Actions */}
        <div className="max-w-md mx-auto bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
          <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-2">
            <span>SCRATCH PROGRESS</span>
            <span className="font-bold text-amber-400">
              {scratchedIds.size} of {contributions.length} Cards ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-700/70 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
            <span className="text-xs text-slate-400">
              {allRevealed ? "All wishes uncovered! 🎉" : "Scratch foil to uncover"}
            </span>
            <button
              onClick={handleRevealAll}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal All Cards</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid of Scratch Cards */}
      {contributions.length === 0 ? (
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center my-6">
          <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No Scratch Cards Yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto text-sm mb-6">
            Share this link with friends so they can contribute scratch cards with photos and wishes for {recipientName}!
          </p>
          {onAddWish ? (
            <button
              onClick={onAddWish}
              className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition"
            >
              Create First Scratch Card
            </button>
          ) : (
            <a
              href={`/wall/${wall.share_slug}/contribute`}
              className="inline-block bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition"
            >
              Create First Scratch Card
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributions.map((contribution, index) => (
            <ScratchableCard
              key={contribution.id}
              contribution={contribution}
              index={index}
              onScratched={handleCardScratched}
              isFullyRevealed={allRevealed || scratchedIds.has(contribution.id)}
              onInspect={(c) => setInspectedCard(c)}
            />
          ))}
        </div>
      )}

      {/* Detail / Inspect Modal with Close & Escape Handling (Goal 3) */}
      <AnimatePresence>
        {inspectedCard && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
            onClick={() => setInspectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-6 text-white relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setInspectedCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition flex items-center gap-1 text-xs"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">Close</span>
              </button>

              <div className="border-b border-slate-800 pb-3 mb-4">
                <span className="text-amber-400 text-xs font-mono font-bold uppercase">REVEALED WISH</span>
                <h3 className="text-xl font-bold mt-1">From {inspectedCard.contributor_name}</h3>
              </div>

              {inspectedCard.photo_url && (
                <div className="rounded-xl overflow-hidden mb-4 border border-slate-700 bg-slate-950">
                  <img
                    src={inspectedCard.photo_url}
                    alt={inspectedCard.contributor_name}
                    className="w-full max-h-80 object-contain mx-auto"
                  />
                </div>
              )}

              <p className="text-slate-200 text-sm leading-relaxed mb-6 italic bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                &ldquo;{inspectedCard.message}&rdquo;
              </p>

              <div className="text-right">
                <button
                  onClick={() => setInspectedCard(null)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Done / Back to Cards
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
