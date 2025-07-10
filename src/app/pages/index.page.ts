import { Component } from '@angular/core';
import { HeaderComponent, FooterComponent } from '../core/layout';
import { PromoSectionComponent } from '../features/promo';
import { GigsSectionComponent } from '../features/gigs';
import { MusicSectionComponent } from '../features/music';
import { AboutSectionComponent } from '../features/about';
import { MerchSectionComponent } from '../features/merch';
import { ContactSectionComponent } from '../features/contact';
import { BackToTopComponent } from '../shared/components';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    PromoSectionComponent,
    GigsSectionComponent,
    MusicSectionComponent,
    AboutSectionComponent,
    MerchSectionComponent,
    ContactSectionComponent,
    FooterComponent,
    BackToTopComponent
  ],
  template: `
    <app-header />
    <app-promo-section />
    <app-gigs-section />
    <app-music-section />
    <app-about-section />
    <app-merch-section />
    <app-contact-section />
    <app-footer />
    <app-back-to-top />
  `,
})
export default class HomeComponent {
}
