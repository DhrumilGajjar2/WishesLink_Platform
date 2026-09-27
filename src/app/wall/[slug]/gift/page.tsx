'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WallWithContributions, ThemeType } from '@/lib/types';
import { THEME_REGISTRY } from '@/components/themes/ThemeInterface';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { 
  Heart, 
  Sparkles, 
  Lock, 
  Printer, 
  Share2, 
  Home, 
  Gift 
} from 'lucide-react';

export default function GiftRevealPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [wallData, setWallData] = useState<WallWithContributions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWall = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/walls/${slug}`);
      const data = await res.json();
      if (data.success && data.wall) {
        setWallData(data.wall);
      } else {
        setError(data.error || 'Wishing Wall not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load wishing wall');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchWall();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-stone-200 font-sans">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm tracking-widest uppercase">Opening Your Gift...</p>
      </div>
    );
  }

  if (error || !wallData) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-stone-800 border border-stone-700 p-8 rounded-2xl max-w-md w-full text-center text-stone-200">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Gift Not Found</h2>
          <p className="text-stone-400 text-sm mb-6">
            The celebration link could not be located.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-300 transition text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Check reveal date
  const isFutureReveal = wallData.reveal_date
    ? new Date(wallData.reveal_date).getTime() > Date.now()
    : false;

  const recipientName = wallData.recipient_name || wallData.title;
  const themeKey = wallData.theme || 'newspaper';
  const themeMeta = THEME_REGISTRY[themeKey] || THEME_REGISTRY['newspaper'];
  const ThemeComponent = themeMeta.component;

  const getPageBgClass = () => {
    switch (themeKey) {
      case 'newspaper':
        return 'bg-[#efe6d5] text-stone-900';
      case 'scratch_card':
        return 'bg-[#090d16] text-white';
      case 'clothesline':
        return 'bg-[#faf6ee] text-stone-900';
      case 'sky_lanterns':
        return 'bg-[#050814] text-white';
      case 'magazine':
        return 'bg-[#faf5f0] text-stone-900';
      case 'envelope':
        return 'bg-[#f4ebe1] text-stone-900';
      default:
        return 'bg-stone-100 text-stone-900';
    }
  };

  return (
    <div className={`min-h-screen ${getPageBgClass()} transition-colors duration-500 pb-12 font-sans`}>
      {/* Elegant Gift Header Banner */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 text-white py-3 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-white block leading-tight">
                A Surprise Gift for {recipientName}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                Created with love by your family & friends
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fireCelebrationConfetti();
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confetti!</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Gift link copied to clipboard!');
              }}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Gift Container */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {isFutureReveal ? (
          /* Sealed until Reveal Date */
          <div className="max-w-xl mx-auto my-12 bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-stone-200 text-center text-stone-900">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-stone-500 font-semibold">
              SURPRISE GIFT LOCKED
            </span>
            <h1 className="text-3xl font-extrabold mt-2 mb-3">
              Dear {recipientName},
            </h1>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              Your loved ones have prepared a special celebration gift for you! It will unlock and reveal all their secret photos and messages on:
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
              <span className="text-lg font-bold text-rose-950 font-serif block">
                {new Date(wallData.reveal_date!).toLocaleDateString(undefined, { dateStyle: 'full' })}
              </span>
              <span className="text-xs font-mono text-rose-600 mt-1 block">
                {wallData.contributions.length} secret wishes & photos waiting for you!
              </span>
            </div>
          </div>
        ) : (
          /* Pure Theme Presentation — No Add Wish, No Contributor clutter */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeComponent
              wall={wallData}
              contributions={wallData.contributions}
              isRevealed={false}
              // Notice: onAddWish is omitted in Gift Reveal Mode so no contributor CTAs appear!
            />
          </motion.div>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="mt-8 text-center text-xs font-mono text-stone-500">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for {recipientName}
        </p>
      </footer>
    </div>
  );
}
