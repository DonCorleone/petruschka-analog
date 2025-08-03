import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.html',
  styleUrls: ['./about-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  bandMembers = this.bandDataService.bandMembersResource.value;
}
