'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProps, Contribution } from '@/lib/types';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { Newspaper, Sparkles, Printer, Share2, ZoomIn, X, Clock, PlusCircle } from 'lucide-react';

export const NewspaperTheme: React.FC<ThemeProps> = ({
  wall,
  contributions,
  isRevealed: initialRevealed,
  onReveal,
  onAddWish,
}) => {
  const [isUnfolded, setIsUnfolded] = useState(initialRevealed);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  // Close modal on Escape key (Goal 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedContribution(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUnfold = () => {
    setIsUnfolded(true);
    fireCelebrationConfetti();
    if (onReveal) onReveal();
  };

  const formattedDate = new Date(wall.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const leadStory = contributions[0];
  const otherStories = contributions.slice(1);
  const recipientName = wall.recipient_name || wall.title;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-3 sm:px-6 font-serif">
      <AnimatePresence mode="wait">
        {!isUnfolded ? (
          /* Folded Newspaper Cover State */
          <motion.div
            key="folded-cover"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              rotateX: -75,
              opacity: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="relative cursor-pointer group perspective-1000"
            onClick={handleUnfold}
          >
            <div className="bg-[#f5ece1] text-[#1c1917] p-6 sm:p-12 rounded-lg border-4 border-stone-800 shadow-2xl relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]">
              {/* Authentic Crease Shadows */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-b from-stone-400/40 via-stone-500/20 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-gradient-to-r from-stone-400/40 via-stone-500/20 to-transparent z-10 pointer-events-none" />

              {/* Vintage Rubber Stamp */}
              <div className="absolute top-8 right-8 rotate-[-12deg] border-4 border-red-800/80 text-red-800/80 px-3 py-1 font-mono text-xs font-black uppercase tracking-widest rounded-sm pointer-events-none select-none">
                HOT OFF THE PRESS ★ 100% EXCLUSIVE
              </div>

              <div className="text-center border-b-2 border-stone-800 pb-4 mb-6">
                <span className="text-[11px] sm:text-xs uppercase tracking-widest font-mono text-stone-600 block">
                  ★ SPECIAL EXTRA EDITION ★ CELEBRATING {recipientName.toUpperCase()} ★
                </span>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-2 uppercase font-serif">
                  The Daily Chronicle
                </h1>
                <div className="flex justify-between items-center text-[10px] sm:text-xs border-t border-b border-stone-400 py-1 mt-3 font-mono">
                  <span>SPECIAL TRIBUTE GAZETTE</span>
                  <span className="font-bold">{formattedDate}</span>
                  <span>PRICELESS COLLECTOR&apos;S ITEM</span>
                </div>
              </div>

              {/* Cover Photo / Hero Snapshot */}
              <div className="my-6 text-center">
                {wall.cover_photo_url && (
                  <div className="w-36 h-36 sm:w-48 sm:h-48 mx-auto rounded-full overflow-hidden border-4 border-stone-800 shadow-xl mb-4 bg-stone-200 ring-4 ring-amber-700/20">
                    <img
                      src={wall.cover_photo_url}
                      alt={recipientName}
                      className="w-full h-full object-cover filter contrast-[1.08] grayscale-[10%]"
                    />
                  </div>
                )}

                <div className="inline-block bg-red-800 text-amber-50 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider mb-3 animate-pulse">
                  BREAKING HEADLINE DISPATCH
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-stone-900 mb-3">
                  {wall.title}
                </h2>
                <p className="text-stone-700 max-w-xl mx-auto italic text-sm sm:text-base mb-6 leading-relaxed">
                  {wall.description || `Special commemorative dispatches and photographs compiled from loved ones to honor ${recipientName}.`}
                </p>

                <div className="relative inline-flex items-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-sans font-medium px-8 py-4 rounded-md shadow-xl group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-base sm:text-lg">Click to Unfold & Read Dispatches</span>
                  <span className="text-xs bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded-full ml-1 font-mono">
                    {contributions.length} Stories
                  </span>
                </div>
              </div>

              <div className="text-center font-mono text-[11px] text-stone-500 mt-4">
                Broadsheet is folded into quarters — Tap anywhere to unfold full paper
              </div>
            </div>
          </motion.div>
        ) : (
          /* Unfolded Full Newspaper Broadside */
          <motion.div
            key="unfolded-broadsheet"
            initial={{ opacity: 0, rotateX: 60, scale: 0.95 }}
            animate={{ opacity: 1, rotateX: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#fbf7ee] text-[#1c1917] p-4 sm:p-10 rounded-sm border-double border-4 border-stone-800 shadow-2xl relative"
          >
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-stone-300 font-sans text-xs gap-3">
              <div className="flex items-center gap-2 text-stone-600 font-mono">
                <Newspaper className="w-4 h-4 text-stone-800" />
                <span>UNFOLDED BROADSHEET • {contributions.length} DISPATCHES</span>
              </div>
              <div className="flex items-center gap-2">
                {onAddWish && (
                  <button
                    onClick={onAddWish}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded font-bold shadow-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Story</span>
                  </button>
                )}
                <button
                  onClick={() => setIsUnfolded(false)}
                  className="px-3 py-1.5 border border-stone-400 hover:border-stone-800 text-stone-700 hover:text-stone-900 rounded font-medium transition"
                >
                  Fold Paper
                </button>
                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-medium transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Wall link copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-medium transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Newspaper Masthead */}
            <header className="text-center pb-5 border-b-4 border-stone-900 mb-6 relative">
              {/* Authenticated Stamp */}
              <div className="hidden sm:block absolute top-0 right-4 rotate-[8deg] border-2 border-red-700/60 text-red-700/60 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xs pointer-events-none">
                VERIFIED ARCHIVE ★
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono tracking-widest text-stone-600 uppercase border-b border-stone-300 pb-1 mb-2">
                <span>The Community & Family Tribute</span>
                <span>Celebration Gazette</span>
                <span>Honorary Issue</span>
              </div>

              <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-stone-950 font-serif leading-none py-1">
                The Celebration Gazette
              </h1>

              <div className="flex justify-between items-center text-xs sm:text-sm font-mono border-y-2 border-stone-800 py-1.5 mt-3">
                <span className="font-semibold uppercase tracking-wider">HONORING: {recipientName}</span>
                <span className="italic">{formattedDate}</span>
                <span className="font-semibold uppercase">OCCASION: {wall.occasion_type}</span>
              </div>

              <div className="mt-4 bg-stone-900 text-amber-50 py-2 px-4 text-center">
                <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-wide font-serif">
                  {wall.title}
                </h2>
              </div>
              {wall.description && (
                <p className="text-xs sm:text-sm italic text-stone-700 mt-2 max-w-2xl mx-auto">
                  &ldquo;{wall.description}&rdquo;
                </p>
              )}
            </header>

            {/* Frontpage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Lead Headline Story */}
              {leadStory ? (
                <article className={`${otherStories.length > 0 ? 'md:col-span-7' : 'md:col-span-12'} border-b-2 md:border-b-0 md:border-r-2 border-stone-300 pr-0 md:pr-6 pb-6 md:pb-0`}>
                  <div className="inline-block bg-red-900 text-white font-mono text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider mb-2">
                    LEAD STORY • TOP DISPATCH
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2 font-serif text-stone-950">
                    A Loving Word from {leadStory.contributor_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-4 border-b border-stone-200 pb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>FILED ON {new Date(leadStory.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>CORRESPONDENT: {leadStory.contributor_name}</span>
                  </div>

                  {(leadStory.photo_url || wall.cover_photo_url) && (
                    <div 
                      className="relative group cursor-pointer overflow-hidden border-2 border-stone-800 bg-stone-100 mb-4 shadow-sm"
                      onClick={() => setSelectedContribution(leadStory)}
                    >
                      <img
                        src={leadStory.photo_url || wall.cover_photo_url}
                        alt={`Photo for ${recipientName}`}
                        className="w-full h-72 sm:h-96 object-cover filter contrast-[1.05] grayscale-[15%] group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-full text-xs font-sans">
                          <ZoomIn className="w-4 h-4" /> View Full Image
                        </span>
                      </div>
                      <div className="bg-stone-200/90 px-3 py-1.5 border-t border-stone-400 text-xs italic font-serif text-stone-700">
                        Featured photograph accompanying lead tribute for {recipientName}.
                      </div>
                    </div>
                  )}

                  <div className="text-stone-800 text-base leading-relaxed font-serif text-justify">
                    <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-stone-900 first-letter:font-serif whitespace-pre-line">
                      {leadStory.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-stone-400 flex justify-between items-center text-xs font-mono text-stone-600">
                    <span>— End of Transmission</span>
                    <span className="text-red-700 font-bold">♥ Verified Story</span>
                  </div>
                </article>
              ) : (
                <article className="md:col-span-12 py-12 text-center border-2 border-dashed border-stone-400 p-8">
                  {wall.cover_photo_url && (
                    <img
                      src={wall.cover_photo_url}
                      alt={recipientName}
                      className="w-40 h-40 object-cover rounded-full mx-auto border-4 border-stone-800 mb-4 shadow-lg"
                    />
                  )}
                  <h3 className="text-2xl font-bold font-serif mb-2">
                    The Press Is Waiting for Your Story!
                  </h3>
                  <p className="text-stone-700 max-w-md mx-auto text-sm font-sans mb-4">
                    Be the very first correspondent to file a photo and wish in honor of {recipientName}.
                  </p>
                  {onAddWish && (
                    <button
                      onClick={onAddWish}
                      className="bg-stone-900 hover:bg-stone-800 text-amber-100 font-sans font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-md"
                    >
                      File First Dispatch
                    </button>
                  )}
                </article>
              )}

              {/* Secondary Column Stories */}
              {otherStories.length > 0 && (
                <div className="md:col-span-5 flex flex-col gap-6">
                  <div className="border-b-2 border-stone-800 pb-1 mb-1">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-stone-700">
                      CORRESPONDENCE & TRIBUTES
                    </span>
                  </div>

                  {otherStories.map((story) => (
                    <article 
                      key={story.id} 
                      className="border-b border-stone-300 pb-5 last:border-b-0 hover:bg-stone-100/60 p-2 rounded transition cursor-pointer"
                      onClick={() => setSelectedContribution(story)}
                    >
                      <h4 className="text-lg sm:text-xl font-bold leading-snug font-serif text-stone-900 mb-1">
                        A Word from {story.contributor_name}
                      </h4>
                      <div className="text-[11px] font-mono text-stone-500 mb-2">
                        Filed {new Date(story.created_at).toLocaleDateString()}
                      </div>

                      {story.photo_url && (
                        <div className="relative group border border-stone-600 mb-3 overflow-hidden shadow-xs">
                          <img
                            src={story.photo_url}
                            alt={story.contributor_name}
                            className="w-full h-44 object-cover filter contrast-[1.05] grayscale-[10%] group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-1 right-1 bg-stone-900/80 text-white p-1 rounded">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      <p className="text-sm font-serif text-stone-800 leading-relaxed italic border-l-2 border-stone-400 pl-3 line-clamp-4">
                        &ldquo;{story.message}&rdquo;
                      </p>
                      <div className="text-right text-xs font-mono font-semibold text-stone-700 mt-2">
                        — {story.contributor_name}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Newspaper Footer */}
            <footer className="mt-10 pt-4 border-t-4 border-stone-900 text-center font-mono text-xs text-stone-600 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span>PUBLISHED FOR {recipientName.toUpperCase()}</span>
              <span className="italic font-serif">&ldquo;Cherished memories captured in print&rdquo;</span>
              <span>SPECIAL EDITION</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo / Story Detail Modal with Close & Escape Handling (Goal 3) */}
      <AnimatePresence>
        {selectedContribution && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
            onClick={() => setSelectedContribution(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#fbf7ee] text-stone-900 border-2 border-stone-800 max-w-2xl w-full rounded-lg overflow-hidden shadow-2xl p-6 font-serif relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prominent Close Button */}
              <button
                onClick={() => setSelectedContribution(null)}
                className="absolute top-4 right-4 text-stone-600 hover:text-stone-950 p-1.5 rounded-full hover:bg-stone-200 transition font-sans flex items-center gap-1 text-xs"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">Close</span>
              </button>

              <div className="border-b border-stone-300 pb-3 mb-4 pr-16">
                <span className="font-mono text-xs text-red-800 uppercase tracking-widest block font-bold">
                  PHOTOGRAPHIC ARCHIVE
                </span>
                <h3 className="text-2xl font-bold font-serif text-stone-950 mt-1">
                  Dispatch by {selectedContribution.contributor_name}
                </h3>
                <span className="text-xs font-mono text-stone-500">
                  {new Date(selectedContribution.created_at).toLocaleString()}
                </span>
              </div>

              {selectedContribution.photo_url && (
                <div className="border-4 border-stone-200 shadow-inner mb-4 overflow-hidden rounded bg-stone-100">
                  <img
                    src={selectedContribution.photo_url}
                    alt={selectedContribution.contributor_name}
                    className="w-full max-h-[50vh] object-contain mx-auto"
                  />
                </div>
              )}

              <div className="bg-stone-100 p-4 border-l-4 border-stone-800 rounded-r mb-4">
                <p className="text-stone-800 text-base italic leading-relaxed whitespace-pre-line">
                  &ldquo;{selectedContribution.message}&rdquo;
                </p>
                <div className="mt-2 text-right font-mono text-xs font-bold text-stone-700">
                  Signed, {selectedContribution.contributor_name}
                </div>
              </div>

              {/* Bottom Done button */}
              <div className="text-right pt-2 border-t border-stone-300">
                <button
                  onClick={() => setSelectedContribution(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-sans font-medium"
                >
                  Done / Back to Paper
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
