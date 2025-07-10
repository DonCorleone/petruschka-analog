import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
      @if (isBrowser) {
        @defer (on viewport) {
          <app-gigs-section />
        } @placeholder {
          <div class="section" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--section-bg-light, #f8f9fa);">
            <div style="color: var(--primary-color, #EC3A81); font-size: 14px; opacity: 0.8;">Loading gigs...</div>
          </div>
        }
      } @else {
        <app-gigs-section />
      }
    </div>
    
    <div id="music">
      @if (isBrowser) {
        @defer (on viewport) {
          <app-music-section />
        } @placeholder {
          <div class="section" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--section-bg-light, #f8f9fa);">
            <div style="color: var(--primary-color, #EC3A81); font-size: 14px; opacity: 0.8;">Loading music...</div>
          </div>
        }
      } @else {
        <app-music-section />
      }
    </div>
    
    <div id="about">
      @if (isBrowser) {
        @defer (on viewport) {
          <app-about-section />
        } @placeholder {
          <div class="section" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--section-bg-light, #f8f9fa);">
            <div style="color: var(--primary-color, #EC3A81); font-size: 14px; opacity: 0.8;">Loading about...</div>
          </div>
        }
      } @else {
        <app-about-section />
      }
    </div>
    
    <div id="merch">
      @if (isBrowser) {
        @defer (on viewport) {
          <app-merch-section />
        } @placeholder {
          <div class="section" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--section-bg-light, #f8f9fa);">
            <div style="color: var(--primary-color, #EC3A81); font-size: 14px; opacity: 0.8;">Loading merchandise...</div>
          </div>
        }
      } @else {
        <app-merch-section />
      }
    </div>
    
    <div id="contact">
      @if (isBrowser) {
        @defer (on viewport) {
          <app-contact-section />
        } @placeholder {
          <div class="section" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--section-bg-dark, #f1f1f1);">
            <div style="color: var(--primary-color, #EC3A81); font-size: 14px; opacity: 0.8;">Loading contact...</div>
          </div>
        }
      } @else {
        <app-contact-section />
      }
    </div>
    
    <app-footer />
    <app-back-to-top />
  `,
})
export default class HomeComponent {
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);
}
