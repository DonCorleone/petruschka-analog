// Shared types used by both client and server

export interface Gig {
  id: number;
  date: {
    day: number;
    month: string;
    year: number;
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
  startTimestamp?: number; // Add timestamp for exact event identification
  availableSeats?: number; // Available seats from MULU
  ticketTypes?: Array<{
    name: string;
    price: number;
    currency: string;
    description?: string;
  }>;
  duration?: string;
  importantNotes?: string;
  notificationEmail?: string;
}

export interface Album {
  id: number;
  title: string;
  coverImage: string;
  status: 'available' | 'coming-soon';
  price?: number;
  purchaseUrl: string;
  // Additional fields for detailed view
  description?: string;
  releaseDate?: string;
  artists?: string;
  notificationEmail?: string;
  tracks?: Array<{
    title: string;
    duration?: string;
  }>;
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
  // Additional fields for detailed view
  longDescription?: string;
  details?: string[];
  performanceDates?: string[];
  type?: 'tournee' | 'regular';
  notificationEmail?: string;
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
  countdownDate?: Date;
  isCurrentlyRunning?: boolean; // True when premiere is over but show still has upcoming dates
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

export interface Press {
  id: string;
  nr: string;
  desc: string;
  source: string;
  date: string;
  author: string;
  fileExtension: string;
  link?: string;
  quote?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  url: string;
  image: string;
  events: Array<{
    event: string;
    share: number;
  }>;
  totalShare: number;
  sizeClass: string;
}

// MULU seat availability data
export interface MuluSeat {
  from: number; // Unix timestamp (seconds)
  av_part: number; // Available seats
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
