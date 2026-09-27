export type OccasionType = 
  | 'birthday'
  | 'anniversary'
  | 'farewell'
  | 'wedding'
  | 'baby_shower'
  | 'appreciation'
  | 'other';

export type ThemeType = 
  | 'newspaper'
  | 'scratch_card'
  | 'magazine'
  | 'envelope'
  | 'clothesline'
  | 'sky_lanterns';

export interface Wall {
  id: string;
  title: string;
  recipient_name: string;
  occasion_type: OccasionType;
  theme: ThemeType;
  share_slug: string;
  cover_photo_url?: string;
  organizer_message?: string;
  organizer_name?: string;
  reveal_date: string | null; // ISO string or null
  created_at: string;
  description?: string;
}

export interface Contribution {
  id: string;
  wall_id: string;
  contributor_name: string;
  message: string;
  photo_url: string;
  created_at: string;
  highlight?: boolean;
}

export interface WallWithContributions extends Wall {
  contributions: Contribution[];
}

export interface ThemeProps {
  wall: Wall;
  contributions: Contribution[];
  isRevealed: boolean;
  onReveal?: () => void;
  onAddWish?: () => void;
}
