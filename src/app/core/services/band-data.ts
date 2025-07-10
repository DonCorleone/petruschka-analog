import { inject, Injectable } from '@angular/core';
import { resource } from '@angular/core';
import { MOCK_GIGS, type Gig } from '../../features/gigs';
import { MOCK_ALBUMS, type Album } from '../../features/music';
import { MOCK_BAND_MEMBERS, type BandMember } from '../../features/about';
import { MOCK_MERCH, MOCK_UPDATES, type MerchItem, type Update } from '../../features/merch';

@Injectable({
  providedIn: 'root'
})
export class BandDataService {
  
  // Using Resource API for optimal performance with signals
  gigsResource = resource({
    loader: () => Promise.resolve(MOCK_GIGS)
  });

  albumsResource = resource({
    loader: () => Promise.resolve(MOCK_ALBUMS)
  });

  bandMembersResource = resource({
    loader: () => Promise.resolve(MOCK_BAND_MEMBERS)
  });

  merchResource = resource({
    loader: () => Promise.resolve(MOCK_MERCH)
  });

  updatesResource = resource({
    loader: () => Promise.resolve(MOCK_UPDATES)
  });

  // In the future, these would be replaced with actual HTTP calls:
  // gigsResource = resource({
  //   loader: () => this.http.get<Gig[]>('/api/gigs').toPromise()
  // });
}
