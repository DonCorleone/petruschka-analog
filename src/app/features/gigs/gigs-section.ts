import { Component, inject } from '@angular/core';
import { BandDataService, DialogService } from '../../core/services';
import { Gig } from '../../../shared/types';

@Component({
  selector: 'app-gigs-section',
  standalone: true,
  templateUrl: './gigs-section.html',
  styleUrls: ['./gigs-section.css']
})
export class GigsSectionComponent {
  
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

  gigs = this.bandDataService.gigsResource.value;

  openGigDetail(gig: Gig): void {
    this.dialogService.openGigDetail(gig);
  }
}
