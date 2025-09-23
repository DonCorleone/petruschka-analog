import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { BandDataService, DialogService } from '../../core/services';
import { type ContactInfo, type SocialLink, type Press } from '../../../shared/types';

@Component({
  selector: 'app-contact-section',
  imports: [CommonModule, NgClass],
  templateUrl: './contact-section.html',
  styleUrls: ['./contact-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent {
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

  contactData = this.bandDataService.contactResource.value;
  press = this.bandDataService.pressResource.value;
  sponsors = this.bandDataService.sponsorsResource.value;
  
  get contactInfo(): ContactInfo[] {
    return this.contactData()?.contactInfo || [];
  }
  
  get musicChannels(): SocialLink[] {
    return this.contactData()?.musicChannels || [];
  }
  
  get socialMedia(): SocialLink[] {
    return this.contactData()?.socialMedia || [];
  }

  get pressReleases(): Press[] {
    return this.press() || [];
  }

  get sponsorsList() {
    return this.sponsors() || [];
  }


  openNewsletterSignup() {
    this.dialogService.openNewsletterDialog();
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

  onSponsorImageError(event: any): void {
    // Fallback to sponsor placeholder SVG if sponsor image fails to load
    event.target.src = '/sponsor-placeholder.svg';
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
