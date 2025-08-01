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
  private isDialogOpening = false;

  gigs = this.bandDataService.gigsResource.value;

  async openGigDetail(gig: Gig): Promise<void> {
    if (this.isDialogOpening) {
      return; // Prevent double-click
    }
    
    this.isDialogOpening = true;
    try {
      await this.dialogService.openGigDetail(gig);
    } finally {
      // Reset flag after a short delay to allow for dialog to fully open
      setTimeout(() => {
        this.isDialogOpening = false;
      }, 500);
    }
  }
}
