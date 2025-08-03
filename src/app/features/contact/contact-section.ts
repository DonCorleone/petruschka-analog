import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BandDataService } from '../../core/services';
import { type ContactInfo, type SocialLink } from '../../../shared/types';

@Component({
  selector: 'app-contact-section',
  templateUrl: './contact-section.html',
  styleUrls: ['./contact-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent {
  private bandDataService = inject(BandDataService);
  
  contactData = this.bandDataService.contactResource.value;
  
  get contactInfo(): ContactInfo[] {
    return this.contactData()?.contactInfo || [];
  }
  
  get musicChannels(): SocialLink[] {
    return this.contactData()?.musicChannels || [];
  }
  
  get socialMedia(): SocialLink[] {
    return this.contactData()?.socialMedia || [];
  }
}
