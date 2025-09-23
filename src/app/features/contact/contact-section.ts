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
    // Preview images are always PNG
    return `https://www.petruschka.ch/assets/images/presse/${press.nr}.png?nf_resize=fit&w=550`;
  }

  getPressArticleUrl(press: Press): string {
    // If there's a link, use it directly, otherwise construct asset URL with file extension
    if (press.link) {
      return press.link;
    }
    return `https://www.petruschka.ch/assets/images/presse/${press.nr}.${press.fileExtension}`;
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
