'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OccasionType, ThemeType, Wall } from '@/lib/types';
import { THEME_REGISTRY } from '@/components/themes/ThemeInterface';
import { compressImage, formatBytes } from '@/components/ui/ImageCompressor';
import { ShareLaunchModal } from '@/components/ShareLaunchModal';
import { QuickContributeModal } from '@/components/QuickContributeModal';
import { 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Heart, 
  UploadCloud, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle,
  Eye,
  Send
} from 'lucide-react';

const OCCASIONS: { id: OccasionType; label: string; icon: string; defaultWish: string }[] = [
  { id: 'birthday', label: 'Birthday', icon: '🎂', defaultWish: 'Wishing you the happiest birthday filled with joy and love!' },
  { id: 'farewell', label: 'Farewell / New Job', icon: '✈️', defaultWish: 'Best of luck on your exciting new journey! We will miss you tremendously.' },
  { id: 'anniversary', label: 'Anniversary', icon: '💍', defaultWish: 'Congratulations on this beautiful milestone of love and partnership!' },
  { id: 'wedding', label: 'Wedding', icon: '💐', defaultWish: 'Wishing you both a lifetime of happiness, laughter, and endless adventures together.' },
  { id: 'baby_shower', label: 'Baby Shower', icon: '🍼', defaultWish: 'So thrilled for the arrival of your sweet little bundle of joy!' },
  { id: 'appreciation', label: 'Team Kudos / Thank You', icon: '🌟', defaultWish: 'Thank you for your incredible dedication and inspiring positivity!' },
  { id: 'other', label: 'Other Milestone', icon: '🎉', defaultWish: 'Cheers to celebrating this incredible moment with you!' },
];

