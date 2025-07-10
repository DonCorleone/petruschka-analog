import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header';
import { PromoSectionComponent } from '../components/promo-section';
import { GigsSectionComponent } from '../components/gigs-section';
import { MusicSectionComponent } from '../components/music-section';
import { AboutSectionComponent } from '../components/about-section';
import { MerchSectionComponent } from '../components/merch-section';
import { ContactSectionComponent } from '../components/contact-section';
import { FooterComponent } from '../components/footer';
import { BackToTopComponent } from '../components/back-to-top';

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
