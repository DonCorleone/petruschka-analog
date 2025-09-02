import { Component, signal, inject, OnInit, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { BandDataService } from '../../core/services';
import { CountdownComponent } from '../../shared/components';
import { Update } from '../../../shared/types';

interface CarouselSlide {
  id: number;
  interval: number;
  backgroundUrl?: string;
  styleObj?: { [key: string]: string };
}

@Component({
  selector: 'app-promo-section',
  imports: [CommonModule, CountdownComponent],
  templateUrl: './promo-section.html',
  styleUrls: ['./promo-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoSectionComponent implements OnInit {
  
  private bandDataService = inject(BandDataService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  headline = 'Petruschka';
  tagline = 'Zauberhafte Puppentheater-Aufführungen für Kinder und Familien';
  
  // All available background images - separated by orientation
  private allLandscapeBackgroundImages = [
    '/images/bg/landscape/01.jpeg',
    '/images/bg/landscape/02.jpeg',
    '/images/bg/landscape/03.jpeg',
    '/images/bg/landscape/04.jpeg',
    '/images/bg/landscape/05.jpeg',
    '/images/bg/landscape/06.jpeg',
    // Add more landscape images here if needed
  ];

  private allPortraitBackgroundImages = [
    '/images/bg/portrait/01.jpeg',
    '/images/bg/portrait/02.jpeg',
    '/images/bg/portrait/03.jpeg',
    '/images/bg/portrait/04.jpeg',
    '/images/bg/portrait/05.jpeg',
    '/images/bg/portrait/06.jpeg',
    // Add more portrait images here if needed
  ];
  
  // Number of slides to show (can be changed)
  private numberOfSlidesToShow = 6;
  
  // Track orientation for responsive images - with SSR safety check
  isPortraitOrientation = signal<boolean>(this.isBrowser ? 
    window.matchMedia('(orientation: portrait)').matches : 
    false);
  
  slides: CarouselSlide[] = [];
  
  ngOnInit(): void {
    // Initialize slides with randomized background images
    this.initRandomizedSlides();
    
    // Add orientation change listener only in browser environment
    if (this.isBrowser) {
      window.matchMedia('(orientation: portrait)').addEventListener('change', (e) => {
        this.isPortraitOrientation.set(e.matches);
        this.initRandomizedSlides();
      });
    }
  }
  
  /**
   * Initialize slides with randomized background images
   */
  private initRandomizedSlides(): void {
    // Get a random subset of images if there are more images than slides needed
    const randomizedImages = this.getRandomizedBackgrounds();
    
    // Create slide objects with the randomized images
    this.slides = randomizedImages.map((imageUrl, index) => {
      const slide: CarouselSlide = {
        id: index + 1,
        interval: 6000,
        backgroundUrl: imageUrl,
        styleObj: {
          'background-image': `url("${imageUrl}")`,
          'background-position': 'center center',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        }
      };
      return slide;
    });
  }
  
  /**
   * Get a randomized subset of background images based on current orientation
   */
  private getRandomizedBackgrounds(): string[] {
    // Select image set based on current orientation
    const imageSet = this.isPortraitOrientation() 
      ? this.allPortraitBackgroundImages 
      : this.allLandscapeBackgroundImages;
      
    // Shuffle all available images
    const shuffled = [...imageSet].sort(() => Math.random() - 0.5);
    
    // If we need all images or more, return all shuffled images
    if (this.numberOfSlidesToShow >= imageSet.length) {
      return shuffled;
    }
    
    // Otherwise, take only the number of slides we want to show
    return shuffled.slice(0, this.numberOfSlidesToShow);
  }

  // Get updates from service with error handling
  updates = () => {
    try {
      const updatesData = this.bandDataService.updatesResource.value();
      return updatesData || [];
    } catch (error) {
      console.error('Error loading updates:', error);
      return [];
    }
  };
  
  private videoModalOpen = signal(false);
  private videoUrl = signal<SafeResourceUrl>('');
  
  isVideoModalOpen = this.videoModalOpen.asReadonly();
  currentVideoUrl = this.videoUrl.asReadonly();

  openVideoModal(url: string) {
    // Sanitize the URL for iframe security
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.videoUrl.set(safeUrl);
    this.videoModalOpen.set(true);
    
    // Only manipulate DOM in browser environment
    if (this.isBrowser) {
      document.body.classList.add('modal-open');
    }
  }

  closeVideoModal() {
    this.videoModalOpen.set(false);
    this.videoUrl.set('' as unknown as SafeResourceUrl);
    
    // Only manipulate DOM in browser environment
    if (this.isBrowser) {
      document.body.classList.remove('modal-open');
    }
  }
}
