import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

declare global {
  interface Window {
    bootstrap: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BootstrapService {
  
  private document = inject(DOCUMENT);
  
  async initializeBootstrap() {
    if (typeof window !== 'undefined' && !window.bootstrap) {
      // Dynamically import Bootstrap JS
      const bootstrap = await import('bootstrap');
      window.bootstrap = bootstrap;
    }
  }

  // Helper methods for Bootstrap components
  showModal(modalElement: HTMLElement) {
    if (window.bootstrap) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  hideModal(modalElement: HTMLElement) {
    if (window.bootstrap) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  initializeCarousel(carouselElement: HTMLElement, options?: any) {
    if (window.bootstrap) {
      return new window.bootstrap.Carousel(carouselElement, options);
    }
    return null;
  }
}
