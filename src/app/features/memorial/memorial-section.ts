import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-memorial-section',
  templateUrl: './memorial-section.html',
  styleUrls: ['./memorial-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemorialSectionComponent {
  
  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }
}