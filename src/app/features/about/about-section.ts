import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-section.html',
  styleUrls: ['./about-section.css']
})
export class AboutSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  bandMembers = this.bandDataService.bandMembersResource.value;
}
