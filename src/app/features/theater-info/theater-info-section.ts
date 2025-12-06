import { Component, ChangeDetectionStrategy, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import {YouTubePlayer} from '@angular/youtube-player';

@Component({
  selector: 'app-theater-info-section',
  templateUrl: './theater-info-section.html',
  styleUrls: ['./theater-info-section.css'],
  imports: [YouTubePlayer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheaterInfoSectionComponent implements OnInit, AfterViewInit {

  @ViewChild('youTubePlayer') youTubePlayer!: ElementRef<HTMLDivElement>;

  videoHeight: number | undefined;
  videoWidth: number | undefined;
  changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }
  
  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }
    ngAfterViewInit(): void {
    this.onResize();
    window.addEventListener("resize", this.onResize.bind(this));
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