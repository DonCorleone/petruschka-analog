import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { resource } from '@angular/core';
import { 
  type Gig, 
  type Album, 
  type BandMember, 
  type MerchItem, 
  type Update,
  type ContactInfo,
  type SocialLink,
  type PastEvent,
  type ApiResponse 
} from '../../../shared/types';

@Injectable({
  providedIn: 'root'
})
export class BandDataService {
  private http = inject(HttpClient);
  
  // Using Resource API for optimal performance with signals and server-side data fetching
  gigsResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<Gig[]>>('/api/v1/gigs').toPromise();
      return response?.data || [];
    }
  });

  albumsResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<Album[]>>('/api/v1/albums').toPromise();
      return response?.data || [];
    }
  });

  bandMembersResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<BandMember[]>>('/api/v1/band-members').toPromise();
      return response?.data || [];
    }
  });

  merchResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<MerchItem[]>>('/api/v1/merch').toPromise();
      return response?.data || [];
    }
  });

  updatesResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<Update[]>>('/api/v1/updates').toPromise();
      return response?.data || [];
    }
  });

  contactResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<{ contactInfo: ContactInfo[], musicChannels: SocialLink[], socialMedia: SocialLink[] }>>('/api/v1/contact').toPromise();
      return response?.data || { contactInfo: [], musicChannels: [], socialMedia: [] };
    }
  });

  pastEventsResource = resource({
    loader: async () => {
      const response = await this.http.get<ApiResponse<PastEvent[]>>('/api/v1/past-events').toPromise();
      return response?.data || [];
    }
  });
}
