'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Wall } from '@/lib/types';
import { compressImage, formatBytes } from '@/components/ui/ImageCompressor';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  ArrowLeft, 
  Trash2, 
  Heart, 
  Eye, 
  Share2, 
  AlertCircle 
} from 'lucide-react';

export default function ContributePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [wall, setWall] = useState<Wall | null>(null);
  const [loadingWall, setLoadingWall] = useState(true);
  const [wallError, setWallError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [compressionStats, setCompressionStats] = useState<{ original: number; compressed: number } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch wall metadata
  useEffect(() => {
    async function loadWall() {
      try {
        setLoadingWall(true);
        const res = await fetch(`/api/walls/${slug}`);
        const data = await res.json();
        if (data.success && data.wall) {
          setWall(data.wall);
        } else {
          setWallError(data.error || 'Wishing Wall not found');
        }
      } catch (err: any) {
        setWallError(err.message || 'Failed to load wishing wall');
      } finally {
        setLoadingWall(false);
      }
    }
    if (slug) {
      loadWall();
    }
  }, [slug]);

  // Handle image selection and client-side compression
  const processImageFile = async (file: File) => {
    try {
      setIsCompressing(true);
      setErrorMessage('');

      const result = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });

      setPhotoPreview(result.dataUrl);
      setPhotoBlob(result.blob);
      setCompressionStats({
        original: result.originalSize,
        compressed: result.compressedSize,
      });
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setErrorMessage('Could not process this image. Please try another photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoBlob(null);
    setCompressionStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Submit contribution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name or relationship.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write a short message or wish.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Send form data or base64
      let res: Response;
      if (photoBlob) {
        const formData = new FormData();
        formData.append('contributor_name', name.trim());
        formData.append('message', message.trim());
        formData.append('photo', photoBlob, 'photo.jpg');

        res = await fetch(`/api/walls/${slug}/contribute`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`/api/walls/${slug}/contribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contributor_name: name.trim(),
            message: message.trim(),
            photo_url: '',
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        fireCelebrationConfetti();
      } else {
        setErrorMessage(data.error || 'Failed to submit wish. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingWall) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium">Opening Wishing Wall...</p>
        </div>
      </div>
    );
  }

  if (wallError || !wall) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-stone-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Wall Not Found</h2>
          <p className="text-stone-600 text-sm mb-6">
            The link you followed may be incorrect or the wishing wall has expired.
          </p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition"
          >
            Create Your Own Wall
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/wall/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Wishing Wall</span>
          </Link>
          <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            Occasion: {wall.occasion_type}
          </span>
        </div>

        {/* Success Card */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-stone-200 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                Wish Added With Love!
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mb-6 leading-relaxed">
                Thank you, <strong>{name}</strong>! Your tribute is now part of{' '}
                <strong>{wall.title}</strong>.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/wall/${slug}`}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>See Your Story on the Wall</span>
                </Link>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setName('');
                    setMessage('');
                    removePhoto();
                  }}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-3 rounded-xl transition"
                >
                  Add Another Photo / Memory
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/wall/${slug}/contribute`);
                    alert('Contribution link copied! Send it to more friends.');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline mt-2 flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Contributor Link for Friends</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Contribution Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden"
            >
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-stone-900 to-indigo-950 p-6 sm:p-8 text-white">
                <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  No Signup Required
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Leave a Wish for {wall.title}
                </h1>
                {wall.description && (
                  <p className="text-stone-300 text-sm mt-2 leading-relaxed">
                    {wall.description}
                  </p>
                )}
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                    Your Name / Who is this from? <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grandma Elena, Alex & Sarah, The Marketing Team"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 placeholder-stone-400 text-sm font-medium"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                    Your Message / Memory <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a sweet memory, hilarious inside joke, or heartfelt milestone congratulations..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 placeholder-stone-400 text-sm leading-relaxed"
                  />
                  <div className="text-right text-[11px] text-stone-400 mt-1">
                    {message.length} characters
                  </div>
                </div>

                {/* Photo Upload with Mobile-first Compression */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-stone-700 mb-1.5">
                    Attach a Photo <span className="text-stone-400 font-normal lowercase">(optional but loved!)</span>
                  </label>

                  {/* Hidden inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 p-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/5">
                        <img
                          src={photoPreview}
                          alt="Upload preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-900 text-white p-2 rounded-full backdrop-blur-xs transition shadow-md"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Compression stats pill */}
                      {compressionStats && (
                        <div className="mt-2 text-center text-xs font-mono text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            Optimized for fast mobile load: {formatBytes(compressionStats.original)} ➔ {formatBytes(compressionStats.compressed)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition bg-stone-50/50"
                    >
                      {isCompressing ? (
                        <div className="py-6">
                          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs font-mono text-stone-600">Compressing & optimizing image...</p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-stone-800 mb-1">
                            Drag & drop a photo here, or select below
                          </p>
                          <p className="text-xs text-stone-500 mb-4">
                            Accepts JPG, PNG, WebP, HEIC (iPhone photos auto-converted)
                          </p>

                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold shadow-xs transition"
                            >
                              Choose Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Take Photo</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting your memory...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                      <span>Submit Wish & Photo</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
