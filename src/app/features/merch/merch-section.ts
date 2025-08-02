import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-merch-section',
  templateUrl: './merch-section.html',
  styleUrls: ['./merch-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  merchItems = this.bandDataService.merchResource.value;
}
