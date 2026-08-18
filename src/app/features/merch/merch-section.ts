import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService, DialogService } from '../../core/services';
import { MerchItem } from '../../../shared/types';
import { AnimateOnScrollDirective } from '../../shared/directives';

@Component({
  selector: 'app-merch-section',
  templateUrl: './merch-section.html',
  styleUrls: ['./merch-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimateOnScrollDirective]
})
export class MerchSectionComponent {
  
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);
  
  merchItems = this.bandDataService.merchResource.value;
  
  openMerchDetail(merchItem: MerchItem): void {
    if (merchItem) {
      this.dialogService.openMerchDetail(merchItem);
    }
  }

  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }

}
