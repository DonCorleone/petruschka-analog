import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService, DialogService } from '../../core/services';
import { Gig } from '../../../shared/types';

@Component({
  selector: 'app-gigs-section',
  templateUrl: './gigs-section.html',
  styleUrls: ['./gigs-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GigsSectionComponent {
  
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

  gigs = this.bandDataService.gigsResource.value;

  async openGigDetail(gig: Gig): Promise<void> {
    await this.dialogService.openGigDetail(gig);
  }

  async openLocationDialog(locationName: string): Promise<void> {
    if (locationName && locationName !== '#') {
      await this.dialogService.openLocationDetail(locationName);
    }
  }
}
