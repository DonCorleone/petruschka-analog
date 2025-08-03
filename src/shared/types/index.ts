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
  // Enhanced fields from legacy data
  longDescription?: string;
  shortDescription?: string;
  artists?: string;
  flyerImagePath?: string;
  bannerImagePath?: string;
  eventDateString?: string;
  ticketTypes?: Array<{
    name: string;
    price: number;
    currency: string;
    description?: string;
  }>;
  duration?: string;
  ageRecommendation?: string;
  importantNotes?: string;
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

export interface Location {
  _id: { $oid: string };
  name: string;
  street: string;
  postalCode: string;
  city: string;
  directions: string;
  info: string;
  ef_id?: string;
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

export interface PastEvent {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  year: string;
  season: string;
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
