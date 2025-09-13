import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../../core/services/band-data';
import { DialogService } from '../../core/services/dialog.service';
import { Gig } from '../../../shared/types';

@Component({
  selector: 'app-gig-detail-page',
  imports: [CommonModule],
  template: `
    <!-- This page exists for SEO and deep linking -->
    <!-- The actual content is shown in the dialog overlay -->
    <div class="loading-container">
      <p>Loading gig details...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class GigDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

    async ngOnInit(): Promise<void> {
    const gigId = this.route.snapshot.paramMap.get('id');
    
    if (gigId) {
      try {
        // Try to find the gig and open the dialog
        const gigs = this.bandDataService.gigsResource.value() || [];
        const gig = gigs.find(g => g?.id?.toString() === gigId);
        
        if (gig) {
          // Open the dialog overlay with detailed data loading
          await this.dialogService.openGigDetail(gig);
        } else {
          // If we couldn't find the gig, check if we need to load data
          // This happens when the page is accessed directly (deeplink)
          if (gigs.length === 0) {
            console.log('No gigs available, trying to load data...');
            // Force data loading - need to wait a moment for resources to load in this environment
            try {
              // Wait briefly then retry with whatever data might be available now
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Try again after waiting - resources should have loaded by now
              const refreshedGigs = this.bandDataService.gigsResource.value() || [];
              const refreshedGig = refreshedGigs.find(g => g?.id?.toString() === gigId);
              
              if (refreshedGig) {
                await this.dialogService.openGigDetail(refreshedGig);
                return;
              }
            } catch (refreshError) {
              console.error('Failed to refresh gig data:', refreshError);
            }
          }
          
          // Gig not found, redirect to home
          console.error('Gig not found:', gigId);
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Error opening gig dialog:', error);
        this.router.navigate(['/']);
      }
    } else {
      // No ID provided, redirect to home
      this.router.navigate(['/']);
    }
  }
}
