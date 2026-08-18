import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent, FooterComponent } from '../core/layout';
import { PromoSectionComponent } from '../features/promo';
import { GigsSectionComponent } from '../features/gigs';
// Deferred sections: import directly from component file (not barrel index.ts)
// to ensure bundler creates a separate lazy chunk per section.
import { AboutSectionComponent } from '../features/about/about-section';
import { EducationSectionComponent } from '../features/education/education-section';
import { MerchSectionComponent } from '../features/merch/merch-section';
import { HistorySectionComponent } from '../features/history/history-section';
import { MusicSectionComponent } from '../features/music/music-section';
import { ContactSectionComponent } from '../features/contact/contact-section';
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
      @defer (on viewport) {
        <app-about-section />
      } @placeholder {
        <div style="min-height:400px"></div>
      }
    </div>

    <div id="schueleraufführungen">
      @defer (on viewport) {
        <app-education-section />
      } @placeholder {
        <div style="min-height:300px"></div>
      }
    </div>

    <div id="merch">
      @defer (on viewport) {
        <app-merch-section />
      } @placeholder {
        <div style="min-height:300px"></div>
      }
    </div>

    <div id="history">
      @defer (on viewport) {
        <app-history-section />
      } @placeholder {
        <div style="min-height:400px"></div>
      }
    </div>

    <div id="music">
      @defer (on viewport) {
        <app-music-section />
      } @placeholder {
        <div style="min-height:300px"></div>
      }
    </div>

    <div id="contact">
      @defer (on viewport) {
        <app-contact-section />
      } @placeholder {
        <div style="min-height:200px"></div>
      }
    </div>

    <app-footer />
    <app-back-to-top />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
