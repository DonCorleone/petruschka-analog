import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { BandDataService, DialogService } from '../../core/services';
import { type ContactInfo, type SocialLink } from '../../../shared/types';
import { MemorialSectionComponent } from '../memorial/memorial-section';
import { TheaterInfoSectionComponent } from '../theater-info/theater-info-section';
import { PressSectionComponent } from '../press/press-section';
import { SponsorsSectionComponent } from '../sponsors/sponsors-section';

@Component({
  selector: 'app-contact-section',
  imports: [
    CommonModule,
    MemorialSectionComponent,
    TheaterInfoSectionComponent,
    PressSectionComponent,
    SponsorsSectionComponent
  ],
  templateUrl: './contact-section.html',
  styleUrls: ['./contact-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent {
  private bandDataService = inject(BandDataService);
  private dialogService = inject(DialogService);

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

  openNewsletterSignup() {
    this.dialogService.openNewsletterDialog();
  }
}
