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

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    
    if (eventId) {
      // Try to find the event and open the dialog
      const pastEvents = this.bandDataService.pastEventsResource.value();
      const event = pastEvents?.find((e: PastEvent) => e.id === eventId);
      
      if (event) {
        // Open the dialog overlay
        this.dialogService.openHistoryDetail(event);
      } else {
        // Event not found, redirect to home
        console.error('History event not found:', eventId);
        this.router.navigate(['/']);
      }
    } else {
      // No event ID, redirect to home
      this.router.navigate(['/']);
    }
  }
}
