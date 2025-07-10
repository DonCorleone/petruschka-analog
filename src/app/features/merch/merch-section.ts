import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-merch-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merch-section.html',
  styleUrls: ['./merch-section.css']
})
export class MerchSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  merchItems = this.bandDataService.merchResource.value;
}