export default function HomePage() {
  const router = useRouter();

  // Form States
  const [recipientName, setRecipientName] = useState('');
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState<OccasionType>('birthday');
  const [theme, setTheme] = useState<ThemeType>('newspaper');
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [coverPhotoBlob, setCoverPhotoBlob] = useState<Blob | null>(null);
  const [coverPhotoStats, setCoverPhotoStats] = useState<{ original: number; compressed: number } | null>(null);
  const [organizerWish, setOrganizerWish] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [revealDate, setRevealDate] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Post-Creation Success Modal
  const [createdWall, setCreatedWall] = useState<Wall | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-generate title when recipient changes if not manually set
  const handleRecipientChange = (nameVal: string) => {
    setRecipientName(nameVal);
    if (!title || title.includes("'s ") || title.includes("Birthday") || title.includes("Farewell")) {
      const occLabel = OCCASIONS.find(o => o.id === occasion)?.label.split('/')[0].trim() || 'Celebration';
      setTitle(`${nameVal ? nameVal + "'s" : "Someone's"} ${occLabel}`);
    }
  };

  const handleOccasionSelect = (occ: OccasionType) => {
    setOccasion(occ);
    const occObj = OCCASIONS.find(o => o.id === occ);
    const occLabel = occObj?.label.split('/')[0].trim() || 'Celebration';
    if (recipientName) {
      setTitle(`${recipientName}'s ${occLabel}`);
    }
    if (!organizerWish) {
      setOrganizerWish(occObj?.defaultWish || '');
    }
  };

  const processCoverPhoto = async (file: File) => {
    try {
      setIsCompressingPhoto(true);
      setErrorMessage('');
      const result = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      setCoverPhotoPreview(result.dataUrl);
      setCoverPhotoBlob(result.blob);
      setCoverPhotoStats({ original: result.originalSize, compressed: result.compressedSize });
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not process photo. Please choose another.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const removeCoverPhoto = () => {
    setCoverPhotoPreview(null);
    setCoverPhotoBlob(null);
    setCoverPhotoStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleCreateWall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setErrorMessage('Please enter the name of the person you are celebrating.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const wallTitle = title.trim() || `${recipientName.trim()}'s Celebration`;

      const res = await fetch('/api/walls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wallTitle,
          recipient_name: recipientName.trim(),
          occasion_type: occasion,
          theme,
          cover_photo_base64: coverPhotoPreview || '',
          organizer_message: organizerWish.trim(),
          organizer_name: organizerName.trim() || 'Organizer',
          reveal_date: revealDate || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.wall) {
        setCreatedWall(data.wall);
        setIsShareModalOpen(true);
      } else {
        setErrorMessage(data.error || 'Failed to create wishing wall.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-serif font-black text-xl shadow-xs">
            W
          </div>
          <div>
            <span className="font-bold text-base tracking-tight block leading-tight">Digital Wishing Wall</span>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Interactive Group Keepsakes</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#demo-showcase"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition hidden sm:inline-block"
          >
            Preview Demos
          </a>
          <a
            href="#create-form"
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Free Wall</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 px-4 sm:px-8 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border border-amber-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Never An Empty Wall • Zero Signup For Loved Ones</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-950 font-serif leading-[1.1] mb-4">
            Surprise someone special with a <br className="hidden sm:inline" />
            <span className="italic bg-gradient-to-r from-red-700 via-amber-700 to-indigo-800 bg-clip-text text-transparent">
              living memory reveal.
            </span>
          </h1>

          <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Upload their photo, pick an interactive theme (Vintage Newspaper, Scratch Card, or Magazine), and send the link to friends on WhatsApp. Friends tap and add photos in 30 seconds with no signup!
          </p>

          <a
            href="#create-form"
            className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-amber-400 font-bold px-7 py-3.5 rounded-2xl shadow-xl transition-all hover:scale-105 text-sm"
          >
            <Heart className="w-4 h-4 fill-amber-400" />
            <span>Build Wishing Wall in 1 Minute</span>
          </a>
        </motion.div>
      </section>

      {/* The 3-Step Create-Wall Form */}
      <section id="create-form" className="py-8 px-4 sm:px-8 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-2xl">
          <div className="border-b border-stone-200 pb-5 mb-6 text-center sm:text-left">
            <span className="font-mono text-xs font-bold text-amber-700 uppercase tracking-widest">
              STEP-BY-STEP SETUP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-stone-950 mt-1">
              Create Your Wishing Wall
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Upload their photo first so the wall is already gorgeous before you share it!
            </p>
          </div>

          <form onSubmit={handleCreateWall} className="space-y-6">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Who are we celebrating? */}
            <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-stone-900">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-xs">1</span>
                <span>Who Are We Celebrating?</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Their Name / Nickname <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => handleRecipientChange(e.target.value)}
                    placeholder="e.g. Arthur, Sarah, Grandpa Joe, Maya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Wall Headline / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Arthur's 80th Jubilee Edition"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium text-stone-900 bg-white"
                  />
                </div>
              </div>

              {/* Occasion Pickers */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pick Occasion
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => handleOccasionSelect(occ.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                        occasion === occ.id
                          ? 'border-amber-500 bg-amber-100 text-amber-950 ring-2 ring-amber-400/50'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <span>{occ.icon}</span>
                      <span className="truncate">{occ.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Upload Photo of the Person & Your Opening Wish */}
            <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-stone-900">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-xs">2</span>
                <span>Their Photo & Your Opening Wish</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Upload Photo of {recipientName || 'The Person'}
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) processCoverPhoto(e.target.files[0]);
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) processCoverPhoto(e.target.files[0]);
                    }}
                  />

                  {coverPhotoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-white p-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/5">
                        <img src={coverPhotoPreview} alt="Cover preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeCoverPhoto}
                          className="absolute top-2 right-2 bg-stone-900/80 text-white p-1.5 rounded-full hover:bg-stone-900 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {coverPhotoStats && (
                        <p className="text-[10px] font-mono text-emerald-600 text-center mt-1">
                          Compressed {formatBytes(coverPhotoStats.original)} ➔ {formatBytes(coverPhotoStats.compressed)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-5 text-center bg-white hover:border-amber-400 transition">
                      {isCompressingPhoto ? (
                        <div className="py-4">
                          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                          <p className="text-[11px] font-mono text-stone-500">Compressing photo...</p>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-7 h-7 text-stone-400 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-stone-800 mb-2">
                            Select or snap their photo
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium"
                            >
                              Choose File
                            </button>
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-medium"
                            >
                              Camera
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Opening Wish */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Opening Wish / Memory
                    </label>
                    <textarea
                      rows={3}
                      value={organizerWish}
                      onChange={(e) => setOrganizerWish(e.target.value)}
                      placeholder="e.g. Dad, 80 years of legendary wisdom and hilarious jokes. Here is our tribute to you!"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-stone-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Name <span className="text-stone-400 font-normal lowercase">(Organizer)</span>
                    </label>
                    <input
                      type="text"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder="e.g. Sarah & The Family"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-stone-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Pick Interactive Reveal Theme */}
            <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-xs">3</span>
                  <span>Choose Interactive Reveal Theme</span>
                </div>
                <span className="text-[11px] font-mono text-stone-500">Live preview enabled</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(THEME_REGISTRY) as ThemeType[]).map((tKey) => {
                  const meta = THEME_REGISTRY[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <div
                      key={tKey}
                      onClick={() => setTheme(tKey)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-stone-950 bg-white shadow-md ring-2 ring-amber-400/40'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meta.icon}</span>
                          <span className="font-bold text-xs text-stone-950">{meta.name}</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          {meta.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-snug mb-2">
                        {meta.description}
                      </p>
                      <div className="text-[10px] font-mono font-bold text-amber-800">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Reveal Date */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Optional Secret Reveal Date <span className="text-stone-400 font-normal lowercase">(leave empty to reveal immediately)</span>
                </label>
                <input
                  type="date"
                  value={revealDate}
                  onChange={(e) => setRevealDate(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isCompressingPhoto}
              className="w-full bg-stone-950 hover:bg-stone-800 disabled:opacity-50 text-amber-400 font-bold py-4 px-6 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Preparing wishing wall...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create Wall & Get Shareable Link</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Pre-filled Demos Showcase */}
      <section id="demo-showcase" className="py-14 bg-stone-100/80 border-y border-stone-200 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-mono text-xs text-amber-700 uppercase tracking-widest font-bold bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/60">
              READY-TO-TEST SAMPLES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 font-serif mt-2">
              Explore How Loved Ones Experience It
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto mt-1.5">
              Click any live interactive demo below to see the animations, sound effects, and clean recipient reveals in action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Demo 1: Newspaper */}
            <div className="bg-[#fbf7ee] rounded-3xl p-6 border-4 border-stone-800 shadow-xl flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-600 block font-bold mb-1">
                  📰 THEME 1: VINTAGE GAZETTE
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-950 mb-2">
                  Arthur&apos;s 80th Jubilee Edition
                </h3>
                <p className="text-stone-700 text-xs sm:text-sm font-serif leading-relaxed mb-4">
                  Broadsheet arrives folded in quarters. Tap to trigger 3D unfolding with celebratory confetti, revealing lead front-page story, archive photo clippings, and press stamps.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-stone-500">5 Stories • Preloaded</span>
                <div className="flex gap-2">
                  <Link
                    href="/wall/arthur-80th-birthday/gift"
                    className="bg-stone-900 hover:bg-stone-800 text-amber-100 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <span>🎁 Gift Reveal</span>
                  </Link>
                  <Link
                    href="/wall/arthur-80th-birthday"
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <span>Full Wall</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Demo 2: Scratch Card */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col justify-between text-white hover:border-amber-400/50 transition">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block font-bold mb-1">
                  ✨ THEME 2: SCRATCH & REVEAL
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                  Sarah&apos;s Epic Farewell Tour
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                  Each wish is hidden under interactive metallic foil. Touch & swipe or drag to scratch off the foil with realistic sound effects and progress tracking!
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-400">4 Scratch Cards • Preloaded</span>
                <div className="flex gap-2">
                  <Link
                    href="/wall/sarah-farewell-2025/gift"
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <span>🎁 Gift Reveal</span>
                  </Link>
                  <Link
                    href="/wall/sarah-farewell-2025"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <span>Full Wall</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Demo 3: Polaroid Clothesline */}
            <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl p-6 border-2 border-amber-300/80 shadow-xl flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-800 block font-bold mb-1">
                  📸 THEME 3: POLAROID CLOTHESLINE
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-950 mb-2">
                  Maya&apos;s Graduation Memories
                </h3>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-4">
                  Twinkling fairy lights with wooden clothespins holding real polaroids that sway in the breeze. Click any polaroid to unclip and flip to read the handwritten note!
                </p>
              </div>

              <div className="pt-4 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-stone-500">4 Polaroids • Preloaded</span>
                <div className="flex gap-2">
                  <Link
                    href="/wall/maya-graduation-memories/gift"
                    className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <span>🎁 Gift Reveal</span>
                  </Link>
                  <Link
                    href="/wall/maya-graduation-memories"
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <span>Full Wall</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Demo 4: Sky Lanterns */}
            <div className="bg-[#060918] rounded-3xl p-6 border border-indigo-900/80 shadow-xl flex flex-col justify-between text-white hover:border-amber-400/40 transition">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-300 block font-bold mb-1">
                  🏮 THEME 4: FLOATING SKY LANTERNS
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-white mb-2">
                  Lanterns for Liam & Noah
                </h3>
                <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed mb-4">
                  A starlit night sky with warm lanterns floating gently into the night. Tap any lantern to bring it forward with a glowing aura and read the anniversary tribute.
                </p>
              </div>

              <div className="pt-4 border-t border-indigo-950 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-amber-300/60">3 Lanterns • Preloaded</span>
                <div className="flex gap-2">
                  <Link
                    href="/wall/liam-noah-anniversary/gift"
                    className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <span>🎁 Gift Reveal</span>
                  </Link>
                  <Link
                    href="/wall/liam-noah-anniversary"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <span>Full Wall</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto mb-2.5">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Zero-Friction for Loved Ones</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No account creation or passwords. Mobile camera integration and instant client-side photo compression.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 bg-rose-100 text-rose-800 rounded-xl flex items-center justify-center mx-auto mb-2.5">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Emotional Reveal</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Newspaper broadsheet unfolding, interactive metallic scratch foil, and celebration confetti.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Instant Share & WhatsApp Ready</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Get an instant invite link formatted with pre-written text ready to drop in group chats.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-stone-200 text-center font-mono text-xs text-stone-500">
        <p>Digital Wishing Wall • Built with Next.js, Tailwind CSS & Framer Motion</p>
      </footer>

      {/* Share Launchpad Modal upon creation */}
      {createdWall && (
        <ShareLaunchModal
          wall={createdWall}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onQuickAdd={() => setIsQuickAddOpen(true)}
        />
      )}

      {/* Quick Contribute Modal for organizer */}
      {createdWall && (
        <QuickContributeModal
          wall={createdWall}
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={() => {
            router.push(`/wall/${createdWall.share_slug}`);
          }}
        />
      )}
    </div>
  );
}
