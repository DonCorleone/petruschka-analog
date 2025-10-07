import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent, FooterComponent } from '../core/layout';
import { PromoSectionComponent } from '../features/promo';
import { GigsSectionComponent } from '../features/gigs';
import { MusicSectionComponent } from '../features/music';
import { AboutSectionComponent } from '../features/about';
import { EducationSectionComponent } from '../features/education/education-section';
import { MerchSectionComponent } from '../features/merch';
import { HistorySectionComponent } from '../features/history';
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
    EducationSectionComponent,
    MerchSectionComponent,
    HistorySectionComponent,
    ContactSectionComponent,
    FooterComponent,
    BackToTopComponent,
  ],
  template: `
    <app-header />

    <div id="promo">
      <app-promo-section />
    </div>

    <div id="gigs">
      <app-gigs-section />
    </div>

    <div id="about">
      <app-about-section />
    </div>

    <div id="schueleraufführungen">
      <app-education-section />
    </div>

    <div id="merch">
      <app-merch-section />
    </div>

    <div id="history">
      <app-history-section />
    </div>

    <div id="music">
      <app-music-section />
    </div>

    <div id="contact">
      <app-contact-section />
    </div>

    <app-footer />
    <app-back-to-top />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
