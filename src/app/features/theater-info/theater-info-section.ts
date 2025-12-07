import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  inject,
  afterNextRender,
} from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-theater-info-section',
  templateUrl: './theater-info-section.html',
  styleUrls: ['./theater-info-section.css'],
  imports: [YouTubePlayer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheaterInfoSectionComponent {
  @ViewChild('youTubePlayer') youTubePlayer!: ElementRef<HTMLDivElement>;

  videoHeight: number | undefined;
  videoWidth: number | undefined;
  changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    // Run browser-only code after render (fixes SSR errors)
    afterNextRender(() => {
      // Load YouTube iframe API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      // Setup resize listener
      this.onResize();
      window.addEventListener('resize', this.onResize.bind(this));
    });
  }

  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }

  onResize(): void {
    // you can remove this line if you want to have wider video player than 1200px
    this.videoWidth = Math.min(
      this.youTubePlayer.nativeElement.clientWidth,
      1320
    );
    // so you keep the ratio
    this.videoHeight = this.videoWidth * 0.6;
    this.changeDetectorRef.detectChanges();
  }
}
