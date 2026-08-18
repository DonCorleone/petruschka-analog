import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnimateOnScrollDirective } from '../../shared/directives';

@Component({
  selector: 'app-education-section',
  templateUrl: './education-section.html',
  styleUrls: ['./education-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimateOnScrollDirective]
})
export class EducationSectionComponent {
  
  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }
}