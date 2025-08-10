import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
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

  gigs = this.bandDataService.gigsResource.value;
  
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
