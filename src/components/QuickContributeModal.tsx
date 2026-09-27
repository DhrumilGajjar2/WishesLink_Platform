'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wall } from '@/lib/types';
import { compressImage, formatBytes } from '@/components/ui/ImageCompressor';
import { fireCelebrationConfetti } from '@/components/ui/Confetti';
import { 
  X, 
  Camera, 
  UploadCloud, 
  Heart, 
  CheckCircle, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';

interface QuickContributeModalProps {
  wall: Wall;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickContributeModal: React.FC<QuickContributeModalProps> = ({
  wall,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [compressionStats, setCompressionStats] = useState<{ original: number; compressed: number } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Close on Escape key (Goal 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const processFile = async (file: File) => {
    try {
      setIsCompressing(true);
      setErrorMessage('');
      const result = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      setPhotoPreview(result.dataUrl);
      setPhotoBlob(result.blob);
      setCompressionStats({ original: result.originalSize, compressed: result.compressedSize });
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not process photo. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoBlob(null);
    setCompressionStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write a short message or wish.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      let res: Response;
      if (photoBlob) {
        const formData = new FormData();
        formData.append('contributor_name', name.trim());
        formData.append('message', message.trim());
        formData.append('photo', photoBlob, 'photo.jpg');

        res = await fetch(`/api/walls/${wall.share_slug}/contribute`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`/api/walls/${wall.share_slug}/contribute`, {
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
        setIsSubmitted(true);
        fireCelebrationConfetti();
        setTimeout(() => {
          onSuccess();
          onClose();
          setIsSubmitted(false);
          setName('');
          setMessage('');
          handleRemovePhoto();
        }, 1800);
      } else {
        setErrorMessage(data.error || 'Failed to submit wish.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose} // Goal 3: Click outside to close
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden relative my-auto font-sans"
          onClick={(e) => e.stopPropagation()} // Prevent close on modal card click
        >
          {/* Header */}
          <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                NO SIGNUP NEEDED
              </span>
              <h3 className="text-xl font-bold tracking-tight">
                Add Wish for {wall.recipient_name || wall.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition flex items-center gap-1 text-xs"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
              <span className="sr-only sm:not-sr-only text-[11px] font-medium pr-1">Close</span>
            </button>
          </div>

          {/* Form or Success */}
          {isSubmitted ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-stone-900 mb-1">Wish Added! 🎉</h4>
              <p className="text-stone-600 text-sm">
                Revealing your story on the wishing wall now...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-stone-700 mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aunt Sarah, David, High School Crew"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-stone-900"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-stone-700 mb-1">
                  Your Message / Memory <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a favorite memory, inside joke, or heartfelt milestone wish..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-stone-900 leading-relaxed"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-stone-700 mb-1">
                  Photo <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>

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
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 p-2 flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Upload preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate">Photo selected</p>
                      {compressionStats && (
                        <p className="text-[11px] font-mono text-emerald-600">
                          {formatBytes(compressionStats.original)} ➔ {formatBytes(compressionStats.compressed)}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 border border-dashed border-stone-300 hover:border-amber-500 bg-stone-50 rounded-xl text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5 transition"
                    >
                      <UploadCloud className="w-4 h-4 text-stone-400" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-2.5 px-3 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 rounded-xl text-xs font-medium text-amber-900 flex items-center gap-1.5 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">Camera</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit & Cancel Buttons (Goal 3) */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <span>Post Wish to Wall</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
