import React from 'react';
import { ThemeProps, ThemeType } from '@/lib/types';
import { NewspaperTheme } from './NewspaperTheme';
import { ScratchCardTheme } from './ScratchCardTheme';
import { MagazineTheme } from './MagazineTheme';
import { EnvelopeTheme } from './EnvelopeTheme';
import { ClotheslineTheme } from './ClotheslineTheme';
import { LanternsTheme } from './LanternsTheme';

export type ThemeComponent = React.ComponentType<ThemeProps>;

export interface ThemeMeta {
  id: ThemeType;
  name: string;
  description: string;
  badge: string;
  icon: string;
  previewBg: string;
  component: ThemeComponent;
}

export const THEME_REGISTRY: Record<ThemeType, ThemeMeta> = {
  newspaper: {
    id: 'newspaper',
    name: 'Vintage Gazette',
    description: 'Folded broadsheet newspaper with animated unfolding, aged paper texture, editorial columns, and press clippings.',
    badge: 'Popular',
    icon: '📰',
    previewBg: 'bg-[#f4ede1] text-[#1c1917] border-stone-800',
    component: NewspaperTheme,
  },
  scratch_card: {
    id: 'scratch_card',
    name: 'Scratch & Reveal',
    description: 'Interactive metallic silver scratch foil. Drag or swipe on mobile/desktop to scratch off and reveal messages with confetti.',
    badge: 'Interactive',
    icon: '✨',
    previewBg: 'bg-slate-900 text-amber-400 border-slate-700',
    component: ScratchCardTheme,
  },
  clothesline: {
    id: 'clothesline',
    name: 'Polaroid Clothesline',
    description: 'Rustic fairy lights and wooden clothespins holding polaroid photos that sway in the breeze. Tap to flip and read notes!',
    badge: 'New ✨',
    icon: '📸',
    previewBg: 'bg-gradient-to-br from-amber-50 to-stone-100 text-stone-900 border-amber-300',
    component: ClotheslineTheme,
  },
  sky_lanterns: {
    id: 'sky_lanterns',
    name: 'Floating Sky Lanterns',
    description: 'Midnight starlit sky with warm glowing lanterns carrying wishes into the night. Tap to bring them into glowing focus.',
    badge: 'Magical 🏮',
    icon: '🏮',
    previewBg: 'bg-[#090d1e] text-amber-300 border-indigo-900',
    component: LanternsTheme,
  },
  magazine: {
    id: 'magazine',
    name: 'Birthday Magazine',
    description: 'Glossy editorial spread with full-bleed hero covers, pagination flips, and high-fashion photo framing.',
    badge: 'Chic',
    icon: '📖',
    previewBg: 'bg-gradient-to-br from-rose-50 to-pink-100 text-rose-950 border-rose-300',
    component: MagazineTheme,
  },
  envelope: {
    id: 'envelope',
    name: 'Sealed Envelope',
    description: 'Wax-sealed luxury parchment envelope. Click to break the wax seal and watch the folded letter slide out.',
    badge: 'Classic',
    icon: '💌',
    previewBg: 'bg-gradient-to-br from-amber-50 to-orange-100 text-stone-800 border-amber-300',
    component: EnvelopeTheme,
  },
};
