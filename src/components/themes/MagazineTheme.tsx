'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProps } from '@/lib/types';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, X, Heart, PlusCircle } from 'lucide-react';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';

export const MagazineTheme: React.FC<ThemeProps> = ({
  wall,
  contributions,
  isRevealed: initialRevealed,
  onReveal,
  onAddWish,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpened, setIsOpened] = useState(initialRevealed);

  const totalPages = contributions.length + 1;
  const recipientName = wall.recipient_name || wall.title;

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpened) return;
      if (e.key === 'ArrowRight' && currentPage < totalPages - 1) {
        setCurrentPage((p) => p + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage((p) => p - 1);
      } else if (e.key === 'Escape') {
        setIsOpened(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpened, currentPage, totalPages]);

  const handleOpen = () => {
    setIsOpened(true);
    setCurrentPage(1);
    fireCelebrationConfetti();
    if (onReveal) onReveal();
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-3 sm:px-6 font-sans">
      {!isOpened ? (
        /* Magazine Glossy Cover */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-gradient-to-br from-rose-900 via-rose-700 to-indigo-950 rounded-3xl p-6 sm:p-12 text-white shadow-2xl overflow-hidden cursor-pointer group border-4 border-white/20"
          onClick={handleOpen}
        >
          {/* Cover photo full-bleed background overlay if provided */}
          {wall.cover_photo_url && (
            <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700 pointer-events-none">
              <img src={wall.cover_photo_url} alt={recipientName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950 via-rose-950/70 to-transparent" />
            </div>
          )}

          <div className="border-2 border-white/40 p-6 sm:p-10 rounded-2xl relative z-10 backdrop-blur-xs">
            <div className="flex justify-between items-center text-[10px] sm:text-xs tracking-widest uppercase font-mono border-b border-white/30 pb-3 mb-6">
              <span>SPECIAL COMMEMORATIVE EDITION</span>
              <span>VOL. I • LUXURY ISSUE</span>
            </div>

            <div className="text-center my-8">
              <span className="text-amber-300 font-serif italic text-lg sm:text-2xl block mb-2 font-medium">
                The Collector&apos;s Issue Celebrating
              </span>
              <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight font-serif drop-shadow-lg text-white">
                {recipientName}
              </h1>
              <p className="mt-4 text-white/90 max-w-md mx-auto text-sm sm:text-base leading-relaxed italic font-serif">
                &ldquo;{wall.title}&rdquo;
              </p>
            </div>

            <div className="text-center mt-10">
              <button className="bg-white hover:bg-amber-100 text-rose-950 font-bold px-8 py-3.5 rounded-full shadow-2xl group-hover:scale-105 transition-transform flex items-center gap-2 mx-auto text-sm sm:text-base">
                <BookOpen className="w-5 h-5 text-rose-600" />
                <span>Open Magazine Spreads</span>
                <span className="text-xs bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full font-mono">
                  {contributions.length} Spreads
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Interactive Flip Spread */
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-900 relative">
          {/* Top Bar with Clear Close Option (Goal 3) */}
          <div className="p-3.5 bg-stone-100 border-b border-stone-200 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-rose-700">★ {recipientName.toUpperCase()}</span>
              <span className="text-stone-400">•</span>
              <span>Spread {currentPage} of {totalPages - 1}</span>
            </div>

            <div className="flex items-center gap-3">
              {onAddWish && (
                <button
                  onClick={onAddWish}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-md font-bold transition flex items-center gap-1 text-[11px]"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Add Wish</span>
                </button>
              )}
              <button
                onClick={() => setIsOpened(false)}
                className="text-stone-600 hover:text-stone-950 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 transition"
                title="Close to Magazine Cover"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Cover</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-12 min-h-[460px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentPage === 0 ? (
                <motion.div
                  key="cover-spread"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center"
                >
                  <h2 className="text-3xl sm:text-5xl font-serif font-black">{wall.title}</h2>
                  <p className="text-stone-600 mt-2 max-w-md mx-auto">{wall.description}</p>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-full font-medium shadow-md hover:bg-rose-500 transition"
                  >
                    Start Reading →
                  </button>
                </motion.div>
              ) : (
                (() => {
                  const item = contributions[currentPage - 1];
                  if (!item) return null;
                  return (
                    <motion.div
                      key={`spread-${item.id}`}
                      initial={{ opacity: 0, rotateY: -15, scale: 0.98 }}
                      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                      exit={{ opacity: 0, rotateY: 15, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
                    >
                      {item.photo_url ? (
                        <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 aspect-[4/3] sm:aspect-square bg-stone-50">
                          <img
                            src={item.photo_url}
                            alt={item.contributor_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] sm:aspect-square bg-rose-50 rounded-2xl flex flex-col items-center justify-center text-rose-300 border border-rose-100 p-6">
                          <Heart className="w-16 h-16 fill-rose-200 text-rose-400 mb-3" />
                          <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">Cherished Memory</span>
                        </div>
                      )}

                      <div className="flex flex-col justify-center">
                        <span className="text-xs uppercase tracking-widest font-mono text-rose-600 font-bold mb-2">
                          FEATURED CONTRIBUTION
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 mb-4">
                          {item.contributor_name}
                        </h3>
                        <p className="text-stone-700 text-base sm:text-xl italic font-serif leading-relaxed mb-6 whitespace-pre-line">
                          &ldquo;{item.message}&rdquo;
                        </p>
                        <span className="text-xs font-mono text-stone-400">
                          Recorded on {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })()
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Bar */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-20 disabled:pointer-events-none transition flex items-center gap-1 text-xs font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-md py-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${
                    currentPage === i ? 'bg-rose-600 w-6' : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-20 disabled:pointer-events-none transition flex items-center gap-1 text-xs font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
