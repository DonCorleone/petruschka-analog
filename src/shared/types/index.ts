// Shared types used by both client and server

export interface Gig {
  id: number;
  date: {
    day: number;
    month: string;
  };
  title: string;
  venue: string;
  location: string;
  time: string;
  dayOfWeek: string;
  description: string;
  ticketUrl: string;
}

export interface Album {
  id: number;
  title: string;
  coverImage: string;
  status: 'available' | 'coming-soon';
  price?: number;
  purchaseUrl: string;
}

export interface BandMember {
  id: number;
  name: string;
  instrument: string;
  image: string;
  description: string;
}

export interface MerchItem {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  purchaseUrl: string;
}

export interface Update {
  id: number;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  mediaType?: 'video' | 'image';
  mediaUrl?: string;
  mediaThumb?: string;
  isCountdown?: boolean;
  countdownDate?: string;
}

export interface ContactInfo {
  type: string;
  title: string;
  email: string;
  icon: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
