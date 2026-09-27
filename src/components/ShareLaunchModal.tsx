'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Wall } from '@/lib/types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  PlusCircle, 
  Eye, 
  Send,
  Gift,
  Users,
  X,
  ArrowLeft
} from 'lucide-react';

interface ShareLaunchModalProps {
  wall: Wall;
  isOpen: boolean;
  onClose: () => void;
  onQuickAdd: () => void;
}

export const ShareLaunchModal: React.FC<ShareLaunchModalProps> = ({
  wall,
  isOpen,
  onClose,
  onQuickAdd,
}) => {
  const [activeTab, setActiveTab] = useState<'contributors' | 'recipient'>('contributors');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

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

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const contributeUrl = `${origin}/wall/${wall.share_slug}/contribute`;
  const giftUrl = `${origin}/wall/${wall.share_slug}/gift`;

  const recipientName = wall.recipient_name || 'our friend';

  const contributorInviteMessage = `Hey everyone! I set up a secret digital wishing wall for ${recipientName}! 🎂✨

Click here to add your photo and a quick memory/wish (takes 30 seconds, no signup needed):
${contributeUrl}`;

  const recipientGiftMessage = `Happy ${wall.occasion_type || 'celebration'}, ${recipientName}! 🎁✨

Your friends and family put together a secret digital wishing wall filled with memories and photos just for you! Open your gift here:
${giftUrl}`;

  const currentUrl = activeTab === 'contributors' ? contributeUrl : giftUrl;
  const currentMessage = activeTab === 'contributors' ? contributorInviteMessage : recipientGiftMessage;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentMessage)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose} // Goal 3: Click outside/backdrop to close
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden relative font-sans my-auto"
          onClick={(e) => e.stopPropagation()} // Prevent close on modal card click
        >
          {/* Top-Right Prominent Close Button (Goal 3) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition flex items-center gap-1 text-xs"
            title="Close this popup (Esc)"
          >
            <X className="w-5 h-5" />
            <span className="sr-only sm:not-sr-only text-[11px] font-medium pr-1">Close</span>
          </button>

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-stone-950 via-indigo-950 to-stone-900 p-6 sm:p-8 text-white text-center relative overflow-hidden">
            <div className="w-14 h-14 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold block mb-1">
              WISHING WALL READY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight pr-6">
              {wall.title}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
              Choose who you want to share with: friends to collect wishes, or {recipientName} to reveal their gift!
            </p>
          </div>

          {/* Audience Tabs: Friends vs Recipient */}
          <div className="p-3.5 bg-stone-100 border-b border-stone-200 flex gap-2">
            <button
              onClick={() => setActiveTab('contributors')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'contributors'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>1. For Friends (Upload Link)</span>
            </button>

            <button
              onClick={() => setActiveTab('recipient')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'recipient'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              <span>2. For {recipientName} (Gift Link)</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {activeTab === 'contributors' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 leading-relaxed">
                <strong>Send this to friends & family</strong> before the celebration so they can add photos and heartfelt wishes!
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-950 leading-relaxed">
                <strong>Send this to {recipientName} on their special day!</strong> It reveals their ready theme with zero &ldquo;Add Wish&rdquo; buttons or clutter.
              </div>
            )}

            {/* 1-Click WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm ${
                activeTab === 'contributors' ? 'bg-[#25D366] hover:bg-[#20ba59]' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {activeTab === 'contributors' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Share with Friends on WhatsApp</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>Send Surprise Gift to {recipientName}</span>
                </>
              )}
            </a>

            {/* Link Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
              <span className="text-[11px] font-mono uppercase font-bold text-stone-600 block mb-1.5">
                {activeTab === 'contributors' ? 'CONTRIBUTOR UPLOAD LINK' : `GIFT REVEAL LINK FOR ${recipientName.toUpperCase()}`}
              </span>
              <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl p-2">
                <span className="text-xs font-mono text-stone-700 truncate flex-1 select-all">
                  {currentUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-stone-200 text-xs">
                <button
                  onClick={handleCopyInvite}
                  className="text-stone-600 hover:text-stone-950 font-medium underline flex items-center gap-1"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInvite ? 'Copied Full Message!' : 'Copy Full Message Text'}</span>
                </button>
                <Link
                  href={currentUrl}
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Actions & Prominent Close Button (Goal 3) */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onQuickAdd();
                }}
                className="flex-1 py-3 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Add Another Wish</span>
              </button>

              <Link
                href={giftUrl}
                className="flex-1 py-3 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>View Gift Page</span>
              </Link>

              <button
                onClick={onClose}
                className="py-3 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
