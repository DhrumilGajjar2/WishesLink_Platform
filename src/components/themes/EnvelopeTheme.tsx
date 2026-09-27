'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProps } from '@/lib/types';
import { MailOpen, Heart, Sparkles, X, PlusCircle } from 'lucide-react';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';

export const EnvelopeTheme: React.FC<ThemeProps> = ({
  wall,
  contributions,
  isRevealed: initialRevealed,
  onReveal,
  onAddWish,
}) => {
  const [isOpen, setIsOpen] = useState(initialRevealed);

  const recipientName = wall.recipient_name || wall.title;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    fireCelebrationConfetti();
    if (onReveal) onReveal();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 font-serif">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Sealed Envelope with Wax Seal */
          <motion.div
            key="sealed-envelope"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            className="cursor-pointer group flex flex-col items-center justify-center p-4 sm:p-12"
            onClick={handleOpen}
          >
            <div className="relative w-full max-w-xl aspect-[1.4/1] bg-[#f8f1e5] border-2 border-stone-300 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col justify-between items-center text-center overflow-hidden transition-all duration-300 group-hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] group-hover:-translate-y-1">
              {/* Flap shape */}
              <div className="absolute top-0 left-0 right-0 h-36 bg-[#efe4d2] border-b-2 border-stone-300 [clip-path:polygon(0_0,100%_0,50%_100%)] shadow-sm" />

              <div className="relative z-10 mt-6 sm:mt-8">
                <span className="font-mono text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest block font-bold">
                  DELIVERY FOR A SPECIAL OCCASION
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mt-2 font-serif">
                  {recipientName}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 italic mt-1 font-serif">
                  &ldquo;{wall.title}&rdquo;
                </p>
              </div>

              {/* The Wax Seal Button */}
              <div className="relative z-20 my-auto">
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-600 via-red-700 to-amber-950 rounded-full shadow-2xl border-4 border-amber-300/60 flex flex-col items-center justify-center text-amber-100 group-hover:ring-8 group-hover:ring-red-400/40 transition-all cursor-pointer"
                >
                  <Heart className="w-8 h-8 fill-current text-amber-200" />
                  <span className="text-[9px] font-mono tracking-tighter uppercase font-bold mt-0.5">BREAK SEAL</span>
                </motion.div>
              </div>

              <div className="relative z-10 text-stone-600 text-xs font-mono">
                Contains {contributions.length} Sealed Letters & Photographs • Tap Wax Seal to Open
              </div>
            </div>
          </motion.div>
        ) : (
          /* Opened Envelope Letter Cascade */
          <motion.div
            key="opened-letters"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-[#f8f1e5] p-4 rounded-2xl border border-stone-300 text-xs font-mono text-stone-700 shadow-sm">
              <span className="flex items-center gap-2">
                <MailOpen className="w-4 h-4 text-red-700" />
                <span className="font-bold">UNSEALED WISH ARCHIVE FOR {recipientName.toUpperCase()}</span>
                <span>• {contributions.length} Letters</span>
              </span>

              <div className="flex items-center gap-2">
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
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1 text-stone-700 hover:text-stone-950 font-semibold px-2 py-1 rounded hover:bg-stone-200 transition"
                  title="Reseal Envelope (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reseal (Esc)</span>
                </button>
              </div>
            </div>

            {/* Recipient Cover Keepsake Card if provided */}
            {wall.cover_photo_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#fffdf9] p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-lg relative overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="rounded-2xl overflow-hidden shadow border border-stone-200">
                    <img src={wall.cover_photo_url} alt={recipientName} className="w-full h-64 object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold block mb-1">
                      KEEPSAKE PORTRAIT
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mb-2">
                      In Honor of {recipientName}
                    </h3>
                    <p className="text-stone-700 text-sm sm:text-base italic font-serif leading-relaxed mb-4">
                      {wall.organizer_message || wall.description || `May this envelope forever hold the heartfelt wishes of those who love you!`}
                    </p>
                    <span className="text-xs font-mono text-stone-500 font-semibold">
                      — {wall.organizer_name || 'Organized with Love'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contributions.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-[#fffdf9] p-6 rounded-3xl border border-stone-300 shadow-md relative overflow-hidden flex flex-col justify-between hover:shadow-xl transition-shadow"
                >
                  <div>
                    {c.photo_url && (
                      <div className="rounded-2xl overflow-hidden mb-4 border border-stone-200 shadow-xs">
                        <img
                          src={c.photo_url}
                          alt={c.contributor_name}
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    )}
                    <p className="text-stone-800 text-base leading-relaxed italic whitespace-pre-line">
                      &ldquo;{c.message}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center text-xs font-mono text-stone-600">
                    <span className="font-bold text-stone-900 text-sm">— {c.contributor_name}</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
