import { Component, inject } from '@angular/core';
import { BandDataService } from '../../core/services';

@Component({
  selector: 'app-history-section',
  standalone: true,
  templateUrl: './history-section.html',
  styleUrls: ['./history-section.css']
})
export class HistorySectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  pastEvents = this.bandDataService.pastEventsResource.value;

  toggleInfo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle('show');
    }
  }
}
