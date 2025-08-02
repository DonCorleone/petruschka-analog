import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService } from '../../core/services';
import { DialogService } from '../../core/services/dialog.service';
import { PastEvent } from '../../../shared/types';

@Component({
  selector: 'app-history-section',
  templateUrl: './history-section.html',
  styleUrls: ['./history-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorySectionComponent {
  
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);
  
  pastEvents = this.bandDataService.pastEventsResource.value;

  openHistoryDetail(event: PastEvent): void {
    this.dialogService.openHistoryDetail(event);
  }
}
