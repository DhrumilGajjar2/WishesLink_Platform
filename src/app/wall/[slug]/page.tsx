'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { WallWithContributions, ThemeType } from '@/lib/types';
import { THEME_REGISTRY } from '@/components/themes/ThemeInterface';
import { QuickContributeModal } from '@/components/QuickContributeModal';
import { ShareLaunchModal } from '@/components/ShareLaunchModal';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { 
  Sparkles, 
  Share2, 
  PlusCircle, 
  Layers, 
  Lock, 
  Unlock, 
  Check, 
  Home,
  Heart,
  Gift,
  Users,
  Eye
} from 'lucide-react';

export default function WallViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const initialMode = searchParams.get('mode') === 'gift' ? 'gift' : 'organizer';

  const [wallData, setWallData] = useState<WallWithContributions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTheme, setActiveTheme] = useState<ThemeType>('newspaper');
  const [viewMode, setViewMode] = useState<'organizer' | 'gift'>(initialMode);
  const [copied, setCopied] = useState(false);
  const [isOrganizerPreview, setIsOrganizerPreview] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchWall = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/walls/${slug}`);
      const data = await res.json();
      if (data.success && data.wall) {
        setWallData(data.wall);
        setActiveTheme(data.wall.theme || 'newspaper');
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
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-stone-200">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm tracking-widest uppercase">Opening Wishing Wall...</p>
      </div>
    );
  }

  if (error || !wallData) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-stone-800 border border-stone-700 p-8 rounded-2xl max-w-md w-full text-center text-stone-200">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Wall Not Found</h2>
          <p className="text-stone-400 text-sm mb-6">
            The wishing wall with slug &ldquo;{slug}&rdquo; could not be located.
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

  const isFutureReveal = wallData.reveal_date
    ? new Date(wallData.reveal_date).getTime() > Date.now()
    : false;

  const isLocked = isFutureReveal && !isOrganizerPreview;
  const themeMeta = THEME_REGISTRY[activeTheme] || THEME_REGISTRY['newspaper'];
  const ThemeComponent = themeMeta.component;
  const recipientName = wallData.recipient_name || wallData.title;

  const getPageBgClass = () => {
    switch (activeTheme) {
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
    <div className={`min-h-screen ${getPageBgClass()} transition-colors duration-500 pb-20 sm:pb-8 font-sans`}>
      {/* Top Floating Utility Bar */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 text-stone-200 py-2.5 px-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-stone-400 hover:text-white flex items-center gap-1 font-mono font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wishing Wall</span>
            </Link>
            <span className="text-stone-700">/</span>
            <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-xs">
              {recipientName}
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {wallData.contributions.length} wishes
            </span>
          </div>

          {/* View Mode Switcher: Organizer vs Recipient Gift Mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700 text-[11px]">
              <button
                onClick={() => setViewMode('organizer')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                  viewMode === 'organizer'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="View as organizer / contributor (shows upload buttons)"
              >
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">Organizer View</span>
              </button>
              <button
                onClick={() => setViewMode('gift')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                  viewMode === 'gift'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="View as recipient (clean gift reveal, no upload buttons)"
              >
                <Gift className="w-3 h-3 text-amber-300" />
                <span>Recipient Gift View</span>
              </button>
            </div>

            {/* Share Modal Trigger */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-lg transition"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Links</span>
            </button>

            {/* Add Wish button (only in organizer mode) */}
            {viewMode === 'organizer' && (
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Wish</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Recipient Gift Mode Banner if activated */}
      {viewMode === 'gift' && (
        <div className="bg-rose-600 text-white text-xs py-2 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2">
          <Gift className="w-3.5 h-3.5 text-amber-300" />
          <span>
            <strong>Recipient Gift Preview Mode:</strong> This is the clean, clutter-free reveal that {recipientName} sees!
          </span>
          <Link
            href={`/wall/${slug}/gift`}
            target="_blank"
            className="underline font-bold ml-1 hover:text-amber-200"
          >
            Open Dedicated Gift Link ↗
          </Link>
        </div>
      )}

      {/* Main Container */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {isLocked ? (
          /* Sealed State */
          <div className="max-w-xl mx-auto my-12 bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-stone-200 text-center text-stone-900">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-stone-500 font-semibold">
              WISHING WALL SEALED
            </span>
            <h1 className="text-3xl font-extrabold mt-2 mb-3">
              {wallData.title}
            </h1>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              This wishing wall will unlock and reveal all heartfelt contributions for <strong>{recipientName}</strong> on{' '}
              <strong>{new Date(wallData.reveal_date!).toLocaleDateString(undefined, { dateStyle: 'full' })}</strong>!
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Your Wish Before Reveal</span>
              </button>

              <button
                onClick={() => setIsOrganizerPreview(true)}
                className="text-xs text-stone-500 hover:text-stone-800 underline font-mono flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Organizer Override: Preview Early</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Theme Render */
          <div>
            <ThemeComponent
              wall={wallData}
              contributions={wallData.contributions}
              isRevealed={false}
              // Only pass onAddWish if in organizer mode; in gift mode it is omitted!
              onAddWish={viewMode === 'organizer' ? () => setIsQuickAddOpen(true) : undefined}
            />
          </div>
        )}
      </main>

      {/* Floating Sticky Mobile Action Bar (ONLY in Organizer Mode) */}
      {viewMode === 'organizer' && (
        <div className="sm:hidden fixed bottom-3 left-3 right-3 z-30">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-bold py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-sm border border-amber-300"
          >
            <Heart className="w-4 h-4 text-red-700 fill-red-700" />
            <span>Add Photo & Wish for {recipientName}</span>
          </motion.button>
        </div>
      )}

      {/* Inline Quick Contribute Modal */}
      <QuickContributeModal
        wall={wallData}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={fetchWall}
      />

      {/* Share Launch Modal */}
      <ShareLaunchModal
        wall={wallData}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onQuickAdd={() => setIsQuickAddOpen(true)}
      />
    </div>
  );
}
