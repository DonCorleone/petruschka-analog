import { Component, inject, ChangeDetectionStrategy, OnInit, afterNextRender } from '@angular/core';
import { BandDataService, DialogService } from '../../core/services';
import { Gig } from '../../../shared/types';

@Component({
  selector: 'app-gigs-section',
  templateUrl: './gigs-section.html',
  styleUrls: ['./gigs-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GigsSectionComponent implements OnInit {

  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

  // Use computed signal that reactively merges gigs with MULU seat data
  gigs = this.bandDataService.gigsWithSeats;

  constructor() {
    // Load fresh gigs and MULU seat availability ONLY in the browser (not during SSR)
    // This ensures fresh data even if the build is old (builds once per month)
    afterNextRender(() => {
      // Fetch fresh gigs to filter out past events
      this.bandDataService.clientGigsResource.value();
      // Fetch fresh MULU seat data
      this.bandDataService.muluSeatsResource.value();
    });
  }

  ngOnInit(): void {
    // Ensure gig templates are loaded for detailed views
    // This will populate the GigDataService with template data needed for client-side detail extraction
    this.bandDataService.gigTemplatesResource.value();
  }

  async openGigDetail(gig: Gig): Promise<void> {
    await this.dialogService.openGigDetail(gig);
  }

  async openLocationDialog(locationName: string): Promise<void> {
    if (locationName && locationName !== '#') {
      await this.dialogService.openLocationDetail(locationName);
    }
  }
}
