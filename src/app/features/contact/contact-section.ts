import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContactInfo {
  type: string;
  title: string;
  email: string;
  icon: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-section.html',
  styleUrls: ['./contact-section.css']
})
export class ContactSectionComponent {
  
  contactInfo: ContactInfo[] = [
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

  musicChannels: SocialLink[] = [
    { name: 'iTunes', url: '#', icon: '/images/itunes.svg' },
    { name: 'Last.fm', url: '#', icon: '/images/lastfm.svg' },
    { name: 'Vevo', url: '#', icon: '/images/vevo.svg' },
    { name: 'Bandcamp', url: '#', icon: '/images/bandcamp.svg' },
    { name: 'Deezer', url: '#', icon: '/images/deezer.svg' }
  ];

  socialMedia: SocialLink[] = [
    { name: 'YouTube', url: '#', icon: 'fab fa-youtube' },
    { name: 'SoundCloud', url: '#', icon: 'fab fa-soundcloud' },
    { name: 'Spotify', url: '#', icon: 'fab fa-spotify' },
    { name: 'Facebook', url: '#', icon: 'fab fa-facebook-f' },
    { name: 'Instagram', url: '#', icon: 'fab fa-instagram' },
    { name: 'Twitter', url: '#', icon: 'fab fa-twitter' }
  ];
}
