import { Component, ChangeDetectionStrategy } from '@angular/core';
import {YouTubePlayer} from '@angular/youtube-player';

@Component({
  selector: 'app-theater-info-section',
  templateUrl: './theater-info-section.html',
  styleUrls: ['./theater-info-section.css'],
  imports: [YouTubePlayer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheaterInfoSectionComponent {
  
  onImageError(event: any): void {
    // Fallback to placeholder image if original fails to load
    event.target.src = '/images/placeholder.svg';
  }
}