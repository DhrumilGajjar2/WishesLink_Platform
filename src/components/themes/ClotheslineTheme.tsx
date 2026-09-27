'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProps, Contribution } from '@/lib/types';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { Sparkles, X, Heart, PlusCircle, Share2, ZoomIn, RotateCcw } from 'lucide-react';

export const ClotheslineTheme: React.FC<ThemeProps> = ({
  wall,
  contributions,
  onAddWish,
}) => {
  const [selectedItem, setSelectedItem] = useState<Contribution | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const recipientName = wall.recipient_name || wall.title;

  const handleOpenPhoto = (item: Contribution) => {
    setSelectedItem(item);
    setIsFlipped(false);
    fireCelebrationConfetti();
  };

  const handleClose = () => {
    setSelectedItem(null);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-3 sm:px-6 font-sans">
      {/* Fairy Light Garland & Header */}
      <div className="text-center mb-8 relative">
        {/* Animated glowing string lights */}
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-4 px-4 overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.6, 1, 0.7, 1],
                scale: [0.9, 1.15, 0.95, 1],
                boxShadow: [
                  '0 0 10px rgba(251, 191, 36, 0.4)',
                  '0 0 20px rgba(251, 191, 36, 0.8)',
                  '0 0 12px rgba(251, 191, 36, 0.5)',
                ],
              }}
              transition={{
                duration: 2.2 + (i % 3) * 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.2,
              }}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-300 border border-amber-200"
            />
          ))}
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-900/10 text-amber-900 border border-amber-900/20 px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Polaroid Memory Clothesline</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-serif tracking-tight mb-2">
          {wall.title}
        </h1>
        <p className="text-stone-700 max-w-xl mx-auto text-sm sm:text-base italic font-serif">
          {wall.description || `Special moments and handwritten notes clipped on the memory line for ${recipientName}. Tap any polaroid to turn it over!`}
        </p>
      </div>

      {/* Recipient Master Photo Badge if present */}
      {wall.cover_photo_url && (
        <div className="mb-10 text-center">
          <motion.div
            whileHover={{ scale: 1.03, rotate: 0 }}
            initial={{ rotate: -2 }}
            className="inline-block bg-white p-4 sm:p-5 pb-8 rounded-sm shadow-2xl border-4 border-amber-300 relative cursor-pointer group"
            onClick={() => {
              handleOpenPhoto({
                id: 'master-cover',
                wall_id: wall.id,
                contributor_name: wall.organizer_name || 'Wall Organizer',
                message: wall.organizer_message || `To our guest of honor, ${recipientName}!`,
                photo_url: wall.cover_photo_url!,
                created_at: wall.created_at,
                highlight: true,
              });
            }}
          >
            {/* Wooden clothespin */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-9 bg-amber-700 rounded-sm shadow-md border border-amber-900 z-10" />
            <div className="w-52 h-52 sm:w-64 sm:h-64 overflow-hidden rounded bg-stone-100 mb-3 shadow-inner">
              <img
                src={wall.cover_photo_url}
                alt={recipientName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="text-center font-serif">
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block">HONORED GUEST</span>
              <span className="text-lg font-bold text-stone-900">{recipientName}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Clothesline Wire & Pegs */}
      <div className="relative pt-6">
        {/* Wire */}
        <div className="hidden sm:block absolute top-10 left-0 right-0 h-1 bg-gradient-to-r from-stone-400 via-stone-500 to-stone-400 shadow-sm rounded-full z-0" />

        {contributions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-300 rounded-3xl p-8 bg-white/60">
            <Heart className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold font-serif mb-1">No Polaroids Clipped Yet</h3>
            <p className="text-sm text-stone-600 mb-4 max-w-sm mx-auto">
              Be the first to clip a photo and write a memory on the back for {recipientName}!
            </p>
            {onAddWish && (
              <button
                onClick={onAddWish}
                className="bg-stone-900 hover:bg-stone-800 text-amber-200 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow"
              >
                Clip First Polaroid
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 relative z-10 pt-4">
            {contributions.map((item, idx) => {
              const rotation = (idx % 2 === 0 ? 1 : -1) * (1.5 + (idx % 3) * 1.2);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -8, rotate: 0, transition: { duration: 0.2 } }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleOpenPhoto(item)}
                >
                  {/* Wooden Clothespin */}
                  <div className="w-4 h-8 bg-amber-700 rounded-xs shadow-md border border-amber-900 mb-[-12px] z-20 group-hover:scale-110 transition-transform" />

                  {/* Polaroid Frame */}
                  <div
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="bg-white p-3.5 pb-6 rounded-sm shadow-xl border border-stone-200 hover:shadow-2xl transition-all w-full max-w-[280px]"
                  >
                    <div className="w-full aspect-square overflow-hidden bg-stone-100 rounded-xs mb-3 shadow-inner relative">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.contributor_name}
                          className="w-full h-full object-cover filter contrast-[1.03] group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-stone-50">
                          <Heart className="w-8 h-8 text-rose-400 mb-2 fill-rose-100" />
                          <p className="text-xs italic text-stone-600 line-clamp-3">
                            &ldquo;{item.message}&rdquo;
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-stone-900/80 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                          <ZoomIn className="w-3 h-3" /> Flip & Read
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-serif text-stone-800">
                      <span className="font-bold truncate max-w-[170px]">{item.contributor_name}</span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3D Flip Polaroid Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              className="relative max-w-md w-full perspective-1000"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-50 flex items-center gap-1 text-xs"
              >
                <X className="w-5 h-5" />
                <span>Close (Esc)</span>
              </button>

              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', damping: 20 }}
                className="w-full bg-white rounded-lg shadow-2xl p-5 pb-8 border border-stone-200 [transform-style:preserve-3d] relative"
              >
                {/* FRONT: The Photograph */}
                <div className={`space-y-4 ${isFlipped ? 'invisible' : 'visible'}`}>
                  <div className="w-full aspect-square rounded overflow-hidden bg-stone-100 shadow-inner">
                    {selectedItem.photo_url ? (
                      <img
                        src={selectedItem.photo_url}
                        alt={selectedItem.contributor_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rose-50 text-rose-500">
                        <Heart className="w-16 h-16 fill-rose-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-xs font-mono text-stone-400 block uppercase">FROM</span>
                      <h4 className="text-xl font-bold font-serif text-stone-900">{selectedItem.contributor_name}</h4>
                    </div>
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Flip to Read Message</span>
                    </button>
                  </div>
                </div>

                {/* BACK: The Handwritten Note (Rotated 180deg) */}
                <div
                  className={`absolute inset-0 p-6 flex flex-col justify-between bg-[#fbf7ee] rounded-lg [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                    isFlipped ? 'visible' : 'invisible'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center border-b border-stone-300 pb-2 mb-4">
                      <span className="font-mono text-xs text-amber-800 uppercase font-bold tracking-wider">
                        HANDWRITTEN NOTE
                      </span>
                      <span className="text-xs font-mono text-stone-500">
                        {new Date(selectedItem.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-stone-800 font-serif italic text-lg sm:text-xl leading-relaxed whitespace-pre-line">
                      &ldquo;{selectedItem.message}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-300 flex justify-between items-center">
                    <span className="font-serif font-bold text-stone-900 text-base">
                      — With love, {selectedItem.contributor_name}
                    </span>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Flip back
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
