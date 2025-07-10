import { defineEventHandler } from 'h3';
import { ContactInfo, SocialLink, ApiResponse } from '../../../../shared/types';

const MOCK_CONTACT_INFO: ContactInfo[] = [
  {
    type: 'general',
    title: 'General',
    email: 'info@website.com',
    icon: 'fas fa-info-circle'
  },
  {
    type: 'booking',
    title: 'Booking',
    email: 'booking@website.com',
    icon: 'fas fa-calendar-check'
  },
  {
    type: 'press',
    title: 'Press',
    email: 'press@website.com',
    icon: 'fas fa-newspaper'
  }
];

const MOCK_MUSIC_CHANNELS: SocialLink[] = [
  { name: 'iTunes', url: '#', icon: '/images/itunes.svg' },
  { name: 'Last.fm', url: '#', icon: '/images/lastfm.svg' },
  { name: 'Vevo', url: '#', icon: '/images/vevo.svg' },
  { name: 'Bandcamp', url: '#', icon: '/images/bandcamp.svg' },
  { name: 'Deezer', url: '#', icon: '/images/deezer.svg' }
];

const MOCK_SOCIAL_MEDIA: SocialLink[] = [
  { name: 'YouTube', url: '#', icon: 'fab fa-youtube' },
  { name: 'SoundCloud', url: '#', icon: 'fab fa-soundcloud' },
  { name: 'Spotify', url: '#', icon: 'fab fa-spotify' },
  { name: 'Facebook', url: '#', icon: 'fab fa-facebook-f' },
  { name: 'Instagram', url: '#', icon: 'fab fa-instagram' },
  { name: 'Twitter', url: '#', icon: 'fab fa-twitter' }
];

export default defineEventHandler(async (event): Promise<ApiResponse<{ contactInfo: ContactInfo[], musicChannels: SocialLink[], socialMedia: SocialLink[] }>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 80));
  
  return {
    success: true,
    data: {
      contactInfo: MOCK_CONTACT_INFO,
      musicChannels: MOCK_MUSIC_CHANNELS,
      socialMedia: MOCK_SOCIAL_MEDIA
    },
    timestamp: new Date().toISOString()
  };
});
