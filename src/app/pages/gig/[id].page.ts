import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../../core/services/band-data';
import { DialogService } from '../../core/services/dialog.service';
import { Gig } from '../../../shared/types';

@Component({
  selector: 'app-gig-detail-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- This page exists for SEO and deep linking -->
    <!-- The actual content is shown in the dialog overlay -->
    <div class="loading-container">
      <p>Loading gig details...</p>
    </div>
  `
})
export default class GigDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

    async ngOnInit(): Promise<void> {
    const gigId = this.route.snapshot.paramMap.get('id');
    
    if (gigId) {
      // Try to find the gig and open the dialog
      const gigs = this.bandDataService.gigsResource.value();
      const gig = gigs?.find(g => g.id.toString() === gigId);
      
      if (gig) {
        // Open the dialog overlay with detailed data loading
        await this.dialogService.openGigDetail(gig);
      } else {
        // Gig not found, redirect to home
        console.error('Gig not found:', gigId);
        this.router.navigate(['/']);
      }
    } else {
      // No ID provided, redirect to home
      this.router.navigate(['/']);
    }
  }
}
