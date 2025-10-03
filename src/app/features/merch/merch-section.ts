import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BandDataService, DialogService } from '../../core/services';
import { MerchItem } from '../../../shared/types';

@Component({
  selector: 'app-merch-section',
  templateUrl: './merch-section.html',
  styleUrls: ['./merch-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

}
