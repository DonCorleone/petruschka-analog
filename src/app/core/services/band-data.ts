import { inject, Injectable, computed } from '@angular/core';
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
  type MuluSeat,
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

  // Client-side gigs resource with sessionStorage caching
  // This fetches fresh gigs only in the browser to filter out past events
  // even if the build is old (SSG builds once per month)
  clientGigsResource = resource({
    loader: async () => {
      // Skip entirely during SSR - only run in browser
      if (typeof window === 'undefined') {
        console.log('⏭️ Skipping client gigs fetch during SSR');
        return [];
      }

      const STORAGE_KEY = 'client_gigs_data';
      const STORAGE_TIMESTAMP_KEY = 'client_gigs_timestamp';

      // Check sessionStorage first
      if (typeof sessionStorage !== 'undefined') {
        const cachedData = sessionStorage.getItem(STORAGE_KEY);
        const cachedTimestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);

        if (cachedData && cachedTimestamp) {
          console.log('✅ Using cached client gigs data from session');
          return JSON.parse(cachedData) as Gig[];
        }
      }

      // Fetch from API if not cached (browser only)
      console.log('🔄 Fetching fresh gigs data from browser...');
      const response = await firstValueFrom(this.http.get<ApiResponse<Gig[]>>('/api/v1/gigs'));
      const data = response?.data || [];

      // Cache in sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
        console.log('✅ Cached client gigs data to session');
      }

      return data;
    }
  });

  // MULU seat availability resource with sessionStorage caching
  muluSeatsResource = resource({
    loader: async () => {
      // Skip entirely during SSR - only run in browser
      if (typeof window === 'undefined') {
        console.log('⏭️ Skipping MULU fetch during SSR');
        return [];
      }

      const STORAGE_KEY = 'mulu_seats_data';
      const STORAGE_TIMESTAMP_KEY = 'mulu_seats_timestamp';

      // Check sessionStorage first
      if (typeof sessionStorage !== 'undefined') {
        const cachedData = sessionStorage.getItem(STORAGE_KEY);
        const cachedTimestamp = sessionStorage.getItem(STORAGE_TIMESTAMP_KEY);

        if (cachedData && cachedTimestamp) {
          console.log('✅ Using cached MULU seat data from session');
          return JSON.parse(cachedData) as MuluSeat[];
        }
      }

      // Fetch from API if not cached (browser only)
      console.log('🔄 Fetching fresh MULU seat data from browser...');
      const response = await firstValueFrom(this.http.get<ApiResponse<MuluSeat[]>>('/api/v1/mulu-seats'));
      const data = response?.data || [];

      // Cache in sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
        console.log('✅ Cached MULU seat data to session');
      }

      return data;
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

  // Computed signal that reactively merges gigs with MULU seat availability
  // This updates automatically when either gigs or MULU data changes
  // Prefers fresh client-side gigs over stale SSR gigs
  gigsWithSeats = computed(() => {
    const clientGigs = this.clientGigsResource.value() || [];
    const ssrGigs = this.gigsResource.value() || [];
    const muluData = this.muluSeatsResource.value() || [];

    // Use client gigs if available (browser), otherwise fallback to SSR gigs
    const gigs = clientGigs.length > 0 ? clientGigs : ssrGigs;

    if (muluData.length === 0) {
      return gigs;
    }

    return this.mergeGigsWithMuluData(gigs, muluData);
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

  /**
   * Merges gigs with MULU seat availability data
   * Matching logic: truncate gig.startTimestamp by last 3 digits and compare with mulu.from
   */
  private mergeGigsWithMuluData(gigs: Gig[], muluData: MuluSeat[]): Gig[] {
    // Create a map of MULU data for efficient lookup
    const muluMap = new Map<number, number>();
    muluData.forEach(seat => {
      muluMap.set(seat.from, seat.av_part);
    });

    // Merge gigs with MULU data
    return gigs.map(gig => {
      if (gig.startTimestamp) {
        // Truncate last 3 digits (convert milliseconds to seconds)
        const timestampInSeconds = Math.floor(gig.startTimestamp / 1000);
        const availableSeats = muluMap.get(timestampInSeconds);

        if (availableSeats !== undefined) {
          return { ...gig, availableSeats };
        }
      }
      return gig;
    });
  }
}
