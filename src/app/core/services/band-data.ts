import { inject, Injectable } from '@angular/core';
import { TransferState, makeStateKey } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GigDataService } from './gig-data.service';
import { 
  type Gig, 
  type Album, 
  type BandMember, 
  type MerchItem, 
  type Update,
  type ContactInfo,
  type SocialLink,
  type PastEvent,
  type Press,
  type Sponsor,
  type ApiResponse 
} from '../../../shared/types';

@Injectable({
  providedIn: 'root'
})
export class BandDataService {
  private http = inject(HttpClient);
  private gigDataService = inject(GigDataService);
  private transferState = inject(TransferState);
  
  // Using Resource API for optimal performance with signals and server-side data fetching
  gigsResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<Gig[]>>('/api/v1/gigs'));
      return response?.data || [];
    }
  });

  // New resource for raw gig template data (for detailed views)
  gigTemplatesResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<any[]>>('/api/v1/gig-templates'));
      const templates = response?.data || [];
      
      // Store templates in GigDataService for client-side detail extraction
      this.gigDataService.setGigTemplates(templates);
      
      return templates;
    }
  });

  albumsResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<Album[]>>('/api/v1/albums'));
      return response?.data || [];
    }
  });

  bandMembersResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<BandMember[]>>('/api/v1/band-members'));
      return response?.data || [];
    }
  });

  // Removed client-only httpResource to avoid extra XHR after hydration

  merchResource = resource({
    loader: async () => {
      // Use TransferState to avoid client-side refetch after SSR
      const STATE_KEY = makeStateKey<MerchItem[]>('merch');
      const cached = this.transferState.get(STATE_KEY, null as unknown as MerchItem[]);
      if (cached && Array.isArray(cached)) {
        return cached;
      }

      const response = await firstValueFrom(this.http.get<ApiResponse<MerchItem[]>>('/api/v1/merch'));
      const data = response?.data || [];
      // Store for client re-use (only runs during SSR)
      try {
        this.transferState.set(STATE_KEY, data);
      } catch {
        // no-op if not available
      }
      return data;
    }
  });

  updatesResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<Update[]>>('/api/v1/updates'));
      return response?.data || [];
    }
  });

  contactResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<{ contactInfo: ContactInfo[], musicChannels: SocialLink[], socialMedia: SocialLink[] }>>('/api/v1/contact'));
      return response?.data || { contactInfo: [], musicChannels: [], socialMedia: [] };
    }
  });

  pastEventsResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<PastEvent[]>>('/api/v1/past-events'));
      return response?.data || [];
    }
  });

  pressResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<Press[]>>('/api/v1/press'));
      return response?.data || [];
    }
  });

  sponsorsResource = resource({
    loader: async () => {
      const response = await firstValueFrom(this.http.get<ApiResponse<Sponsor[]>>('/api/v1/sponsors'));
      return response?.data || [];
    }
  });
}
