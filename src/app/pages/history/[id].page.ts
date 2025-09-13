import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';
import { BandDataService } from '../../core/services';
import { PastEvent } from '../../../shared/types';

@Component({
  selector: 'app-history-detail-page',
  imports: [CommonModule],
  template: `
    <!-- This page exists for SEO and deep linking -->
    <!-- The actual content is shown in the dialog overlay -->
    <div class="loading-container">
      <p>Lade historische Details...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class HistoryDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private bandDataService = inject(BandDataService);

  async ngOnInit(): Promise<void> {
    const eventId = this.route.snapshot.paramMap.get('id');
    
    if (eventId) {
      try {
        // Try to find the event and open the dialog
        const pastEvents = this.bandDataService.pastEventsResource.value() || [];
        const event = pastEvents.find((e: PastEvent) => e.id === eventId);
        
        if (event) {
          // Open the dialog overlay and get reference
          const dialogRef = await this.dialogService.openHistoryDetail(event);
          
          // Subscribe to dialog close and navigate to home when closed
          // This prevents blank page in private browsing mode
          if (dialogRef) {
            dialogRef.closed.subscribe(() => {
              // Navigate to homepage when dialog is closed
              this.router.navigate(['/']);
            });
          }
        } else {
          // If we couldn't find the event, check if we need to load data
          // This happens when the page is accessed directly (deeplink)
          if (pastEvents.length === 0) {
            console.log('No past events available, trying to load data...');
            
            // Wait briefly then retry with whatever data might be available now
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try again after waiting
            const refreshedEvents = this.bandDataService.pastEventsResource.value() || [];
            const refreshedEvent = refreshedEvents.find((e: PastEvent) => e.id === eventId);
            
            if (refreshedEvent) {
              // Open dialog and get reference
              const dialogRef = await this.dialogService.openHistoryDetail(refreshedEvent);
              
              // Subscribe to dialog close event
              if (dialogRef) {
                dialogRef.closed.subscribe(() => {
                  // Navigate to homepage when dialog is closed
                  this.router.navigate(['/']);
                });
              }
              return;
            }
          }
          
          // Event not found, redirect to home
          console.error('History event not found:', eventId);
          this.router.navigate(['/']);
        }
      } catch (error) {
        console.error('Error opening history dialog:', error);
        this.router.navigate(['/']);
      }
    } else {
      // No event ID, redirect to home
      this.router.navigate(['/']);
    }
  }
}
