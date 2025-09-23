import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-sponsors-section',
  templateUrl: './sponsors-section.html',
  styleUrls: ['./sponsors-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass]
})
export class SponsorsSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  sponsors = this.bandDataService.sponsorsResource.value || [];

  onSponsorImageError(event: any): void {
    // Fallback to sponsor placeholder SVG if image fails to load
    event.target.src = '/sponsor-placeholder.svg';
  }
}
