import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandDataService } from '../services/band-data';
import { CountdownComponent } from './countdown';

interface CarouselSlide {
  id: number;
  interval: number;
}

@Component({
  selector: 'app-promo-section',
  standalone: true,
  imports: [CommonModule, CountdownComponent],
  templateUrl: './promo-section.html',
  styleUrls: ['./promo-section.css']
})
export class PromoSectionComponent {
  
  private bandDataService = inject(BandDataService);
  
  headline = 'For Bands and Musicians';
  tagline = 'The Perfect Bootstrap Template to Promote Your Music';
  
  slides: CarouselSlide[] = [
    { id: 1, interval: 6000 },
    { id: 2, interval: 6000 },
    { id: 3, interval: 6000 },
    { id: 4, interval: 6000 },
    { id: 5, interval: 6000 },
    { id: 6, interval: 6000 }
  ];

  updates = this.bandDataService.updatesResource.value;
  
  private videoModalOpen = signal(false);
  private videoUrl = signal<string>('');
  
  isVideoModalOpen = this.videoModalOpen.asReadonly();
  currentVideoUrl = this.videoUrl.asReadonly();

  openVideoModal(url: string) {
    this.videoUrl.set(url);
    this.videoModalOpen.set(true);
    document.body.classList.add('modal-open');
  }

  closeVideoModal() {
    this.videoModalOpen.set(false);
    this.videoUrl.set('');
    document.body.classList.remove('modal-open');
  }
}
