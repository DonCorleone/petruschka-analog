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
    
    <div id="promo">
      <app-promo-section />
    </div>
    
    <div id="gigs">
      @defer (on idle) {
        <app-gigs-section />
      } @placeholder {
        <div class="section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    </div>
    
    <div id="music">
      @defer (on idle) {
        <app-music-section />
      } @placeholder {
        <div class="section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    </div>
    
    <div id="about">
      @defer (on idle) {
        <app-about-section />
      } @placeholder {
        <div class="section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    </div>
    
    <div id="merch">
      @defer (on idle) {
        <app-merch-section />
      } @placeholder {
        <div class="section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    </div>
    
    <div id="contact">
      @defer (on idle) {
        <app-contact-section />
      } @placeholder {
        <div class="section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    </div>
    
    <app-footer />
    <app-back-to-top />
  `,
})
export default class HomeComponent {
}
