'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProps, Contribution } from '@/lib/types';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { Sparkles, X, Heart, PlusCircle, Flame, Moon, Eye } from 'lucide-react';

export const LanternsTheme: React.FC<ThemeProps> = ({
  wall,
  contributions,
  onAddWish,
}) => {
  const [selectedLantern, setSelectedLantern] = useState<Contribution | null>(null);

  const recipientName = wall.recipient_name || wall.title;

  const handleOpenLantern = (item: Contribution) => {
    setSelectedLantern(item);
    fireCelebrationConfetti();
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 text-white relative min-h-[85vh] overflow-hidden">
      {/* Deep Sky Starlit Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glowing Moon */}
        <div className="absolute top-6 right-10 w-20 h-20 rounded-full bg-amber-100/20 blur-xl pointer-events-none" />
        <div className="absolute top-8 right-12 w-16 h-16 rounded-full bg-amber-50/90 shadow-[0_0_50px_rgba(254,240,138,0.8)] pointer-events-none" />

        {/* Ambient floating ember particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ['100vh', '-10vh'],
              x: [(i % 2 === 0 ? 10 : -10) * (i % 4), (i % 2 === 0 ? -15 : 15) * (i % 3)],
              opacity: [0, 0.9, 0],
              scale: [0.6, 1.2, 0.4],
            }}
            transition={{
              duration: 10 + (i % 5) * 2.5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'linear',
            }}
            style={{ left: `${(i * 5.5 + 4) % 95}%` }}
            className="absolute bottom-0 w-2 h-2 rounded-full bg-amber-400 blur-xs"
          />
        ))}
      </div>

      {/* Header */}
      <div className="text-center relative z-10 mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 backdrop-blur-md">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Floating Sky Lanterns & Wishes</span>
        </div>

        <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white font-serif mb-3 drop-shadow-md">
          {wall.title}
        </h1>
        <p className="text-amber-100/80 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          {wall.description || `Each glowing lantern carries a heartfelt wish into the night sky for ${recipientName}. Tap any lantern to read its light!`}
        </p>
      </div>

      {/* Recipient Master Lantern */}
      {wall.cover_photo_url && (
        <div className="relative z-10 mb-14 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block relative cursor-pointer"
            onClick={() => {
              handleOpenLantern({
                id: 'master-lantern',
                wall_id: wall.id,
                contributor_name: wall.organizer_name || 'Wall Organizer',
                message: wall.organizer_message || `Lighting the brightest lantern for you, ${recipientName}!`,
                photo_url: wall.cover_photo_url!,
                created_at: wall.created_at,
                highlight: true,
              });
            }}
          >
            <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-3xl bg-gradient-to-t from-amber-600 via-amber-500/80 to-amber-300 p-2 shadow-[0_0_60px_rgba(245,158,11,0.6)] border-2 border-amber-200/80 relative flex flex-col justify-between overflow-hidden">
              <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden shadow-inner">
                <img src={wall.cover_photo_url} alt={recipientName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 to-transparent" />
              </div>
              <div className="text-center pb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-100">CELEBRATING</span>
                <h3 className="text-base font-bold text-white drop-shadow truncate">{recipientName}</h3>
              </div>
            </div>
            {/* Soft flame aura */}
            <div className="w-10 h-10 bg-amber-400 rounded-full blur-md mx-auto -mt-2 animate-pulse" />
          </motion.div>
        </div>
      )}

      {/* Grid of Floating Lanterns */}
      {contributions.length === 0 ? (
        <div className="relative z-10 text-center py-16 border-2 border-dashed border-amber-400/30 rounded-3xl p-8 bg-slate-900/60 backdrop-blur-md max-w-md mx-auto">
          <Flame className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
          <h3 className="text-xl font-bold font-serif mb-1 text-white">No Lanterns Released Yet</h3>
          <p className="text-xs text-amber-200/80 mb-5">
            Be the first to release a warm sky lantern with a photo and wish for {recipientName}!
          </p>
          {onAddWish && (
            <button
              onClick={onAddWish}
              className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg hover:brightness-110 transition"
            >
              Release First Lantern
            </button>
          )}
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {contributions.map((item, idx) => {
            const floatOffset = (idx % 3) * 6;
            return (
              <motion.div
                key={item.id}
                animate={{ y: [-floatOffset, floatOffset, -floatOffset] }}
                transition={{
                  duration: 4 + (idx % 3),
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: idx * 0.3,
                }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => handleOpenLantern(item)}
                className="cursor-pointer group flex flex-col items-center"
              >
                {/* Lantern Body */}
                <div className="w-full max-w-[280px] bg-gradient-to-b from-amber-400/20 via-slate-900/90 to-amber-950/80 border border-amber-400/50 rounded-3xl p-4 shadow-[0_10px_35px_rgba(245,158,11,0.25)] group-hover:shadow-[0_15px_45px_rgba(245,158,11,0.5)] transition-all backdrop-blur-md">
                  {item.photo_url ? (
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 border border-amber-300/30">
                      <img
                        src={item.photo_url}
                        alt={item.contributor_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                        <span className="text-xs font-bold text-amber-200 truncate">{item.contributor_name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col items-center justify-center p-4 text-center mb-3">
                      <Flame className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                      <p className="text-xs italic text-amber-100 line-clamp-3">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-300">{item.contributor_name}</span>
                    <span className="text-[10px] text-amber-200/60 font-mono">Tap to Read</span>
                  </div>
                </div>

                {/* Lantern Flame Base */}
                <div className="w-6 h-6 rounded-full bg-amber-400/80 blur-xs -mt-1 group-hover:scale-125 transition-transform" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected Lantern Modal */}
      <AnimatePresence>
        {selectedLantern && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedLantern(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-400/60 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button with explicit Esc reminder */}
              <button
                onClick={() => setSelectedLantern(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition flex items-center gap-1 text-xs"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                  ✨ SKY LANTERN WISH
                </span>
                <h3 className="text-2xl font-bold font-serif text-white">
                  From {selectedLantern.contributor_name}
                </h3>
              </div>

              {selectedLantern.photo_url && (
                <div className="w-full max-h-72 rounded-2xl overflow-hidden mb-5 border border-amber-400/40 shadow-lg">
                  <img
                    src={selectedLantern.photo_url}
                    alt={selectedLantern.contributor_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-amber-500/10 border border-amber-400/30 p-5 rounded-2xl mb-4">
                <p className="text-amber-100 text-base sm:text-lg italic font-serif leading-relaxed text-center">
                  &ldquo;{selectedLantern.message}&rdquo;
                </p>
                <span className="block text-right text-xs font-mono text-amber-300 font-semibold mt-3">
                  — {selectedLantern.contributor_name}
                </span>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setSelectedLantern(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Close Lantern
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
