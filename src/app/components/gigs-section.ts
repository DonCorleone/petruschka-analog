import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../services/band-data';

@Component({
  selector: 'app-gigs-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gigs-section.html',
  styleUrls: ['./gigs-section.css']
})
export class GigsSectionComponent {
  
  private bandDataService = inject(BandDataService);
  private openGigs = signal<Set<number>>(new Set());

  gigs = this.bandDataService.gigsResource.value;

  toggleGigInfo(gigId: number) {
    this.openGigs.update(openGigs => {
      const newSet = new Set(openGigs);
      if (newSet.has(gigId)) {
        newSet.delete(gigId);
      } else {
        newSet.add(gigId);
      }
      return newSet;
    });
  }

  isGigInfoOpen(gigId: number): boolean {
    return this.openGigs().has(gigId);
  }
}
