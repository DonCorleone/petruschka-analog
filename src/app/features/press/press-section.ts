import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../../core/services';
import { type Press } from '../../../shared/types';

@Component({
  selector: 'app-press-section',
  imports: [CommonModule],
  templateUrl: './press-section.html',
  styleUrls: ['./press-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PressSectionComponent {
  private bandDataService = inject(BandDataService);

  press = this.bandDataService.pressResource.value;
  
  get pressReleases(): Press[] {
    return this.press() || [];
  }

  getPressImageUrl(press: Press): string {
    // Preview images are always PNG - use relative path that works in dev and production
    if (!press?.nr) {
      return '/images/placeholder.svg'; // Fallback for missing press number
    }
    return `/images/presse/${press.nr}.png?nf_resize=fit&w=550`;
  }

  getPressArticleUrl(press: Press): string {
    // If there's a link, use it directly, otherwise construct asset URL with file extension
    if (press.link) {
      return press.link;
    }
    if (!press?.nr || !press?.fileExtension) {
      return '#'; // Fallback for missing data
    }
    return `https://www.petruschka.ch/images/presse/${press.nr}.${press.fileExtension}`;
  }

  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}